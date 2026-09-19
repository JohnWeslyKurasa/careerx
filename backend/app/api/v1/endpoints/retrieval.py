from fastapi import APIRouter, Depends, status
from backend.app.models.retrieval import (
    RetrievalQueryRequest,
    RetrievalResponse,
    MatchJDRequest,
    JDMatchResponse,
)
from backend.app.services.retrieval_service import EvidenceRetrievalService

router = APIRouter()


def get_retrieval_service() -> EvidenceRetrievalService:
    return EvidenceRetrievalService()


@router.post(
    "/query",
    response_model=RetrievalResponse,
    status_code=status.HTTP_200_OK,
    summary="Retrieve grounded evidence for an arbitrary requirement query",
)
async def query_evidence(
    request: RetrievalQueryRequest,
    service: EvidenceRetrievalService = Depends(get_retrieval_service),
) -> RetrievalResponse:
    """
    Executes hybrid retrieval over a candidate's active evidence nodes.
    Supports 4 evaluation modes (bm25_only, dense_only, hybrid, hybrid_reranked).
    """
    return await service.query_candidate_evidence(request)


@router.post(
    "/match",
    response_model=JDMatchResponse,
    status_code=status.HTTP_200_OK,
    summary="Retrieve grounded evidence across all requirements of a target JD",
)
async def match_target_job(
    request: MatchJDRequest,
    service: EvidenceRetrievalService = Depends(get_retrieval_service),
) -> JDMatchResponse:
    """
    Matches candidate active Career Memory against each decomposed clause
    of the target Job Description.
    """
    return await service.match_target_jd(request)
