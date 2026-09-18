import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.db.session import get_session_factory
from app.db.seed import seed_database
from app.rag.retriever import rag_service
from app.graph.entity_resolver import entity_resolver
from app.graph.graph_retriever import graph_retriever


@pytest.fixture(scope="session", autouse=True)
def setup_graph_rag_db():
    """Seed database and populate vector index for Graph-RAG testing."""
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


# 1. Entity Resolution Tests
def test_entity_resolution_marcus_vance():
    SessionFactory = get_session_factory()
    db = SessionFactory()
    try:
        resolved, ambiguities = entity_resolver.resolve_entities("Tell me about Marcus Vance and his activities", db=db)
        assert len(resolved) >= 1
        assert any(e.id == "P-001" for e in resolved)
        assert len(ambiguities) == 0
    finally:
        db.close()


def test_entity_resolution_julian_thorne():
    SessionFactory = get_session_factory()
    db = SessionFactory()
    try:
        resolved, ambiguities = entity_resolver.resolve_entities("Investigate Julian Thorne transactions", db=db)
        assert len(resolved) >= 1
        assert any(e.id == "P-004" for e in resolved)
        assert len(ambiguities) == 0
    finally:
        db.close()


def test_duplicate_david_vance_ambiguity():
    SessionFactory = get_session_factory()
    db = SessionFactory()
    try:
        # "David Vance" is shared by P-002 (suspect) and P-011 (innocent engineer)
        resolved, ambiguities = entity_resolver.resolve_entities("Show background for David Vance", db=db)
        assert len(ambiguities) == 1
        amb = ambiguities[0]
        assert amb.status == "AMBIGUOUS"
        assert amb.queried_name == "David Vance"
        candidate_ids = [m.id for m in amb.matches]
        assert "P-002" in candidate_ids
        assert "P-011" in candidate_ids
    finally:
        db.close()


# 2. Graph Path Finding Tests (P-001 -> A-001 <- P-004)
def test_graph_path_between_p001_and_p004():
    SessionFactory = get_session_factory()
    db = SessionFactory()
    try:
        paths = graph_retriever.find_paths(source_id="P-001", target_id="P-004", max_hops=2, db=db)
        assert len(paths) > 0

        # Check if shared account A-001 path exists
        found_a001_path = False
        for p in paths:
            node_ids = [n.id for n in p.path_nodes]
            if "A-001" in node_ids:
                found_a001_path = True
                assert p.hops <= 2
                assert any(r.relationship_type == "ASSOCIATED_WITH" for r in p.path_relationships)
        
        assert found_a001_path, "Expected shared Account A-001 path connecting P-001 and P-004"
    finally:
        db.close()


# 3. Cross-Case Connection Tests
def test_cross_case_connection_p004():
    SessionFactory = get_session_factory()
    db = SessionFactory()
    try:
        cc = graph_retriever.get_cross_case_connections("P-004", db=db)
        assert cc is not None
        assert cc.entity_id == "P-004"
        case_ids = [c["case_id"] for c in cc.cases]
        assert "CASE-001" in case_ids
        assert "CASE-002" in case_ids
        assert len(cc.connecting_relationships) > 0
    finally:
        db.close()


# 4. Graph Topology Statistics API
def test_graph_stats_api(client):
    response = client.get("/api/v1/graph/stats")
    assert response.status_code == 200
    stats = response.json()
    assert stats["total_nodes"] >= 37
    assert stats["total_edges"] >= 38
    assert "node_types" in stats
    assert stats["node_types"].get("PERSON") >= 13


# 5. Hybrid Investigation Retrieval Endpoint Tests
def test_investigation_retrieve_marcus_vance_julian_thorne(client):
    payload = {
        "query": "What connects Marcus Vance and Julian Thorne?",
        "case_id": "CASE-001",
        "top_k": 5,
    }
    response = client.post("/api/v1/investigation/retrieve", json=payload)
    assert response.status_code == 200
    data = response.json()

    # 1. Resolved Entities
    resolved_ids = [e["id"] for e in data["resolved_entities"]]
    assert "P-001" in resolved_ids
    assert "P-004" in resolved_ids

    # 2. Graph Context & Paths
    graph_ctx = data["graph_context"]
    assert len(graph_ctx["nodes"]) > 0
    assert len(graph_ctx["relationships"]) > 0
    assert len(graph_ctx["paths"]) > 0
    
    # Verify path connects via A-001
    all_path_nodes = []
    for p in graph_ctx["paths"]:
        all_path_nodes.extend([n["id"] for n in p["path_nodes"]])
    assert "A-001" in all_path_nodes

    # 3. Evidence Context
    evidence_items = data["evidence_context"]["results"]
    assert len(evidence_items) > 0
    ev_ids = [e["evidence_id"] for e in evidence_items]
    # Mandate or wire evidence must be present
    assert any(ev_id in {"EVD-004", "EVD-005", "EVD-002"} for ev_id in ev_ids)

    # 4. Sources & Provenance
    assert len(data["sources"]) > 0
    assert len(data["provenance"]) > 0
    for prov in data["provenance"]:
        assert prov["evidence_id"].startswith("EVD-")
        assert prov["source_id"].startswith("SRC-")
        assert "provenance_path" in prov


def test_investigation_retrieve_january_march_timeline(client):
    payload = {
        "query": "What happened between January and March?",
        "case_id": "CASE-001",
    }
    response = client.post("/api/v1/investigation/retrieve", json=payload)
    assert response.status_code == 200
    data = response.json()

    events = data["timeline_context"]["events"]
    assert len(events) > 0

    # Ensure chronological order
    timestamps = [e["timestamp"] for e in events]
    assert timestamps == sorted(timestamps)


def test_investigation_retrieve_cross_case(client):
    payload = {
        "query": "What connects CASE-001 and CASE-002?",
    }
    response = client.post("/api/v1/investigation/retrieve", json=payload)
    assert response.status_code == 200
    data = response.json()

    # Cross case context must identify Julian Thorne P-004
    cross_case = data["graph_context"].get("cross_case")
    assert cross_case is not None
    assert cross_case["entity_id"] == "P-004"
    case_ids = [c["case_id"] for c in cross_case["cases"]]
    assert "CASE-001" in case_ids
    assert "CASE-002" in case_ids


def test_investigation_retrieve_account_a001(client):
    payload = {
        "query": "Show the relationships involving Account A-001",
        "case_id": "CASE-001",
    }
    response = client.post("/api/v1/investigation/retrieve", json=payload)
    assert response.status_code == 200
    data = response.json()

    resolved_ids = [e["id"] for e in data["resolved_entities"]]
    assert "A-001" in resolved_ids

    # Relationships in graph context must include P-001 and P-004 associations
    rel_entities = set()
    for r in data["graph_context"]["relationships"]:
        rel_entities.add(r["from_entity_id"])
        rel_entities.add(r["to_entity_id"])
    assert "P-001" in rel_entities
    assert "P-004" in rel_entities


def test_investigation_retrieve_preserves_contradicted_status(client):
    payload = {
        "query": "Anonymous tip regarding Marcus Vance location",
        "case_id": "CASE-001",
    }
    response = client.post("/api/v1/investigation/retrieve", json=payload)
    assert response.status_code == 200
    data = response.json()

    evidence_items = data["evidence_context"]["results"]
    contradicted_items = [e for e in evidence_items if e["evidence_id"] == "EVD-017"]
    
    if contradicted_items:
        assert contradicted_items[0]["verification_status"] == "CONTRADICTED"


def test_investigation_retrieve_case_isolation(client):
    payload = {
        "query": "offshore escrow conduit Zurich Vaults",
        "case_id": "CASE-001",
    }
    response = client.post("/api/v1/investigation/retrieve", json=payload)
    assert response.status_code == 200
    data = response.json()

    # Ensure no CASE-002 specific evidence leaks into CASE-001 evidence context
    for ev in data["evidence_context"]["results"]:
        assert ev["case_id"] == "CASE-001"
