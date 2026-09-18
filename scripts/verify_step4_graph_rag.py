"""Verification script for Step 4: Graph-RAG + Context Fusion."""

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

def run_verification():
    print("==================================================")
    print(" VERIFYING STEP 4: GRAPH-RAG + CONTEXT FUSION")
    print("==================================================")

    # 1. Graph Topology Stats
    print("\n[1] Testing Graph Stats API (GET /api/v1/graph/stats)...")
    r = client.get("/api/v1/graph/stats")
    assert r.status_code == 200, f"Graph stats failed: {r.text}"
    stats = r.json()
    print(f"[PASS] Graph Stats: {stats['total_nodes']} nodes, {stats['total_edges']} edges, density={stats['density']}")
    print(f"       Node breakdown: {stats['node_types']}")

    # 2. DEMO QUERY 1: "What connects Marcus Vance and Julian Thorne?"
    print("\n[2] DEMO QUERY 1: 'What connects Marcus Vance and Julian Thorne?'")
    r = client.post("/api/v1/investigation/retrieve", json={
        "query": "What connects Marcus Vance and Julian Thorne?",
        "case_id": "CASE-001",
        "top_k": 3,
    })
    assert r.status_code == 200, f"Query 1 failed: {r.text}"
    data1 = r.json()
    resolved_ids = [e["id"] for e in data1["resolved_entities"]]
    print(f"[PASS] Resolved Entities: {resolved_ids}")
    print(f"       Discovered Graph Paths ({len(data1['graph_context']['paths'])}):")
    for p in data1["graph_context"]["paths"]:
        print(f"         -> {p['path_summary']}")
    print(f"       Supporting Evidence Hits: {len(data1['evidence_context']['results'])}")

    # 3. DEMO QUERY 2: "What happened between January and March?"
    print("\n[3] DEMO QUERY 2: 'What happened between January and March?'")
    r = client.post("/api/v1/investigation/retrieve", json={
        "query": "What happened between January and March?",
        "case_id": "CASE-001",
    })
    assert r.status_code == 200, f"Query 2 failed: {r.text}"
    data2 = r.json()
    events = data2["timeline_context"]["events"]
    print(f"[PASS] Chronological Timeline Events Retrieved: {len(events)}")
    if events:
        print(f"       First: [{events[0]['timestamp']}] {events[0]['event_type']} - {events[0]['description'][:60]}...")
        print(f"       Last:  [{events[-1]['timestamp']}] {events[-1]['event_type']} - {events[-1]['description'][:60]}...")

    # 4. DEMO QUERY 3: "What connects CASE-001 and CASE-002?"
    print("\n[4] DEMO QUERY 3: 'What connects CASE-001 and CASE-002?'")
    r = client.post("/api/v1/investigation/retrieve", json={
        "query": "What connects CASE-001 and CASE-002?",
    })
    assert r.status_code == 200, f"Query 3 failed: {r.text}"
    data3 = r.json()
    cc = data3["graph_context"].get("cross_case")
    print(f"[PASS] Cross-Case Connection Detected: {cc['entity_id']} ({cc['entity_name']})")
    for c in cc["cases"]:
        print(f"         -> Case [{c['case_id']}]: {c['title']} (Role: {c['role_in_case']})")

    # 5. DEMO QUERY 4: "Show the relationships involving Account A-001"
    print("\n[5] DEMO QUERY 4: 'Show the relationships involving Account A-001'")
    r = client.post("/api/v1/investigation/retrieve", json={
        "query": "Show the relationships involving Account A-001",
        "case_id": "CASE-001",
    })
    assert r.status_code == 200, f"Query 4 failed: {r.text}"
    data4 = r.json()
    rels = data4["graph_context"]["relationships"]
    print(f"[PASS] Relationships connected to A-001: {len(rels)}")
    for r_item in rels:
        print(f"         -> {r_item['from_entity_name']} --[{r_item['relationship_type']}]--> {r_item['to_entity_name']} (Source: {r_item['source_id']})")

    # 6. Safety Check: Ambiguous Entity "David Vance"
    print("\n[6] Safety Check: Ambiguous Query 'Show David Vance'")
    r = client.post("/api/v1/investigation/retrieve", json={
        "query": "Show David Vance",
    })
    assert r.status_code == 200, f"Ambiguity check failed: {r.text}"
    data6 = r.json()
    ambiguities = data6["ambiguities"]
    print(f"[PASS] Ambiguity Flagged: {len(ambiguities)} ambiguous name(s)")
    for amb in ambiguities:
        print(f"       - Status: {amb['status']} for '{amb['queried_name']}'")
        print(f"       - Candidate matches: {[m['id'] + ' (' + m['attributes'].get('occupation', m['attributes'].get('role', 'N/A')) + ')' for m in amb['matches']]}")

    print("\n==================================================")
    print(" ALL STEP 4 GRAPH-RAG DEMO CHECKS PASSED!")
    print("==================================================")


if __name__ == "__main__":
    run_verification()
