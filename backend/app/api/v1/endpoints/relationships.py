from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.relationship import Relationship
from app.models.source import Source
from app.models.evidence import Evidence
from app.schemas.relationship import RelationshipResponse, RelationshipEvidenceResponse
from app.schemas.source import SourceResponse
from app.schemas.evidence import EvidenceResponse

router = APIRouter()


@router.get(
    "",
    response_model=List[RelationshipResponse],
    summary="List all relationships",
    description="Retrieve all entity-to-entity relationships.",
)
def list_relationships(db: Session = Depends(get_db)) -> List[RelationshipResponse]:
    relationships = db.query(Relationship).order_by(Relationship.created_at.desc()).all()
    return relationships


@router.get(
    "/{relationship_id}",
    response_model=RelationshipResponse,
    summary="Get relationship by ID",
    description="Retrieve specific relationship information, confidence score, timestamps, and source provenance reference.",
)
def get_relationship(relationship_id: str, db: Session = Depends(get_db)) -> RelationshipResponse:
    rel = db.query(Relationship).filter(Relationship.id == relationship_id).first()
    if not rel:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Relationship with ID '{relationship_id}' not found.",
        )
    return RelationshipResponse.model_validate(rel)


@router.get(
    "/{relationship_id}/evidence",
    response_model=RelationshipEvidenceResponse,
    summary="Get provenance evidence for relationship",
    description="Retrieve the source documentation and verified evidence records substantiating this relationship.",
)
def get_relationship_evidence(relationship_id: str, db: Session = Depends(get_db)) -> RelationshipEvidenceResponse:
    rel = db.query(Relationship).filter(Relationship.id == relationship_id).first()
    if not rel:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Relationship with ID '{relationship_id}' not found.",
        )

    source_obj = None
    evidence_items = []
    provenance_chain = [
        f"Entity [{rel.from_entity_id}]",
        f"Relationship [{rel.relationship_type}] (ID: {rel.id})",
        f"Entity [{rel.to_entity_id}]",
    ]

    if rel.source_id:
        source = db.query(Source).filter(Source.id == rel.source_id).first()
        if source:
            source_obj = SourceResponse.model_validate(source)
            provenance_chain.append(f"Source [{source.source_type}] Ref: {source.reference_code} (ID: {source.id})")

            # Query evidence matching this source
            ev_records = db.query(Evidence).filter(Evidence.source_id == source.id).all()
            evidence_items = [
                EvidenceResponse.model_validate(ev)
                for ev in ev_records
            ]

            for ev in ev_records:
                provenance_chain.append(f"Evidence [{ev.evidence_type}] Status: {ev.verification_status} (ID: {ev.id})")
        else:
            provenance_chain.append(f"Source ID [{rel.source_id}] (Not Found)")
    else:
        provenance_chain.append("Provenance: INFERRED (No explicit source record)")

    return RelationshipEvidenceResponse(
        relationship=RelationshipResponse.model_validate(rel),
        source=source_obj,
        evidence_items=evidence_items,
        provenance_chain=provenance_chain,
    )
