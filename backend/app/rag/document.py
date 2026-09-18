from typing import List, Dict, Any, Optional
from dataclasses import dataclass, field
from sqlalchemy.orm import Session

from app.models.evidence import Evidence
from app.models.source import Source
from app.models.case import Case
from app.models.entity import Entity
from app.models.relationship import Relationship
from app.models.event import Event, EventEntity
from app.rag.metadata import EvidenceMetadata


@dataclass
class EvidenceDocument:
    """Canonical document representation of an Evidence record for RAG."""
    document_id: str
    evidence_id: str
    case_id: Optional[str]
    source_id: str
    text: str
    metadata: Dict[str, Any] = field(default_factory=dict)


def build_evidence_document(evidence: Evidence, db: Session) -> EvidenceDocument:
    """Constructs a rich, deterministic, searchable document from an Evidence record and its relational context."""
    doc_id = f"DOC-{evidence.id}"
    
    # 1. Fetch Source details
    source = db.query(Source).filter(Source.id == evidence.source_id).first()
    source_type = source.source_type if source else "UNKNOWN_SOURCE"
    source_ref = source.reference_code if source else "N/A"
    source_title = source.title if source else "N/A"

    # 2. Fetch Case details
    case = db.query(Case).filter(Case.id == evidence.case_id).first() if evidence.case_id else None
    case_title = case.title if case else "N/A"
    case_number = case.case_number if case else "N/A"

    # 3. Discover involved entities via relationships & events linked to this source/case
    entity_ids = set()
    entity_names = []
    
    # Check relationships with matching source_id
    linked_rels = db.query(Relationship).filter(Relationship.source_id == evidence.source_id).all()
    rel_descriptions = []
    for r in linked_rels:
        entity_ids.add(r.from_entity_id)
        entity_ids.add(r.to_entity_id)
        rel_descriptions.append(f"{r.from_entity_id} {r.relationship_type} {r.to_entity_id} ({r.description})")

    # Check events with matching source_id
    linked_events = db.query(Event).filter(Event.source_id == evidence.source_id).all()
    event_descriptions = []
    for evt in linked_events:
        if evt.location_id:
            entity_ids.add(evt.location_id)
        ev_entities = db.query(EventEntity).filter(EventEntity.event_id == evt.id).all()
        for ee in ev_entities:
            entity_ids.add(ee.entity_id)
        event_descriptions.append(f"{evt.event_type} on {evt.timestamp.strftime('%Y-%m-%d %H:%M')} - {evt.description}")

    # Query entity names
    if entity_ids:
        entities = db.query(Entity).filter(Entity.id.in_(list(entity_ids))).all()
        for ent in entities:
            entity_names.append(f"{ent.name} ({ent.id}, {ent.entity_type})")

    # 4. Construct deterministic text representation
    date_str = evidence.evidence_date.strftime("%Y-%m-%d") if evidence.evidence_date else "Unknown Date"
    
    text_lines = [
        f"Evidence Record: {evidence.id} - {evidence.title}",
        f"Case: {evidence.case_id or 'Unassigned'} ({case_title}) | Case Number: {case_number}",
        f"Source: {source_ref} ({source_type}) - {source_title}",
        f"Date: {date_str}",
        f"Verification Status: {evidence.verification_status}",
    ]

    if entity_names:
        text_lines.append(f"Involved Entities: {', '.join(sorted(entity_names))}")

    if rel_descriptions:
        text_lines.append(f"Associated Relationships: {'; '.join(rel_descriptions)}")

    if event_descriptions:
        text_lines.append(f"Associated Events: {'; '.join(event_descriptions)}")

    text_lines.append(f"Evidence Content: {evidence.content.strip()}")

    full_text = "\n".join(text_lines)

    # 5. Build structured metadata
    meta = EvidenceMetadata(
        evidence_id=evidence.id,
        case_id=evidence.case_id,
        source_id=evidence.source_id,
        source_type=source_type,
        evidence_type=evidence.evidence_type,
        evidence_date=date_str,
        verification_status=evidence.verification_status,
        entity_ids=sorted(list(entity_ids)),
        entity_names=sorted(entity_names),
        data_origin="SYNTHETIC",
        demo_only=True,
        extra_fields={
            "document_id": doc_id,
            "source_reference": source_ref,
            "case_title": case_title,
        },
    )

    return EvidenceDocument(
        document_id=doc_id,
        evidence_id=evidence.id,
        case_id=evidence.case_id,
        source_id=evidence.source_id,
        text=full_text,
        metadata=meta.to_dict(),
    )
