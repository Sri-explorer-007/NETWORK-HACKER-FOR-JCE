import re
from typing import List, Tuple, Dict
from sqlalchemy.orm import Session

from app.models.entity import Entity
from app.graph.graph_models import ResolvedEntity, EntityAmbiguity


class EntityResolver:
    """Lightweight, deterministic query entity resolver with ambiguity detection."""

    def __init__(self):
        pass

    def _normalize(self, text: str) -> str:
        return re.sub(r"[^\w\s\-\+]", " ", text.lower()).strip()

    def resolve_entities(self, query: str, db: Session) -> Tuple[List[ResolvedEntity], List[EntityAmbiguity]]:
        """Extracts candidate entities from query text.
        
        Returns:
            Tuple of (resolved_entities, ambiguities)
        """
        resolved: List[ResolvedEntity] = []
        ambiguities: List[EntityAmbiguity] = []

        norm_query = f" {self._normalize(query)} "
        all_entities = db.query(Entity).all()

        # Group entities by normalized name to detect duplicate/ambiguous identities
        name_to_entities: Dict[str, List[Entity]] = {}
        id_to_entity: Dict[str, Entity] = {}

        for ent in all_entities:
            norm_name = self._normalize(ent.name)
            name_to_entities.setdefault(norm_name, []).append(ent)
            id_to_entity[ent.id.upper()] = ent

        # 1. Direct ID matching (e.g. P-001, A-001, CASE-001, ORG-002)
        found_ids = set()
        for ent_id, ent in id_to_entity.items():
            pattern = rf"\b{re.escape(ent_id.lower())}\b"
            if re.search(pattern, norm_query):
                found_ids.add(ent.id)
                resolved.append(
                    ResolvedEntity(
                        id=ent.id,
                        name=ent.name,
                        entity_type=ent.entity_type,
                        match_type="ID",
                        confidence=1.0,
                        status="RESOLVED",
                        attributes=ent.attributes or {},
                    )
                )

        # 2. Name and Alias matching
        matched_names = set()
        for norm_name, entity_list in name_to_entities.items():
            if len(norm_name) < 3:
                continue

            # Check if name is present as a word/phrase in the query
            pattern = rf"\b{re.escape(norm_name)}\b"
            if re.search(pattern, norm_query):
                matched_names.add(norm_name)

                if len(entity_list) > 1:
                    # AMBIGUITY DETECTED: Multiple distinct entities share this exact name
                    candidates = [
                        ResolvedEntity(
                            id=e.id,
                            name=e.name,
                            entity_type=e.entity_type,
                            match_type="EXACT_NAME",
                            confidence=0.5,
                            status="AMBIGUOUS",
                            attributes=e.attributes or {},
                        )
                        for e in entity_list
                    ]
                    # Only add to ambiguity if none of these IDs were explicitly specified
                    if not any(e.id in found_ids for e in entity_list):
                        ambiguities.append(
                            EntityAmbiguity(
                                queried_name=entity_list[0].name,
                                status="AMBIGUOUS",
                                message=f"Multiple entities share the name '{entity_list[0].name}'. Please specify entity ID (e.g., {', '.join(e.id for e in entity_list)}) or distinguishing details.",
                                matches=candidates,
                            )
                        )
                else:
                    ent = entity_list[0]
                    if ent.id not in found_ids:
                        found_ids.add(ent.id)
                        resolved.append(
                            ResolvedEntity(
                                id=ent.id,
                                name=ent.name,
                                entity_type=ent.entity_type,
                                match_type="EXACT_NAME",
                                confidence=1.0,
                                status="RESOLVED",
                                attributes=ent.attributes or {},
                            )
                        )

        # 3. Case Number matching (e.g. NH-2026-001 -> CASE-001)
        for ent in all_entities:
            case_num = ent.attributes.get("case_number")
            if case_num and case_num.lower() in norm_query:
                if ent.id not in found_ids:
                    found_ids.add(ent.id)
                    resolved.append(
                        ResolvedEntity(
                            id=ent.id,
                            name=ent.name,
                            entity_type=ent.entity_type,
                            match_type="ALIAS",
                            confidence=1.0,
                            status="RESOLVED",
                            attributes=ent.attributes or {},
                        )
                    )

        return resolved, ambiguities


entity_resolver = EntityResolver()
