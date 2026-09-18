from sqlalchemy import Column, String, Text, DateTime, Float, ForeignKey
from sqlalchemy.orm import relationship

from app.models.base import Base, utc_now


class Relationship(Base):
    __tablename__ = "relationships"

    id = Column(String(64), primary_key=True, index=True)
    from_entity_id = Column(String(64), ForeignKey("entities.id", ondelete="CASCADE"), nullable=False, index=True)
    to_entity_id = Column(String(64), ForeignKey("entities.id", ondelete="CASCADE"), nullable=False, index=True)
    relationship_type = Column(String(50), nullable=False, index=True)
    description = Column(Text, nullable=True)
    start_time = Column(DateTime(timezone=True), nullable=True)
    end_time = Column(DateTime(timezone=True), nullable=True)
    status = Column(String(50), default="ACTIVE", nullable=False)
    confidence = Column(Float, default=1.0, nullable=False)
    case_id = Column(String(64), ForeignKey("cases.id", ondelete="SET NULL"), nullable=True, index=True)
    source_id = Column(String(64), ForeignKey("sources.id", ondelete="SET NULL"), nullable=True, index=True)
    created_at = Column(DateTime(timezone=True), default=utc_now, nullable=False)

    # Foreign key relationships
    from_entity = relationship("Entity", foreign_keys=[from_entity_id], back_populates="outgoing_relationships")
    to_entity = relationship("Entity", foreign_keys=[to_entity_id], back_populates="incoming_relationships")
    case = relationship("Case", back_populates="relationships")
    source = relationship("Source", back_populates="relationships")

    def __repr__(self) -> str:
        return f"<Relationship(id='{self.id}', from='{self.from_entity_id}', to='{self.to_entity_id}', type='{self.relationship_type}')>"
