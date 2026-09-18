from sqlalchemy import Column, String, Text, DateTime, JSON
from sqlalchemy.orm import relationship

from app.models.base import Base, utc_now


class Entity(Base):
    __tablename__ = "entities"

    id = Column(String(64), primary_key=True, index=True)
    entity_type = Column(String(50), nullable=False, index=True)  # PERSON, ORGANIZATION, PHONE, ACCOUNT, VEHICLE, LOCATION, DEVICE, CASE
    name = Column(String(255), nullable=False, index=True)
    description = Column(Text, nullable=True)
    status = Column(String(50), default="ACTIVE", nullable=False)
    attributes = Column(JSON, default=dict, nullable=False)
    created_at = Column(DateTime(timezone=True), default=utc_now, nullable=False)
    updated_at = Column(DateTime(timezone=True), default=utc_now, onupdate=utc_now, nullable=False)

    # Relationships
    case_associations = relationship("CaseEntity", back_populates="entity", cascade="all, delete-orphan")
    event_associations = relationship("EventEntity", back_populates="entity", cascade="all, delete-orphan")

    outgoing_relationships = relationship(
        "Relationship",
        foreign_keys="Relationship.from_entity_id",
        back_populates="from_entity",
        cascade="all, delete-orphan",
    )
    incoming_relationships = relationship(
        "Relationship",
        foreign_keys="Relationship.to_entity_id",
        back_populates="to_entity",
        cascade="all, delete-orphan",
    )

    def __repr__(self) -> str:
        return f"<Entity(id='{self.id}', type='{self.entity_type}', name='{self.name}')>"
