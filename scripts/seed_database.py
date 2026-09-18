#!/usr/bin/env python
"""Seed script for Network Hunter demonstration dataset.

Usage:
    python scripts/seed_database.py [--reset]
"""

import sys
import os
from pathlib import Path

# Add backend directory to sys.path
root_dir = Path(__file__).resolve().parent.parent
backend_dir = root_dir / "backend"
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

from app.db.seed import run_seed

if __name__ == "__main__":
    reset = "--no-reset" not in sys.argv
    print(f"Executing database seed (reset={reset})...")
    stats = run_seed(reset=reset)
    print("All tables populated successfully.")
