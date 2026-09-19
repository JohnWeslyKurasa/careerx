import pytest
from httpx import AsyncClient

from backend.app.services.parser.jd_parser import JobDescriptionParser

SAMPLE_JD_TEXT = """
Role: Junior Python Backend Engineer
Company: Apex Cloud Systems

About the Role:
We are seeking a talented Junior Backend Engineer to join our core platform team.

Key Requirements:
- Strong proficiency in Python and asynchronous frameworks (FastAPI or asyncio) is required.
- Must have hands-on experience designing databases with MongoDB and PostgreSQL.
- Experience with in-memory caching using Redis is essential.
- Experience with Docker containerization and CI/CD pipelines.
- Knowledge of Microservices architecture and RESTful API standards.
- Nice to have: familiarity with Kubernetes and GraphQL is a plus.
- Good communication and teamwork skills in an Agile environment.
"""


@pytest.mark.anyio
async def test_jd_parser_direct_extraction():
    """Verify that the JD parser extracts requirements, skills, weights, and interview topics."""
    parsed = JobDescriptionParser.parse_text(SAMPLE_JD_TEXT)

    assert "Junior Python Backend Engineer" in parsed.title
    assert parsed.company == "Apex Cloud Systems" or parsed.company is None or "Apex" in (parsed.company or "")
    assert len(parsed.requirements) >= 4

    # Verify high weight (3.0) for mandatory skills
    fastapi_req = next(
        (r for r in parsed.requirements if "FastAPI" in r.canonical_skills or "Python" in r.canonical_skills),
        None,
    )
    assert fastapi_req is not None
    assert fastapi_req.importance_weight == 3.0

    # Verify low weight (1.0) for nice-to-have skills
    k8s_req = next(
        (r for r in parsed.requirements if "Kubernetes" in r.canonical_skills or "GraphQL" in r.canonical_skills),
        None,
    )
    assert k8s_req is not None
    assert k8s_req.importance_weight == 1.0

    # Verify synthesized interview topics
    assert len(parsed.interview_topics) >= 2
    assert any("Async Python" in t or "FastAPI" in t for t in parsed.interview_topics)


@pytest.mark.anyio
async def test_jd_parser_too_short_text():
    """Verify that JDs with insufficient text raise ValueError."""
    with pytest.raises(ValueError):
        JobDescriptionParser.parse_text("Short text")


@pytest.mark.anyio
async def test_jd_api_endpoint_success(async_client: AsyncClient):
    """Test POST /api/v1/jd/parse with valid payload."""
    payload = {
        "raw_text": SAMPLE_JD_TEXT,
        "title": "Junior Python Backend Engineer",
        "company": "Apex Cloud Systems",
    }
    response = await async_client.post("/api/v1/jd/parse", json=payload)

    assert response.status_code == 200
    data = response.json()
    assert data["title"] == "Junior Python Backend Engineer"
    assert data["company"] == "Apex Cloud Systems"
    assert len(data["requirements"]) >= 4
    assert len(data["interview_topics"]) >= 1
    assert "extraction_metadata" in data


@pytest.mark.anyio
async def test_jd_api_endpoint_validation_error(async_client: AsyncClient):
    """Test POST /api/v1/jd/parse with invalid short payload returns HTTP 422."""
    payload = {"raw_text": "too short"}
    response = await async_client.post("/api/v1/jd/parse", json=payload)
    assert response.status_code == 422
