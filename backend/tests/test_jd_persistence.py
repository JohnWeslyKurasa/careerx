import pytest
from httpx import AsyncClient

SAMPLE_JD_TEXT = """
Job Title: Senior Python Backend Developer
Company: Apex Cloud Systems
Location: Remote

About the Role:
We are seeking a Backend Developer with strong Python and FastAPI experience.
Must have deep understanding of asynchronous programming and database optimization.

Key Requirements:
- 3+ years of experience with Python, FastAPI, and PostgreSQL.
- Must have experience with Redis caching and message queues (Kafka or RabbitMQ).
- Strong knowledge of Docker and container orchestration.
- Nice to have: experience with GraphQL and Kubernetes.
"""


@pytest.mark.anyio
async def test_jd_ingest_and_retrieval(async_client: AsyncClient):
    """Verify JD ingestion decomposes requirements, persists to DB, and is retrievable by jd_id."""
    payload = {
        "raw_text": SAMPLE_JD_TEXT,
        "title": "Senior Python Backend Developer",
        "company": "Apex Cloud Systems",
    }

    response = await async_client.post("/api/v1/jd/ingest", json=payload)
    assert response.status_code == 201
    data = response.json()

    jd_id = data["jd_id"]
    assert jd_id.startswith("jd_")
    assert data["requirements_count"] >= 3
    assert data["job_description"]["company"] == "Apex Cloud Systems"

    # Verify retrieval
    get_res = await async_client.get(f"/api/v1/jd/{jd_id}")
    assert get_res.status_code == 200
    retrieved = get_res.json()
    assert retrieved["jd_id"] == jd_id
    assert retrieved["title"] == "Senior Python Backend Developer"
    assert len(retrieved["requirements"]) >= 3
    assert len(retrieved["interview_topics"]) >= 2

    # Check that requirements have importance weights
    weights = [r["importance_weight"] for r in retrieved["requirements"]]
    assert all(1.0 <= w <= 3.0 for w in weights)


@pytest.mark.anyio
async def test_jd_not_found(async_client: AsyncClient):
    """Verify 404 is returned when querying a non-existent jd_id."""
    res = await async_client.get("/api/v1/jd/jd_does_not_exist_404")
    assert res.status_code == 404
    assert "not found" in res.json()["detail"]


@pytest.mark.anyio
async def test_jd_validation_error_on_short_text(async_client: AsyncClient):
    """Verify 400 error when sending text shorter than 20 characters."""
    payload = {"raw_text": "Short text"}
    res = await async_client.post("/api/v1/jd/ingest", json=payload)
    assert res.status_code == 400
