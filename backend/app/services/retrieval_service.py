"""
High-Level Retrieval Application Service for CAREERX.
Bridges MongoDB Career Memory with the multi-stage Hybrid Retrieval Engine.
"""
import time
import logging
from typing import List, Optional
from fastapi import HTTPException, status
from backend.app.models.profile import EvidenceNode
from backend.app.models.retrieval import (
    RetrievalQueryRequest,
    RetrievalResponse,
    MatchJDRequest,
    JDMatchResponse,
    RequirementMatchResult,
)
from backend.app.db.repositories.profile_repo import ProfileRepository
from backend.app.db.repositories.evidence_repo import EvidenceRepository
from backend.app.db.repositories.jd_repo import JobDescriptionRepository
from backend.app.services.retrieval.hybrid_retriever import HybridRetriever

logger = logging.getLogger("careerx.service.retrieval")


class EvidenceRetrievalService:
    """Coordinates evidence retrieval, vector persistence, and JD requirement matching."""

    def __init__(
        self,
        profile_repo: Optional[ProfileRepository] = None,
        evidence_repo: Optional[EvidenceRepository] = None,
        jd_repo: Optional[JobDescriptionRepository] = None,
    ) -> None:
        self.profile_repo = profile_repo or ProfileRepository()
        self.evidence_repo = evidence_repo or EvidenceRepository()
        self.jd_repo = jd_repo or JobDescriptionRepository()

    async def query_candidate_evidence(
        self, request: RetrievalQueryRequest
    ) -> RetrievalResponse:
        """
        Retrieves top grounded evidence nodes from a candidate's Career Memory
        for an arbitrary query or requirement string.
        """
        start_time = time.perf_counter()

        # 1. Verify candidate exists
        profile = await self.profile_repo.get_by_candidate_id(request.candidate_id)
        if not profile:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Candidate profile '{request.candidate_id}' not found.",
            )

        # 2. Fetch evidence nodes (active only by default)
        if request.include_archived:
            nodes = await self.evidence_repo.get_all_by_candidate_id(request.candidate_id)
        else:
            nodes = await self.evidence_repo.get_active_by_candidate_id(request.candidate_id)

        # 3. Execute Hybrid Retrieval
        ranked_items, new_embeddings = HybridRetriever.retrieve(
            query=request.requirement_text,
            evidence_nodes=nodes,
            mode=request.mode,
            alpha=request.alpha,
            stage1_top_k=request.stage1_top_k,
            final_top_k=request.final_top_k,
        )

        # 4. Asynchronously persist any newly computed embeddings to MongoDB
        if new_embeddings:
            updates = [{"evidence_id": eid, "embedding": emb} for eid, emb in new_embeddings]
            try:
                await self.evidence_repo.update_embeddings_batch(updates)
                logger.info(f"Persisted {len(updates)} dense embeddings to MongoDB for candidate={request.candidate_id}")
            except Exception as e:
                logger.warning(f"Failed to persist embeddings to MongoDB: {e}")

        elapsed_ms = (time.perf_counter() - start_time) * 1000.0

        return RetrievalResponse(
            candidate_id=request.candidate_id,
            requirement_text=request.requirement_text,
            mode=request.mode,
            alpha=request.alpha,
            total_active_evaluated=len(nodes),
            latency_ms=round(elapsed_ms, 2),
            results=ranked_items,
        )

    async def match_target_jd(self, request: MatchJDRequest) -> JDMatchResponse:
        """
        Retrieves top grounded evidence nodes across all requirements of a target Job Description.
        """
        start_time = time.perf_counter()

        # 1. Verify candidate exists
        profile = await self.profile_repo.get_by_candidate_id(request.candidate_id)
        if not profile:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Candidate profile '{request.candidate_id}' not found.",
            )

        # 2. Verify target JD exists
        jd = await self.jd_repo.get_by_id(request.jd_id)
        if not jd:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Target Job Description '{request.jd_id}' not found.",
            )

        # 3. Fetch active evidence nodes
        nodes = await self.evidence_repo.get_active_by_candidate_id(request.candidate_id)

        all_new_embeddings = []
        matches: List[RequirementMatchResult] = []

        # 4. Evaluate each JD requirement
        for req in jd.requirements:
            ranked_items, new_embs = HybridRetriever.retrieve(
                query=req.text,
                evidence_nodes=nodes,
                mode=request.mode,
                alpha=request.alpha,
                stage1_top_k=request.stage1_top_k,
                final_top_k=request.final_top_k,
            )
            all_new_embeddings.extend(new_embs)
            matches.append(
                RequirementMatchResult(
                    req_id=req.req_id,
                    requirement_text=req.text,
                    importance_weight=req.importance_weight,
                    retrieved_evidence=ranked_items,
                )
            )

        # 5. Persist any newly computed embeddings
        if all_new_embeddings:
            # Deduplicate by evidence_id
            seen = set()
            deduped = []
            for eid, emb in all_new_embeddings:
                if eid not in seen:
                    seen.add(eid)
                    deduped.append({"evidence_id": eid, "embedding": emb})
            try:
                await self.evidence_repo.update_embeddings_batch(deduped)
            except Exception as e:
                logger.warning(f"Failed to persist batch embeddings: {e}")

        elapsed_ms = (time.perf_counter() - start_time) * 1000.0

        return JDMatchResponse(
            candidate_id=request.candidate_id,
            jd_id=request.jd_id,
            mode=request.mode,
            matches=matches,
            total_latency_ms=round(elapsed_ms, 2),
        )
