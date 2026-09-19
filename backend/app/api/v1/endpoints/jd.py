from fastapi import APIRouter, HTTPException, status

from backend.app.models.jd import (
    JDIngestResponse,
    JDParseRequest,
    JobDescription,
    ParsedJobDescription,
)
from backend.app.services.jd_service import JDPersistenceService
from backend.app.services.parser.jd_parser import JobDescriptionParser

router = APIRouter()
jd_service = JDPersistenceService()


@router.post(
    "/parse",
    response_model=ParsedJobDescription,
    status_code=status.HTTP_200_OK,
    summary="Parse & Decompose Job Description (In-Memory)",
    description="Extracts structured technical requirements, canonical skill tags, importance weights, and interview themes from JD text without database write.",
)
async def parse_job_description(payload: JDParseRequest) -> ParsedJobDescription:
    """Decompose raw job description text into structured requirements in-memory (Phase 2)."""
    try:
        return JobDescriptionParser.parse_text(
            raw_text=payload.raw_text,
            title=payload.title,
            company=payload.company,
        )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to parse job description: {e}",
        )


@router.post(
    "/ingest",
    response_model=JDIngestResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Ingest & Persist Target Job Description",
    description="Parses, decomposes, and persists target Job Description in MongoDB (Phase 3).",
)
async def ingest_job_description(payload: JDParseRequest) -> JDIngestResponse:
    """Decompose raw JD text and persist to MongoDB job_descriptions collection."""
    try:
        return await jd_service.ingest_job_description(payload)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to ingest job description: {e}",
        )


@router.get(
    "/{jd_id}",
    response_model=JobDescription,
    status_code=status.HTTP_200_OK,
    summary="Get Persisted Job Description",
    description="Retrieves a stored job description by its jd_id identifier.",
)
async def get_job_description(jd_id: str) -> JobDescription:
    """Fetch persistent job description by jd_id."""
    jd_doc = await jd_service.get_job_description(jd_id)
    if not jd_doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Job description with ID '{jd_id}' not found.",
        )
    return jd_doc
