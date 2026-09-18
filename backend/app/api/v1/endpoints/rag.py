from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.rag.retriever import rag_service
from app.rag.metadata import RAGFilters
from app.schemas.rag import (
    RAGSearchRequest,
    RAGSearchResponse,
    RAGIndexResponse,
    RAGStatsResponse,
)

router = APIRouter()


@router.post(
    "/index",
    response_model=RAGIndexResponse,
    status_code=status.HTTP_200_OK,
    summary="Index all evidence records into vector store",
    description="Loads evidence records, creates enriched documents, chunks them, generates embeddings, and updates the vector database.",
)
def index_evidence_records(db: Session = Depends(get_db)) -> RAGIndexResponse:
    stats = rag_service.index_all_evidence(db=db, force_reindex=False)
    return RAGIndexResponse(**stats)


@router.post(
    "/search",
    response_model=RAGSearchResponse,
    summary="Semantic vector retrieval over evidence",
    description="Performs cosine similarity search against indexed evidence chunks with optional case and metadata filtering.",
)
def search_evidence(request: RAGSearchRequest, db: Session = Depends(get_db)) -> RAGSearchResponse:
    filters = RAGFilters(
        case_id=request.case_id,
        entity_id=request.entity_id,
        date_from=request.date_from,
        date_to=request.date_to,
        source_type=request.source_type,
        verification_status=request.verification_status,
    )
    response_data = rag_service.search(
        query=request.query,
        case_id=request.case_id,
        top_k=request.top_k,
        filters=filters,
        db=db,
    )
    return RAGSearchResponse(**response_data)


@router.get(
    "/stats",
    response_model=RAGStatsResponse,
    summary="RAG Pipeline Statistics",
    description="Returns metrics on indexed documents, chunks, vector embeddings, and distinct cases in the vector store.",
)
def get_rag_statistics(db: Session = Depends(get_db)) -> RAGStatsResponse:
    stats = rag_service.get_stats(db=db)
    return RAGStatsResponse(**stats)
