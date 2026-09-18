from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, ConfigDict


class CaseBase(BaseModel):
    id: str
    case_number: str
    title: str
    description: Optional[str] = None
    status: str
    priority: str


class CaseResponse(CaseBase):
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class CaseEntityRole(BaseModel):
    entity_id: str
    role: str
    name: Optional[str] = None
    entity_type: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


class CaseDetailResponse(CaseResponse):
    entities: List[CaseEntityRole] = []
    entities_count: int = 0
    relationships_count: int = 0
    events_count: int = 0
    sources_count: int = 0
    evidence_count: int = 0
