"""Evidence RAG and Graph-RAG Layer for Network Hunter."""

from app.rag.config import rag_config, RAGConfig
from app.rag.document import EvidenceDocument, build_evidence_document
from app.rag.chunker import EvidenceChunk, chunk_document
from app.rag.embeddings import (
    EmbeddingProvider,
    OpenAIEmbeddingProvider,
    DeterministicDevEmbeddingProvider,
    get_embedding_provider,
)
from app.rag.vector_store import (
    VectorStore,
    RelationalVectorStore,
    SearchResult,
    get_vector_store,
)
from app.rag.metadata import RAGFilters, EvidenceMetadata, matches_filters
from app.rag.retriever import RAGRetrieverService, rag_service
from app.rag.context_builder import (
    ContextBuilder,
    context_builder,
    InvestigationContext,
    TimelineEventItem,
    EvidenceContextItem,
    ProvenanceRecord,
)
from app.rag.hybrid_retriever import HybridRetriever, hybrid_retriever

__all__ = [
    "rag_config",
    "RAGConfig",
    "EvidenceDocument",
    "build_evidence_document",
    "EvidenceChunk",
    "chunk_document",
    "EmbeddingProvider",
    "OpenAIEmbeddingProvider",
    "DeterministicDevEmbeddingProvider",
    "get_embedding_provider",
    "VectorStore",
    "RelationalVectorStore",
    "SearchResult",
    "get_vector_store",
    "RAGFilters",
    "EvidenceMetadata",
    "matches_filters",
    "RAGRetrieverService",
    "rag_service",
    "ContextBuilder",
    "context_builder",
    "InvestigationContext",
    "TimelineEventItem",
    "EvidenceContextItem",
    "ProvenanceRecord",
    "HybridRetriever",
    "hybrid_retriever",
]
