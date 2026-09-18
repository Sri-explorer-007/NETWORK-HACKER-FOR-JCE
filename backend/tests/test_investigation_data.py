import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.db.session import get_session_factory
from app.db.seed import seed_database
from app.models.case import Case
from app.models.entity import Entity
from app.models.relationship import Relationship
from app.models.event import Event
from app.models.source import Source
from app.models.evidence import Evidence


@pytest.fixture(scope="session", autouse=True)
def setup_test_db():
    """Ensure test database is initialized and seeded."""
    SessionFactory = get_session_factory()
    db = SessionFactory()
    try:
        seed_database(db, reset=True)
    finally:
        db.close()


@pytest.fixture
def client():
    return TestClient(app)


# 1. Verification of Cases and Seed Data
def test_cases_retrieval(client):
    response = client.get("/api/v1/cases")
    assert response.status_code == 200
    cases = response.json()
    assert len(cases) >= 2
    case_ids = [c["id"] for c in cases]
    assert "CASE-001" in case_ids
    assert "CASE-002" in case_ids


def test_case_detail_retrieval(client):
    response = client.get("/api/v1/cases/CASE-001")
    assert response.status_code == 200
    case_data = response.json()
    assert case_data["id"] == "CASE-001"
    assert case_data["case_number"] == "NH-2026-001"
    assert case_data["title"] == "Operation Meridian"
    assert case_data["status"] == "ACTIVE"
    assert case_data["priority"] == "HIGH"
    assert case_data["entities_count"] > 0
    assert len(case_data["entities"]) > 0


def test_case_not_found(client):
    response = client.get("/api/v1/cases/CASE-NONEXISTENT")
    assert response.status_code == 404


# 2. Verification of Entities and Connections
def test_entity_retrieval(client):
    response = client.get("/api/v1/entities/P-001")
    assert response.status_code == 200
    entity = response.json()
    assert entity["id"] == "P-001"
    assert entity["name"] == "Marcus Vance"
    assert entity["entity_type"] == "PERSON"
    assert "CASE-001" in entity["associated_cases"]
    assert entity["direct_connections_count"] > 0


def test_entity_connections(client):
    response = client.get("/api/v1/entities/P-001/connections")
    assert response.status_code == 200
    data = response.json()
    assert data["entity"]["id"] == "P-001"
    assert data["total_connections"] > 0
    
    # Check that connected entity details are populated
    connected_ids = [c["connected_entity_id"] for c in data["connections"]]
    assert "A-001" in connected_ids  # Shared account connection
    assert "P-004" in connected_ids  # Julian Thorne connection


# 3. Verification of Relationships and Provenance
def test_relationship_retrieval(client):
    response = client.get("/api/v1/relationships/REL-001")
    assert response.status_code == 200
    rel = response.json()
    assert rel["id"] == "REL-001"
    assert rel["from_entity_id"] == "P-001"
    assert rel["to_entity_id"] == "A-001"
    assert rel["relationship_type"] == "ASSOCIATED_WITH"
    assert rel["source_id"] is not None  # Must preserve provenance source ID


def test_relationship_evidence_traceability(client):
    response = client.get("/api/v1/relationships/REL-001/evidence")
    assert response.status_code == 200
    data = response.json()
    assert data["relationship"]["id"] == "REL-001"
    assert data["source"] is not None
    assert data["source"]["id"] == "SRC-011"
    assert len(data["evidence_items"]) > 0
    assert len(data["provenance_chain"]) >= 4

    # Check evidence metadata has synthetic label
    for ev in data["evidence_items"]:
        assert ev["metadata"].get("data_origin") == "SYNTHETIC"
        assert ev["metadata"].get("demo_only") is True


# 4. Verification of Case Network Endpoint
def test_case_network_graph(client):
    response = client.get("/api/v1/cases/CASE-001/network")
    assert response.status_code == 200
    graph = response.json()
    assert "nodes" in graph
    assert "edges" in graph
    assert graph["total_nodes"] > 10
    assert graph["total_edges"] > 10

    # Ensure node structure
    node_ids = [n["id"] for n in graph["nodes"]]
    assert "P-001" in node_ids
    assert "P-004" in node_ids
    assert "A-001" in node_ids
    assert "L-001" in node_ids

    # Ensure edge structure
    for edge in graph["edges"]:
        assert "source" in edge
        assert "target" in edge
        assert "relationship_type" in edge
        assert "confidence" in edge


# 5. Verification of Chronological Case Timeline
def test_case_timeline_sorting(client):
    response = client.get("/api/v1/cases/CASE-001/timeline")
    assert response.status_code == 200
    timeline = response.json()
    assert timeline["case_id"] == "CASE-001"
    assert timeline["total_events"] > 0
    events = timeline["events"]

    # Assert strict chronological ordering
    timestamps = [evt["timestamp"] for evt in events]
    assert timestamps == sorted(timestamps)

    # Check event structure includes participants
    for evt in events:
        assert "id" in evt
        assert "event_type" in evt
        assert "timestamp" in evt
        assert "description" in evt
        assert isinstance(evt["entities"], list)


# 6. Verification of PATTERN 1: Shared Account Pattern
def test_pattern_shared_account(client):
    # Both P-001 and P-004 must be associated with Account A-001
    p1_conns = client.get("/api/v1/entities/P-001/connections").json()
    p4_conns = client.get("/api/v1/entities/P-004/connections").json()

    p1_connected = [c["connected_entity_id"] for c in p1_conns["connections"]]
    p4_connected = [c["connected_entity_id"] for c in p4_conns["connections"]]

    assert "A-001" in p1_connected
    assert "A-001" in p4_connected


# 7. Verification of PATTERN 2: Cross-Case Connection
def test_pattern_cross_case_connection(client):
    # Person P-004 must be associated with both CASE-001 and CASE-002
    p4 = client.get("/api/v1/entities/P-004").json()
    assert "CASE-001" in p4["associated_cases"]
    assert "CASE-002" in p4["associated_cases"]


# 8. Verification of PATTERN 3: Temporal Sequence (Call -> Meeting -> Transaction)
def test_pattern_temporal_sequence(client):
    timeline = client.get("/api/v1/cases/CASE-001/timeline").json()
    events = timeline["events"]
    
    # Filter for the specific key sequence events
    call_events = [e for e in events if e["id"] == "EVT-002"]
    meeting_events = [e for e in events if e["id"] == "EVT-004"]
    transaction_events = [e for e in events if e["id"] == "EVT-006"]

    assert len(call_events) == 1
    assert len(meeting_events) == 1
    assert len(transaction_events) == 1

    call_ts = call_events[0]["timestamp"]
    meeting_ts = meeting_events[0]["timestamp"]
    trans_ts = transaction_events[0]["timestamp"]

    # Jan 10 (Call) < Jan 15 (Meeting) < Jan 20 (Transaction)
    assert call_ts < meeting_ts < trans_ts


# 9. Verification of EDGE CASES
def test_edge_cases(client):
    # Edge case 1: Two people with same name but distinct IDs
    p2 = client.get("/api/v1/entities/P-002").json()
    p11 = client.get("/api/v1/entities/P-011").json()
    assert p2["name"] == "David Vance"
    assert p11["name"] == "David Vance"
    assert p2["id"] != p11["id"]
    assert p2["attributes"]["dob"] != p11["attributes"]["dob"]

    # Edge case 2: Multiple phones for one person (P-001 has PH-001 and PH-002)
    p1_conns = client.get("/api/v1/entities/P-001/connections").json()
    p1_targets = [c["connected_entity_id"] for c in p1_conns["connections"]]
    assert "PH-001" in p1_targets
    assert "PH-002" in p1_targets

    # Edge case 3: Relationship with end date (REL-017 has end_time)
    rel17 = client.get("/api/v1/relationships/REL-017").json()
    assert rel17["end_time"] is not None
    assert rel17["status"] == "TERMINATED"

    # Edge case 5: Ambiguous identity relationship (REL-036 has confidence 0.45, status AMBIGUOUS)
    rel36 = client.get("/api/v1/relationships/REL-036").json()
    assert rel36["status"] == "AMBIGUOUS"
    assert rel36["confidence"] < 0.5
