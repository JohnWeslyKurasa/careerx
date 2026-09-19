"""
Job Readiness Scoring (JRS) API Endpoints for CAREERX.
Provides deterministic, explainable readiness evaluations against target Job Descriptions.
"""
import logging
from typing import Optional
from fastapi import APIRouter, Depends, Query, status
from backend.app.models.jrs import JRSRequest, JRSResponse
from backend.app.models.retrieval import RetrievalMode
from backend.app.services.jrs_service import JRSScoringService

logger = logging.getLogger("careerx.api.jrs")

router = APIRouter(prefix="/jrs", tags=["Job Readiness Scoring"])


def get_jrs_service() -> JRSScoringService:
    return JRSScoringService()


@router.post(
    "/calculate",
    response_model=JRSResponse,
    status_code=status.HTTP_200_OK,
    summary="Calculate Explainable Job Readiness Score (JRS)",
    description=(
        "Evaluates candidate active Career Memory against a target Job Description. "
        "Performs evidence grounding, applies confidence multipliers, aggregates importance weights, "
        "deducts critical gap penalties, and returns an explainable 0-100 readiness report."
    ),
)
async def calculate_jrs(
    request: JRSRequest,
    service: JRSScoringService = Depends(get_jrs_service),
) -> JRSResponse:
    return await service.calculate_jrs(request)


@router.get(
    "/evaluate/{candidate_id}/{jd_id}",
    response_model=JRSResponse,
    status_code=status.HTTP_200_OK,
    summary="Evaluate Candidate Readiness for a Target Job (GET)",
    description="Convenience GET endpoint to evaluate candidate against a target Job Description.",
)
async def evaluate_candidate_for_jd(
    candidate_id: str,
    jd_id: str,
    mode: RetrievalMode = Query(
        default=RetrievalMode.HYBRID_RERANKED,
        description="Retrieval engine mode for evidence grounding",
    ),
    alpha: float = Query(
        default=0.65,
        ge=0.0,
        le=1.0,
        description="Hybrid fusion dense weight",
    ),
    stage1_top_k: int = Query(
        default=15,
        ge=1,
        le=50,
        description="Stage-1 recall depth",
    ),
    service: JRSScoringService = Depends(get_jrs_service),
) -> JRSResponse:
    request = JRSRequest(
        candidate_id=candidate_id,
        jd_id=jd_id,
        retrieval_mode=mode,
        alpha=alpha,
        stage1_top_k=stage1_top_k,
    )
    return await service.calculate_jrs(request)
