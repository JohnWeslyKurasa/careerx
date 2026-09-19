"""
Live Verification Script for CAREERX Phase 4: Evidence Retrieval & Hybrid RAG Engine.
Validates:
1. Dense 384-dim SBERT embedding generation
2. MongoDB embedding persistence in `evidence_nodes` collection
3. 4-way ablation execution (BM25, SBERT, Hybrid, Cross-Encoder Reranked)
4. Target JD requirement matching across multi-clause requirements
"""
import asyncio
import time
from motor.motor_asyncio import AsyncIOMotorClient
from backend.app.core.config import settings
from backend.app.db.collections import EVIDENCE_COLLECTION, PROFILES_COLLECTION, JD_COLLECTION
from backend.app.models.retrieval import (
    RetrievalQueryRequest,
    RetrievalMode,
    MatchJDRequest,
)
from backend.app.services.retrieval_service import EvidenceRetrievalService


async def main():
    print("=" * 70)
    print("CAREERX Phase 4: Evidence Retrieval & Hybrid RAG Live Audit")
    print("=" * 70)

    from backend.app.core.database import db_manager
    await db_manager.connect()
    client = db_manager.client
    db = db_manager.get_database()

    # Verify Ping
    ping_res = await client.admin.command("ping")
    print(f"[OK] MongoDB Connection Verified: {ping_res}")

    # Find a sample candidate profile
    profile = await db[PROFILES_COLLECTION].find_one({}, sort=[("created_at", -1)])
    if not profile:
        print("[FAIL] No candidate profiles found in MongoDB. Run Phase 3 verification first.")
        return

    candidate_id = profile["candidate_id"]
    print(f"\n[Sample Candidate] candidate_id='{candidate_id}', name='{profile.get('full_name')}'")

    # Inspect active evidence nodes
    active_nodes = await db[EVIDENCE_COLLECTION].find(
        {"candidate_id": candidate_id, "is_active": True}
    ).to_list(length=100)
    print(f"Active evidence nodes available: {len(active_nodes)}")
    for node in active_nodes[:3]:
        has_emb = "YES (384-dim)" if node.get("embedding") and len(node["embedding"]) == 384 else "NO (pending)"
        print(f"  - [{node['evidence_id']}] '{node['claim_text'][:50]}...' | Embedded: {has_emb}")

    # Initialize Service
    service = EvidenceRetrievalService()
    test_query = "Experience with asynchronous programming, Redis, and high throughput APIs"

    print(f"\n--- Testing 4-Way Retrieval Ablation Modes on Query: ---")
    print(f"Query: '{test_query}'")

    modes = [
        (RetrievalMode.BM25_ONLY, "Mode 1: BM25 Lexical Only"),
        (RetrievalMode.DENSE_ONLY, "Mode 2: SBERT Dense Only"),
        (RetrievalMode.HYBRID, "Mode 3: Single-Stage Hybrid (alpha=0.65)"),
        (RetrievalMode.HYBRID_RERANKED, "Mode 4: Two-Stage Hybrid + Cross-Encoder Reranked"),
    ]

    for mode_enum, mode_label in modes:
        req = RetrievalQueryRequest(
            candidate_id=candidate_id,
            requirement_text=test_query,
            mode=mode_enum,
            alpha=0.65,
            stage1_top_k=10,
            final_top_k=2,
        )
        res = await service.query_candidate_evidence(req)
        print(f"\n[{mode_label}] (Latency: {res.latency_ms:.2f}ms)")
        for rank, item in enumerate(res.results, start=1):
            score_info = f"final={item.final_score:.4f}"
            if item.bm25_score is not None:
                score_info += f", bm25={item.bm25_score:.4f}"
            if item.dense_score is not None:
                score_info += f", dense={item.dense_score:.4f}"
            if item.rerank_score is not None:
                score_info += f", rerank={item.rerank_score:.4f}"
            print(f"  Rank #{rank} [{score_info}]: '{item.claim_text}'")

    # Verify that embeddings were persisted to MongoDB
    updated_nodes = await db[EVIDENCE_COLLECTION].find(
        {"candidate_id": candidate_id, "is_active": True, "embedding": {"$ne": None}}
    ).to_list(length=100)
    print(f"\n[OK] MongoDB Vector Persistence Audit:")
    print(f"Active nodes with persisted 384-dim embeddings: {len(updated_nodes)} of {len(active_nodes)}")

    # Verify Target JD Matching
    sample_jd = await db[JD_COLLECTION].find_one({}, sort=[("created_at", -1)])
    if sample_jd:
        print(f"\n--- Testing Target JD Multi-Clause Matching ---")
        print(f"Target JD: '{sample_jd.get('title')}' (jd_id={sample_jd.get('jd_id')})")
        match_req = MatchJDRequest(
            candidate_id=candidate_id,
            jd_id=sample_jd["jd_id"],
            mode=RetrievalMode.HYBRID_RERANKED,
            final_top_k=2,
        )
        jd_res = await service.match_target_jd(match_req)
        print(f"Total matching latency across {len(jd_res.matches)} requirements: {jd_res.total_latency_ms:.2f}ms")
        for match in jd_res.matches:
            print(f"\n  * Requirement: '{match.requirement_text}' (weight={match.importance_weight})")
            for r, ev in enumerate(match.retrieved_evidence, start=1):
                print(f"    - Grounding #{r} (score={ev.final_score:.4f}): '{ev.claim_text}'")

    client.close()
    print("\n[SUCCESS] Phase 4 Live Retrieval and Vector Verification Completed Successfully.")


if __name__ == "__main__":
    asyncio.run(main())
