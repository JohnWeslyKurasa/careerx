import io
import pytest
from httpx import AsyncClient
import docx

from backend.app.services.parser.resume_parser import (
    EmptyDocumentError,
    ResumeParser,
    ScannedDocumentError,
    UnsupportedFormatError,
)

SAMPLE_RESUME_TEXT = """
Arjun Sharma
arjun.sharma@example.com | +91 9876543210
https://github.com/arjun-dev | https://linkedin.com/in/arjun-dev

EDUCATION
ABC Institute of Technology
B.Tech in Computer Science and Engineering | GPA: 8.6
2022 - 2026

TECHNICAL SKILLS
Languages: Python, JavaScript, TypeScript, SQL
Frameworks: FastAPI, React, Node.js, Next.js
Databases & Cloud: MongoDB, Redis, PostgreSQL, Docker, AWS

PROJECTS
Distributed Task Runner
https://github.com/arjun-dev/task-runner
- Built an asynchronous distributed task runner using Python and Redis.
- Implemented worker pool handling 500 req/s with 99.9% uptime.
- Containerized using Docker for scalable deployment.

E-Commerce Microservices
https://github.com/arjun-dev/ecommerce-api
- Developed RESTful microservices architecture in FastAPI and MongoDB.
- Reduced API latency by 28% through Redis query caching.

EXPERIENCE
TechStart Inc - Backend Intern
May 2025 - Aug 2025
- Contributed to production REST APIs in FastAPI.
- Authored automated unit tests with 85% test coverage.
"""


def create_sample_docx(text: str) -> bytes:
    """Helper to generate an in-memory .docx file for testing."""
    doc = docx.Document()
    for line in text.strip().splitlines():
        doc.add_paragraph(line)
    bio = io.BytesIO()
    doc.save(bio)
    return bio.getvalue()


@pytest.mark.anyio
async def test_resume_parser_txt_format():
    """Verify that TXT format resumes are parsed accurately."""
    file_bytes = SAMPLE_RESUME_TEXT.encode("utf-8")
    parsed = ResumeParser.parse_bytes(file_bytes, "resume.txt")

    assert parsed.full_name == "Arjun Sharma"
    assert parsed.email == "arjun.sharma@example.com"
    assert parsed.phone == "+91 9876543210"
    assert parsed.github_url == "https://github.com/arjun-dev"
    assert parsed.linkedin_url == "https://linkedin.com/in/arjun-dev"

    # Education
    assert len(parsed.education) >= 1
    assert "ABC Institute" in parsed.education[0].institution
    assert parsed.education[0].grad_year == 2026

    # Projects
    assert len(parsed.projects) >= 2
    task_runner = next((p for p in parsed.projects if "Task Runner" in p.title), None)
    assert task_runner is not None
    assert "https://github.com/arjun-dev/task-runner" in (task_runner.repo_url or "")
    assert "Python" in task_runner.tech_stack
    assert "Redis" in task_runner.tech_stack
    assert len(task_runner.bullets) >= 2

    # Skills
    assert "FastAPI" in parsed.skills
    assert "Docker" in parsed.skills
    assert "MongoDB" in parsed.skills

    # Experience
    assert len(parsed.experiences) >= 1
    assert "TechStart" in parsed.experiences[0].company


@pytest.mark.anyio
async def test_resume_parser_docx_format():
    """Verify that DOCX format resumes are parsed accurately."""
    docx_bytes = create_sample_docx(SAMPLE_RESUME_TEXT)
    parsed = ResumeParser.parse_bytes(docx_bytes, "arjun_resume.docx")

    assert parsed.full_name == "Arjun Sharma"
    assert parsed.email == "arjun.sharma@example.com"
    assert len(parsed.projects) >= 1
    assert "FastAPI" in parsed.skills
    assert parsed.extraction_metadata["file_type"] == "docx"


@pytest.mark.anyio
async def test_resume_parser_empty_file():
    """Verify that empty files raise EmptyDocumentError."""
    with pytest.raises(EmptyDocumentError):
        ResumeParser.parse_bytes(b"", "empty.txt")


@pytest.mark.anyio
async def test_resume_parser_unsupported_format():
    """Verify that unsupported file extensions raise UnsupportedFormatError."""
    with pytest.raises(UnsupportedFormatError):
        ResumeParser.parse_bytes(b"some binary data", "resume.png")


@pytest.mark.anyio
async def test_resume_api_endpoint_success(async_client: AsyncClient):
    """Test POST /api/v1/profile/parse with a valid file upload."""
    files = {"file": ("resume.txt", io.BytesIO(SAMPLE_RESUME_TEXT.encode("utf-8")), "text/plain")}
    response = await async_client.post("/api/v1/profile/parse", files=files)

    assert response.status_code == 200
    data = response.json()
    assert data["full_name"] == "Arjun Sharma"
    assert data["email"] == "arjun.sharma@example.com"
    assert len(data["projects"]) >= 2
    assert "FastAPI" in data["skills"]
    assert "extraction_metadata" in data


@pytest.mark.anyio
async def test_resume_api_endpoint_empty_file(async_client: AsyncClient):
    """Test POST /api/v1/profile/parse with an empty file returns HTTP 400."""
    files = {"file": ("empty.txt", io.BytesIO(b""), "text/plain")}
    response = await async_client.post("/api/v1/profile/parse", files=files)
    assert response.status_code == 400


@pytest.mark.anyio
async def test_resume_api_endpoint_invalid_extension(async_client: AsyncClient):
    """Test POST /api/v1/profile/parse with an unsupported format returns HTTP 415."""
    files = {"file": ("resume.exe", io.BytesIO(b"binary content"), "application/octet-stream")}
    response = await async_client.post("/api/v1/profile/parse", files=files)
    assert response.status_code == 415
