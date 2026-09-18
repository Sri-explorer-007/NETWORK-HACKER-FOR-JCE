from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field


class RAGFilters(BaseModel):
    """Filter criteria for vector similarity retrieval."""
    case_id: Optional[str] = None
    entity_id: Optional[str] = None
    source_type: Optional[str] = None
    verification_status: Optional[str] = None
    date_from: Optional[str] = None  # Format: YYYY-MM-DD
    date_to: Optional[str] = None    # Format: YYYY-MM-DD


class EvidenceMetadata(BaseModel):
    """Standardized metadata payload attached to evidence documents and vector chunks."""
    evidence_id: str
    case_id: Optional[str] = None
    source_id: str
    source_type: str
    evidence_type: str
    evidence_date: str  # YYYY-MM-DD
    verification_status: str
    entity_ids: List[str] = Field(default_factory=list)
    entity_names: List[str] = Field(default_factory=list)
    data_origin: str = "SYNTHETIC"
    demo_only: bool = True
    extra_fields: Dict[str, Any] = Field(default_factory=dict)

    def to_dict(self) -> Dict[str, Any]:
        return {
            "evidence_id": self.evidence_id,
            "case_id": self.case_id,
            "source_id": self.source_id,
            "source_type": self.source_type,
            "evidence_type": self.evidence_type,
            "evidence_date": self.evidence_date,
            "verification_status": self.verification_status,
            "entity_ids": self.entity_ids,
            "entity_names": self.entity_names,
            "data_origin": self.data_origin,
            "demo_only": self.demo_only,
            **self.extra_fields,
        }


def matches_filters(meta: Dict[str, Any], filters: Optional[RAGFilters]) -> bool:
    """Evaluates whether metadata dictionary matches the given RAG search filters."""
    if not filters:
        return True

    # 1. Case ID filter
    if filters.case_id:
        if meta.get("case_id") != filters.case_id:
            return False

    # 2. Entity ID filter (check if entity_id is among the involved entity_ids)
    if filters.entity_id:
        involved_entities = meta.get("entity_ids", [])
        if filters.entity_id not in involved_entities:
            return False

    # 3. Source Type filter
    if filters.source_type:
        if meta.get("source_type") != filters.source_type:
            return False

    # 4. Verification Status filter
    if filters.verification_status:
        if meta.get("verification_status") != filters.verification_status:
            return False

    # 5. Date range filter
    ev_date_str = meta.get("evidence_date")
    if ev_date_str:
        try:
            ev_date = datetime.strptime(ev_date_str[:10], "%Y-%m-%d").date()
            if filters.date_from:
                date_from = datetime.strptime(filters.date_from[:10], "%Y-%m-%d").date()
                if ev_date < date_from:
                    return False
            if filters.date_to:
                date_to = datetime.strptime(filters.date_to[:10], "%Y-%m-%d").date()
                if ev_date > date_to:
                    return False
        except (ValueError, TypeError):
            pass
    elif filters.date_from or filters.date_to:
        # If date filter required but record has no date
        return False

    return True
