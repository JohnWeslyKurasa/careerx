from typing import List, Optional
from fastapi import APIRouter, File, Form, HTTPException, Query, UploadFile, status

from backend.app.models.profile import (
    AddProjectRequest,
    CandidateProfile,
    EvidenceNode,
    ParsedResume,
    ProfileIngestResponse,
)
from backend.app.services.parser.resume_parser import (
    EmptyDocumentError,
    ParsingError,
    ResumeParser,
    ScannedDocumentError,
    UnsupportedFormatError,
)
from backend.app.services.profile_service import ProfilePersistenceService

router = APIRouter()

MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024  # 10 MB limit
profile_service = ProfilePersistenceService()


@router.post(
    "/parse",
    response_model=ParsedResume,
    status_code=status.HTTP_200_OK,
    summary="Parse Candidate Resume Document (In-Memory)",
    description="Extracts structured entities, projects, education, and skills from PDF, DOCX, or TXT resumes without writing to database.",
)
async def parse_resume_upload(file: UploadFile = File(...)) -> ParsedResume:
    """Parse an uploaded resume file into an in-memory structured model (Phase 2)."""
    if not file.filename:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Filename must be provided.",
        )

    content = await file.read()
    if len(content) > MAX_FILE_SIZE_BYTES:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"File exceeds maximum allowed size of {MAX_FILE_SIZE_BYTES // (1024 * 1024)}MB.",
        )

    try:
        return ResumeParser.parse_bytes(content, file.filename)
    except EmptyDocumentError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except ScannedDocumentError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except UnsupportedFormatError as e:
        raise HTTPException(status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE, detail=str(e))
    except ParsingError as e:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=str(e))
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Unexpected parsing error: {e}",
        )


@router.post(
    "/ingest",
    response_model=ProfileIngestResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Ingest & Persist Candidate Resume",
    description="Parses resume and persists career profile and atomic evidence nodes in MongoDB under the Clean Replacement + Timestamp Audit strategy.",
)
async def ingest_resume(
    file: UploadFile = File(...),
    candidate_id: Optional[str] = Form(None),
) -> ProfileIngestResponse:
    """Ingest resume file, persist profile, and mint initial evidence nodes (Phase 3)."""
    if not file.filename:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Filename must be provided.",
        )

    content = await file.read()
    if len(content) > MAX_FILE_SIZE_BYTES:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"File exceeds maximum allowed size of {MAX_FILE_SIZE_BYTES // (1024 * 1024)}MB.",
        )

    try:
        return await profile_service.ingest_resume_bytes(
            file_bytes=content,
            filename=file.filename,
            candidate_id=candidate_id,
        )
    except EmptyDocumentError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except ScannedDocumentError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except UnsupportedFormatError as e:
        raise HTTPException(status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE, detail=str(e))
    except ParsingError as e:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=str(e))
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to ingest candidate profile: {e}",
        )


@router.get(
    "/{candidate_id}",
    response_model=CandidateProfile,
    status_code=status.HTTP_200_OK,
    summary="Get Candidate Profile",
    description="Retrieves the persistent career profile for a candidate.",
)
async def get_candidate_profile(candidate_id: str) -> CandidateProfile:
    """Fetch candidate profile by candidate_id."""
    profile = await profile_service.get_profile(candidate_id)
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Candidate profile with ID '{candidate_id}' not found.",
        )
    return profile


@router.get(
    "/{candidate_id}/evidence",
    response_model=List[EvidenceNode],
    status_code=status.HTTP_200_OK,
    summary="Get Candidate Evidence Nodes",
    description="Retrieves atomic, auditable evidence items supporting the candidate's career memory.",
)
async def get_candidate_evidence(
    candidate_id: str,
    active_only: bool = Query(True, description="Filter for only active evidence nodes"),
) -> List[EvidenceNode]:
    """Fetch evidence nodes for a candidate."""
    profile = await profile_service.get_profile(candidate_id)
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Candidate profile with ID '{candidate_id}' not found.",
        )
    return await profile_service.get_evidence(candidate_id, active_only=active_only)


@router.post(
    "/{candidate_id}/projects",
    response_model=CandidateProfile,
    status_code=status.HTTP_200_OK,
    summary="Add Standalone Project",
    description="Appends a project to candidate's portfolio and mints new evidence nodes without re-uploading resume.",
)
async def add_project_to_profile(
    candidate_id: str,
    payload: AddProjectRequest,
) -> CandidateProfile:
    """Add a standalone portfolio project to an existing candidate profile."""
    try:
        return await profile_service.add_standalone_project(candidate_id, payload)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to add project: {e}",
        )
