from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.graph.graph_builder import graph_builder
from app.schemas.investigation import GraphStatsResponse

router = APIRouter()


@router.get(
    "/stats",
    response_model=GraphStatsResponse,
    status_code=status.HTTP_200_OK,
    summary="Knowledge Graph Topology Metrics",
    description="Returns global NetworkX graph metrics including total nodes, edges, density, connected components, and entity type breakdown.",
)
def get_graph_statistics(db: Session = Depends(get_db)) -> GraphStatsResponse:
    stats = graph_builder.get_stats(db=db)
    return GraphStatsResponse(**stats)
