# CAREERX — Database Schema & API Contract Specification

## 1. Database Architecture & Collections (MongoDB)

CAREERX utilizes MongoDB due to its native BSON representation of deeply nested hierarchical resume data, project trees, and polymorphic evidence nodes.

```
                    +----------------------------------------+
                    |           CANDIDATE PROFILES           |
                    |         (Collection: `profiles`)       |
                    +----------------------------------------+
                                        │ 1:N
                                        ▼
+------------------------------------------------------------------------------------+
|                                 EVIDENCE NODES                                     |
|                           (Collection: `evidence_nodes`)                           |
|       - claim_text, source_type, source_url, verified_skills, embedding [384]      |
+------------------------------------------------------------------------------------+
       │ 1:N                                                        │ 1:N
       ▼                                                            ▼
+-----------------------------+                             +------------------------+
|       MATCH RESULTS         |                             |   INTERVIEW SESSIONS   |
| (Collection: `match_reports`|                             |(Collection: `interviews|
|  - jrs_score, gaps, matrix  |                             | - turns, evals, state  |
+-----------------------------+                             +------------------------+
```

---

## 2. Collection Document Schemas

### 2.1 `profiles` Collection
```json
{
  "_id": "ObjectId(...)",
  "candidate_id": "usr_98a7f1e2",
  "full_name": "Arjun Sharma",
  "email": "arjun@example.com",
  "github_username": "arjun-dev",
  "education": [
    {
      "institution": "ABC Institute of Technology",
      "degree": "B.Tech Computer Science",
      "gpa": 8.6,
      "start_year": 2022,
      "end_year": 2026
    }
  ],
  "experiences": [
    {
      "role": "Backend Intern",
      "company": "TechStart Inc",
      "duration": "May 2025 - Aug 2025",
      "bullets": [
        "Built REST APIs in FastAPI reducing response time by 28%",
        "Implemented Redis caching layer for top 100 queries"
      ]
    }
  ],
  "projects": [
    {
      "project_id": "proj_task_runner",
      "title": "Distributed Task Runner",
      "repo_url": "https://github.com/arjun-dev/task-runner",
      "summary": "Distributed async task queue using Python and Redis.",
      "tech_stack": ["Python", "FastAPI", "Redis", "Docker"],
      "ast_verified": true,
      "test_coverage_detected": true
    }
  ],
  "raw_skills": ["Python", "FastAPI", "Docker", "Redis", "MongoDB", "Git"],
  "created_at": "2026-08-24T10:00:00Z",
  "updated_at": "2026-08-24T10:00:00Z"
}
```

### 2.2 `evidence_nodes` Collection (with Vector Index)
```json
{
  "_id": "ObjectId(...)",
  "evidence_id": "ev_01j7x8a9",
  "candidate_id": "usr_98a7f1e2",
  "claim_text": "Built REST APIs in FastAPI reducing response time by 28%",
  "source_type": "experience_bullet",
  "source_reference": "TechStart Inc — Backend Intern",
  "verifiable_url": "https://github.com/arjun-dev/task-runner",
  "verified_skills": ["FastAPI", "Python", "REST"],
  "confidence_tier": "STRONG",
  "confidence_score": 0.92,
  "embedding": [0.024, -0.081, 0.145, "...", -0.019],
  "created_at": "2026-08-24T10:05:00Z"
}
```

### 2.3 `job_descriptions` Collection
```json
{
  "_id": "ObjectId(...)",
  "jd_id": "jd_backend_001",
  "title": "Junior Python Backend Engineer",
  "company": "Apex Cloud Systems",
  "raw_text": "We are seeking a Python Backend Engineer with strong FastAPI and MongoDB skills...",
  "requirements": [
    {
      "req_id": "req_01",
      "category": "HARD_SKILL",
      "text": "Proficiency in Python and asynchronous frameworks (FastAPI or async asyncio)",
      "importance_weight": 3.0,
      "canonical_skills": ["Python", "FastAPI", "Asyncio"]
    },
    {
      "req_id": "req_02",
      "category": "DATABASE",
      "text": "Hands-on experience with MongoDB and Redis caching",
      "importance_weight": 2.5,
      "canonical_skills": ["MongoDB", "Redis"]
    }
  ],
  "interview_topics": ["FastAPI Dependency Injection", "Redis Invalidation", "Async Event Loop"]
}
```

---

## 3. MongoDB Vector Search Index Configuration

```json
{
  "mappings": {
    "dynamic": true,
    "fields": {
      "embedding": {
        "dimensions": 384,
        "similarity": "cosine",
        "type": "knnVector"
      },
      "candidate_id": {
        "type": "token"
      },
      "verified_skills": {
        "type": "token"
      }
    }
  }
}
```

---

## 4. API Endpoints Plan (RESTful & Event Streams)

### 4.1 Candidate Profile Service (`/api/v1/profile`)
- `POST /api/v1/profile/upload` — Upload resume (PDF/DOCX) $\rightarrow$ Returns structured profile AST.
- `GET /api/v1/profile/{candidate_id}` — Fetch full candidate profile & verified evidence nodes.
- `POST /api/v1/profile/{candidate_id}/github/sync` — Trigger official GitHub API repository ingestion & AST code analysis.

### 4.2 Job Description Service (`/api/v1/jd`)
- `POST /api/v1/jd/analyze` — Ingest raw JD text $\rightarrow$ Extracts structured requirements, weights, and interview topics.
- `GET /api/v1/jd/{jd_id}` — Retrieve decomposed JD requirement graph.

### 4.3 Evidence-Grounded Matching Service (`/api/v1/match`)
- `POST /api/v1/match/evaluate` — Request payload `{ candidate_id, jd_id }`.
  - Computes hybrid RAG retrieval per requirement.
  - Returns deterministic $JRS$ score breakdown, Strong/Partial/Unverified/Missing matrix, and detected critical gaps.

### 4.4 Resume Intelligence Service (`/api/v1/resume`)
- `POST /api/v1/resume/tailor` — Generate grounded, XYZ-formatted resume bullet suggestions strictly constrained to verified evidence nodes.
- `GET /api/v1/resume/diff/{candidate_id}/{jd_id}` — View side-by-side audit trail comparing original vs optimized bullets.

### 4.5 Adaptive Mock Interview Service (`/api/v1/interview`)
- `POST /api/v1/interview/start` — Initialize a new LangGraph interview session.
- `POST /api/v1/interview/{session_id}/turn` — Submit candidate response $\rightarrow$ Evaluates answer across 7 dimensions and streams the next adaptive question (SSE).
- `GET /api/v1/interview/{session_id}/report` — Retrieve comprehensive evaluation transcript, radar chart scores, and viva prep tips.

### 4.6 Pedagogical Learning & Reassessment (`/api/v1/learning`)
- `POST /api/v1/learning/plan` — Generate personalized, gap-targeted roadmap.
- `POST /api/v1/learning/reassess` — Submit micro-project artifact or quiz $\rightarrow$ Updates evidence node and re-computes $JRS$.
