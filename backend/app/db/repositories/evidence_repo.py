"""Repository for MongoDB operations on the evidence_nodes collection."""
from typing import Any, Dict, List, Optional
import logging
from backend.app.core.database import db_manager
from backend.app.db.collections import EVIDENCE_COLLECTION
from backend.app.models.profile import EvidenceNode

logger = logging.getLogger("careerx.repo.evidence")


class EvidenceRepository:
    """Data Access Object for the `evidence_nodes` MongoDB collection."""

    def __init__(self) -> None:
        pass

    @property
    def _collection(self):
        db = db_manager.get_database()
        return db[EVIDENCE_COLLECTION]

    async def bulk_insert(self, nodes: List[EvidenceNode]) -> int:
        """Insert multiple evidence nodes efficiently."""
        if not nodes:
            return 0
        docs = [node.model_dump() for node in nodes]
        res = await self._collection.insert_many(docs)
        count = len(res.inserted_ids)
        logger.info(f"Bulk-inserted {count} evidence nodes into MongoDB.")
        return count

    async def insert_one(self, node: EvidenceNode) -> EvidenceNode:
        """Insert a single evidence node."""
        doc = node.model_dump()
        await self._collection.insert_one(doc)
        logger.info(f"Inserted evidence node evidence_id={node.evidence_id}")
        return node

    async def get_active_by_candidate_id(self, candidate_id: str) -> List[EvidenceNode]:
        """Fetch all currently active evidence nodes for a candidate."""
        cursor = self._collection.find(
            {"candidate_id": candidate_id, "is_active": True},
            {"_id": 0}
        )
        docs = await cursor.to_list(length=1000)
        return [EvidenceNode(**d) for d in docs]

    async def get_all_by_candidate_id(self, candidate_id: str) -> List[EvidenceNode]:
        """Fetch all evidence nodes (active and archived) for audit history."""
        cursor = self._collection.find(
            {"candidate_id": candidate_id},
            {"_id": 0}
        )
        docs = await cursor.to_list(length=2000)
        return [EvidenceNode(**d) for d in docs]

    async def deactivate_resume_evidence(
        self, candidate_id: str, archived_at: str
    ) -> int:
        """
        Deactivates resume-derived evidence nodes on new resume upload.
        Crucial: Preserves independent evidence (e.g. manual_portfolio, interview_transcript).
        """
        query = {
            "candidate_id": candidate_id,
            "is_active": True,
            "source_type": {"$in": ["experience_bullet", "project_bullet"]},
        }
        update = {
            "$set": {
                "is_active": False,
                "archived_at": archived_at,
            }
        }
        res = await self._collection.update_many(query, update)
        logger.info(
            f"Deactivated {res.modified_count} resume-derived evidence nodes for candidate_id={candidate_id}"
        )
        return res.modified_count

    async def update_embedding(self, evidence_id: str, embedding: List[float]) -> bool:
        """Update the dense vector embedding for an evidence node."""
        res = await self._collection.update_one(
            {"evidence_id": evidence_id},
            {"$set": {"embedding": embedding}}
        )
        return res.modified_count > 0

    async def update_embeddings_batch(self, updates: List[Dict[str, Any]]) -> int:
        """
        Batch update embeddings for multiple evidence nodes.
        updates: [{'evidence_id': 'ev_...', 'embedding': [...]}, ...]
        """
        if not updates:
            return 0
        from pymongo import UpdateOne
        operations = [
            UpdateOne(
                {"evidence_id": item["evidence_id"]},
                {"$set": {"embedding": item["embedding"]}}
            )
            for item in updates
        ]
        res = await self._collection.bulk_write(operations, ordered=False)
        return res.modified_count

    async def delete_by_candidate_id(self, candidate_id: str) -> int:
        """Delete all evidence nodes for a candidate."""
        res = await self._collection.delete_many({"candidate_id": candidate_id})
        return res.deleted_count
