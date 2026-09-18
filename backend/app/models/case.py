from sqlalchemy import Column, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship

from app.models.base import Base, utc_now


class CaseEntity(Base):
    __tablename__ = "case_entities"

    case_id = Column(String(64), ForeignKey("cases.id", ondelete="CASCADE"), primary_key=True)
    entity_id = Column(String(64), ForeignKey("entities.id", ondelete="CASCADE"), primary_key=True)
    role = Column(String(100), nullable=False, default="ASSOCIATE")

    # Relationships
    case = relationship("Case", back_populates="entity_associations")
    entity = relationship("Entity", back_populates="case_associations")

    def __repr__(self) -> str:
        return f"<CaseEntity(case_id='{self.case_id}', entity_id='{self.entity_id}', role='{self.role}')>"


class Case(Base):
    __tablename__ = "cases"

    id = Column(String(64), primary_key=True, index=True)
    case_number = Column(String(64), unique=True, nullable=False, index=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    status = Column(String(50), default="ACTIVE", nullable=False)
    priority = Column(String(50), default="MEDIUM", nullable=False)
    created_at = Column(DateTime(timezone=True), default=utc_now, nullable=False)
    updated_at = Column(DateTime(timezone=True), default=utc_now, onupdate=utc_now, nullable=False)

    # Relationships
    entity_associations = relationship("CaseEntity", back_populates="case", cascade="all, delete-orphan")
    relationships = relationship("Relationship", back_populates="case", cascade="all, delete-orphan")
    events = relationship("Event", back_populates="case", cascade="all, delete-orphan")
    sources = relationship("Source", back_populates="case", cascade="all, delete-orphan")
    evidence_items = relationship("Evidence", back_populates="case", cascade="all, delete-orphan")

    def __repr__(self) -> str:
        return f"<Case(id='{self.id}', case_number='{self.case_number}', title='{self.title}')>"
