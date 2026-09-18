from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import or_

from app.db.session import get_db
from app.models.entity import Entity
from app.models.case import CaseEntity
from app.models.relationship import Relationship
from app.schemas.entity import (
    EntityResponse,
    EntityDetailResponse,
    EntityConnectionsResponse,
    EntityConnectionItem,
)

router = APIRouter()


@router.get(
    "",
    response_model=List[EntityResponse],
    summary="List all entities",
    description="Retrieve all entities in the knowledge base.",
)
def list_entities(db: Session = Depends(get_db)) -> List[EntityResponse]:
    entities = db.query(Entity).order_by(Entity.name.asc()).all()
    return entities


@router.get(
    "/{entity_id}",
    response_model=EntityDetailResponse,
    summary="Get entity details by ID",
    description="Retrieve specific entity information, attributes, associated cases, and connection count.",
)
def get_entity(entity_id: str, db: Session = Depends(get_db)) -> EntityDetailResponse:
    entity = db.query(Entity).filter(Entity.id == entity_id).first()
    if not entity:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Entity with ID '{entity_id}' not found.",
        )

    # Fetch associated case IDs
    case_ids = [
        ce.case_id
        for ce in db.query(CaseEntity.case_id).filter(CaseEntity.entity_id == entity_id).all()
    ]

    # Count direct connections (incoming + outgoing)
    connections_count = (
        db.query(Relationship)
        .filter(or_(Relationship.from_entity_id == entity_id, Relationship.to_entity_id == entity_id))
        .count()
    )

    return EntityDetailResponse(
        id=entity.id,
        entity_type=entity.entity_type,
        name=entity.name,
        description=entity.description,
        status=entity.status,
        attributes=entity.attributes or {},
        created_at=entity.created_at,
        updated_at=entity.updated_at,
        associated_cases=case_ids,
        direct_connections_count=connections_count,
    )


@router.get(
    "/{entity_id}/connections",
    response_model=EntityConnectionsResponse,
    summary="Get all connections for an entity",
    description="Retrieve all incoming and outgoing relationships with connected entity details and source provenance.",
)
def get_entity_connections(entity_id: str, db: Session = Depends(get_db)) -> EntityConnectionsResponse:
    entity = db.query(Entity).filter(Entity.id == entity_id).first()
    if not entity:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Entity with ID '{entity_id}' not found.",
        )

    # Outgoing relationships
    outgoing_rels = (
        db.query(Relationship, Entity)
        .join(Entity, Relationship.to_entity_id == Entity.id)
        .filter(Relationship.from_entity_id == entity_id)
        .all()
    )

    # Incoming relationships
    incoming_rels = (
        db.query(Relationship, Entity)
        .join(Entity, Relationship.from_entity_id == Entity.id)
        .filter(Relationship.to_entity_id == entity_id)
        .all()
    )

    connection_items = []

    for rel, target_ent in outgoing_rels:
        connection_items.append(
            EntityConnectionItem(
                relationship_id=rel.id,
                relationship_type=rel.relationship_type,
                description=rel.description,
                direction="OUTGOING",
                connected_entity_id=target_ent.id,
                connected_entity_name=target_ent.name,
                connected_entity_type=target_ent.entity_type,
                confidence=rel.confidence,
                start_time=rel.start_time,
                end_time=rel.end_time,
                source_id=rel.source_id,
                case_id=rel.case_id,
            )
        )

    for rel, source_ent in incoming_rels:
        connection_items.append(
            EntityConnectionItem(
                relationship_id=rel.id,
                relationship_type=rel.relationship_type,
                description=rel.description,
                direction="INCOMING",
                connected_entity_id=source_ent.id,
                connected_entity_name=source_ent.name,
                connected_entity_type=source_ent.entity_type,
                confidence=rel.confidence,
                start_time=rel.start_time,
                end_time=rel.end_time,
                source_id=rel.source_id,
                case_id=rel.case_id,
            )
        )

    return EntityConnectionsResponse(
        entity=EntityResponse.model_validate(entity),
        total_connections=len(connection_items),
        connections=connection_items,
    )
