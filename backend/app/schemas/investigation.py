from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field
from app.graph.graph_models import ResolvedEntity, EntityAmbiguity
from app.llm.models import InvestigationAnswer, Finding


class InvestigationRetrieveRequest(BaseModel):
    query: str
    case_id: Optional[str] = None
    date_from: Optional[str] = None  # Format: YYYY-MM-DD
    date_to: Optional[str] = None    # Format: YYYY-MM-DD
    source_type: Optional[str] = None
    verification_status: Optional[str] = None
    top_k: int = Field(default=5, ge=1, le=50)


class InvestigationRetrieveResponse(BaseModel):
    query: str
    case_id: Optional[str] = None
    resolved_entities: List[ResolvedEntity] = Field(default_factory=list)
    ambiguities: List[EntityAmbiguity] = Field(default_factory=list)
    graph_context: Dict[str, Any] = Field(default_factory=dict)
    timeline_context: Dict[str, Any] = Field(default_factory=dict)
    evidence_context: Dict[str, Any] = Field(default_factory=dict)
    sources: List[Dict[str, Any]] = Field(default_factory=list)
    provenance: List[Dict[str, Any]] = Field(default_factory=list)


class InvestigationQueryRequest(BaseModel):
    query: str = Field(..., description="Investigator question or analysis prompt")
    case_id: Optional[str] = Field(default=None, description="Active Case ID (e.g. CASE-001)")
    date_from: Optional[str] = Field(default=None, description="Start date (YYYY-MM-DD)")
    date_to: Optional[str] = Field(default=None, description="End date (YYYY-MM-DD)")
    source_type: Optional[str] = Field(default=None, description="Filter by source type")
    verification_status: Optional[str] = Field(default=None, description="Filter by verification status")
    top_k: int = Field(default=5, ge=1, le=50, description="Top-K vector evidence items")


# InvestigationQueryResponse is an alias/re-export of the strict InvestigationAnswer model
InvestigationQueryResponse = InvestigationAnswer


class GraphStatsResponse(BaseModel):
    total_nodes: int
    total_edges: int
    density: float
    connected_components: int
    node_types: Dict[str, int] = Field(default_factory=dict)
