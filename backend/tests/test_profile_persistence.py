import io
from uuid import uuid4
import pytest
from httpx import AsyncClient


def create_resume_v1(email: str) -> str:
    return f"""
Arjun Sharma
{email} | +91 9876543210
https://github.com/arjun-dev | https://linkedin.com/in/arjun-dev

EDUCATION
ABC Institute of Technology
B.Tech in Computer Science and Engineering | GPA: 8.6
2022 - 2026

TECHNICAL SKILLS
Languages: Python, JavaScript
Frameworks: FastAPI, React
Databases: Redis, Docker

PROJECTS
Distributed Task Runner
https://github.com/arjun-dev/task-runner
- Built an asynchronous distributed task runner using Python and Redis.
- Implemented worker pool handling 500 req/s with 99.9% uptime.

Weather Scraper
- Built a web scraper in Python using BeautifulSoup.

EXPERIENCE
TechStart Inc - Backend Intern
May 2025 - Aug 2025
- Contributed to production REST APIs in FastAPI.
"""


def create_resume_v2(email: str) -> str:
    return f"""
Arjun Sharma
{email} | +91 9876543210
https://github.com/arjun-dev | https://linkedin.com/in/arjun-dev

EDUCATION
ABC Institute of Technology
B.Tech in Computer Science and Engineering | GPA: 8.6
2022 - 2026

TECHNICAL SKILLS
Languages: Python, TypeScript
Frameworks: FastAPI, Next.js
Databases: MongoDB, Redis, Docker

PROJECTS
Distributed Task Runner
https://github.com/arjun-dev/task-runner
- Built an asynchronous distributed task runner using Python and Redis.
- Implemented worker pool handling 500 req/s with 99.9% uptime.

E-Commerce Microservices
https://github.com/arjun-dev/ecommerce-api
- Engineered asynchronous microservices backend using FastAPI and MongoDB.
- Implemented JWT authentication and role-based access control.

EXPERIENCE
TechStart Inc - Junior Backend Engineer
May 2025 - Present
- Designed high-throughput microservices handling production traffic.
"""


@pytest.mark.anyio
async def test_profile_first_time_ingestion(async_client: AsyncClient):
    """Verify first-time resume ingestion creates profile, version=1, and evidence nodes."""
    test_email = f"arjun.first.{uuid4().hex[:6]}@example.com"
    resume_text = create_resume_v1(test_email)
    file_content = resume_text.encode("utf-8")
    files = {"file": ("resume_v1.txt", io.BytesIO(file_content), "text/plain")}

    response = await async_client.post("/api/v1/profile/ingest", files=files)
    assert response.status_code == 201
    data = response.json()

    candidate_id = data["candidate_id"]
    assert candidate_id.startswith("usr_")
    assert data["version"] == 1
    assert data["active_evidence_count"] >= 3
    assert data["profile"]["full_name"] == "Arjun Sharma"
    assert data["profile"]["email"] == test_email

    # Verify profile retrieval by candidate_id
    get_res = await async_client.get(f"/api/v1/profile/{candidate_id}")
    assert get_res.status_code == 200
    profile_data = get_res.json()
    assert profile_data["candidate_id"] == candidate_id
    assert len(profile_data["projects"]) == 2
    assert profile_data["version"] == 1

    # Verify evidence retrieval
    ev_res = await async_client.get(f"/api/v1/profile/{candidate_id}/evidence")
    assert ev_res.status_code == 200
    evidence_items = ev_res.json()
    assert len(evidence_items) == data["active_evidence_count"]
    # Verify confidence tier
    strong_items = [e for e in evidence_items if e["confidence_tier"] == "STRONG"]
    assert len(strong_items) >= 1
    assert any("task-runner" in (e.get("verifiable_url") or "") for e in strong_items)


@pytest.mark.anyio
async def test_profile_version_update_clean_replacement(async_client: AsyncClient):
    """
    Verify uploading an updated resume:
    1. Increments version to 2
    2. Maintains audit snapshot
    3. Replaces active resume projects
    4. Deactivates removed evidence nodes
    5. Mints new active evidence nodes
    """
    test_email = f"arjun.update.{uuid4().hex[:6]}@example.com"

    # 1. First upload
    file_v1 = create_resume_v1(test_email).encode("utf-8")
    files_v1 = {"file": ("resume_v1.txt", io.BytesIO(file_v1), "text/plain")}
    res1 = await async_client.post("/api/v1/profile/ingest", files=files_v1)
    assert res1.status_code == 201
    candidate_id = res1.json()["candidate_id"]
    v1_evidence_count = res1.json()["active_evidence_count"]
    assert res1.json()["version"] == 1

    # 2. Second upload for the SAME candidate
    file_v2 = create_resume_v2(test_email).encode("utf-8")
    files_v2 = {"file": ("resume_v2.txt", io.BytesIO(file_v2), "text/plain")}
    data_form = {"candidate_id": candidate_id}
    res2 = await async_client.post(
        "/api/v1/profile/ingest", files=files_v2, data=data_form
    )
    assert res2.status_code == 201
    res2_data = res2.json()

    assert res2_data["candidate_id"] == candidate_id
    assert res2_data["version"] == 2
    assert len(res2_data["profile"]["audit_history"]) == 1
    assert res2_data["profile"]["audit_history"][0]["version"] == 1

    # Active projects should now be Distributed Task Runner & E-Commerce Microservices (Weather Scraper removed)
    titles = [p["title"] for p in res2_data["profile"]["projects"]]
    assert "Weather Scraper" not in titles
    assert any("E-Commerce" in t for t in titles)

    # 3. Verify evidence deactivation
    # Active evidence should contain E-Commerce and Task Runner claims
    active_ev_res = await async_client.get(
        f"/api/v1/profile/{candidate_id}/evidence?active_only=true"
    )
    active_ev = active_ev_res.json()
    active_claims = [e["claim_text"] for e in active_ev]
    assert not any("BeautifulSoup" in c for c in active_claims)
    assert any("FastAPI and MongoDB" in c for c in active_claims)

    # All evidence (including archived) should show deactivated nodes
    all_ev_res = await async_client.get(
        f"/api/v1/profile/{candidate_id}/evidence?active_only=false"
    )
    all_ev = all_ev_res.json()
    assert len(all_ev) > len(active_ev)
    deactivated = [e for e in all_ev if not e["is_active"]]
    assert len(deactivated) >= v1_evidence_count


@pytest.mark.anyio
async def test_standalone_project_addition(async_client: AsyncClient):
    """Verify adding a standalone portfolio project additively expands profile and evidence."""
    test_email = f"arjun.standalone.{uuid4().hex[:6]}@example.com"
    file_v1 = create_resume_v1(test_email).encode("utf-8")
    files_v1 = {"file": ("resume_v1.txt", io.BytesIO(file_v1), "text/plain")}
    res1 = await async_client.post("/api/v1/profile/ingest", files=files_v1)
    candidate_id = res1.json()["candidate_id"]

    # Append standalone project
    project_payload = {
        "title": "Distributed Cache Invalidation Service",
        "repo_url": "https://github.com/arjun-dev/cache-invalidator",
        "tech_stack": ["Python", "Redis", "Kafka"],
        "bullets": [
            "Implemented distributed pub/sub cache invalidation handling 20k events/sec."
        ],
    }

    add_res = await async_client.post(
        f"/api/v1/profile/{candidate_id}/projects", json=project_payload
    )
    assert add_res.status_code == 200
    updated_profile = add_res.json()
    assert any("Cache Invalidation" in p["title"] for p in updated_profile["projects"])

    # Check that new evidence was minted with source_type="manual_portfolio"
    ev_res = await async_client.get(f"/api/v1/profile/{candidate_id}/evidence")
    assert ev_res.status_code == 200
    nodes = ev_res.json()
    manual_nodes = [e for e in nodes if e["source_type"] == "manual_portfolio"]
    assert len(manual_nodes) >= 1
    assert manual_nodes[0]["confidence_tier"] == "STRONG"
    assert "cache-invalidator" in manual_nodes[0]["verifiable_url"]


@pytest.mark.anyio
async def test_profile_not_found_handling(async_client: AsyncClient):
    """Verify 404 responses for non-existent candidate lookups."""
    res = await async_client.get("/api/v1/profile/usr_non_existent_999")
    assert res.status_code == 404
    assert "not found" in res.json()["detail"]

    res_ev = await async_client.get("/api/v1/profile/usr_non_existent_999/evidence")
    assert res_ev.status_code == 404

    res_add = await async_client.post(
        "/api/v1/profile/usr_non_existent_999/projects",
        json={"title": "Test", "bullets": ["Test bullet"]},
    )
    assert res_add.status_code == 404
