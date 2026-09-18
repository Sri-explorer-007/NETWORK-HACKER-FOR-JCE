from typing import Dict, Any, List
from app.rag.context_builder import InvestigationContext


def format_investigation_context_for_llm(context: InvestigationContext) -> str:
    """Converts an InvestigationContext into a structured, compact text representation
    specifically formatted for LLM explanation and citation.
    """
    sections: List[str] = []

    # 1. Header / Investigation Meta
    sections.append(f"=== INVESTIGATION CONTEXT ===")
    sections.append(f"QUERY: {context.query}")
    if context.case_id:
        sections.append(f"ACTIVE CASE: {context.case_id}")

    # 2. Resolved Entities
    sections.append("\n--- RESOLVED ENTITIES ---")
    if context.resolved_entities:
        for ent in context.resolved_entities:
            sections.append(f"- Entity ID: {ent.id} | Name: {ent.name} | Type: {ent.entity_type}")
    else:
        sections.append("No specific entities resolved from database.")

    # 3. Entity Ambiguities
    if context.ambiguities:
        sections.append("\n--- ENTITY AMBIGUITIES DETECTED ---")
        for amb in context.ambiguities:
            matches = getattr(amb, "matches", getattr(amb, "candidates", []))
            cands = ", ".join([f"{c.id} ({c.name}, {c.entity_type})" for c in matches])
            sections.append(
                f"[AMBIGUITY ALERT] Name query '{amb.queried_name}' is ambiguous. Matching candidates: {cands}. "
                f"Rule: Do NOT arbitrarily pick one candidate. Treat as AMBIGUOUS and require human review."
            )

    # 4. Graph Context (Paths & Relationships)
    sections.append("\n--- KNOWLEDGE GRAPH (RELATIONSHIPS & PATHS) ---")
    paths = context.graph_context.get("paths", [])
    if paths:
        sections.append("Discovered Multi-Hop Paths:")
        for idx, p in enumerate(paths, start=1):
            hops_str = " -> ".join([f"{n.get('id', '')} ({n.get('name', '')})" for n in p.get("path_nodes", [])])
            sections.append(f"  Path {idx} (hops={p.get('hop_count', 1)}): {hops_str}")

    relationships = context.graph_context.get("relationships", [])
    if relationships:
        sections.append("Retrieved Graph Relationships:")
        for r in relationships:
            rel_id = r.get("relationship_id")
            from_info = r.get("from_entity", {})
            to_info = r.get("to_entity", {})
            rel_type = r.get("relationship_type")
            status = r.get("status")
            src_id = r.get("source_id", "N/A")
            c_id = r.get("case_id", "N/A")
            sections.append(
                f"- [{rel_id}] {from_info.get('id', '')} ({from_info.get('name', '')}) -> "
                f"{to_info.get('id', '')} ({to_info.get('name', '')}) | Type: {rel_type} | "
                f"Status: {status} | Source ID: {src_id} | Case ID: {c_id}"
            )
    else:
        sections.append("No direct graph relationships in current context.")

    cross_case = context.graph_context.get("cross_case")
    if cross_case:
        sections.append("\n--- CROSS-CASE LINKAGE ---")
        sections.append(f"Entity {cross_case.get('entity_id')} connects across cases:")
        for c in cross_case.get("cases", []):
            sections.append(f"  - Case ID: {c.get('case_id')} ({c.get('case_number')}) - Title: {c.get('title')}")

    # 5. Timeline Context (Chronological Events)
    sections.append("\n--- CHRONOLOGICAL TIMELINE (EVENTS) ---")
    events = context.timeline_context.get("events", [])
    if events:
        for evt in events:
            evt_id = evt.get("event_id")
            ts = evt.get("timestamp")
            etype = evt.get("event_type")
            desc = evt.get("description")
            src_id = evt.get("source_id", "N/A")
            ees = ", ".join(evt.get("involved_entity_ids", []))
            sections.append(
                f"- [{evt_id}] {ts} | Type: {etype} | Involves: [{ees}] | Source: {src_id}\n"
                f"  Description: {desc}"
            )
    else:
        sections.append("No matching timeline events in specified temporal/case window.")

    # 6. Evidence Context (Vector & Provenance Records)
    sections.append("\n--- RETRIEVED EVIDENCE RECORDS ---")
    evidence_results = context.evidence_context.get("results", [])
    if evidence_results:
        for ev in evidence_results:
            ev_id = ev.get("evidence_id")
            v_stat = ev.get("verification_status", "OBSERVED")
            src_id = ev.get("source_id", "N/A")
            c_id = ev.get("case_id", "N/A")
            txt = ev.get("text", "")
            
            # Highlight Contradiction Status clearly
            stat_flag = f"[{v_stat}]"
            if v_stat == "CONTRADICTED":
                stat_flag = "!!! [CONTRADICTED EVIDENCE] !!!"

            sections.append(
                f"- Evidence ID: {ev_id} | Status: {stat_flag} | Source ID: {src_id} | Case ID: {c_id}\n"
                f"  Content: {txt}"
            )
    else:
        sections.append("No specific evidence records retrieved.")

    # 7. Sources
    sections.append("\n--- SOURCES CATALOG ---")
    if context.sources:
        for s in context.sources:
            s_id = s.get("source_id")
            stype = s.get("source_type")
            ref = s.get("reference_code")
            title = s.get("title")
            s_stat = s.get("status")
            sections.append(f"- Source ID: {s_id} | Ref: {ref} | Type: {stype} | Title: {title} | Status: {s_stat}")
    else:
        sections.append("No source records.")

    # 8. Provenance Trace
    sections.append("\n--- PROVENANCE TRACES ---")
    if context.provenance:
        for p in context.provenance:
            sections.append(f"- {p.provenance_path}")
    else:
        sections.append("No provenance traces available.")

    sections.append("\n=== END INVESTIGATION CONTEXT ===")
    return "\n".join(sections)
