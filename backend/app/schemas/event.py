from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, ConfigDict


class EventParticipant(BaseModel):
    entity_id: str
    role: str
    name: Optional[str] = None
    entity_type: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


class EventResponse(BaseModel):
    id: str
    event_type: str
    timestamp: datetime
    description: str
    location_id: Optional[str] = None
    location_name: Optional[str] = None
    case_id: Optional[str] = None
    source_id: Optional[str] = None
    created_at: datetime
    entities: List[EventParticipant] = []

    model_config = ConfigDict(from_attributes=True)


class TimelineResponse(BaseModel):
    case_id: str
    total_events: int
    events: List[EventResponse]
