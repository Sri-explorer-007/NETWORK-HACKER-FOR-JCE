from datetime import datetime
from typing import List, Dict, Any
from sqlalchemy import Column, String, Text, Integer, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship

from app.models.base import Base, utc_now


class VectorEmbedding(Base):
    """Stores chunked evidence text, vector embeddings, and searchable metadata."""
    __tablename__ = "vector_embeddings"

    id = Column(String(64), primary_key=True, index=True)
    document_id = Column(String(64), nullable=False, index=True)
    evidence_id = Column(String(64), ForeignKey("evidence.id", ondelete="CASCADE"), nullable=False, index=True)
    case_id = Column(String(64), ForeignKey("cases.id", ondelete="SET NULL"), nullable=True, index=True)
    source_id = Column(String(64), ForeignKey("sources.id", ondelete="SET NULL"), nullable=True, index=True)
    chunk_id = Column(String(64), nullable=False, index=True)
    chunk_index = Column(Integer, default=0, nullable=False)
    text = Column(Text, nullable=False)
    
    # Stored as JSON array of floats in SQLite development fallback
    # Seamlessly mapped to pgvector Vector(dim) in PostgreSQL environments
    embedding = Column(JSON, nullable=False)
    
    # Metadata for filtering (entity_ids, evidence_type, source_type, evidence_date, verification_status, etc.)
    extra_metadata = Column("metadata", JSON, default=dict, nullable=False)
    created_at = Column(DateTime(timezone=True), default=utc_now, nullable=False)

    # Relationships
    evidence = relationship("Evidence")
    case = relationship("Case")
    source = relationship("Source")

    @property
    def metadata_dict(self) -> Dict[str, Any]:
        return self.extra_metadata or {}

    def __repr__(self) -> str:
        return f"<VectorEmbedding(id='{self.id}', evidence_id='{self.evidence_id}', case_id='{self.case_id}')>"
