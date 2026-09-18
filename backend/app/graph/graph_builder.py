import networkx as nx
from typing import Dict, Any, Optional
from sqlalchemy.orm import Session

from app.models.entity import Entity
from app.models.relationship import Relationship


class GraphBuilder:
    """Builds and caches NetworkX graph representations from the relational database."""

    def __init__(self):
        self._graph: Optional[nx.MultiDiGraph] = None
        self._undirected_graph: Optional[nx.Graph] = None

    def build_graph(self, db: Session, force_rebuild: bool = False) -> nx.MultiDiGraph:
        """Constructs a NetworkX MultiDiGraph from active entities and relationships."""
        if self._graph is not None and not force_rebuild:
            return self._graph

        G = nx.MultiDiGraph()

        # 1. Add all entities as nodes
        entities = db.query(Entity).all()
        for ent in entities:
            G.add_node(
                ent.id,
                name=ent.name,
                entity_type=ent.entity_type,
                status=ent.status,
                description=ent.description,
                attributes=ent.attributes or {},
                created_at=ent.created_at,
            )

        # 2. Add all relationships as directed edges
        relationships = db.query(Relationship).all()
        for rel in relationships:
            G.add_edge(
                rel.from_entity_id,
                rel.to_entity_id,
                key=rel.id,
                relationship_id=rel.id,
                relationship_type=rel.relationship_type,
                description=rel.description,
                start_time=rel.start_time,
                end_time=rel.end_time,
                status=rel.status,
                confidence=rel.confidence,
                case_id=rel.case_id,
                source_id=rel.source_id,
            )

        self._graph = G
        self._undirected_graph = G.to_undirected(as_view=False)
        return self._graph

    def get_undirected_graph(self, db: Session) -> nx.Graph:
        """Returns undirected graph projection for multi-directional path and bridge analysis."""
        if self._undirected_graph is None:
            self.build_graph(db=db)
        return self._undirected_graph

    def get_stats(self, db: Session) -> Dict[str, Any]:
        """Calculates graph metrics and topology statistics."""
        G = self.build_graph(db=db)
        density = nx.density(G)
        
        # Connected components on undirected projection
        UG = G.to_undirected(as_view=True)
        components_count = nx.number_connected_components(UG) if len(UG) > 0 else 0

        return {
            "total_nodes": G.number_of_nodes(),
            "total_edges": G.number_of_edges(),
            "density": round(float(density), 4),
            "connected_components": components_count,
            "node_types": self._get_node_type_counts(G),
        }

    def _get_node_type_counts(self, G: nx.MultiDiGraph) -> Dict[str, int]:
        counts = {}
        for _, data in G.nodes(data=True):
            etype = data.get("entity_type", "UNKNOWN")
            counts[etype] = counts.get(etype, 0) + 1
        return counts


# Singleton builder instance
graph_builder = GraphBuilder()
