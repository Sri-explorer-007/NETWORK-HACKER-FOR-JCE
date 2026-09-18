from datetime import datetime
from typing import Optional, Dict, Any, List
from pydantic import BaseModel, ConfigDict


class EntityBase(BaseModel):
    id: str
    entity_type: str
    name: str
    description: Optional[str] = None
    status: str = "ACTIVE"
    attributes: Dict[str, Any] = {}


class EntityResponse(EntityBase):
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class EntityConnectionItem(BaseModel):
    relationship_id: str
    relationship_type: str
    description: Optional[str] = None
    direction: str  # "OUTGOING" or "INCOMING"
    connected_entity_id: str
    connected_entity_name: str
    connected_entity_type: str
    confidence: float
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    source_id: Optional[str] = None
    case_id: Optional[str] = None


class EntityConnectionsResponse(BaseModel):
    entity: EntityResponse
    total_connections: int
    connections: List[EntityConnectionItem]


class EntityDetailResponse(EntityResponse):
    associated_cases: List[str] = []
    direct_connections_count: int = 0
