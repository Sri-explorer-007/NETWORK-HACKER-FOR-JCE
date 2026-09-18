#!/usr/bin/env python
"""CLI script to index all evidence records into the Network Hunter Vector Store.

Usage:
    python scripts/index_rag.py [--force]
"""

import sys
from pathlib import Path

# Add backend directory to sys.path
root_dir = Path(__file__).resolve().parent.parent
backend_dir = root_dir / "backend"
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

from app.db.session import get_session_factory
from app.rag.retriever import rag_service

def run_indexing(force: bool = False):
    print("==================================================")
    print(" NETWORK HUNTER - EVIDENCE VECTOR INDEXING")
    print("==================================================")
    SessionFactory = get_session_factory()
    db = SessionFactory()
    try:
        stats = rag_service.index_all_evidence(db=db, force_reindex=force)
        print("--------------------------------------------------")
        print("Indexing Summary:")
        for k, v in stats.items():
            print(f"  - {k}: {v}")
        
        pipeline_stats = rag_service.get_stats(db=db)
        print("--------------------------------------------------")
        print("Vector Database State:")
        for k, v in pipeline_stats.items():
            print(f"  - {k}: {v}")
        print("==================================================")
        return stats
    finally:
        db.close()


if __name__ == "__main__":
    force_arg = "--force" in sys.argv or "-f" in sys.argv
    run_indexing(force=force_arg)
