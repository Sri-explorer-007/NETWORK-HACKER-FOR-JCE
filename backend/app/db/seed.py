"""Database Seeding Module for Network Hunter."""

import sys
from sqlalchemy.orm import Session

from app.db.init_db import create_tables, drop_tables
from app.db.session import get_session_factory
from app.db.synthetic_data import get_synthetic_dataset
from app.models.case import Case, CaseEntity
from app.models.entity import Entity
from app.models.source import Source
from app.models.evidence import Evidence
from app.models.relationship import Relationship
from app.models.event import Event, EventEntity


def seed_database(db: Session, reset: bool = False) -> dict:
    """Populates the database with the demonstration synthetic investigation dataset."""
    if reset:
        drop_tables()
    create_tables()

    data = get_synthetic_dataset()
    stats = {}

    # 1. Cases
    existing_case_ids = {c.id for c in db.query(Case.id).all()}
    cases_to_add = []
    for c_data in data["cases"]:
        if c_data["id"] not in existing_case_ids:
            cases_to_add.append(Case(**c_data))
    if cases_to_add:
        db.add_all(cases_to_add)
        db.flush()
    stats["cases"] = db.query(Case).count()

    # 2. Entities
    existing_entity_ids = {e.id for e in db.query(Entity.id).all()}
    entities_to_add = []
    for e_data in data["entities"]:
        if e_data["id"] not in existing_entity_ids:
            entities_to_add.append(Entity(**e_data))
    if entities_to_add:
        db.add_all(entities_to_add)
        db.flush()
    stats["entities"] = db.query(Entity).count()

    # 3. Case Entities (M2M)
    existing_ce = {(ce.case_id, ce.entity_id) for ce in db.query(CaseEntity.case_id, CaseEntity.entity_id).all()}
    ce_to_add = []
    for ce_data in data["case_entities"]:
        key = (ce_data["case_id"], ce_data["entity_id"])
        if key not in existing_ce:
            ce_to_add.append(CaseEntity(**ce_data))
    if ce_to_add:
        db.add_all(ce_to_add)
        db.flush()
    stats["case_entities"] = db.query(CaseEntity).count()

    # 4. Sources
    existing_src_ids = {s.id for s in db.query(Source.id).all()}
    src_to_add = []
    for s_data in data["sources"]:
        if s_data["id"] not in existing_src_ids:
            src_to_add.append(Source(**s_data))
    if src_to_add:
        db.add_all(src_to_add)
        db.flush()
    stats["sources"] = db.query(Source).count()

    # 5. Evidence
    existing_evd_ids = {ev.id for ev in db.query(Evidence.id).all()}
    evd_to_add = []
    for ev_data in data["evidence"]:
        if ev_data["id"] not in existing_evd_ids:
            evd_to_add.append(Evidence(**ev_data))
    if evd_to_add:
        db.add_all(evd_to_add)
        db.flush()
    stats["evidence"] = db.query(Evidence).count()

    # 6. Relationships
    existing_rel_ids = {r.id for r in db.query(Relationship.id).all()}
    rel_to_add = []
    for r_data in data["relationships"]:
        if r_data["id"] not in existing_rel_ids:
            rel_to_add.append(Relationship(**r_data))
    if rel_to_add:
        db.add_all(rel_to_add)
        db.flush()
    stats["relationships"] = db.query(Relationship).count()

    # 7. Events and EventEntities
    existing_evt_ids = {evt.id for evt in db.query(Event.id).all()}
    for evt_data in data["events"]:
        participants = evt_data.pop("participants", [])
        if evt_data["id"] not in existing_evt_ids:
            event_obj = Event(**evt_data)
            db.add(event_obj)
            db.flush()
            for p in participants:
                ee = EventEntity(
                    event_id=event_obj.id,
                    entity_id=p["entity_id"],
                    role=p["role"],
                )
                db.add(ee)
    db.commit()
    stats["events"] = db.query(Event).count()
    stats["event_entities"] = db.query(EventEntity).count()

    return stats


def run_seed(reset: bool = True):
    """Run database seeding using current session factory."""
    SessionFactory = get_session_factory()
    db = SessionFactory()
    try:
        print("Starting Network Hunter Database Seeding...")
        stats = seed_database(db, reset=reset)
        print("Database Seed Completed Successfully!")
        print("Summary of Seeded Records:")
        for table, count in stats.items():
            print(f"  - {table}: {count}")
        return stats
    finally:
        db.close()


if __name__ == "__main__":
    reset_arg = "--reset" in sys.argv or "-r" in sys.argv
    run_seed(reset=reset_arg)
