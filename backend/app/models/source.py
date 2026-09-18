from sqlalchemy import Column, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship

from app.models.base import Base, utc_now


class Source(Base):
    __tablename__ = "sources"

    id = Column(String(64), primary_key=True, index=True)
    source_type = Column(String(50), nullable=False, index=True)
    reference_code = Column(String(100), nullable=False, index=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    source_date = Column(DateTime(timezone=True), nullable=False)
    case_id = Column(String(64), ForeignKey("cases.id", ondelete="SET NULL"), nullable=True, index=True)
    status = Column(String(50), default="ACTIVE", nullable=False)
    created_at = Column(DateTime(timezone=True), default=utc_now, nullable=False)

    # Relationships
    case = relationship("Case", back_populates="sources")
    evidence_items = relationship("Evidence", back_populates="source", cascade="all, delete-orphan")
    relationships = relationship("Relationship", back_populates="source")
    events = relationship("Event", back_populates="source")

    def __repr__(self) -> str:
        return f"<Source(id='{self.id}', type='{self.source_type}', ref='{self.reference_code}')>"
