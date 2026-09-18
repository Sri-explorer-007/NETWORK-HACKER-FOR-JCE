import os
from pydantic import BaseModel


class RAGConfig(BaseModel):
    """Configuration settings for Network Hunter Evidence RAG."""
    
    # Embedding Configuration
    EMBEDDING_API_KEY: str = os.getenv("EMBEDDING_API_KEY", "")
    EMBEDDING_MODEL: str = os.getenv("EMBEDDING_MODEL", "text-embedding-3-small")
    EMBEDDING_DIMENSION: int = 384
    
    # Chunking Configuration (1500 chars keeps single concise evidence as 1 chunk while splitting long reports)
    MAX_CHUNK_CHARS: int = 1500
    CHUNK_OVERLAP_CHARS: int = 200
    
    # Retrieval Configuration
    DEFAULT_TOP_K: int = 5
    MAX_TOP_K: int = 25
    MIN_SIMILARITY_SCORE: float = 0.05
    
    # Vector Database Backend
    VECTOR_BACKEND: str = os.getenv("VECTOR_BACKEND", "sqlite_fallback")  # "pgvector" or "sqlite_fallback"


rag_config = RAGConfig()
