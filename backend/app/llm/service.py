import time
import json
import logging
from typing import Optional, List, Dict, Any, Set

from app.llm.config import LLMConfig, llm_config
from app.llm.models import (
    InvestigationAnswer,
    Finding,
    FindingType,
    ConfidenceLabel,
)
from app.llm.prompts import (
    INVESTIGATION_SYSTEM_PROMPT,
    build_user_prompt,
)
from app.llm.provider import LLMProvider, OpenAILikeProvider
from app.llm.guardrails import (
    validate_grounded_response,
    sanitize_and_filter_hallucinations,
)
from app.rag.context_builder import InvestigationContext
from app.rag.llm_context import format_investigation_context_for_llm

logger = logging.getLogger("network_hunter.llm")
logging.basicConfig(level=logging.INFO)


class LLMService:
    """Grounded LLM Generation Service. Synthesizes structured investigation context
    into fact-grounded, explainable analytical responses with strict ID validation.
    """

    def __init__(self, provider: Optional[LLMProvider] = None, config: Optional[LLMConfig] = None):
        self.config = config or llm_config
        self.provider = provider or (OpenAILikeProvider(self.config) if self.config.is_configured else None)

    def generate_answer(
        self,
        query: str,
        context: InvestigationContext,
    ) -> InvestigationAnswer:
        """Generates a grounded investigative answer from structured InvestigationContext."""
        start_time = time.time()
        resolved_ids = [e.id for e in context.resolved_entities]
        ev_count = len(context.evidence_context.get("results", []))
        rel_count = len(context.graph_context.get("relationships", []))
        evt_count = len(context.timeline_context.get("events", []))

        logger.info(
            f"[LLM] Investigation Query received: '{query}' | "
            f"Resolved Entities: {resolved_ids} | Graph Rels: {rel_count} | "
            f"Timeline Events: {evt_count} | Evidence Count: {ev_count}"
        )

        # 1. If LLM Provider is not configured, execute deterministic development fallback
        if not self.config.is_configured or self.provider is None:
            logger.info("[LLM] No LLM API key configured. Utilizing deterministic DEMO_FALLBACK mode.")
            answer = self._generate_deterministic_fallback(query, context)
            latency = (time.time() - start_time) * 1000
            logger.info(f"[LLM] Fallback generated in {latency:.2f}ms | Requires Review: {answer.requires_human_review}")
            return answer

        # 2. Format Context and Prompts for Provider
        try:
            formatted_context = format_investigation_context_for_llm(context)
            user_prompt = build_user_prompt(query, formatted_context)

            # 3. Call LLM Provider
            raw_response = self.provider.generate(
                system_prompt=INVESTIGATION_SYSTEM_PROMPT,
                user_prompt=user_prompt,
            )

            # 4. Parse Structured JSON
            parsed_data = self._parse_json_response(raw_response)
            
            # Map into InvestigationAnswer
            raw_answer = InvestigationAnswer(
                query=query,
                mode="LLM",
                answer=parsed_data.get("answer", ""),
                findings=[Finding(**f) for f in parsed_data.get("findings", [])],
                source_ids=parsed_data.get("source_ids", []),
                evidence_ids=parsed_data.get("evidence_ids", []),
                relationship_ids=parsed_data.get("relationship_ids", []),
                entity_ids=parsed_data.get("entity_ids", []),
                caveats=parsed_data.get("caveats", []),
                requires_human_review=parsed_data.get("requires_human_review", True),
            )

            # 5. Guardrail Sanitization & Validation
            sanitized_answer = sanitize_and_filter_hallucinations(raw_answer, context)
            val_res = validate_grounded_response(sanitized_answer, context)

            if not val_res.is_valid:
                logger.warning(f"[LLM] Guardrail validation warnings/errors: {val_res.errors}")
                for err in val_res.errors:
                    sanitized_answer.caveats.append(f"Guardrail Note: {err}")

            latency = (time.time() - start_time) * 1000
            logger.info(
                f"[LLM] Generation complete in {latency:.2f}ms | Mode: LLM | "
                f"Findings: {len(sanitized_answer.findings)} | Validated: {val_res.is_valid}"
            )
            return sanitized_answer

        except Exception as e:
            logger.error(f"[LLM] LLM Provider call failed ({str(e)}). Falling back to deterministic analysis.")
            fallback_answer = self._generate_deterministic_fallback(query, context)
            fallback_answer.caveats.append(f"Notice: Generated via deterministic fallback due to provider error: {str(e)}")
            return fallback_answer

    def _parse_json_response(self, text: str) -> Dict[str, Any]:
        """Extracts and parses JSON from provider text output."""
        cleaned = text.strip()
        if cleaned.startswith("```json"):
            cleaned = cleaned[7:]
        if cleaned.startswith("```"):
            cleaned = cleaned[3:]
        if cleaned.endswith("```"):
            cleaned = cleaned[:-3]
        cleaned = cleaned.strip()
        return json.loads(cleaned)

    def _generate_deterministic_fallback(
        self,
        query: str,
        context: InvestigationContext,
    ) -> InvestigationAnswer:
        """Generates an evidence-grounded, fully deterministic analytical response
        directly from the retrieved InvestigationContext without external LLM dependencies.
        """
        findings: List[Finding] = []
        caveats: List[str] = [
            "Generated via deterministic development fallback mode (DEMO_FALLBACK).",
            "Records indicate investigative connections; human review is required before drawing legal conclusions.",
        ]

        collected_ev_ids: Set[str] = set()
        collected_src_ids: Set[str] = set()
        collected_rel_ids: Set[str] = set()
        collected_ent_ids: Set[str] = set()

        for ent in context.resolved_entities:
            collected_ent_ids.add(ent.id)

        # 1. Ambiguity Handling
        if context.ambiguities:
            for amb in context.ambiguities:
                matches = getattr(amb, "matches", getattr(amb, "candidates", []))
                cand_ids = [c.id for c in matches]
                cand_names = [f"{c.name} ({c.id}, {c.entity_type})" for c in matches]
                for cid in cand_ids:
                    collected_ent_ids.add(cid)
                
                statement = (
                    f"Name query '{amb.queried_name}' is ambiguous in the database. "
                    f"Two or more distinct candidate entities match: {', '.join(cand_names)}. "
                    f"In accordance with Network Hunter safety standards, no candidate has been arbitrarily selected."
                )
                findings.append(
                    Finding(
                        statement=statement,
                        finding_type=FindingType.AMBIGUOUS.value,
                        evidence_ids=[],
                        source_ids=[],
                        relationship_ids=[],
                        confidence_label=ConfidenceLabel.HIGH.value,
                    )
                )
            caveats.append("Entity resolution is AMBIGUOUS. Human investigator review is required to select the intended subject.")

        # 2. Graph Multi-Hop Paths & Relationships
        paths = context.graph_context.get("paths", [])
        relationships = context.graph_context.get("relationships", [])

        if paths:
            for idx, p in enumerate(paths, start=1):
                hop_nodes = p.get("path_nodes", [])
                p_rels = p.get("path_relationships", [])
                node_seq = " -> ".join([f"{n.get('name', '')} ({n.get('id', '')})" for n in hop_nodes])
                rel_ids = [r.get("relationship_id") for r in p_rels if r.get("relationship_id")]
                src_ids = [r.get("source_id") for r in p_rels if r.get("source_id") and r.get("source_id") != "N/A"]
                
                for rid in rel_ids:
                    collected_rel_ids.add(rid)
                for sid in src_ids:
                    collected_src_ids.add(sid)
                for n in hop_nodes:
                    if n.get("id"):
                        collected_ent_ids.add(n.get("id"))

                # Check if shared account is present in path
                account_nodes = [n for n in hop_nodes if n.get("type") == "ACCOUNT" or n.get("id", "").startswith("A-")]
                acc_detail = ""
                if account_nodes:
                    acc_names = ", ".join([f"{a.get('name')} ({a.get('id')})" for a in account_nodes])
                    acc_detail = f" Connection traverses shared financial/asset entity {acc_names}."

                stmt = f"Discovered {len(hop_nodes)-1}-hop graph connection: {node_seq}.{acc_detail}"
                findings.append(
                    Finding(
                        statement=stmt,
                        finding_type=FindingType.VERIFIED.value,
                        evidence_ids=[],
                        source_ids=src_ids,
                        relationship_ids=rel_ids,
                        confidence_label=ConfidenceLabel.HIGH.value,
                    )
                )
        elif relationships:
            for r in relationships[:5]:
                rel_id = r.get("relationship_id")
                from_e = r.get("from_entity", {})
                to_e = r.get("to_entity", {})
                rtype = r.get("relationship_type")
                rstat = r.get("status")
                sid = r.get("source_id")
                if rel_id:
                    collected_rel_ids.add(rel_id)
                if sid and sid != "N/A":
                    collected_src_ids.add(sid)
                if from_e.get("id"):
                    collected_ent_ids.add(from_e["id"])
                if to_e.get("id"):
                    collected_ent_ids.add(to_e["id"])

                ftype = FindingType.VERIFIED.value if rstat == "VERIFIED" else FindingType.OBSERVED.value
                stmt = f"Graph relationship [{rel_id}]: {from_e.get('name')} ({from_e.get('id')}) -> {to_e.get('name')} ({to_e.get('id')}) via {rtype} (status: {rstat})."
                findings.append(
                    Finding(
                        statement=stmt,
                        finding_type=ftype,
                        evidence_ids=[],
                        source_ids=[sid] if sid and sid != "N/A" else [],
                        relationship_ids=[rel_id] if rel_id else [],
                        confidence_label=ConfidenceLabel.HIGH.value if rstat == "VERIFIED" else ConfidenceLabel.MEDIUM.value,
                    )
                )

        # 3. Cross-Case Linkage
        cross_case = context.graph_context.get("cross_case")
        if cross_case:
            c_entity_id = cross_case.get("entity_id")
            c_cases = cross_case.get("cases", [])
            case_titles = [f"{c.get('case_id')} ({c.get('title')})" for c in c_cases]
            c_rels = [r.get("relationship_id") for r in cross_case.get("connecting_relationships", []) if r.get("relationship_id")]
            for crid in c_rels:
                collected_rel_ids.add(crid)
            collected_ent_ids.add(c_entity_id)

            stmt = f"Entity {c_entity_id} forms a cross-case linkage across multiple active cases: {', '.join(case_titles)}."
            findings.append(
                Finding(
                    statement=stmt,
                    finding_type=FindingType.VERIFIED.value,
                    evidence_ids=[],
                    source_ids=[],
                    relationship_ids=c_rels,
                    confidence_label=ConfidenceLabel.HIGH.value,
                )
            )

        # 4. Chronological Timeline Events
        events = context.timeline_context.get("events", [])
        if events:
            event_strs = []
            for evt in events[:5]:
                eid = evt.get("event_id")
                ts = evt.get("timestamp")
                etype = evt.get("event_type")
                desc = evt.get("description")
                sid = evt.get("source_id")
                if sid and sid != "N/A":
                    collected_src_ids.add(sid)
                for ee_id in evt.get("involved_entity_ids", []):
                    collected_ent_ids.add(ee_id)
                event_strs.append(f"[{eid}] {ts} ({etype}): {desc}")

            stmt = f"Chronological timeline contains {len(events)} event(s):\n" + "\n".join([f"  - {s}" for s in event_strs])
            findings.append(
                Finding(
                    statement=stmt,
                    finding_type=FindingType.OBSERVED.value,
                    evidence_ids=[],
                    source_ids=[e.get("source_id") for e in events if e.get("source_id") and e.get("source_id") != "N/A"][:3],
                    relationship_ids=[],
                    confidence_label=ConfidenceLabel.HIGH.value,
                )
            )

        # 5. Evidence & Contradiction Handling
        evidence_results = context.evidence_context.get("results", [])
        for ev in evidence_results:
            ev_id = ev.get("evidence_id")
            v_stat = ev.get("verification_status", "OBSERVED")
            src_id = ev.get("source_id")
            text_snip = ev.get("text", "").replace("\n", " ")[:140]

            if ev_id:
                collected_ev_ids.add(ev_id)
            if src_id and src_id != "N/A":
                collected_src_ids.add(src_id)

            if v_stat == "CONTRADICTED":
                stmt = f"Evidence record [{ev_id}] is marked CONTRADICTED (source: {src_id}): '{text_snip}...'. This statement is refuted by verified records and must not be treated as fact."
                findings.append(
                    Finding(
                        statement=stmt,
                        finding_type=FindingType.CONTRADICTED.value,
                        evidence_ids=[ev_id],
                        source_ids=[src_id] if src_id and src_id != "N/A" else [],
                        relationship_ids=[],
                        confidence_label=ConfidenceLabel.HIGH.value,
                    )
                )
                caveats.append(f"Evidence {ev_id} is CONTRADICTED by investigative findings.")
            else:
                stmt = f"Supporting evidence [{ev_id}] (Status: {v_stat}, Source: {src_id}): '{text_snip}'."
                findings.append(
                    Finding(
                        statement=stmt,
                        finding_type=FindingType.VERIFIED.value if v_stat == "VERIFIED" else FindingType.OBSERVED.value,
                        evidence_ids=[ev_id],
                        source_ids=[src_id] if src_id and src_id != "N/A" else [],
                        relationship_ids=[],
                        confidence_label=ConfidenceLabel.HIGH.value if v_stat == "VERIFIED" else ConfidenceLabel.MEDIUM.value,
                    )
                )

        # 6. If no findings were produced, report INSUFFICIENT_EVIDENCE
        if not findings:
            findings.append(
                Finding(
                    statement="Retrieved records do not contain sufficient evidence to answer the specified query.",
                    finding_type=FindingType.INSUFFICIENT_EVIDENCE.value,
                    evidence_ids=[],
                    source_ids=[],
                    relationship_ids=[],
                    confidence_label=ConfidenceLabel.LOW.value,
                )
            )

        # 7. Synthesize Comprehensive Text Answer
        answer_parts = []
        if context.ambiguities:
            answer_parts.append("AMBIGUITY DETECTED: The queried name matches multiple distinct entities in the database. Individual records cannot be uniquely attributed without human investigator clarification.")
        
        if paths:
            path_descriptions = [
                " -> ".join([f"{n.get('name')} ({n.get('id')})" for n in p.get("path_nodes", [])])
                for p in paths
            ]
            answer_parts.append(f"Records indicate a network path connection: {'; '.join(path_descriptions)}.")
        elif relationships:
            rel_descriptions = [
                f"{r.get('from_entity', {}).get('name')} and {r.get('to_entity', {}).get('name')} via {r.get('relationship_type')} [{r.get('relationship_id')}]"
                for r in relationships[:3]
            ]
            answer_parts.append(f"Retrieved graph relationships establish connections between: {'; '.join(rel_descriptions)}.")

        if cross_case:
            answer_parts.append(f"Cross-case analysis shows entity {cross_case.get('entity_id')} is active across multiple cases including {', '.join([c.get('case_id') for c in cross_case.get('cases', [])])}.")

        if events:
            answer_parts.append(f"A chronological sequence of {len(events)} event(s) was identified across the active timeline.")

        if evidence_results:
            verified_evs = [ev.get("evidence_id") for ev in evidence_results if ev.get("verification_status") == "VERIFIED"]
            contradicted_evs = [ev.get("evidence_id") for ev in evidence_results if ev.get("verification_status") == "CONTRADICTED"]
            
            ev_summary = f"Retrieved {len(evidence_results)} supporting evidence document(s)."
            if verified_evs:
                ev_summary += f" Verified evidence records include: {', '.join(verified_evs)}."
            if contradicted_evs:
                ev_summary += f" CONTRADICTED record(s) flagged: {', '.join(contradicted_evs)}."
            answer_parts.append(ev_summary)

        answer_parts.append("All statements are based exclusively on retrieved synthetic investigation records. Human review is required before drawing investigative conclusions.")

        full_answer_text = "\n\n".join(answer_parts)

        return InvestigationAnswer(
            query=query,
            mode="DEMO_FALLBACK",
            answer=full_answer_text,
            findings=findings,
            source_ids=sorted(list(collected_src_ids)),
            evidence_ids=sorted(list(collected_ev_ids)),
            relationship_ids=sorted(list(collected_rel_ids)),
            entity_ids=sorted(list(collected_ent_ids)),
            caveats=caveats,
            requires_human_review=True,
        )


# Global singleton instance
llm_service = LLMService()
