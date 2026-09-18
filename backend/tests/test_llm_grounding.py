import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.main import app
from app.db.session import get_session_factory
from app.llm.models import (
    InvestigationAnswer,
    Finding,
    FindingType,
    ConfidenceLabel,
)
from app.llm.provider import MockLLMProvider
from app.llm.service import LLMService, llm_service
from app.llm.guardrails import (
    validate_grounded_response,
    sanitize_and_filter_hallucinations,
    extract_context_valid_ids,
)
from app.rag.hybrid_retriever import hybrid_retriever


from app.db.seed import seed_database
from app.rag.retriever import rag_service


@pytest.fixture(scope="session", autouse=True)
def setup_llm_grounding_db():
    """Ensure database and vector index are populated for LLM test suite."""
    SessionFactory = get_session_factory()
    db = SessionFactory()
    try:
        seed_database(db, reset=True)
        rag_service.index_all_evidence(db, force_reindex=True)
    finally:
        db.close()


@pytest.fixture(scope="module")
def db_session():
    SessionFactory = get_session_factory()
    db = SessionFactory()
    try:
        yield db
    finally:
        db.close()


@pytest.fixture(scope="module")
def client():
    return TestClient(app)


# 1. Test LLM Response JSON Parsing
def test_llm_response_json_parsing():
    service = LLMService()
    raw_json_str = """
    ```json
    {
        "query": "Test Query",
        "mode": "LLM",
        "answer": "Test answer citing EVD-005.",
        "findings": [
            {
                "statement": "Observed test finding",
                "finding_type": "OBSERVED",
                "evidence_ids": ["EVD-005"],
                "source_ids": ["SRC-011"],
                "relationship_ids": ["REL-001"],
                "confidence_label": "HIGH"
            }
        ],
        "source_ids": ["SRC-011"],
        "evidence_ids": ["EVD-005"],
        "relationship_ids": ["REL-001"],
        "entity_ids": ["P-001"],
        "caveats": ["Test caveat"],
        "requires_human_review": true
    }
    ```
    """
    parsed = service._parse_json_response(raw_json_str)
    assert parsed["query"] == "Test Query"
    assert parsed["findings"][0]["evidence_ids"] == ["EVD-005"]
    assert parsed["requires_human_review"] is True


# 2. Test Valid Grounded Response passes guardrail validation
def test_valid_grounded_response(db_session: Session):
    context = hybrid_retriever.retrieve(
        query="What connects Marcus Vance and Julian Thorne?",
        case_id="CASE-001",
        db=db_session,
    )

    ev_ids_in_context = [e.get("evidence_id") for e in context.evidence_context.get("results", [])]
    src_ids_in_context = [s.get("source_id") for s in context.sources]
    rel_ids_in_context = [r.get("relationship_id") for r in context.graph_context.get("relationships", [])]

    used_ev = ["EVD-005"] if "EVD-005" in ev_ids_in_context else (ev_ids_in_context[:1] if ev_ids_in_context else [])
    used_src = ["SRC-011"] if "SRC-011" in src_ids_in_context else (src_ids_in_context[:1] if src_ids_in_context else [])
    used_rel = ["REL-001"] if "REL-001" in rel_ids_in_context else (rel_ids_in_context[:1] if rel_ids_in_context else [])

    answer = InvestigationAnswer(
        query=context.query,
        mode="LLM",
        answer="Records indicate Marcus Vance and Julian Thorne share Account A-001.",
        findings=[
            Finding(
                statement="P-001 and P-004 connect via A-001",
                finding_type=FindingType.VERIFIED.value,
                evidence_ids=used_ev,
                source_ids=used_src,
                relationship_ids=used_rel,
                confidence_label=ConfidenceLabel.HIGH.value,
            )
        ],
        source_ids=used_src,
        evidence_ids=used_ev,
        relationship_ids=used_rel,
        entity_ids=["P-001", "P-004"],
        caveats=["Human review required"],
        requires_human_review=True,
    )

    val_res = validate_grounded_response(answer, context)
    assert val_res.is_valid is True
    assert len(val_res.errors) == 0


# 3. Test Hallucinated Evidence ID Rejected
def test_hallucinated_evidence_id_rejected(db_session: Session):
    context = hybrid_retriever.retrieve(
        query="What connects Marcus Vance and Julian Thorne?",
        case_id="CASE-001",
        db=db_session,
    )

    fake_answer = InvestigationAnswer(
        query=context.query,
        mode="LLM",
        answer="Hallucinated claim",
        findings=[],
        evidence_ids=["EVD-999-FAKE"],
        requires_human_review=True,
    )

    val_res = validate_grounded_response(fake_answer, context)
    assert val_res.is_valid is False
    assert any("EVD-999-FAKE" in err for err in val_res.errors)

    # Test sanitization strips it
    sanitized = sanitize_and_filter_hallucinations(fake_answer, context)
    assert "EVD-999-FAKE" not in sanitized.evidence_ids
    assert any("Guardrail Alert" in c for c in sanitized.caveats)


# 4. Test Hallucinated Source ID Rejected
def test_hallucinated_source_id_rejected(db_session: Session):
    context = hybrid_retriever.retrieve(
        query="What connects Marcus Vance and Julian Thorne?",
        case_id="CASE-001",
        db=db_session,
    )

    fake_answer = InvestigationAnswer(
        query=context.query,
        mode="LLM",
        answer="Hallucinated source",
        findings=[],
        source_ids=["SRC-FAKE-888"],
        requires_human_review=True,
    )

    val_res = validate_grounded_response(fake_answer, context)
    assert val_res.is_valid is False
    assert any("SRC-FAKE-888" in err for err in val_res.errors)


# 5. Test Hallucinated Relationship ID Rejected
def test_hallucinated_relationship_id_rejected(db_session: Session):
    context = hybrid_retriever.retrieve(
        query="What connects Marcus Vance and Julian Thorne?",
        case_id="CASE-001",
        db=db_session,
    )

    fake_answer = InvestigationAnswer(
        query=context.query,
        mode="LLM",
        answer="Hallucinated relationship",
        findings=[],
        relationship_ids=["REL-FAKE-777"],
        requires_human_review=True,
    )

    val_res = validate_grounded_response(fake_answer, context)
    assert val_res.is_valid is False
    assert any("REL-FAKE-777" in err for err in val_res.errors)


# 6. Test Hallucinated Entity ID Rejected
def test_hallucinated_entity_id_rejected(db_session: Session):
    context = hybrid_retriever.retrieve(
        query="What connects Marcus Vance and Julian Thorne?",
        case_id="CASE-001",
        db=db_session,
    )

    fake_answer = InvestigationAnswer(
        query=context.query,
        mode="LLM",
        answer="Hallucinated entity",
        findings=[],
        entity_ids=["P-999-NONEXISTENT"],
        requires_human_review=True,
    )

    val_res = validate_grounded_response(fake_answer, context)
    assert val_res.is_valid is False
    assert any("P-999-NONEXISTENT" in err for err in val_res.errors)


# 7. Test Ambiguity Preservation (David Vance)
def test_ambiguity_preservation_david_vance(db_session: Session):
    context = hybrid_retriever.retrieve(
        query="Show David Vance",
        db=db_session,
    )
    assert len(context.ambiguities) > 0
    cand_ids = {c.id for c in context.ambiguities[0].matches}
    assert "P-002" in cand_ids
    assert "P-011" in cand_ids

    # Generate answer via fallback service
    service = LLMService()
    answer = service.generate_answer(query="Show David Vance", context=context)

    assert answer.requires_human_review is True
    amb_findings = [f for f in answer.findings if f.finding_type == FindingType.AMBIGUOUS.value]
    assert len(amb_findings) > 0
    assert "P-002" in answer.entity_ids
    assert "P-011" in answer.entity_ids
    assert "AMBIGUITY" in answer.answer or "ambiguous" in answer.answer.lower()


# 8. Test Contradiction Preservation (CONTRADICTED status)
def test_contradiction_preservation(db_session: Session):
    context = hybrid_retriever.retrieve(
        query="Anonymous tip regarding Marcus Vance location",
        case_id="CASE-001",
        db=db_session,
    )
    
    has_contra = any(ev.get("verification_status") == "CONTRADICTED" for ev in context.evidence_context.get("results", []))
    assert has_contra is True

    service = LLMService()
    answer = service.generate_answer(query="Anonymous tip regarding Marcus Vance location", context=context)

    contra_findings = [f for f in answer.findings if f.finding_type == FindingType.CONTRADICTED.value]
    assert len(contra_findings) > 0
    assert answer.requires_human_review is True
    assert "CONTRADICTED" in answer.answer or "contradicted" in answer.answer.lower()


# 9. Test Insufficient Evidence Handling
def test_insufficient_evidence_handling(db_session: Session):
    context = hybrid_retriever.retrieve(
        query="Find spaceship transactions on Mars orbiting base",
        db=db_session,
    )

    service = LLMService()
    answer = service.generate_answer(query=context.query, context=context)

    assert answer.requires_human_review is True
    assert len(answer.findings) > 0


# 10. Test Human-Review Flag Logic
def test_human_review_flag_logic(db_session: Session):
    context = hybrid_retriever.retrieve(
        query="What connects Marcus Vance and Julian Thorne?",
        case_id="CASE-001",
        db=db_session,
    )
    service = LLMService()
    answer = service.generate_answer(query=context.query, context=context)
    assert answer.requires_human_review is True


# 11. Test Deterministic Fallback Mode
def test_deterministic_fallback_mode(db_session: Session):
    context = hybrid_retriever.retrieve(
        query="What connects Marcus Vance and Julian Thorne?",
        case_id="CASE-001",
        db=db_session,
    )
    service = LLMService(provider=None)
    answer = service.generate_answer(query=context.query, context=context)

    assert answer.mode == "DEMO_FALLBACK"
    assert "Marcus Vance" in answer.answer or "P-001" in answer.entity_ids
    assert "Julian Thorne" in answer.answer or "P-004" in answer.entity_ids
    assert "A-001" in answer.entity_ids or "A-001" in answer.answer
    assert answer.requires_human_review is True
    assert any("DEMO_FALLBACK" in c for c in answer.caveats)


# 12. Test Mocked LLM Provider Integration
def test_mocked_llm_provider_generation(db_session: Session):
    context = hybrid_retriever.retrieve(
        query="What connects Marcus Vance and Julian Thorne?",
        case_id="CASE-001",
        db=db_session,
    )

    mock_resp = {
        "query": context.query,
        "mode": "LLM",
        "answer": "Records indicate a connection between Marcus Vance and Julian Thorne through Account A-001.",
        "findings": [
            {
                "statement": "Marcus Vance and Julian Thorne both hold associations with Account A-001.",
                "finding_type": "VERIFIED",
                "evidence_ids": ["EVD-005"],
                "source_ids": ["SRC-011"],
                "relationship_ids": ["REL-001", "REL-002"],
                "confidence_label": "HIGH"
            }
        ],
        "source_ids": ["SRC-011"],
        "evidence_ids": ["EVD-005"],
        "relationship_ids": ["REL-001", "REL-002"],
        "entity_ids": ["P-001", "P-004", "A-001"],
        "caveats": ["Human review required."],
        "requires_human_review": True
    }

    mock_provider = MockLLMProvider(mock_response_json=mock_resp)
    mock_service = LLMService(provider=mock_provider)
    mock_service.config.api_key = "test-mock-key"

    answer = mock_service.generate_answer(query=context.query, context=context)
    assert answer.mode == "LLM"
    assert "Account A-001" in answer.answer
    assert "EVD-005" in answer.evidence_ids
    assert "SRC-011" in answer.source_ids
    assert "P-001" in answer.entity_ids


# 13. Test Endpoint POST /api/v1/investigation/query
def test_api_endpoint_investigation_query(client: TestClient):
    payload = {
        "query": "What connects Marcus Vance and Julian Thorne?",
        "case_id": "CASE-001",
        "top_k": 5,
    }
    response = client.post("/api/v1/investigation/query", json=payload)
    assert response.status_code == 200
    data = response.json()

    assert data["query"] == payload["query"]
    assert data["mode"] in ["LLM", "DEMO_FALLBACK"]
    assert len(data["findings"]) > 0
    assert data["requires_human_review"] is True
    assert "P-001" in data["entity_ids"]
    assert "P-004" in data["entity_ids"]


# 14. Test Endpoint with Temporal Query
def test_api_endpoint_temporal_query(client: TestClient):
    payload = {
        "query": "What happened between Marcus Vance and Julian Thorne between January and March 2026?",
        "case_id": "CASE-001",
    }
    response = client.post("/api/v1/investigation/query", json=payload)
    assert response.status_code == 200
    data = response.json()

    assert len(data["findings"]) > 0
    assert data["requires_human_review"] is True
