from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field


class RAGSearchRequest(BaseModel):
    query: str
    case_id: Optional[str] = None
    top_k: int = Field(default=5, ge=1, le=50)
    
    # Optional metadata filters
    entity_id: Optional[str] = None
    date_from: Optional[str] = None  # Format: YYYY-MM-DD
    date_to: Optional[str] = None    # Format: YYYY-MM-DD
    source_type: Optional[str] = None
    verification_status: Optional[str] = None


class RAGSearchResultItem(BaseModel):
    evidence_id: str
    source_id: str
    case_id: Optional[str] = None
    document_id: str
    chunk_id: str
    text: str
    score: float
    metadata: Dict[str, Any] = Field(default_factory=dict)


class RAGSearchResponse(BaseModel):
    query: str
    case_id: Optional[str] = None
    total_results: int
    results: List[RAGSearchResultItem]


class RAGIndexResponse(BaseModel):
    status: str
    evidence_processed: int
    documents_created: int
    chunks_created: int
    embeddings_created: int


class RAGStatsResponse(BaseModel):
    documents: int
    chunks: int
    embeddings: int
    cases_indexed: int
