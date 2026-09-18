from typing import List, Set, Dict, Any, Tuple, Optional
import re
from app.llm.models import InvestigationAnswer, Finding, FindingType, ConfidenceLabel
from app.rag.context_builder import InvestigationContext


class GuardrailsValidationResult:
    def __init__(self, is_valid: bool, errors: List[str], warnings: List[str]):
        self.is_valid = is_valid
        self.errors = errors
        self.warnings = warnings

    def __repr__(self):
        return f"<GuardrailsValidationResult is_valid={self.is_valid} errors={len(self.errors)} warnings={len(self.warnings)}>"


def extract_context_valid_ids(context: InvestigationContext) -> Dict[str, Set[str]]:
    """Extracts all authorized entity, relationship, evidence, and source IDs present in the context."""
    valid_entity_ids: Set[str] = set()
    valid_relationship_ids: Set[str] = set()
    valid_evidence_ids: Set[str] = set()
    valid_source_ids: Set[str] = set()

    # Entities
    for ent in context.resolved_entities:
        valid_entity_ids.add(ent.id)
    for amb in context.ambiguities:
        matches = getattr(amb, "matches", getattr(amb, "candidates", []))
        for cand in matches:
            valid_entity_ids.add(cand.id)
    for node in context.graph_context.get("nodes", []):
        valid_entity_ids.add(node.get("id"))
    for p in context.graph_context.get("paths", []):
        for n in p.get("path_nodes", []):
            valid_entity_ids.add(n.get("id"))

    # Relationships
    for rel in context.graph_context.get("relationships", []):
        rel_id = rel.get("relationship_id")
        if rel_id:
            valid_relationship_ids.add(rel_id)
        if rel.get("source_id"):
            valid_source_ids.add(rel.get("source_id"))
        if rel.get("from_entity", {}).get("id"):
            valid_entity_ids.add(rel["from_entity"]["id"])
        if rel.get("to_entity", {}).get("id"):
            valid_entity_ids.add(rel["to_entity"]["id"])

    for p in context.graph_context.get("paths", []):
        for r in p.get("path_relationships", []):
            if r.get("relationship_id"):
                valid_relationship_ids.add(r.get("relationship_id"))

    # Evidence
    for ev in context.evidence_context.get("results", []):
        ev_id = ev.get("evidence_id")
        if ev_id:
            valid_evidence_ids.add(ev_id)
        src_id = ev.get("source_id")
        if src_id and src_id != "N/A":
            valid_source_ids.add(src_id)

    # Sources
    for s in context.sources:
        s_id = s.get("source_id")
        if s_id:
            valid_source_ids.add(s_id)

    # Timeline events
    for evt in context.timeline_context.get("events", []):
        if evt.get("source_id"):
            valid_source_ids.add(evt.get("source_id"))
        for ee_id in evt.get("involved_entity_ids", []):
            valid_entity_ids.add(ee_id)

    # Clean None or empty strings
    valid_entity_ids.discard(None)
    valid_relationship_ids.discard(None)
    valid_evidence_ids.discard(None)
    valid_source_ids.discard(None)

    return {
        "entities": valid_entity_ids,
        "relationships": valid_relationship_ids,
        "evidence": valid_evidence_ids,
        "sources": valid_source_ids,
    }


def validate_grounded_response(
    answer: InvestigationAnswer,
    context: InvestigationContext,
) -> GuardrailsValidationResult:
    """Strictly validates that all IDs cited by the LLM exist in the retrieved context,
    validates enum values, and ensures ambiguity/contradiction/human-review rules are enforced.
    """
    errors: List[str] = []
    warnings: List[str] = []

    valid_ids = extract_context_valid_ids(context)
    allowed_finding_types = {t.value for t in FindingType}
    allowed_confidence_labels = {c.value for c in ConfidenceLabel}

    # 1. Validate top-level IDs
    for eid in answer.evidence_ids:
        if eid not in valid_ids["evidence"]:
            errors.append(f"Hallucinated evidence_id: '{eid}' does not exist in retrieved context.")

    for sid in answer.source_ids:
        if sid not in valid_ids["sources"]:
            errors.append(f"Hallucinated source_id: '{sid}' does not exist in retrieved context.")

    for rid in answer.relationship_ids:
        if rid not in valid_ids["relationships"]:
            errors.append(f"Hallucinated relationship_id: '{rid}' does not exist in retrieved context.")

    for ent_id in answer.entity_ids:
        if ent_id not in valid_ids["entities"]:
            errors.append(f"Hallucinated entity_id: '{ent_id}' does not exist in retrieved context.")

    # 2. Validate findings
    has_ambiguous_finding = False
    has_contradicted_finding = False
    has_insufficient_finding = False

    for idx, f in enumerate(answer.findings):
        # Validate finding_type
        if f.finding_type not in allowed_finding_types:
            errors.append(f"Invalid finding_type '{f.finding_type}' in finding #{idx+1}.")

        if f.finding_type == FindingType.AMBIGUOUS.value:
            has_ambiguous_finding = True
        elif f.finding_type == FindingType.CONTRADICTED.value:
            has_contradicted_finding = True
        elif f.finding_type == FindingType.INSUFFICIENT_EVIDENCE.value:
            has_insufficient_finding = True

        # Validate confidence_label
        if f.confidence_label not in allowed_confidence_labels:
            errors.append(f"Invalid confidence_label '{f.confidence_label}' in finding #{idx+1}.")

        # Check finding item IDs
        for eid in f.evidence_ids:
            if eid not in valid_ids["evidence"]:
                errors.append(f"Hallucinated evidence_id '{eid}' in finding #{idx+1}.")
        for sid in f.source_ids:
            if sid not in valid_ids["sources"]:
                errors.append(f"Hallucinated source_id '{sid}' in finding #{idx+1}.")
        for rid in f.relationship_ids:
            if rid not in valid_ids["relationships"]:
                errors.append(f"Hallucinated relationship_id '{rid}' in finding #{idx+1}.")

    # 3. Check Context Ambiguities
    if context.ambiguities:
        # Check if ambiguity is preserved
        if not (has_ambiguous_finding or "ambiguous" in answer.answer.lower()):
            warnings.append("Context contains ambiguous entities, but response does not explicitly highlight ambiguity.")
        if not answer.requires_human_review:
            errors.append("requires_human_review must be True when ambiguous entities exist.")

    # 4. Check Contradicted Evidence in Context
    has_context_contradiction = any(
        ev.get("verification_status") == "CONTRADICTED"
        for ev in context.evidence_context.get("results", [])
    )
    if has_context_contradiction:
        if not (has_contradicted_finding or "contradict" in answer.answer.lower()):
            warnings.append("Context contains CONTRADICTED evidence, but response did not explicitly flag contradictions.")

    # 5. Guardrail on Human Review
    if has_ambiguous_finding or has_contradicted_finding or has_insufficient_finding:
        if not answer.requires_human_review:
            errors.append("requires_human_review must be True for AMBIGUOUS, CONTRADICTED, or INSUFFICIENT_EVIDENCE findings.")

    is_valid = len(errors) == 0
    return GuardrailsValidationResult(is_valid=is_valid, errors=errors, warnings=warnings)


def sanitize_and_filter_hallucinations(
    answer: InvestigationAnswer,
    context: InvestigationContext,
) -> InvestigationAnswer:
    """Strips any hallucinated IDs from the answer and findings while adding an explicit caveat."""
    valid_ids = extract_context_valid_ids(context)
    removed_ids: List[str] = []

    # Clean top-level lists
    clean_ev_ids = []
    for eid in answer.evidence_ids:
        if eid in valid_ids["evidence"]:
            clean_ev_ids.append(eid)
        else:
            removed_ids.append(eid)

    clean_src_ids = []
    for sid in answer.source_ids:
        if sid in valid_ids["sources"]:
            clean_src_ids.append(sid)
        else:
            removed_ids.append(sid)

    clean_rel_ids = []
    for rid in answer.relationship_ids:
        if rid in valid_ids["relationships"]:
            clean_rel_ids.append(rid)
        else:
            removed_ids.append(rid)

    clean_ent_ids = []
    for ent_id in answer.entity_ids:
        if ent_id in valid_ids["entities"]:
            clean_ent_ids.append(ent_id)
        else:
            removed_ids.append(ent_id)

    # Clean findings
    clean_findings = []
    for f in answer.findings:
        f_ev = [eid for eid in f.evidence_ids if eid in valid_ids["evidence"]]
        f_src = [sid for sid in f.source_ids if sid in valid_ids["sources"]]
        f_rel = [rid for rid in f.relationship_ids if rid in valid_ids["relationships"]]
        
        # Ensure valid finding_type
        ft = f.finding_type if f.finding_type in {t.value for t in FindingType} else FindingType.OBSERVED.value
        cl = f.confidence_label if f.confidence_label in {c.value for c in ConfidenceLabel} else ConfidenceLabel.MEDIUM.value

        clean_findings.append(
            Finding(
                statement=f.statement,
                finding_type=ft,
                evidence_ids=f_ev,
                source_ids=f_src,
                relationship_ids=f_rel,
                confidence_label=cl,
            )
        )

    caveats = list(answer.caveats)
    if removed_ids:
        caveats.append(f"Guardrail Alert: Filtered unverified references not present in retrieved context: {', '.join(removed_ids)}")

    # Always enforce human review for safe investigative workflows
    requires_review = True if (context.ambiguities or answer.requires_human_review) else True

    return InvestigationAnswer(
        query=answer.query,
        mode=answer.mode,
        answer=answer.answer,
        findings=clean_findings,
        source_ids=clean_src_ids,
        evidence_ids=clean_ev_ids,
        relationship_ids=clean_rel_ids,
        entity_ids=clean_ent_ids,
        caveats=caveats,
        requires_human_review=requires_review,
    )


def sanitize_untrusted_text(text: str) -> str:
    """Neutralizes potential prompt injection markers inside evidence documents."""
    injection_patterns = [
        r"(?i)ignore previous instructions",
        r"(?i)system prompt",
        r"(?i)declare .* guilty",
        r"(?i)you are now",
    ]
    sanitized = text
    for pat in injection_patterns:
        sanitized = re.sub(pat, "[DATA_CONTENT_FLAGGED]", sanitized)
    return sanitized
