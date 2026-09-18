import os
import sys

# Ensure backend directory is in sys.path and current working directory
backend_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "backend"))
if backend_path not in sys.path:
    sys.path.insert(0, backend_path)
os.chdir(backend_path)

from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def verify_frontend_apis():
    print("=" * 80)
    print("STEP 6: FRONTEND API CONTRACT & DEMO INTEGRATION VERIFICATION")
    print("=" * 80)

    # 1. GET /api/v1/cases
    r = client.get("/api/v1/cases")
    assert r.status_code == 200
    cases = r.json()
    assert len(cases) >= 2
    print(f"[OK] GET /api/v1/cases returned {len(cases)} cases.")

    # 2. GET /api/v1/cases/CASE-001
    r = client.get("/api/v1/cases/CASE-001")
    assert r.status_code == 200
    c_detail = r.json()
    assert c_detail["title"] == "Operation Meridian"
    print(f"[OK] GET /api/v1/cases/CASE-001 returned title: '{c_detail['title']}' (Entities: {c_detail['entities_count']}, Rels: {c_detail['relationships_count']}).")

    # 3. GET /api/v1/cases/CASE-001/network
    r = client.get("/api/v1/cases/CASE-001/network")
    assert r.status_code == 200
    net = r.json()
    assert net["total_nodes"] >= 25
    assert net["total_edges"] >= 25
    print(f"[OK] GET /api/v1/cases/CASE-001/network returned {net['total_nodes']} nodes and {net['total_edges']} edges.")

    # 4. GET /api/v1/cases/CASE-001/timeline
    r = client.get("/api/v1/cases/CASE-001/timeline")
    assert r.status_code == 200
    timeline = r.json()
    assert timeline["total_events"] >= 10
    print(f"[OK] GET /api/v1/cases/CASE-001/timeline returned {timeline['total_events']} chronological events.")

    # 5. GET /api/v1/relationships/REL-001/evidence
    r = client.get("/api/v1/relationships/REL-001/evidence")
    assert r.status_code == 200
    rel_ev = r.json()
    assert rel_ev["relationship"]["from_entity_id"] == "P-001"
    assert rel_ev["relationship"]["to_entity_id"] == "A-001"
    assert len(rel_ev["provenance_chain"]) > 0
    print(f"[OK] GET /api/v1/relationships/REL-001/evidence returned provenance chain with {len(rel_ev['provenance_chain'])} steps.")

    # 6. POST /api/v1/investigation/query
    payload = {
        "query": "What connects Marcus Vance and Julian Thorne?",
        "case_id": "CASE-001",
        "top_k": 5
    }
    r = client.post("/api/v1/investigation/query", json=payload)
    assert r.status_code == 200
    ai_ans = r.json()
    assert "P-001" in ai_ans["entity_ids"]
    assert "P-004" in ai_ans["entity_ids"]
    assert "A-001" in ai_ans["entity_ids"]
    assert len(ai_ans["findings"]) > 0
    print(f"[OK] POST /api/v1/investigation/query returned mode='{ai_ans['mode']}' with {len(ai_ans['findings'])} grounded findings.")

    # 7. GET /api/v1/graph/stats
    r = client.get("/api/v1/graph/stats")
    assert r.status_code == 200
    stats = r.json()
    assert stats["total_nodes"] >= 37
    print(f"[OK] GET /api/v1/graph/stats returned {stats['total_nodes']} nodes, density={stats['density']}.")

    print("=" * 80)
    print("ALL FRONTEND API CONTRACTS FULLY VALIDATED AND PASSING")
    print("=" * 80)

if __name__ == "__main__":
    verify_frontend_apis()
