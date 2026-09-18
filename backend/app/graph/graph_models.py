from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field


class GraphEntityNode(BaseModel):
    """Represents a node in the structured investigation graph."""
    id: str
    name: str
    entity_type: str
    status: str = "ACTIVE"
    description: Optional[str] = None
    attributes: Dict[str, Any] = Field(default_factory=dict)
    case_role: Optional[str] = None


class GraphRelationship(BaseModel):
    """Represents a directed or associative edge in the investigation graph with full provenance."""
    relationship_id: str
    from_entity_id: str
    from_entity_name: str
    to_entity_id: str
    to_entity_name: str
    relationship_type: str
    description: Optional[str] = None
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    status: str = "ACTIVE"
    confidence: float = 1.0
    case_id: Optional[str] = None
    source_id: Optional[str] = None
    retrieval_reason: Optional[str] = None


class GraphPath(BaseModel):
    """Represents a multi-hop traversal path connecting two or more entities."""
    source_id: str
    target_id: str
    hops: int
    path_nodes: List[GraphEntityNode]
    path_relationships: List[GraphRelationship]
    path_summary: str


class CrossCaseConnection(BaseModel):
    """Details how an entity spans across multiple distinct investigation cases."""
    entity_id: str
    entity_name: str
    cases: List[Dict[str, Any]]
    connecting_relationships: List[GraphRelationship] = Field(default_factory=list)


class ResolvedEntity(BaseModel):
    """An entity matched from query text."""
    id: str
    name: str
    entity_type: str
    match_type: str  # "EXACT_NAME", "ALIAS", "ID", "SUBSTRING"
    confidence: float = 1.0
    status: str = "RESOLVED"  # "RESOLVED" or "AMBIGUOUS"
    attributes: Dict[str, Any] = Field(default_factory=dict)


class EntityAmbiguity(BaseModel):
    """Describes an ambiguous entity query where multiple candidates share names/attributes."""
    queried_name: str
    status: str = "AMBIGUOUS"
    message: str
    matches: List[ResolvedEntity]


class GraphContext(BaseModel):
    """Structured graph context payload ready for fusion."""
    nodes: List[GraphEntityNode] = Field(default_factory=list)
    relationships: List[GraphRelationship] = Field(default_factory=list)
    paths: List[GraphPath] = Field(default_factory=list)
    cross_case: Optional[CrossCaseConnection] = None
