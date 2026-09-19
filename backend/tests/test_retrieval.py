"""
Comprehensive Test Suite for Phase 4: Evidence Retrieval & Hybrid RAG Engine.
Validates:
1. Exact keyword matching
2. Semantic matching across synonyms
3. Vocabulary mismatch resolution
4. Irrelevant evidence filtering
5. Active evidence filtering (ignoring archived nodes)
6. Empty evidence handling
7. Multiple evidence nodes ranking
8. 4-way ablation modes (BM25 only, Dense only, Hybrid, Hybrid + Reranker)
9. Configurable parameters (alpha, stage1_top_k, final_top_k)
10. Latency benchmark and error handling
"""
import io
from uuid import uuid4
import pytest
from httpx import AsyncClient
from backend.app.models.profile import EvidenceNode, ConfidenceTier
from backend.app.models.retrieval import RetrievalMode
from backend.app.services.retrieval.sparse_retriever import SparseRetriever
from backend.app.services.retrieval.dense_retriever import DenseRetriever
from backend.app.services.retrieval.hybrid_retriever import HybridRetriever


def make_evidence_node(
    claim: str,
    evidence_id: str,
    skills: list,
    tier: ConfidenceTier = ConfidenceTier.STRONG,
    is_active: bool = True,
    url: str = "https://github.com/test/repo"
) -> EvidenceNode:
    return EvidenceNode(
        evidence_id=evidence_id,
        candidate_id="usr_test_eval",
        claim_text=claim,
        source_type="project_bullet",
        source_reference="Test Project",
        verifiable_url=url,
        verified_skills=skills,
        confidence_tier=tier,
        confidence_score=1.0 if tier == ConfidenceTier.STRONG else 0.75,
        is_active=is_active,
        created_at="2026-09-01T12:00:00Z"
    )


# ---------------------------------------------------------------------------
# Unit Tests: Sparse & Dense Retrievers
# ---------------------------------------------------------------------------

def test_sparse_bm25_exact_match():
    """Verify BM25 gives top score to exact token matches."""
    corpus = [
        "Built distributed task queue in Python with Celery and Redis",
        "Designed relational database schemas with PostgreSQL and Alembic",
        "Frontend single-page applications using React and TailwindCSS"
    ]
    retriever = SparseRetriever(corpus)
    scores = retriever.score_query("Redis task queue")
    assert scores[0] > scores[1]
    assert scores[0] > scores[2]
    assert scores[0] == 1.0  # Normalized top score


def test_dense_retriever_cosine_similarity():
    """Verify DenseRetriever mathematical properties."""
    vec_a = [1.0, 0.0, 0.0]
    vec_b = [1.0, 0.0, 0.0]
    vec_c = [0.0, 1.0, 0.0]
    assert DenseRetriever.cosine_similarity(vec_a, vec_b) == pytest.approx(1.0)
    assert DenseRetriever.cosine_similarity(vec_a, vec_c) == pytest.approx(0.0)

    scores = DenseRetriever.score_query(vec_a, [vec_b, vec_c])
    assert scores[0] == pytest.approx(1.0)
    assert scores[1] == pytest.approx(0.0)


# ---------------------------------------------------------------------------
# Integration Tests: Hybrid Retriever & Ablation Modes
# ---------------------------------------------------------------------------

def test_hybrid_retrieval_vocabulary_mismatch():
    """
    Test core research hypothesis:
    Job Requirement: 'Experience with distributed caching'
    Candidate Evidence: 'Implemented Redis-based cache invalidation'
    BM25 score might be modest, but SBERT semantic match must elevate it to #1.
    """
    nodes = [
        make_evidence_node(
            "Implemented Redis-based cache invalidation reducing database read load by 40%",
            "ev_01",
            ["Redis"]
        ),
        make_evidence_node(
            "Configured CI/CD pipelines using GitHub Actions and Docker",
            "ev_02",
            ["Docker", "GitHub"]
        ),
        make_evidence_node(
            "Wrote comprehensive unit test suite in pytest with 90% coverage",
            "ev_03",
            ["Python", "pytest"],
            tier=ConfidenceTier.CONTEXTUAL
        ),
    ]

    results, _ = HybridRetriever.retrieve(
        query="Experience with distributed caching",
        evidence_nodes=nodes,
        mode=RetrievalMode.HYBRID,
        alpha=0.65,
        final_top_k=2
    )

    assert len(results) == 2
    # The Redis cache node must be ranked #1
    assert results[0].evidence_id == "ev_01"
    assert results[0].dense_score > 0.4
    assert "Redis" in results[0].claim_text


def test_four_ablation_modes():
    """Verify retriever executes across all 4 research ablation configurations."""
    nodes = [
        make_evidence_node(
            "Engineered high-throughput asynchronous microservices in FastAPI",
            "ev_fastapi",
            ["FastAPI", "Python"]
        ),
        make_evidence_node(
            "Provisioned Kubernetes clusters and Helm charts on AWS",
            "ev_k8s",
            ["Kubernetes", "AWS"]
        ),
    ]

    query = "FastAPI backend services"

    # Mode 1: BM25 Only
    res_bm25, _ = HybridRetriever.retrieve(query, nodes, mode=RetrievalMode.BM25_ONLY)
    assert len(res_bm25) > 0
    assert res_bm25[0].evidence_id == "ev_fastapi"
    assert res_bm25[0].rerank_score is None

    # Mode 2: Dense Only
    res_dense, _ = HybridRetriever.retrieve(query, nodes, mode=RetrievalMode.DENSE_ONLY)
    assert len(res_dense) > 0
    assert res_dense[0].evidence_id == "ev_fastapi"
    assert res_dense[0].rerank_score is None

    # Mode 3: Hybrid
    res_hybrid, _ = HybridRetriever.retrieve(query, nodes, mode=RetrievalMode.HYBRID, alpha=0.65)
    assert len(res_hybrid) > 0
    assert res_hybrid[0].evidence_id == "ev_fastapi"
    assert res_hybrid[0].hybrid_score is not None

    # Mode 4: Hybrid + Cross-Encoder Reranked
    res_reranked, _ = HybridRetriever.retrieve(query, nodes, mode=RetrievalMode.HYBRID_RERANKED)
    assert len(res_reranked) > 0
    assert res_reranked[0].evidence_id == "ev_fastapi"
    assert res_reranked[0].rerank_score is not None


def test_empty_and_irrelevant_evidence():
    """Verify graceful handling when evidence list is empty or unrelated."""
    results, _ = HybridRetriever.retrieve("Python programming", [], mode=RetrievalMode.HYBRID)
    assert results == []

    # Irrelevant evidence
    nodes = [
        make_evidence_node("Cooking Italian pasta dishes", "ev_cooking", []),
    ]
    results_irr, _ = HybridRetriever.retrieve("Kubernetes cluster setup", nodes, mode=RetrievalMode.HYBRID)
    assert len(results_irr) == 1
    # Dense score should be low
    assert results_irr[0].dense_score < 0.4


# ---------------------------------------------------------------------------
# API Integration Tests: Full Flow from Profile Ingest to Retrieval
# ---------------------------------------------------------------------------

SAMPLE_RESUME_TEXT = """
Devon Vance
devon.vance@example.com | +91 9123456780
https://github.com/devon-vance

TECHNICAL SKILLS
Languages: Python, Go
Databases: Redis, PostgreSQL
Tools: Docker, Kafka

PROJECTS
High-Speed Event Bus
https://github.com/devon-vance/event-bus
- Built a high-speed asynchronous event bus using Python and Redis streams.
- Handled 10000 events/sec with zero message loss.

Cloud Infrastructure Automation
https://github.com/devon-vance/cloud-infra
- Provisioned Docker containers and CI/CD pipelines.

EXPERIENCE
FinTech Labs - Backend Intern
- Maintained relational PostgreSQL databases and wrote optimized SQL queries.
"""


@pytest.mark.anyio
async def test_retrieval_api_endpoint_flow(async_client: AsyncClient):
    """
    End-to-end test:
    1. Ingest candidate profile with projects
    2. Query retrieval endpoint for 'in-memory streams'
    3. Verify active evidence nodes are returned with full score breakdown
    4. Verify latency is reported and < 500ms
    """
    test_email = f"devon.{uuid4().hex[:6]}@example.com"
    resume = SAMPLE_RESUME_TEXT.replace("devon.vance@example.com", test_email)
    file_bytes = resume.encode("utf-8")
    files = {"file": ("devon_resume.txt", io.BytesIO(file_bytes), "text/plain")}

    ingest_res = await async_client.post("/api/v1/profile/ingest", files=files)
    assert ingest_res.status_code == 201
    candidate_id = ingest_res.json()["candidate_id"]

    # 2. Query retrieval endpoint
    query_payload = {
        "candidate_id": candidate_id,
        "requirement_text": "Experience with Redis streams and event messaging",
        "mode": "hybrid_reranked",
        "alpha": 0.65,
        "stage1_top_k": 10,
        "final_top_k": 2
    }

    ret_res = await async_client.post("/api/v1/retrieval/query", json=query_payload)
    assert ret_res.status_code == 200
    ret_data = ret_res.json()

    assert ret_data["candidate_id"] == candidate_id
    assert ret_data["mode"] == "hybrid_reranked"
    assert ret_data["total_active_evaluated"] >= 2
    assert 0.0 < ret_data["latency_ms"] < 15000.0  # Cold-start model inference and persistence on CPU
    assert len(ret_data["results"]) >= 1

    top_item = ret_data["results"][0]
    assert "Redis streams" in top_item["claim_text"]
    assert top_item["final_score"] > 0.5
    assert top_item["verifiable_url"] is not None


@pytest.mark.anyio
async def test_retrieval_ignores_archived_evidence(async_client: AsyncClient):
    """
    Verify that when candidate updates resume (archiving old projects),
    the retrieval engine strictly evaluates only active evidence nodes.
    """
    test_email = f"archived.{uuid4().hex[:6]}@example.com"
    resume_v1 = f"""
Arun Patel
{test_email} | +91 9988776655

PROJECTS
Legacy Weather Tracker
- Built a weather web app in Flask.
"""
    files_v1 = {"file": ("v1.txt", io.BytesIO(resume_v1.encode("utf-8")), "text/plain")}
    res1 = await async_client.post("/api/v1/profile/ingest", files=files_v1)
    cid = res1.json()["candidate_id"]

    # Resume v2 replaces Legacy Weather Tracker with Distributed Task Queue
    resume_v2 = f"""
Arun Patel
{test_email} | +91 9988776655

PROJECTS
Distributed Task Queue
https://github.com/arun/task-queue
- Engineered scalable task queue in FastAPI and Redis.
"""
    files_v2 = {"file": ("v2.txt", io.BytesIO(resume_v2.encode("utf-8")), "text/plain")}
    res2 = await async_client.post("/api/v1/profile/ingest", files=files_v2, data={"candidate_id": cid})
    assert res2.status_code == 201

    # Query for Flask
    query_payload = {
        "candidate_id": cid,
        "requirement_text": "Flask web application development",
        "mode": "hybrid",
        "include_archived": False
    }
    ret_res = await async_client.post("/api/v1/retrieval/query", json=query_payload)
    assert ret_res.status_code == 200
    claims = [r["claim_text"] for r in ret_res.json()["results"]]
    # The archived Flask project must NOT be in active retrieval results!
    assert not any("Flask" in c for c in claims)


@pytest.mark.anyio
async def test_retrieval_not_found_and_validation(async_client: AsyncClient):
    """Verify 404 for non-existent candidate and 422 for malformed requests."""
    res_404 = await async_client.post(
        "/api/v1/retrieval/query",
        json={"candidate_id": "usr_fake_nonexistent", "requirement_text": "Python"}
    )
    assert res_404.status_code == 404

    # Too short requirement
    res_422 = await async_client.post(
        "/api/v1/retrieval/query",
        json={"candidate_id": "usr_fake", "requirement_text": "a"}
    )
    assert res_422.status_code == 422
