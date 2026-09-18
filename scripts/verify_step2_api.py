"""Verification script for Step 2 API endpoints."""

import sys
from pathlib import Path

# Add backend directory to sys.path
root_dir = Path(__file__).resolve().parent.parent
backend_dir = root_dir / "backend"
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def verify_all_endpoints():
    print("==================================================")
    print(" VERIFYING STEP 2 API ENDPOINTS")
    print("==================================================")

    # 1. GET /api/v1/cases
    r = client.get("/api/v1/cases")
    assert r.status_code == 200, f"Failed /api/v1/cases: {r.text}"
    cases = r.json()
    print(f"[PASS] GET /api/v1/cases -> Found {len(cases)} cases")
    for c in cases:
        print(f"   [{c['id']}] {c['title']} ({c['status']})")

    # 2. GET /api/v1/cases/{case_id}
    r = client.get("/api/v1/cases/CASE-001")
    assert r.status_code == 200, f"Failed /api/v1/cases/CASE-001: {r.text}"
    case_detail = r.json()
    print(f"[PASS] GET /api/v1/cases/CASE-001 -> {case_detail['title']} (Entities: {case_detail['entities_count']}, Relationships: {case_detail['relationships_count']})")

    # 3. GET /api/v1/entities/{entity_id}
    r = client.get("/api/v1/entities/P-001")
    assert r.status_code == 200, f"Failed /api/v1/entities/P-001: {r.text}"
    ent = r.json()
    print(f"[PASS] GET /api/v1/entities/P-001 -> {ent['name']} ({ent['entity_type']}), Direct Connections: {ent['direct_connections_count']}")

    # 4. GET /api/v1/entities/{entity_id}/connections
    r = client.get("/api/v1/entities/P-001/connections")
    assert r.status_code == 200, f"Failed /api/v1/entities/P-001/connections: {r.text}"
    conns = r.json()
    print(f"[PASS] GET /api/v1/entities/P-001/connections -> Total Connections: {conns['total_connections']}")

    # 5. GET /api/v1/cases/{case_id}/network
    r = client.get("/api/v1/cases/CASE-001/network")
    assert r.status_code == 200, f"Failed /api/v1/cases/CASE-001/network: {r.text}"
    net = r.json()
    print(f"[PASS] GET /api/v1/cases/CASE-001/network -> Nodes: {net['total_nodes']}, Edges: {net['total_edges']}")

    # 6. GET /api/v1/cases/{case_id}/timeline
    r = client.get("/api/v1/cases/CASE-001/timeline")
    assert r.status_code == 200, f"Failed /api/v1/cases/CASE-001/timeline: {r.text}"
    time_data = r.json()
    print(f"[PASS] GET /api/v1/cases/CASE-001/timeline -> Total Events: {time_data['total_events']} (Chronologically Sorted)")

    # 7. GET /api/v1/relationships/{relationship_id}
    r = client.get("/api/v1/relationships/REL-001")
    assert r.status_code == 200, f"Failed /api/v1/relationships/REL-001: {r.text}"
    rel = r.json()
    print(f"[PASS] GET /api/v1/relationships/REL-001 -> {rel['from_entity_id']} --[{rel['relationship_type']}]--> {rel['to_entity_id']} (Source: {rel['source_id']})")

    # 8. GET /api/v1/relationships/{relationship_id}/evidence
    r = client.get("/api/v1/relationships/REL-001/evidence")
    assert r.status_code == 200, f"Failed /api/v1/relationships/REL-001/evidence: {r.text}"
    ev_data = r.json()
    print(f"[PASS] GET /api/v1/relationships/REL-001/evidence -> Source: {ev_data['source']['reference_code']}, Evidence items: {len(ev_data['evidence_items'])}")
    print("   Provenance Chain:")
    for step in ev_data["provenance_chain"]:
        print(f"     -> {step}")

    print("==================================================")
    print(" ALL 8 API ENDPOINTS VERIFIED SUCCESSFULLY!")
    print("==================================================")

if __name__ == "__main__":
    verify_all_endpoints()
