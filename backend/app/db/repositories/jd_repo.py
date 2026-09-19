"""Repository for MongoDB operations on the job_descriptions collection."""
from typing import Optional
import logging
from backend.app.core.database import db_manager
from backend.app.db.collections import JD_COLLECTION
from backend.app.models.jd import JobDescription

logger = logging.getLogger("careerx.repo.jd")


class JobDescriptionRepository:
    """Data Access Object for the `job_descriptions` MongoDB collection."""

    def __init__(self) -> None:
        pass

    @property
    def _collection(self):
        db = db_manager.get_database()
        return db[JD_COLLECTION]

    async def insert_jd(self, jd: JobDescription) -> JobDescription:
        """Insert a newly parsed and structured job description document."""
        doc = jd.model_dump()
        await self._collection.insert_one(doc)
        logger.info(f"Inserted job description with jd_id={jd.jd_id}")
        return jd

    async def get_by_id(self, jd_id: str) -> Optional[JobDescription]:
        """Fetch job description by business identifier."""
        doc = await self._collection.find_one({"jd_id": jd_id}, {"_id": 0})
        if not doc:
            return None
        return JobDescription(**doc)

    async def delete_jd(self, jd_id: str) -> bool:
        """Delete job description by ID."""
        res = await self._collection.delete_one({"jd_id": jd_id})
        return res.deleted_count > 0
