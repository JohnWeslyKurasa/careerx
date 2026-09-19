"""Repository for MongoDB operations on the profiles collection."""
from typing import Any, Dict, List, Optional
import logging
from backend.app.core.database import db_manager
from backend.app.db.collections import PROFILES_COLLECTION
from backend.app.models.profile import CandidateProfile, ProjectItem

logger = logging.getLogger("careerx.repo.profile")


class ProfileRepository:
    """Data Access Object for the `profiles` MongoDB collection."""

    def __init__(self) -> None:
        pass

    @property
    def _collection(self):
        db = db_manager.get_database()
        return db[PROFILES_COLLECTION]

    async def insert_profile(self, profile: CandidateProfile) -> CandidateProfile:
        """Insert a newly constructed candidate profile document."""
        doc = profile.model_dump()
        await self._collection.insert_one(doc)
        logger.info(f"Inserted profile for candidate_id={profile.candidate_id}")
        return profile

    async def get_by_candidate_id(self, candidate_id: str) -> Optional[CandidateProfile]:
        """Fetch candidate profile by business identifier."""
        doc = await self._collection.find_one({"candidate_id": candidate_id}, {"_id": 0})
        if not doc:
            return None
        return CandidateProfile(**doc)

    async def get_by_email(self, email: str) -> Optional[CandidateProfile]:
        """Fetch candidate profile by email address."""
        if not email:
            return None
        doc = await self._collection.find_one({"email": email.lower()}, {"_id": 0})
        if not doc:
            return None
        return CandidateProfile(**doc)

    async def update_profile(
        self, candidate_id: str, update_fields: Dict[str, Any]
    ) -> Optional[CandidateProfile]:
        """Update fields on an existing candidate profile."""
        result = await self._collection.find_one_and_update(
            {"candidate_id": candidate_id},
            {"$set": update_fields},
            return_document=True,
            projection={"_id": 0},
        )
        if not result:
            return None
        logger.info(f"Updated profile for candidate_id={candidate_id}")
        return CandidateProfile(**result)

    async def append_project(
        self, candidate_id: str, project: ProjectItem
    ) -> Optional[CandidateProfile]:
        """Append a standalone project to candidate's projects array."""
        project_dict = project.model_dump()
        result = await self._collection.find_one_and_update(
            {"candidate_id": candidate_id},
            {"$push": {"projects": project_dict}},
            return_document=True,
            projection={"_id": 0},
        )
        if not result:
            return None
        logger.info(f"Appended project '{project.title}' to candidate_id={candidate_id}")
        return CandidateProfile(**result)

    async def delete_profile(self, candidate_id: str) -> bool:
        """Delete candidate profile by ID."""
        res = await self._collection.delete_one({"candidate_id": candidate_id})
        return res.deleted_count > 0
