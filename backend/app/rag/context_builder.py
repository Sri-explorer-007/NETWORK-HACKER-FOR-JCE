from typing import List, Dict, Any, Optional, Set
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from app.models.source import Source
from app.models.case import Case
from app.models.evidence import Evidence
from app.graph.graph_models import (
    ResolvedEntity,
    EntityAmbiguity,
    GraphEntityNode,
    GraphRelationship,
    GraphPath,
    CrossCaseConnection,
)


class TimelineEventItem(BaseModel):
    event_id: str
    timestamp: str
    event_type: str
    description: str
    location_id: Optional[str] = None
    location_name: Optional[str] = None
    case_id: Optional[str] = None
    source_id: Optional[str] = None
    involved_entity_ids: List[str] = Field(default_factory=list)
    retrieval_reason: str = "TIMELINE_EVENT"


class EvidenceContextItem(BaseModel):
    evidence_id: str
    source_id: str
    case_id: Optional[str] = None
    document_id: str
    chunk_id: str
    text: str
    score: float
    verification_status: str
    metadata: Dict[str, Any] = Field(default_factory=dict)
    retrieval_reason: str = "SEMANTIC_EVIDENCE_MATCH"


class ProvenanceRecord(BaseModel):
    entity_id: Optional[str] = None
    relationship_id: Optional[str] = None
    source_id: str
    source_reference: str
    source_type: str
    evidence_id: str
    evidence_type: str
    verification_status: str
    case_id: Optional[str] = None
    case_number: Optional[str] = None
    provenance_path: str


class InvestigationContext(BaseModel):
    """Unified, explainable investigation context payload fusing Graph, Timeline, and Evidence RAG."""
    query: str
    case_id: Optional[str] = None
    resolved_entities: List[ResolvedEntity] = Field(default_factory=list)
    ambiguities: List[EntityAmbiguity] = Field(default_factory=list)
    
    graph_context: Dict[str, Any] = Field(
        default_factory=lambda: {
            "nodes": [],
            "relationships": [],
            "paths": [],
            "cross_case": None,
        }
    )
    
    timeline_context: Dict[str, Any] = Field(
        default_factory=lambda: {
            "events": [],
            "total_events": 0,
        }
    )
    
    evidence_context: Dict[str, Any] = Field(
        default_factory=lambda: {
            "results": [],
            "total_results": 0,
        }
    )
    
    sources: List[Dict[str, Any]] = Field(default_factory=list)
    provenance: List[ProvenanceRecord] = Field(default_factory=list)


class ContextBuilder:
    """Fuses and enriches Graph, Timeline, and Vector Evidence results into an InvestigationContext."""

    def build_investigation_context(
        self,
        query: str,
        case_id: Optional[str],
        resolved_entities: List[ResolvedEntity],
        ambiguities: List[EntityAmbiguity],
        nodes: List[GraphEntityNode],
        relationships: List[GraphRelationship],
        paths: List[GraphPath],
        cross_case: Optional[CrossCaseConnection],
        timeline_events: List[TimelineEventItem],
        evidence_results: List[Dict[str, Any]],
        db: Session,
    ) -> InvestigationContext:
        """Constructs the canonical fusion object with deduplication, sources list, and provenance traces."""
        
        # 1. Deduplicate Nodes
        seen_nodes: Set[str] = set()
        dedup_nodes: List[Dict[str, Any]] = []
        for n in nodes:
            if n.id not in seen_nodes:
                seen_nodes.add(n.id)
                dedup_nodes.append(n.model_dump())

        # 2. Deduplicate Relationships
        seen_rels: Set[str] = set()
        dedup_relationships: List[Dict[str, Any]] = []
        source_ids_to_fetch: Set[str] = set()
        case_ids_to_fetch: Set[str] = set()

        if case_id:
            case_ids_to_fetch.add(case_id)

        for r in relationships:
            if r.relationship_id not in seen_rels:
                seen_rels.add(r.relationship_id)
                dedup_relationships.append(r.model_dump())
                if r.source_id:
                    source_ids_to_fetch.add(r.source_id)
                if r.case_id:
                    case_ids_to_fetch.add(r.case_id)

        # 3. Format Evidence Context & collect IDs
        formatted_evidence: List[Dict[str, Any]] = []
        for ev_hit in evidence_results:
            v_status = ev_hit.get("metadata", {}).get("verification_status", "OBSERVED")
            src_id = ev_hit.get("source_id")
            c_id = ev_hit.get("case_id")
            
            if src_id and src_id != "N/A":
                source_ids_to_fetch.add(src_id)
            if c_id:
                case_ids_to_fetch.add(c_id)

            formatted_evidence.append({
                "evidence_id": ev_hit["evidence_id"],
                "source_id": src_id,
                "case_id": c_id,
                "document_id": ev_hit.get("document_id", f"DOC-{ev_hit['evidence_id']}"),
                "chunk_id": ev_hit.get("chunk_id", f"CHUNK-{ev_hit['evidence_id']}-0"),
                "text": ev_hit["text"],
                "score": ev_hit.get("score", 1.0),
                "verification_status": v_status,
                "metadata": ev_hit.get("metadata", {}),
                "retrieval_reason": "SEMANTIC_EVIDENCE_MATCH",
            })

        # 4. Fetch unique Sources
        sources_list: List[Dict[str, Any]] = []
        if source_ids_to_fetch:
            sources = db.query(Source).filter(Source.id.in_(list(source_ids_to_fetch))).all()
            for s in sources:
                sources_list.append({
                    "source_id": s.id,
                    "source_type": s.source_type,
                    "reference_code": s.reference_code,
                    "title": s.title,
                    "source_date": s.source_date.strftime("%Y-%m-%d"),
                    "status": s.status,
                    "case_id": s.case_id,
                })

        # 5. Build Complete Provenance Records
        provenance_list: List[ProvenanceRecord] = []
        source_map = {s["source_id"]: s for s in sources_list}
        cases_map = {}
        if case_ids_to_fetch:
            cases_records = db.query(Case).filter(Case.id.in_(list(case_ids_to_fetch))).all()
            cases_map = {c.id: c for c in cases_records}

        # Build provenance for retrieved evidence items
        for ev_hit in formatted_evidence:
            ev_id = ev_hit["evidence_id"]
            src_id = ev_hit["source_id"]
            c_id = ev_hit["case_id"]
            src_info = source_map.get(src_id, {})
            c_info = cases_map.get(c_id)

            src_ref = src_info.get("reference_code", "N/A")
            src_type = src_info.get("source_type", "N/A")
            c_num = c_info.case_number if c_info else (c_id or "N/A")
            ev_type = ev_hit.get("metadata", {}).get("evidence_type", "EVIDENCE")
            v_stat = ev_hit["verification_status"]

            provenance_path = f"Evidence [{ev_id}] ({ev_type}, {v_stat}) → Source [{src_id}] ({src_ref}) → Case [{c_num}]"

            provenance_list.append(
                ProvenanceRecord(
                    evidence_id=ev_id,
                    source_id=src_id,
                    source_reference=src_ref,
                    source_type=src_type,
                    evidence_type=ev_type,
                    verification_status=v_stat,
                    case_id=c_id,
                    case_number=c_num,
                    provenance_path=provenance_path,
                )
            )

        # 6. Assemble Final InvestigationContext
        return InvestigationContext(
            query=query,
            case_id=case_id,
            resolved_entities=resolved_entities,
            ambiguities=ambiguities,
            graph_context={
                "nodes": dedup_nodes,
                "relationships": dedup_relationships,
                "paths": [p.model_dump() for p in paths],
                "cross_case": cross_case.model_dump() if cross_case else None,
            },
            timeline_context={
                "events": [e.model_dump() for e in timeline_events],
                "total_events": len(timeline_events),
            },
            evidence_context={
                "results": formatted_evidence,
                "total_results": len(formatted_evidence),
            },
            sources=sources_list,
            provenance=provenance_list,
        )


context_builder = ContextBuilder()
