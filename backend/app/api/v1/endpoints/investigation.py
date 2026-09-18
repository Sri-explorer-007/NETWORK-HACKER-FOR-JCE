from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.rag.hybrid_retriever import hybrid_retriever
from app.llm.service import llm_service
from app.schemas.investigation import (
    InvestigationRetrieveRequest,
    InvestigationRetrieveResponse,
    InvestigationQueryRequest,
    InvestigationQueryResponse,
)

router = APIRouter()


@router.post(
    "/retrieve",
    response_model=InvestigationRetrieveResponse,
    status_code=status.HTTP_200_OK,
    summary="Multi-Modal Investigation Context Retrieval",
    description="Fuses Graph path traversal, Chronological Timeline events, and Vector Evidence search into a unified investigation context.",
)
def retrieve_investigation_context(
    request: InvestigationRetrieveRequest,
    db: Session = Depends(get_db),
) -> InvestigationRetrieveResponse:
    context = hybrid_retriever.retrieve(
        query=request.query,
        case_id=request.case_id,
        date_from=request.date_from,
        date_to=request.date_to,
        source_type=request.source_type,
        verification_status=request.verification_status,
        top_k=request.top_k,
        db=db,
    )
    return InvestigationRetrieveResponse(**context.model_dump())


@router.post(
    "/query",
    response_model=InvestigationQueryResponse,
    status_code=status.HTTP_200_OK,
    summary="Grounded LLM Investigation Query",
    description="Executes hybrid Graph-RAG retrieval and synthesizes a grounded analytical response with exact ID citations and guardrails.",
)
def query_investigation_assistant(
    request: InvestigationQueryRequest,
    db: Session = Depends(get_db),
) -> InvestigationQueryResponse:
    # 1. Retrieve multi-modal context (Graph + Timeline + Evidence Vector Store)
    context = hybrid_retriever.retrieve(
        query=request.query,
        case_id=request.case_id,
        date_from=request.date_from,
        date_to=request.date_to,
        source_type=request.source_type,
        verification_status=request.verification_status,
        top_k=request.top_k,
        db=db,
    )

    # 2. Synthesize grounded answer via LLM Service (or deterministic DEMO_FALLBACK)
    answer = llm_service.generate_answer(
        query=request.query,
        context=context,
    )

    return answer
