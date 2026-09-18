from datetime import datetime
from typing import Optional, Dict, Any
from pydantic import BaseModel, ConfigDict, Field


class EvidenceResponse(BaseModel):
    id: str
    source_id: str
    case_id: Optional[str] = None
    evidence_type: str
    title: str
    content: str
    evidence_date: datetime
    verification_status: str
    metadata: Dict[str, Any] = Field(default_factory=dict, validation_alias="extra_metadata", serialization_alias="metadata")
    created_at: datetime

    model_config = ConfigDict(from_attributes=True, populate_by_name=True)
