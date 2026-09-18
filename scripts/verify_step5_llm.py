import os
import sys

# Ensure backend directory is in sys.path
backend_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "backend"))
if backend_path not in sys.path:
    sys.path.insert(0, backend_path)

from app.db.session import get_session_factory
from app.db.seed import seed_database
from app.rag.retriever import rag_service
from app.rag.hybrid_retriever import hybrid_retriever
from app.llm.service import llm_service


DEMO_QUERIES = [
    {
        "id": "QUERY 1 (Multi-Hop Graph Path & Evidence)",
        "query": "What connects Marcus Vance and Julian Thorne?",
        "case_id": "CASE-001",
    },
    {
        "id": "QUERY 2 (Chronological Timeline Analysis)",
        "query": "What happened between Marcus Vance and Julian Thorne between January and March 2026?",
        "case_id": "CASE-001",
    },
    {
        "id": "QUERY 3 (Cross-Case Linkage)",
        "query": "What connects CASE-001 and CASE-002?",
        "case_id": None,
    },
    {
        "id": "QUERY 4 (Shared Asset/Account Investigation)",
        "query": "What relationships involve account A-001?",
        "case_id": "CASE-001",
    },
    {
        "id": "QUERY 5 (Supporting Evidence & Provenance)",
        "query": "What evidence supports the connection between Marcus Vance and Julian Thorne?",
        "case_id": "CASE-001",
    },
    {
        "id": "QUERY 6 (Duplicate Name Ambiguity Protection)",
        "query": "Show David Vance",
        "case_id": None,
    },
]


def run_verification():
    print("=" * 80)
    print("NETWORK HUNTER - STEP 5: GROUNDED LLM INVESTIGATION VERIFICATION")
    print("=" * 80)

    SessionFactory = get_session_factory()
    db = SessionFactory()

    try:
        # Seed and index to guarantee fresh clean state
        print("\n[DB] Ensuring database seeded and evidence vector index is synchronized...")
        seed_database(db, reset=False)
        rag_service.index_all_evidence(db, force_reindex=False)
        print("[DB] Ready.")

        for item in DEMO_QUERIES:
            q_id = item["id"]
            query_str = item["query"]
            case_id = item["case_id"]

            print("\n" + "#" * 80)
            print(f"DEMO CASE: {q_id}")
            print(f"QUERY: '{query_str}' (Case: {case_id or 'ALL'})")
            print("#" * 80)

            # 1. Hybrid Retrieval Context
            context = hybrid_retriever.retrieve(
                query=query_str,
                case_id=case_id,
                db=db,
            )

            # 2. Grounded LLM / Fallback Generation
            answer = llm_service.generate_answer(
                query=query_str,
                context=context,
            )

            # Print Structured Output
            resolved_ents = [f"{e.name} ({e.id})" for e in context.resolved_entities]
            amb_ents = []
            for amb in context.ambiguities:
                cand_list = ", ".join([f"{c.name} ({c.id})" for c in amb.matches])
                amb_ents.append(f"'{amb.queried_name}' -> [{cand_list}]")

            print(f"\n[MODE]: {answer.mode}")
            print(f"[RESOLVED ENTITIES]: {resolved_ents if resolved_ents else 'None'}")
            if amb_ents:
                print(f"[AMBIGUITIES DETECTED]: {amb_ents}")

            print(f"\n[GROUNDED ANSWER]:\n{answer.answer}")

            print("\n[STRUCTURED FINDINGS]:")
            for idx, f in enumerate(answer.findings, 1):
                ev_str = f"ev={f.evidence_ids}" if f.evidence_ids else "ev=[]"
                src_str = f"src={f.source_ids}" if f.source_ids else "src=[]"
                rel_str = f"rel={f.relationship_ids}" if f.relationship_ids else "rel=[]"
                print(f"  {idx}. [{f.finding_type}] (conf: {f.confidence_label}) | {ev_str} {src_str} {rel_str}")
                print(f"     Statement: {f.statement}")

            print(f"\n[EVIDENCE IDS]: {answer.evidence_ids}")
            print(f"[SOURCE IDS]: {answer.source_ids}")
            print(f"[RELATIONSHIP IDS]: {answer.relationship_ids}")
            print(f"[ENTITY IDS]: {answer.entity_ids}")
            print(f"[CAVEATS]: {answer.caveats}")
            print(f"[HUMAN REVIEW REQUIRED]: {answer.requires_human_review}")

        print("\n" + "=" * 80)
        print("STEP 5 GROUNDED LLM INVESTIGATION ASSISTANT: VERIFICATION SUCCESSFUL")
        print("=" * 80)

    finally:
        db.close()


if __name__ == "__main__":
    run_verification()
