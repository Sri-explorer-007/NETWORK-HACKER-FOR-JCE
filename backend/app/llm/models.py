from enum import Enum
from typing import List, Optional
from pydantic import BaseModel, Field


class FindingType(str, Enum):
    OBSERVED = "OBSERVED"
    VERIFIED = "VERIFIED"
    INFERRED = "INFERRED"
    AMBIGUOUS = "AMBIGUOUS"
    CONTRADICTED = "CONTRADICTED"
    INSUFFICIENT_EVIDENCE = "INSUFFICIENT_EVIDENCE"


class ConfidenceLabel(str, Enum):
    HIGH = "HIGH"
    MEDIUM = "MEDIUM"
    LOW = "LOW"
    UNKNOWN = "UNKNOWN"


class Finding(BaseModel):
    statement: str = Field(..., description="Fact-grounded finding statement")
    finding_type: str = Field(
        default=FindingType.OBSERVED.value,
        description="Type of finding: OBSERVED, VERIFIED, INFERRED, AMBIGUOUS, CONTRADICTED, INSUFFICIENT_EVIDENCE",
    )
    evidence_ids: List[str] = Field(
        default_factory=list,
        description="Referenced Evidence IDs (e.g. ['EVD-005'])",
    )
    source_ids: List[str] = Field(
        default_factory=list,
        description="Referenced Source IDs (e.g. ['SRC-011'])",
    )
    relationship_ids: List[str] = Field(
        default_factory=list,
        description="Referenced Relationship IDs (e.g. ['REL-001'])",
    )
    confidence_label: str = Field(
        default=ConfidenceLabel.MEDIUM.value,
        description="Confidence level: HIGH, MEDIUM, LOW, UNKNOWN",
    )


class InvestigationAnswer(BaseModel):
    query: str
    mode: str = Field(
        default="LLM",
        description="Execution mode: 'LLM' or 'DEMO_FALLBACK'",
    )
    answer: str = Field(..., description="Synthesized analytical explanation of retrieved records")
    findings: List[Finding] = Field(
        default_factory=list,
        description="Structured individual findings grounded in context",
    )
    source_ids: List[str] = Field(
        default_factory=list,
        description="Deduplicated list of all referenced Source IDs",
    )
    evidence_ids: List[str] = Field(
        default_factory=list,
        description="Deduplicated list of all referenced Evidence IDs",
    )
    relationship_ids: List[str] = Field(
        default_factory=list,
        description="Deduplicated list of all referenced Relationship IDs",
    )
    entity_ids: List[str] = Field(
        default_factory=list,
        description="Deduplicated list of all referenced Entity IDs (e.g. ['P-001', 'P-004'])",
    )
    caveats: List[str] = Field(
        default_factory=list,
        description="Important investigative caveats, ambiguities, or data limitations",
    )
    requires_human_review: bool = Field(
        default=True,
        description="Flag indicating human investigator review is required",
    )
