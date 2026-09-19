"""Service for orchestrating Job Description parsing and MongoDB persistence."""
from datetime import datetime, timezone
from typing import Optional
from uuid import uuid4
import logging

from backend.app.db.repositories.jd_repo import JobDescriptionRepository
from backend.app.models.jd import (
    JDIngestResponse,
    JDParseRequest,
    JobDescription,
    ParsedJobDescription,
)
from backend.app.services.parser.jd_parser import JobDescriptionParser

logger = logging.getLogger("careerx.service.jd")


class JDPersistenceService:
    """Manages the parsing, validation, and database persistence of target Job Descriptions."""

    def __init__(self, jd_repo: Optional[JobDescriptionRepository] = None) -> None:
        self.jd_repo = jd_repo or JobDescriptionRepository()

    async def ingest_job_description(self, req: JDParseRequest) -> JDIngestResponse:
        """
        Parses raw JD text using Phase 2 JobDescriptionParser, persists the decomposed requirement
        graph in MongoDB, and returns the persisted JobDescription.
        """
        # 1. Deterministic Phase 2 parsing
        parsed: ParsedJobDescription = JobDescriptionParser.parse_text(
            raw_text=req.raw_text,
            title=req.title,
            company=req.company,
        )

        now_iso = datetime.now(timezone.utc).isoformat()
        jd_id = f"jd_{uuid4().hex[:8]}"

        # 2. Construct persistent domain document
        jd_doc = JobDescription(
            jd_id=jd_id,
            title=parsed.title,
            company=parsed.company,
            raw_text=parsed.raw_text,
            requirements=parsed.requirements,
            interview_topics=parsed.interview_topics,
            created_at=now_iso,
        )

        # 3. Persist to MongoDB
        await self.jd_repo.insert_jd(jd_doc)
        logger.info(f"Successfully persisted job description with jd_id={jd_id}")

        return JDIngestResponse(
            jd_id=jd_id,
            job_description=jd_doc,
            requirements_count=len(parsed.requirements),
            message="Job description parsed, decomposed, and persisted successfully.",
        )

    async def get_job_description(self, jd_id: str) -> Optional[JobDescription]:
        """Fetch persistent job description by ID."""
        return await self.jd_repo.get_by_id(jd_id)
