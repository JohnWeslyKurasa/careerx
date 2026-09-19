"""Database collection names and indexing utilities for CAREERX."""
from typing import Any
import logging
from motor.motor_asyncio import AsyncIOMotorDatabase
import pymongo

logger = logging.getLogger("careerx.db")

PROFILES_COLLECTION = "profiles"
EVIDENCE_COLLECTION = "evidence_nodes"
JD_COLLECTION = "job_descriptions"


async def ensure_indexes(db: AsyncIOMotorDatabase) -> None:
    """
    Idempotently create and enforce all required B-Tree and unique indexes.
    Safe to execute on application startup.
    """
    logger.info("Initializing MongoDB indexes for CAREERX collections...")

    try:
        # 1. Profiles collection indexes
        await db[PROFILES_COLLECTION].create_index(
            [("candidate_id", pymongo.ASCENDING)],
            unique=True,
            name="idx_profiles_candidate_id_unique",
        )
        await db[PROFILES_COLLECTION].create_index(
            [("email", pymongo.ASCENDING)],
            unique=True,
            sparse=True,
            name="idx_profiles_email_sparse_unique",
        )

        # 2. Evidence Nodes collection indexes
        await db[EVIDENCE_COLLECTION].create_index(
            [("evidence_id", pymongo.ASCENDING)],
            unique=True,
            name="idx_evidence_id_unique",
        )
        await db[EVIDENCE_COLLECTION].create_index(
            [("candidate_id", pymongo.ASCENDING)],
            name="idx_evidence_candidate_id",
        )
        await db[EVIDENCE_COLLECTION].create_index(
            [("is_active", pymongo.ASCENDING)],
            name="idx_evidence_is_active",
        )
        await db[EVIDENCE_COLLECTION].create_index(
            [("candidate_id", pymongo.ASCENDING), ("is_active", pymongo.ASCENDING)],
            name="idx_evidence_candidate_active",
        )
        await db[EVIDENCE_COLLECTION].create_index(
            [("verified_skills", pymongo.ASCENDING)],
            name="idx_evidence_verified_skills_multikey",
        )

        # 3. Job Descriptions collection indexes
        await db[JD_COLLECTION].create_index(
            [("jd_id", pymongo.ASCENDING)],
            unique=True,
            name="idx_jd_id_unique",
        )

        logger.info("MongoDB indexes verified successfully.")
    except Exception as exc:
        logger.error(f"Failed to ensure database indexes: {exc}")
        raise exc
