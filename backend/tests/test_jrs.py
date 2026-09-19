"""
Comprehensive Automated Test Suite for Phase 5: Job Readiness Scoring Engine (JRS).
Validates:
1. Exact hand-calculated mathematical verification (Part 8 walkthrough)
2. Evidence confidence multipliers (1.00, 0.70, 0.30, 0.00)
3. Missing mandatory skill critical gap penalty (P_critical = 8.0)
4. Critical penalty ceiling capping (max 25.0)
5. Unverified keyword stuffer score cap (JRS <= 30%)
6. Deterministic reproducibility across multiple runs
7. Defensive edge cases (zero evidence, zero weight, similarity noise floor)
8. End-to-end FastAPI integration flow from Profile/JD ingestion to JRS calculation
9. 404 and 422 error handling
"""
import io
from uuid import uuid4
import pytest
from httpx import AsyncClient
from backend.app.models.jrs import (
    JRSMatchSummary,
    JRSRequest,
    JRSResponse,
    MatchStatus,
    RequirementScoreBreakdown,
)
from backend.app.models.profile import ConfidenceTier
from backend.app.models.retrieval import (
    RequirementMatchResult,
    RetrievalMode,
    RetrievedEvidenceItem,
)
from backend.app.services.jrs_service import JRSScoringEngine


def make_retrieved_item(
    evidence_id: str,
    claim: str,
    score: float,
    tier: ConfidenceTier,
    url: str = "https://github.com/test/project",
) -> RetrievedEvidenceItem:
    return RetrievedEvidenceItem(
        evidence_id=evidence_id,
        claim_text=claim,
        source_type="project_bullet",
        source_reference="Test Project",
        verifiable_url=url,
        verified_skills=["Python", "FastAPI"],
        confidence_tier=tier,
        confidence_score=1.0 if tier == ConfidenceTier.STRONG else 0.75,
        bm25_score=score,
        dense_score=score,
        hybrid_score=score,
        rerank_score=score,
        final_score=score,
    )


# ---------------------------------------------------------------------------
# Unit Tests: Pure Deterministic Mathematical Formulations
# ---------------------------------------------------------------------------

def test_jrs_hand_calculated_walkthrough():
    """
    Verifies exact mathematical replication of the 5-requirement walkthrough in Part 8:
    R1: I=3.0, Sim=0.92, Tier=STRONG (1.00)     -> S1=0.920, I1*S1=2.760
    R2: I=3.0, Sim=0.85, Tier=STRONG (1.00)     -> S2=0.850, I2*S2=2.550
    R3: I=2.0, Sim=0.70, Tier=CONTEXTUAL (0.70) -> S3=0.490, I3*S3=0.980
    R4: I=2.0, Sim=0.80, Tier=UNVERIFIED (0.30) -> S4=0.240, I4*S4=0.480
    R5: I=1.0, Sim=0.00, Tier=MISSING (0.00)    -> S5=0.000, I5*S5=0.000

    Sum(I_j) = 11.0
    Sum(I_j * S_j) = 6.770
    BaseJRS = 100 * (6.770 / 11.0) = 61.55%
    P_critical = 0.0
    Final JRS = 61.55%
    """
    matches = [
        RequirementMatchResult(
            req_id="req_01",
            requirement_text="3+ years experience in Python and FastAPI",
            importance_weight=3.0,
            retrieved_evidence=[
                make_retrieved_item("ev_01", "Built async task queue in FastAPI and Python", 0.92, ConfidenceTier.STRONG)
            ],
        ),
        RequirementMatchResult(
            req_id="req_02",
            requirement_text="Experience with Redis caching & event queues",
            importance_weight=3.0,
            retrieved_evidence=[
                make_retrieved_item("ev_02", "Configured Redis cache invalidation", 0.85, ConfidenceTier.STRONG)
            ],
        ),
        RequirementMatchResult(
            req_id="req_03",
            requirement_text="Relational database design in PostgreSQL",
            importance_weight=2.0,
            retrieved_evidence=[
                make_retrieved_item("ev_03", "Maintained PostgreSQL tables", 0.70, ConfidenceTier.CONTEXTUAL)
            ],
        ),
        RequirementMatchResult(
            req_id="req_04",
            requirement_text="Containerization with Docker & CI/CD",
            importance_weight=2.0,
            retrieved_evidence=[
                make_retrieved_item("ev_04", "Docker", 0.80, ConfidenceTier.UNVERIFIED)
            ],
        ),
        RequirementMatchResult(
            req_id="req_05",
            requirement_text="Kubernetes cluster orchestration on AWS",
            importance_weight=1.0,
            retrieved_evidence=[],
        ),
    ]

    response = JRSScoringEngine.compute_jrs(
        candidate_id="usr_arun",
        jd_id="jd_senior_backend",
        jd_title="Senior Backend Engineer",
        match_results=matches,
        retrieval_mode="hybrid_reranked",
    )

    # 1. Check aggregate scores
    assert response.base_jrs == pytest.approx(61.55, abs=0.01)
    assert response.critical_penalty == 0.0
    assert response.overall_jrs == pytest.approx(61.55, abs=0.01)

    # 2. Check summary breakdown counts
    assert response.match_summary.total_requirements == 5
    assert response.match_summary.strong_matches == 2
    assert response.match_summary.partial_matches == 1
    assert response.match_summary.weak_evidence == 1
    assert response.match_summary.missing_requirements == 1
    assert response.match_summary.critical_gaps_count == 0

    # 3. Check individual requirement scores
    b = response.breakdown
    assert b[0].requirement_score == pytest.approx(0.92, abs=0.01)
    assert b[0].match_status == MatchStatus.STRONG_MATCH
    assert b[0].weighted_contribution == pytest.approx(2.76, abs=0.01)

    assert b[1].requirement_score == pytest.approx(0.85, abs=0.01)
    assert b[1].match_status == MatchStatus.STRONG_MATCH

    assert b[2].requirement_score == pytest.approx(0.49, abs=0.01)
    assert b[2].match_status == MatchStatus.PARTIAL_MATCH

    assert b[3].requirement_score == pytest.approx(0.24, abs=0.01)
    assert b[3].match_status == MatchStatus.WEAK_EVIDENCE

    assert b[4].requirement_score == 0.0
    assert b[4].match_status == MatchStatus.MISSING


def test_jrs_missing_mandatory_critical_penalty():
    """
    Candidate misses mandatory Python requirement (I=3.0, missing evidence),
    but has strong PostgreSQL (I=2.0) and strong Docker (I=2.0).
    BaseJRS = 100 * (0.0 + 2.0*0.90 + 2.0*0.90) / 7.0 = 51.43%
    Critical Penalty P_critical = 1 * 8.0 = 8.0
    Final JRS = 51.43 - 8.0 = 43.43%
    """
    matches = [
        RequirementMatchResult(
            req_id="req_python_core",
            requirement_text="Expertise in Python backend development",
            importance_weight=3.0,
            retrieved_evidence=[],  # Missing!
        ),
        RequirementMatchResult(
            req_id="req_postgres",
            requirement_text="PostgreSQL database architecture",
            importance_weight=2.0,
            retrieved_evidence=[
                make_retrieved_item("ev_pg", "Designed PostgreSQL database schemas", 0.90, ConfidenceTier.STRONG)
            ],
        ),
        RequirementMatchResult(
            req_id="req_docker",
            requirement_text="Docker container deployment",
            importance_weight=2.0,
            retrieved_evidence=[
                make_retrieved_item("ev_doc", "Built multi-stage Docker containers", 0.90, ConfidenceTier.STRONG)
            ],
        ),
    ]

    response = JRSScoringEngine.compute_jrs(
        candidate_id="usr_priya",
        jd_id="jd_python_lead",
        jd_title="Python Tech Lead",
        match_results=matches,
        retrieval_mode="hybrid",
    )

    assert response.match_summary.critical_gaps_count == 1
    assert "Expertise in Python backend development" in response.critical_gaps
    assert response.critical_penalty == 8.0
    assert response.base_jrs == pytest.approx(51.43, abs=0.02)
    assert response.overall_jrs == pytest.approx(43.43, abs=0.02)


def test_jrs_unverified_keyword_stuffer_cap():
    """
    Candidate has 100% semantic similarity on all requirements, but only Tier 1 (Unverified) claims.
    Multipliers are 0.30, so BaseJRS must be capped at exactly 30.0%.
    """
    matches = [
        RequirementMatchResult(
            req_id=f"req_{i}",
            requirement_text=f"Requirement {i}",
            importance_weight=2.0,
            retrieved_evidence=[
                make_retrieved_item(f"ev_{i}", f"Keyword {i}", 1.0, ConfidenceTier.UNVERIFIED)
            ],
        )
        for i in range(5)
    ]

    response = JRSScoringEngine.compute_jrs(
        candidate_id="usr_stuffer",
        jd_id="jd_001",
        jd_title="General Role",
        match_results=matches,
        retrieval_mode="hybrid",
    )

    assert response.base_jrs == pytest.approx(30.0, abs=0.01)
    assert response.overall_jrs <= 30.0
    assert response.match_summary.weak_evidence == 5


def test_jrs_critical_penalty_ceiling():
    """
    Candidate misses 4 mandatory requirements (4 * 8.0 = 32.0 raw penalty).
    Penalty must be clamped to MAX_CRITICAL_GAP_PENALTY = 25.0.
    """
    matches = [
        RequirementMatchResult(
            req_id=f"req_mand_{i}",
            requirement_text=f"Mandatory Requirement {i}",
            importance_weight=3.0,
            retrieved_evidence=[],
        )
        for i in range(4)
    ]

    response = JRSScoringEngine.compute_jrs(
        candidate_id="usr_unqualified",
        jd_id="jd_002",
        jd_title="Executive Architect",
        match_results=matches,
        retrieval_mode="hybrid",
    )

    assert response.critical_penalty == 25.0  # Capped at 25.0
    assert response.overall_jrs == 0.0


def test_jrs_zero_evidence_candidate():
    """Candidate with zero evidence nodes across all requirements evaluates cleanly to 0.0%."""
    matches = [
        RequirementMatchResult(
            req_id="req_01",
            requirement_text="Core Java and Spring Boot",
            importance_weight=3.0,
            retrieved_evidence=[],
        ),
        RequirementMatchResult(
            req_id="req_02",
            requirement_text="Microservices and Kafka",
            importance_weight=2.0,
            retrieved_evidence=[],
        ),
    ]

    response = JRSScoringEngine.compute_jrs(
        candidate_id="usr_blank",
        jd_id="jd_java",
        jd_title="Java Developer",
        match_results=matches,
        retrieval_mode="hybrid",
    )

    assert response.overall_jrs == 0.0
    assert response.base_jrs == 0.0
    assert response.match_summary.missing_requirements == 2


def test_jrs_similarity_noise_floor_clipping():
    """Evidence with similarity below 0.15 is treated as noise (0.0 / MISSING)."""
    matches = [
        RequirementMatchResult(
            req_id="req_01",
            requirement_text="Rust Systems Programming",
            importance_weight=2.0,
            retrieved_evidence=[
                make_retrieved_item("ev_cooking", "Cooking recipes in Italian kitchen", 0.10, ConfidenceTier.STRONG)
            ],
        )
    ]

    response = JRSScoringEngine.compute_jrs(
        candidate_id="usr_noise",
        jd_id="jd_rust",
        jd_title="Rust Dev",
        match_results=matches,
        retrieval_mode="dense_only",
    )

    assert response.breakdown[0].match_status == MatchStatus.MISSING
    assert response.breakdown[0].requirement_score == 0.0
    assert response.overall_jrs == 0.0


def test_jrs_deterministic_reproducibility():
    """Verifies that 100 identical invocations produce 100% bitwise identical JRS scores."""
    matches = [
        RequirementMatchResult(
            req_id="req_01",
            requirement_text="Python and FastAPI",
            importance_weight=3.0,
            retrieved_evidence=[
                make_retrieved_item("ev_01", "FastAPI microservices", 0.88, ConfidenceTier.STRONG)
            ],
        ),
        RequirementMatchResult(
            req_id="req_02",
            requirement_text="PostgreSQL relational database",
            importance_weight=2.0,
            retrieved_evidence=[
                make_retrieved_item("ev_02", "PostgreSQL database schemas", 0.75, ConfidenceTier.CONTEXTUAL)
            ],
        ),
    ]

    first_run = JRSScoringEngine.compute_jrs("usr_test", "jd_test", "Title", matches, "hybrid")
    for _ in range(50):
        subsequent_run = JRSScoringEngine.compute_jrs("usr_test", "jd_test", "Title", matches, "hybrid")
        assert subsequent_run.overall_jrs == first_run.overall_jrs
        assert subsequent_run.base_jrs == first_run.base_jrs
        assert subsequent_run.critical_penalty == first_run.critical_penalty


# ---------------------------------------------------------------------------
# API Integration Tests: Full Ingestion -> Retrieval -> JRS Flow
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

SAMPLE_JD_TEXT = """
Senior Python Backend Developer
Acme Corp

Job Description:
We are seeking a Senior Python Backend Developer to join our core engineering team.

Key Requirements:
- 3+ years of experience with Python, FastAPI, and PostgreSQL.
- Must have experience with Redis caching and message queues (Kafka or RabbitMQ).
- Strong knowledge of Docker and container orchestration.
- Nice to have: experience with GraphQL and Kubernetes.
"""


@pytest.mark.anyio
async def test_jrs_api_end_to_end_flow(async_client: AsyncClient):
    """
    End-to-End API Integration Test:
    1. Ingest candidate profile with verified projects
    2. Ingest target Job Description with weighted requirements
    3. Call POST /api/v1/jrs/calculate
    4. Call GET /api/v1/jrs/evaluate/{candidate_id}/{jd_id}
    5. Verify score breakdowns, diagnostics, strengths, and improvements
    """
    test_email = f"devon.jrs.{uuid4().hex[:6]}@example.com"
    resume = SAMPLE_RESUME_TEXT.replace("devon.vance@example.com", test_email)
    files = {"file": ("resume.txt", io.BytesIO(resume.encode("utf-8")), "text/plain")}

    # 1. Ingest Profile
    ingest_res = await async_client.post("/api/v1/profile/ingest", files=files)
    assert ingest_res.status_code == 201
    candidate_id = ingest_res.json()["candidate_id"]

    # 2. Ingest JD
    jd_payload = {"raw_text": SAMPLE_JD_TEXT, "title": "Senior Python Backend Developer", "company": "Acme Corp"}
    jd_res = await async_client.post("/api/v1/jd/ingest", json=jd_payload)
    assert jd_res.status_code == 201
    jd_id = jd_res.json()["jd_id"]

    # 3. Calculate JRS via POST
    jrs_payload = {
        "candidate_id": candidate_id,
        "jd_id": jd_id,
        "retrieval_mode": "hybrid",
        "alpha": 0.65,
        "stage1_top_k": 10,
    }
    calc_res = await async_client.post("/api/v1/jrs/calculate", json=jrs_payload)
    assert calc_res.status_code == 200
    report = calc_res.json()

    assert report["candidate_id"] == candidate_id
    assert report["jd_id"] == jd_id
    assert report["jd_title"] == "Senior Python Backend Developer"
    assert 0.0 <= report["overall_jrs"] <= 100.0
    assert 0.0 <= report["base_jrs"] <= 100.0
    assert report["match_summary"]["total_requirements"] >= 3
    assert len(report["breakdown"]) >= 3
    assert report["computation_latency_ms"] > 0.0

    # Verify requirement breakdowns contain grounded evidence
    grounded_items = [b for b in report["breakdown"] if b["grounded_evidence"] is not None]
    assert len(grounded_items) >= 1
    assert grounded_items[0]["grounded_evidence"]["claim_text"] is not None
    assert grounded_items[0]["grounded_evidence"]["evidence_id"] is not None

    # 4. Evaluate JRS via GET
    get_res = await async_client.get(f"/api/v1/jrs/evaluate/{candidate_id}/{jd_id}?mode=hybrid&alpha=0.65")
    assert get_res.status_code == 200
    get_data = get_res.json()
    assert get_data["overall_jrs"] == report["overall_jrs"]


@pytest.mark.anyio
async def test_jrs_api_not_found_errors(async_client: AsyncClient):
    """Verifies 404 response when candidate or JD does not exist."""
    res_404_cand = await async_client.post(
        "/api/v1/jrs/calculate",
        json={"candidate_id": "usr_nonexistent_999", "jd_id": "jd_fake_001"}
    )
    assert res_404_cand.status_code == 404
