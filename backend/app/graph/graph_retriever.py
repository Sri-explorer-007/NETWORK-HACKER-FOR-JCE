import networkx as nx
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from sqlalchemy import or_

from app.models.entity import Entity
from app.models.relationship import Relationship
from app.models.event import Event, EventEntity
from app.models.case import Case, CaseEntity
from app.graph.graph_models import (
    GraphEntityNode,
    GraphRelationship,
    GraphPath,
    CrossCaseConnection,
    GraphContext,
)
from app.graph.graph_builder import graph_builder


class GraphRetriever:
    """Service providing high-level graph queries, pathfinding, and sub-network extractions."""

    def __init__(self):
        pass

    def _entity_to_node(self, ent: Entity, case_role: Optional[str] = None) -> GraphEntityNode:
        return GraphEntityNode(
            id=ent.id,
            name=ent.name,
            entity_type=ent.entity_type,
            status=ent.status,
            description=ent.description,
            attributes=ent.attributes or {},
            case_role=case_role,
        )

    def _rel_to_graph_rel(self, rel: Relationship, entity_map: Dict[str, Entity], reason: Optional[str] = None) -> GraphRelationship:
        from_ent = entity_map.get(rel.from_entity_id)
        to_ent = entity_map.get(rel.to_entity_id)
        from_name = from_ent.name if from_ent else rel.from_entity_id
        to_name = to_ent.name if to_ent else rel.to_entity_id

        return GraphRelationship(
            relationship_id=rel.id,
            from_entity_id=rel.from_entity_id,
            from_entity_name=from_name,
            to_entity_id=rel.to_entity_id,
            to_entity_name=to_name,
            relationship_type=rel.relationship_type,
            description=rel.description,
            start_time=rel.start_time,
            end_time=rel.end_time,
            status=rel.status,
            confidence=rel.confidence,
            case_id=rel.case_id,
            source_id=rel.source_id,
            retrieval_reason=reason or "DIRECT_GRAPH_RELATIONSHIP",
        )

    def get_entity(self, entity_id: str, db: Session) -> Optional[GraphEntityNode]:
        """Retrieves a single entity node."""
        ent = db.query(Entity).filter(Entity.id == entity_id).first()
        return self._entity_to_node(ent) if ent else None

    def get_direct_connections(self, entity_id: str, db: Session) -> List[GraphRelationship]:
        """Retrieves all 1-hop relationships connected to entity_id."""
        rels = db.query(Relationship).filter(
            or_(Relationship.from_entity_id == entity_id, Relationship.to_entity_id == entity_id)
        ).all()

        entity_ids = {r.from_entity_id for r in rels} | {r.to_entity_id for r in rels}
        entities = db.query(Entity).filter(Entity.id.in_(list(entity_ids))).all()
        entity_map = {e.id: e for e in entities}

        return [self._rel_to_graph_rel(r, entity_map, "DIRECT_GRAPH_RELATIONSHIP") for r in rels]

    def get_relationships_between(self, entity_a: str, entity_b: str, db: Session) -> List[GraphRelationship]:
        """Retrieves direct relationships between two specific entities."""
        rels = db.query(Relationship).filter(
            or_(
                (Relationship.from_entity_id == entity_a) & (Relationship.to_entity_id == entity_b),
                (Relationship.from_entity_id == entity_b) & (Relationship.to_entity_id == entity_a),
            )
        ).all()

        entities = db.query(Entity).filter(Entity.id.in_([entity_a, entity_b])).all()
        entity_map = {e.id: e for e in entities}

        return [self._rel_to_graph_rel(r, entity_map, "DIRECT_GRAPH_RELATIONSHIP") for r in rels]

    def get_two_hop_connections(self, entity_id: str, db: Session) -> GraphContext:
        """Retrieves 2-hop neighborhood subgraph for an entity."""
        UG = graph_builder.get_undirected_graph(db=db)
        if entity_id not in UG:
            return GraphContext()

        # Find 2-hop neighbors
        neighbors_1hop = set(UG.neighbors(entity_id))
        neighbors_2hop = set()
        for n1 in neighbors_1hop:
            neighbors_2hop.update(UG.neighbors(n1))
        
        all_node_ids = {entity_id} | neighbors_1hop | neighbors_2hop

        # Fetch entities and relationships
        entities = db.query(Entity).filter(Entity.id.in_(list(all_node_ids))).all()
        entity_map = {e.id: e for e in entities}
        nodes = [self._entity_to_node(e) for e in entities]

        rels = db.query(Relationship).filter(
            Relationship.from_entity_id.in_(list(all_node_ids)),
            Relationship.to_entity_id.in_(list(all_node_ids)),
        ).all()
        graph_rels = [self._rel_to_graph_rel(r, entity_map, "TWO_HOP_SUBGRAPH") for r in rels]

        return GraphContext(nodes=nodes, relationships=graph_rels)

    def find_paths(self, source_id: str, target_id: str, max_hops: int = 2, db: Session = None) -> List[GraphPath]:
        """Discovers connecting paths between two entities up to max_hops (e.g. P-001 -> A-001 <- P-004)."""
        if not db or source_id == target_id:
            return []

        UG = graph_builder.get_undirected_graph(db=db)
        if source_id not in UG or target_id not in UG:
            return []

        try:
            simple_paths = list(nx.all_simple_paths(UG, source=source_id, target=target_id, cutoff=max_hops))
        except (nx.NetworkXNoPath, nx.NodeNotFound):
            return []

        # Collect all entities in paths
        all_path_node_ids = set()
        for p in simple_paths:
            all_path_node_ids.update(p)

        entities = db.query(Entity).filter(Entity.id.in_(list(all_path_node_ids))).all()
        entity_map = {e.id: e for e in entities}

        graph_paths = []
        for path_seq in simple_paths:
            path_nodes = [self._entity_to_node(entity_map[nid]) for nid in path_seq if nid in entity_map]
            
            # Find relationships connecting adjacent steps in the path
            path_relationships = []
            summary_segments = []

            for i in range(len(path_seq) - 1):
                u, v = path_seq[i], path_seq[i+1]
                edge_rels = db.query(Relationship).filter(
                    or_(
                        (Relationship.from_entity_id == u) & (Relationship.to_entity_id == v),
                        (Relationship.from_entity_id == v) & (Relationship.to_entity_id == u),
                    )
                ).all()

                for er in edge_rels:
                    path_relationships.append(
                        self._rel_to_graph_rel(er, entity_map, "GRAPH_PATH_CONNECTION")
                    )
                
                rel_type = edge_rels[0].relationship_type if edge_rels else "CONNECTED_TO"
                u_name = entity_map[u].name if u in entity_map else u
                v_name = entity_map[v].name if v in entity_map else v
                
                if i == 0:
                    summary_segments.append(f"{u} ({u_name})")
                summary_segments.append(f"-[{rel_type}]-> {v} ({v_name})")

            graph_paths.append(
                GraphPath(
                    source_id=source_id,
                    target_id=target_id,
                    hops=len(path_seq) - 1,
                    path_nodes=path_nodes,
                    path_relationships=path_relationships,
                    path_summary=" ".join(summary_segments),
                )
            )

        return graph_paths

    def get_cross_case_connections(self, entity_id: str, db: Session) -> Optional[CrossCaseConnection]:
        """Identifies and details cross-case linkages for an entity spanning multiple cases."""
        ent = db.query(Entity).filter(Entity.id == entity_id).first()
        if not ent:
            return None

        # Fetch cases associated via CaseEntity
        case_records = (
            db.query(CaseEntity, Case)
            .join(Case, CaseEntity.case_id == Case.id)
            .filter(CaseEntity.entity_id == entity_id)
            .all()
        )

        cases_info = [
            {
                "case_id": c.id,
                "case_number": c.case_number,
                "title": c.title,
                "status": c.status,
                "priority": c.priority,
                "role_in_case": ce.role,
            }
            for ce, c in case_records
        ]

        # Fetch relationships tied to those cases
        case_ids = [c["case_id"] for c in cases_info]
        rels = db.query(Relationship).filter(
            or_(Relationship.from_entity_id == entity_id, Relationship.to_entity_id == entity_id),
            Relationship.case_id.in_(case_ids),
        ).all()

        entity_ids = {r.from_entity_id for r in rels} | {r.to_entity_id for r in rels}
        entities = db.query(Entity).filter(Entity.id.in_(list(entity_ids))).all()
        entity_map = {e.id: e for e in entities}

        connecting_rels = [
            self._rel_to_graph_rel(r, entity_map, "CROSS_CASE_LINK")
            for r in rels
        ]

        return CrossCaseConnection(
            entity_id=ent.id,
            entity_name=ent.name,
            cases=cases_info,
            connecting_relationships=connecting_rels,
        )

    def get_entity_timeline(self, entity_id: str, db: Session) -> List[Dict[str, Any]]:
        """Retrieves all chronologically ordered events involving the entity."""
        events = (
            db.query(Event, EventEntity)
            .join(EventEntity, Event.id == EventEntity.event_id)
            .filter(EventEntity.entity_id == entity_id)
            .order_by(Event.timestamp.asc())
            .all()
        )

        timeline_items = []
        for evt, ee in events:
            timeline_items.append({
                "event_id": evt.id,
                "event_type": evt.event_type,
                "timestamp": evt.timestamp.isoformat(),
                "description": evt.description,
                "role": ee.role,
                "location_id": evt.location_id,
                "case_id": evt.case_id,
                "source_id": evt.source_id,
            })
        return timeline_items

    def get_case_network(self, case_id: str, db: Session) -> GraphContext:
        """Retrieves full graph context for a specific case."""
        case_ents = (
            db.query(CaseEntity, Entity)
            .join(Entity, CaseEntity.entity_id == Entity.id)
            .filter(CaseEntity.case_id == case_id)
            .all()
        )

        entity_map = {ent.id: ent for _, ent in case_ents}
        nodes = [self._entity_to_node(ent, ce.role) for ce, ent in case_ents]

        rels = db.query(Relationship).filter(Relationship.case_id == case_id).all()
        graph_rels = [self._rel_to_graph_rel(r, entity_map, "CASE_NETWORK") for r in rels]

        return GraphContext(nodes=nodes, relationships=graph_rels)


# Global singleton instance
graph_retriever = GraphRetriever()
