from fastapi import APIRouter
from app.api.v1.endpoints import health, cases, entities, relationships, rag, investigation, graph

api_router = APIRouter()

# Register core endpoint routers
api_router.include_router(health.router, tags=["Health"])
api_router.include_router(cases.router, prefix="/cases", tags=["Cases"])
api_router.include_router(entities.router, prefix="/entities", tags=["Entities"])
api_router.include_router(relationships.router, prefix="/relationships", tags=["Relationships"])
api_router.include_router(rag.router, prefix="/rag", tags=["Evidence RAG"])
api_router.include_router(investigation.router, prefix="/investigation", tags=["Investigation Context Fusion"])
api_router.include_router(graph.router, prefix="/graph", tags=["Knowledge Graph"])
