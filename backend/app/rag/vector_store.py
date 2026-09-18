import math
from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from sqlalchemy import delete, func

from app.models.vector_embedding import VectorEmbedding
from app.rag.chunker import EvidenceChunk
from app.rag.metadata import RAGFilters, matches_filters


@dataclass
class SearchResult:
    """Individual vector retrieval hit."""
    evidence_id: str
    source_id: str
    case_id: Optional[str]
    document_id: str
    chunk_id: str
    text: str
    score: float
    metadata: Dict[str, Any] = field(default_factory=dict)


def cosine_similarity(v1: List[float], v2: List[float]) -> float:
    """Computes cosine similarity between two float vectors."""
    if len(v1) != len(v2) or not v1:
        return 0.0
    dot = sum(a * b for a, b in zip(v1, v2))
    norm1 = math.sqrt(sum(a * a for a in v1))
    norm2 = math.sqrt(sum(b * b for b in v2))
    if norm1 == 0.0 or norm2 == 0.0:
        return 0.0
    return dot / (norm1 * norm2)


class VectorStore(ABC):
    """Abstract vector store interface for document storage and similarity retrieval."""

    @abstractmethod
    def add_embeddings(self, chunks: List[EvidenceChunk], embeddings: List[List[float]], db: Session) -> int:
        """Store chunk records and vector embeddings."""
        pass

    @abstractmethod
    def similarity_search(
        self,
        query_vector: List[float],
        top_k: int = 5,
        filters: Optional[RAGFilters] = None,
        db: Session = None,
    ) -> List[SearchResult]:
        """Perform vector similarity search with metadata filtering."""
        pass

    @abstractmethod
    def delete_embeddings(self, case_id: Optional[str] = None, db: Session = None) -> int:
        """Delete embeddings for a case or all embeddings."""
        pass

    @abstractmethod
    def count_embeddings(self, db: Session) -> int:
        """Return total number of stored embeddings."""
        pass


class RelationalVectorStore(VectorStore):
    """Production-compatible development vector store storing embeddings in the relational database.
    
    Compatible with SQLite (using JSON serialization & in-memory cosine ranking) and easily extensible
    to PostgreSQL + pgvector vector index operations without altering the application retrieval interface.
    """

    def add_embeddings(self, chunks: List[EvidenceChunk], embeddings: List[List[float]], db: Session) -> int:
        records_to_insert = []
        for chunk, emb in zip(chunks, embeddings):
            record_id = f"VEC-{chunk.chunk_id}"
            
            # Check if record exists for idempotency
            existing = db.query(VectorEmbedding).filter(VectorEmbedding.id == record_id).first()
            if existing:
                existing.text = chunk.text
                existing.embedding = emb
                existing.extra_metadata = chunk.metadata
            else:
                record = VectorEmbedding(
                    id=record_id,
                    document_id=chunk.document_id,
                    evidence_id=chunk.evidence_id,
                    case_id=chunk.case_id,
                    source_id=chunk.source_id,
                    chunk_id=chunk.chunk_id,
                    chunk_index=chunk.chunk_index,
                    text=chunk.text,
                    embedding=emb,
                    extra_metadata=chunk.metadata,
                )
                records_to_insert.append(record)

        if records_to_insert:
            db.add_all(records_to_insert)
        db.commit()
        return len(chunks)

    def similarity_search(
        self,
        query_vector: List[float],
        top_k: int = 5,
        filters: Optional[RAGFilters] = None,
        db: Session = None,
    ) -> List[SearchResult]:
        if not db:
            return []

        # Query candidates from database applying SQL-level filters where possible
        query = db.query(VectorEmbedding)
        if filters and filters.case_id:
            query = query.filter(VectorEmbedding.case_id == filters.case_id)

        candidates = query.all()
        scored_results: List[SearchResult] = []

        for item in candidates:
            item_meta = item.metadata_dict
            
            # Check comprehensive metadata filters
            if not matches_filters(item_meta, filters):
                continue

            emb = item.embedding
            if not emb:
                continue

            score = cosine_similarity(query_vector, emb)
            
            scored_results.append(
                SearchResult(
                    evidence_id=item.evidence_id,
                    source_id=item.source_id or "N/A",
                    case_id=item.case_id,
                    document_id=item.document_id,
                    chunk_id=item.chunk_id,
                    text=item.text,
                    score=round(float(score), 4),
                    metadata=item_meta,
                )
            )

        # Sort descending by similarity score
        scored_results.sort(key=lambda x: x.score, reverse=True)
        return scored_results[:top_k]

    def delete_embeddings(self, case_id: Optional[str] = None, db: Session = None) -> int:
        if not db:
            return 0
        if case_id:
            stmt = delete(VectorEmbedding).where(VectorEmbedding.case_id == case_id)
        else:
            stmt = delete(VectorEmbedding)
        result = db.execute(stmt)
        db.commit()
        return result.rowcount

    def count_embeddings(self, db: Session) -> int:
        return db.query(func.count(VectorEmbedding.id)).scalar() or 0


def get_vector_store() -> VectorStore:
    """Factory returning configured VectorStore."""
    return RelationalVectorStore()
