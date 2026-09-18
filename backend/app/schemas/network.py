from datetime import datetime
from typing import Optional, Dict, Any, List
from pydantic import BaseModel


class NetworkNode(BaseModel):
    id: str
    label: str
    entity_type: str
    status: str
    description: Optional[str] = None
    attributes: Dict[str, Any] = {}
    case_role: Optional[str] = None


class NetworkEdge(BaseModel):
    id: str
    source: str  # from_entity_id
    target: str  # to_entity_id
    relationship_type: str
    description: Optional[str] = None
    confidence: float
    status: str
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    source_id: Optional[str] = None
    case_id: Optional[str] = None


class NetworkGraphResponse(BaseModel):
    case_id: str
    total_nodes: int
    total_edges: int
    nodes: List[NetworkNode]
    edges: List[NetworkEdge]
