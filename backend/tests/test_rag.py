import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.db.session import get_session_factory
from app.db.seed import seed_database
from app.rag.retriever import rag_service
from app.models.evidence import Evidence
from app.models.source import Source
from app.models.case import Case


@pytest.fixture(scope="session", autouse=True)
def setup_rag_db():
    """Seed database and populate RAG vector index for test session."""
    SessionFactory = get_session_factory()
    db = SessionFactory()
    try:
        seed_database(db, reset=True)
        rag_service.index_all_evidence(db, force_reindex=True)
    finally:
        db.close()


@pytest.fixture
def client():
    return TestClient(app)


# 1. Indexing & Stats API Endpoints
def test_rag_index_api(client):
    response = client.post("/api/v1/rag/index")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "completed"
    assert data["evidence_processed"] >= 25
    assert data["documents_created"] >= 25
    assert data["chunks_created"] >= 25
    assert data["embeddings_created"] >= 25


def test_rag_stats_api(client):
    response = client.get("/api/v1/rag/stats")
    assert response.status_code == 200
    data = response.json()
    assert data["documents"] >= 25
    assert data["chunks"] >= 25
    assert data["embeddings"] >= 25
    assert data["cases_indexed"] == 2


# 2. TEST 1: "What connects Marcus Vance and Julian Thorne?"
def test_rag_query_marcus_vance_julian_thorne(client):
    payload = {
        "query": "What evidence connects Marcus Vance and Julian Thorne?",
        "case_id": "CASE-001",
        "top_k": 5,
    }
    response = client.post("/api/v1/rag/search", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["total_results"] > 0
    
    retrieved_ev_ids = [r["evidence_id"] for r in data["results"]]
    # Shared account, call, or meeting evidence must appear in top results
    relevant_ids = {"EVD-002", "EVD-003", "EVD-004", "EVD-005"}
    assert any(ev_id in relevant_ids for ev_id in retrieved_ev_ids)


# 3. TEST 2: "What happened on January 15?"
def test_rag_query_january_15_meeting(client):
    payload = {
        "query": "What happened on January 15 at Warehouse Dock 9?",
        "case_id": "CASE-001",
        "top_k": 5,
    }
    response = client.post("/api/v1/rag/search", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["total_results"] > 0
    
    retrieved_ev_ids = [r["evidence_id"] for r in data["results"]]
    # EVD-003 (photographic surveillance log on Jan 15) or EVD-010 (statement on Jan 15) should be retrieved
    assert "EVD-003" in retrieved_ev_ids or "EVD-010" in retrieved_ev_ids


# 4. TEST 3: "What connects CASE-001 and CASE-002?"
def test_rag_query_cross_case_nexus(client):
    payload = {
        "query": "What connects CASE-001 and CASE-002 cross-case nexus Julian Thorne?",
        "top_k": 5,
    }
    response = client.post("/api/v1/rag/search", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["total_results"] > 0
    
    retrieved_ev_ids = [r["evidence_id"] for r in data["results"]]
    # Cross-case evidence EVD-015 or related wires EVD-011/EVD-012 should be found
    cross_case_evidence = {"EVD-015", "EVD-011", "EVD-012", "EVD-004"}
    assert any(ev_id in cross_case_evidence for ev_id in retrieved_ev_ids)


# 5. TEST 4: Case Filter Isolation (Search CASE-001 strictly excludes pure CASE-002 evidence)
def test_rag_case_filter_isolation(client):
    payload = {
        "query": "offshore escrow conduit Barclays Zurich Vaults",
        "case_id": "CASE-001",
        "top_k": 10,
    }
    response = client.post("/api/v1/rag/search", json=payload)
    assert response.status_code == 200
    data = response.json()
    
    # All returned evidence MUST belong to CASE-001
    for r in data["results"]:
        assert r["case_id"] == "CASE-001"
        # Pure CASE-002 specific evidence EVD-014 (Barclays Escrow) must not leak into CASE-001
        assert r["evidence_id"] != "EVD-014"


# 6. TEST 5: Date Filter Boundary (2026-01-01 to 2026-01-31 excludes Feb/March evidence)
def test_rag_date_filtering(client):
    payload = {
        "query": "bank wire transfer and accounts",
        "case_id": "CASE-001",
        "date_from": "2026-01-01",
        "date_to": "2026-01-31",
        "top_k": 10,
    }
    response = client.post("/api/v1/rag/search", json=payload)
    assert response.status_code == 200
    data = response.json()
    
    for r in data["results"]:
        ev_date = r["metadata"].get("evidence_date")
        if ev_date:
            assert "2026-01" in ev_date
            assert "2026-02" not in ev_date
            assert "2026-03" not in ev_date


# 7. TEST 6: Provenance field presence in every retrieved result
def test_rag_result_provenance_fields(client):
    payload = {
        "query": "financial transactions and logistics",
        "top_k": 5,
    }
    response = client.post("/api/v1/rag/search", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert len(data["results"]) > 0

    for r in data["results"]:
        assert "evidence_id" in r and r["evidence_id"].startswith("EVD-")
        assert "source_id" in r and r["source_id"].startswith("SRC-")
        assert "case_id" in r
        assert "text" in r and len(r["text"]) > 0
        assert "score" in r
        assert "metadata" in r
        # Metadata must contain synthetic marker
        assert r["metadata"].get("data_origin") == "SYNTHETIC"
        assert r["metadata"].get("demo_only") is True


# 8. TEST 7: End-to-End Provenance Traceability (Result -> Evidence -> Source -> Case)
def test_rag_provenance_chain_integrity(client):
    payload = {
        "query": "Signature Mandate Chase Account A-001",
        "top_k": 1,
    }
    response = client.post("/api/v1/rag/search", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert len(data["results"]) >= 1

    top_hit = data["results"][0]
    ev_id = top_hit["evidence_id"]
    src_id = top_hit["source_id"]
    case_id = top_hit["case_id"]

    SessionFactory = get_session_factory()
    db = SessionFactory()
    try:
        # Trace Evidence
        ev = db.query(Evidence).filter(Evidence.id == ev_id).first()
        assert ev is not None
        assert ev.source_id == src_id

        # Trace Source
        src = db.query(Source).filter(Source.id == src_id).first()
        assert src is not None
        assert src.case_id == case_id

        # Trace Case
        case = db.query(Case).filter(Case.id == case_id).first()
        assert case is not None
        assert case.id == case_id
    finally:
        db.close()


# 9. Additional Metadata Filter: Source Type and Verification Status
def test_rag_source_type_and_status_filtering(client):
    payload = {
        "query": "surveillance observation Dock 9",
        "source_type": "SURVEILLANCE",
        "verification_status": "OBSERVED",
        "top_k": 5,
    }
    response = client.post("/api/v1/rag/search", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert len(data["results"]) > 0

    for r in data["results"]:
        assert r["metadata"].get("source_type") == "SURVEILLANCE"
        assert r["metadata"].get("verification_status") == "OBSERVED"
