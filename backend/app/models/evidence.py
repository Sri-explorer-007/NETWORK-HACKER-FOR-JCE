from typing import Any, Dict
from sqlalchemy import Column, String, Text, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship

from app.models.base import Base, utc_now


class Evidence(Base):
    __tablename__ = "evidence"

    id = Column(String(64), primary_key=True, index=True)
    source_id = Column(String(64), ForeignKey("sources.id", ondelete="CASCADE"), nullable=False, index=True)
    case_id = Column(String(64), ForeignKey("cases.id", ondelete="SET NULL"), nullable=True, index=True)
    evidence_type = Column(String(50), nullable=False, index=True)
    title = Column(String(255), nullable=False)
    content = Column(Text, nullable=False)
    evidence_date = Column(DateTime(timezone=True), nullable=False)
    verification_status = Column(String(50), default="UNVERIFIED", nullable=False, index=True)
    # Map database column 'metadata' while avoiding conflict with Base.metadata
    extra_metadata = Column("metadata", JSON, default=dict, nullable=False)
    created_at = Column(DateTime(timezone=True), default=utc_now, nullable=False)

    # Relationships
    source = relationship("Source", back_populates="evidence_items")
    case = relationship("Case", back_populates="evidence_items")

    @property
    def metadata_dict(self) -> Dict[str, Any]:
        return self.extra_metadata or {}

    def __repr__(self) -> str:
        return f"<Evidence(id='{self.id}', type='{self.evidence_type}', status='{self.verification_status}')>"
