from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.case import Case, CaseEntity
from app.models.entity import Entity
from app.models.relationship import Relationship
from app.models.event import Event, EventEntity
from app.models.source import Source
from app.models.evidence import Evidence
from app.schemas.case import CaseResponse, CaseDetailResponse, CaseEntityRole
from app.schemas.network import NetworkNode, NetworkEdge, NetworkGraphResponse
from app.schemas.event import EventResponse, TimelineResponse, EventParticipant

router = APIRouter()


@router.get(
    "",
    response_model=List[CaseResponse],
    summary="List all investigation cases",
    description="Retrieve all registered investigation cases in the platform.",
)
def list_cases(db: Session = Depends(get_db)) -> List[CaseResponse]:
    cases = db.query(Case).order_by(Case.created_at.desc()).all()
    return cases


@router.get(
    "/{case_id}",
    response_model=CaseDetailResponse,
    summary="Get case details by ID",
    description="Retrieve specific case metadata, associated entity roles, and summary metrics.",
)
def get_case(case_id: str, db: Session = Depends(get_db)) -> CaseDetailResponse:
    case = db.query(Case).filter(Case.id == case_id).first()
    if not case:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Case with ID '{case_id}' not found.",
        )

    # Fetch associated entities with roles
    case_entities = (
        db.query(CaseEntity, Entity)
        .join(Entity, CaseEntity.entity_id == Entity.id)
        .filter(CaseEntity.case_id == case_id)
        .all()
    )

    entity_roles = [
        CaseEntityRole(
            entity_id=ce.entity_id,
            role=ce.role,
            name=ent.name,
            entity_type=ent.entity_type,
        )
        for ce, ent in case_entities
    ]

    relationships_count = db.query(Relationship).filter(Relationship.case_id == case_id).count()
    events_count = db.query(Event).filter(Event.case_id == case_id).count()
    sources_count = db.query(Source).filter(Source.case_id == case_id).count()
    evidence_count = db.query(Evidence).filter(Evidence.case_id == case_id).count()

    return CaseDetailResponse(
        id=case.id,
        case_number=case.case_number,
        title=case.title,
        description=case.description,
        status=case.status,
        priority=case.priority,
        created_at=case.created_at,
        updated_at=case.updated_at,
        entities=entity_roles,
        entities_count=len(entity_roles),
        relationships_count=relationships_count,
        events_count=events_count,
        sources_count=sources_count,
        evidence_count=evidence_count,
    )


@router.get(
    "/{case_id}/network",
    response_model=NetworkGraphResponse,
    summary="Get case network graph",
    description="Returns graph-ready nodes and edges associated with the given case.",
)
def get_case_network(case_id: str, db: Session = Depends(get_db)) -> NetworkGraphResponse:
    case = db.query(Case).filter(Case.id == case_id).first()
    if not case:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Case with ID '{case_id}' not found.",
        )

    # 1. Fetch case entities
    case_entity_records = (
        db.query(CaseEntity, Entity)
        .join(Entity, CaseEntity.entity_id == Entity.id)
        .filter(CaseEntity.case_id == case_id)
        .all()
    )

    nodes_dict = {}
    for ce, ent in case_entity_records:
        nodes_dict[ent.id] = NetworkNode(
            id=ent.id,
            label=ent.name,
            entity_type=ent.entity_type,
            status=ent.status,
            description=ent.description,
            attributes=ent.attributes or {},
            case_role=ce.role,
        )

    # 2. Fetch relationships assigned to this case
    case_rels = db.query(Relationship).filter(Relationship.case_id == case_id).all()
    
    # Also fetch any missing endpoint entities from relationships
    missing_entity_ids = set()
    for r in case_rels:
        if r.from_entity_id not in nodes_dict:
            missing_entity_ids.add(r.from_entity_id)
        if r.to_entity_id not in nodes_dict:
            missing_entity_ids.add(r.to_entity_id)

    if missing_entity_ids:
        missing_ents = db.query(Entity).filter(Entity.id.in_(missing_entity_ids)).all()
        for ent in missing_ents:
            nodes_dict[ent.id] = NetworkNode(
                id=ent.id,
                label=ent.name,
                entity_type=ent.entity_type,
                status=ent.status,
                description=ent.description,
                attributes=ent.attributes or {},
                case_role="ASSOCIATE",
            )

    edges = [
        NetworkEdge(
            id=r.id,
            source=r.from_entity_id,
            target=r.to_entity_id,
            relationship_type=r.relationship_type,
            description=r.description,
            confidence=r.confidence,
            status=r.status,
            start_time=r.start_time,
            end_time=r.end_time,
            source_id=r.source_id,
            case_id=r.case_id,
        )
        for r in case_rels
    ]

    nodes_list = list(nodes_dict.values())

    return NetworkGraphResponse(
        case_id=case_id,
        total_nodes=len(nodes_list),
        total_edges=len(edges),
        nodes=nodes_list,
        edges=edges,
    )


@router.get(
    "/{case_id}/timeline",
    response_model=TimelineResponse,
    summary="Get case chronological timeline",
    description="Retrieve all events for a case sorted in chronological order with participant details.",
)
def get_case_timeline(case_id: str, db: Session = Depends(get_db)) -> TimelineResponse:
    case = db.query(Case).filter(Case.id == case_id).first()
    if not case:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Case with ID '{case_id}' not found.",
        )

    events = (
        db.query(Event)
        .filter(Event.case_id == case_id)
        .order_by(Event.timestamp.asc())
        .all()
    )

    timeline_events = []
    for evt in events:
        # Load participants with entity names
        event_participants = (
            db.query(EventEntity, Entity)
            .join(Entity, EventEntity.entity_id == Entity.id)
            .filter(EventEntity.event_id == evt.id)
            .all()
        )

        participants_list = [
            EventParticipant(
                entity_id=ee.entity_id,
                role=ee.role,
                name=ent.name,
                entity_type=ent.entity_type,
            )
            for ee, ent in event_participants
        ]

        loc_name = evt.location.name if evt.location else None

        timeline_events.append(
            EventResponse(
                id=evt.id,
                event_type=evt.event_type,
                timestamp=evt.timestamp,
                description=evt.description,
                location_id=evt.location_id,
                location_name=loc_name,
                case_id=evt.case_id,
                source_id=evt.source_id,
                created_at=evt.created_at,
                entities=participants_list,
            )
        )

    return TimelineResponse(
        case_id=case_id,
        total_events=len(timeline_events),
        events=timeline_events,
    )
