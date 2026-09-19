"""Database Repositories for MongoDB collections."""
from backend.app.db.repositories.profile_repo import ProfileRepository
from backend.app.db.repositories.evidence_repo import EvidenceRepository
from backend.app.db.repositories.jd_repo import JobDescriptionRepository

__all__ = [
    "ProfileRepository",
    "EvidenceRepository",
    "JobDescriptionRepository",
]
