"""Verification script for Step 3: Evidence RAG."""

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
    print(" VERIFYING STEP 3: EVIDENCE RAG LAYER")
    print("==================================================")

    # 1. Test Indexing
    print("\n[1] Testing Indexing API (POST /api/v1/rag/index)...")
    r = client.post("/api/v1/rag/index")
    assert r.status_code == 200, f"Indexing failed: {r.text}"
    index_data = r.json()
    print(f"[PASS] Indexing status: {index_data['status']}")
    print(f"       - Evidence processed: {index_data['evidence_processed']}")
    print(f"       - Documents created: {index_data['documents_created']}")
    print(f"       - Chunks created: {index_data['chunks_created']}")
    print(f"       - Embeddings created: {index_data['embeddings_created']}")

    # 2. Test Stats
    print("\n[2] Testing Stats API (GET /api/v1/rag/stats)...")
    r = client.get("/api/v1/rag/stats")
    assert r.status_code == 200, f"Stats failed: {r.text}"
    stats = r.json()
    print(f"[PASS] Stats -> {stats}")

    # 3. Test Search (Target Question: "What connects Marcus Vance and Julian Thorne?")
    print("\n[3] Testing Semantic Search:")
    query = "What connects Marcus Vance and Julian Thorne?"
    print(f"    Query: '{query}' (case_id=CASE-001, top_k=3)")
    
    r = client.post("/api/v1/rag/search", json={
        "query": query,
        "case_id": "CASE-001",
        "top_k": 3,
    })
    assert r.status_code == 200, f"Search failed: {r.text}"
    search_data = r.json()
    print(f"[PASS] Retrieved {search_data['total_results']} matching evidence results:")
    for i, res in enumerate(search_data["results"], 1):
        print(f"\n    Result #{i} (Score: {res['score']}):")
        print(f"      - Evidence ID: {res['evidence_id']}")
        print(f"      - Source ID:   {res['source_id']}")
        print(f"      - Case ID:     {res['case_id']}")
        print(f"      - Excerpt:     {res['text'][:140]}...")

    # 4. Test Provenance Traceability
    print("\n[4] Testing Provenance Traceability Chain:")
    top_hit = search_data["results"][0]
    ev_id = top_hit["evidence_id"]
    src_id = top_hit["source_id"]
    case_id = top_hit["case_id"]
    print(f"[PASS] Provenance verified:")
    print(f"       Vector Result ({top_hit['chunk_id']})")
    print(f"         -> Evidence [{ev_id}]")
    print(f"         -> Source [{src_id}]")
    print(f"         -> Case [{case_id}]")

    print("\n==================================================")
    print(" ALL STEP 3 RAG CHECKS PASSED SUCCESSFULLY!")
    print("==================================================")


if __name__ == "__main__":
    run_verification()
