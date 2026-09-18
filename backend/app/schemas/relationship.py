from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, ConfigDict
from app.schemas.source import SourceResponse
from app.schemas.evidence import EvidenceResponse


class RelationshipResponse(BaseModel):
    id: str
    from_entity_id: str
    to_entity_id: str
    relationship_type: str
    description: Optional[str] = None
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    status: str
    confidence: float
    case_id: Optional[str] = None
    source_id: Optional[str] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class RelationshipEvidenceResponse(BaseModel):
    relationship: RelationshipResponse
    source: Optional[SourceResponse] = None
    evidence_items: List[EvidenceResponse] = []
    provenance_chain: List[str] = []
