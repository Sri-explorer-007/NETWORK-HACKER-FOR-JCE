from sqlalchemy import Column, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship

from app.models.base import Base, utc_now


class EventEntity(Base):
    __tablename__ = "event_entities"

    event_id = Column(String(64), ForeignKey("events.id", ondelete="CASCADE"), primary_key=True)
    entity_id = Column(String(64), ForeignKey("entities.id", ondelete="CASCADE"), primary_key=True)
    role = Column(String(100), nullable=False, default="PARTICIPANT")

    # Relationships
    event = relationship("Event", back_populates="entity_associations")
    entity = relationship("Entity", back_populates="event_associations")

    def __repr__(self) -> str:
        return f"<EventEntity(event_id='{self.event_id}', entity_id='{self.entity_id}', role='{self.role}')>"


class Event(Base):
    __tablename__ = "events"

    id = Column(String(64), primary_key=True, index=True)
    event_type = Column(String(50), nullable=False, index=True)
    timestamp = Column(DateTime(timezone=True), nullable=False, index=True)
    description = Column(Text, nullable=False)
    location_id = Column(String(64), ForeignKey("entities.id", ondelete="SET NULL"), nullable=True, index=True)
    case_id = Column(String(64), ForeignKey("cases.id", ondelete="SET NULL"), nullable=True, index=True)
    source_id = Column(String(64), ForeignKey("sources.id", ondelete="SET NULL"), nullable=True, index=True)
    created_at = Column(DateTime(timezone=True), default=utc_now, nullable=False)

    # Relationships
    case = relationship("Case", back_populates="events")
    source = relationship("Source", back_populates="events")
    location = relationship("Entity", foreign_keys=[location_id])
    entity_associations = relationship("EventEntity", back_populates="event", cascade="all, delete-orphan")

    def __repr__(self) -> str:
        return f"<Event(id='{self.id}', type='{self.event_type}', timestamp='{self.timestamp}')>"
