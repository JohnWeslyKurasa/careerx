# CAREERX — System Architecture & Module Breakdown

## 1. High-Level Architecture Overview

CAREERX follows a **Layered Clean Architecture** that cleanly decouples:
1. **User Presentation Layer (Next.js 14 App Router, React, Tailwind CSS, TypeScript)**
2. **API & Orchestration Layer (FastAPI, Pydantic v2, Python 3.11+)**
3. **Agentic Workflow Engine (LangGraph State Machine)**
4. **Deterministic Service Layer (Parsers, Matcher, Mathematical Scoring Calculator)**
5. **RAG & Evidence Engine (Hybrid Vector Search, Dense Embeddings, BM25 Keyword Search, Reciprocal Rank Fusion)**
6. **Data & Persistence Layer (MongoDB for Documents + Vector Store)**

```
+-----------------------------------------------------------------------------------+
|                        PRESENTATION LAYER (Next.js 14 / TypeScript)               |
|  [Profile Hub]  [JD Intelligence]  [Evidence Matrix]  [Mock Interview]  [Learning]|
+-----------------------------------------------------------------------------------+
                                         │  (REST API / Server-Sent Events SSE)
                                         ▼
+-----------------------------------------------------------------------------------+
|                         API GATEWAY & ROUTERS (FastAPI)                           |
|  /api/v1/profile  |  /api/v1/jd  |  /api/v1/match  |  /api/v1/interview  |  /api/v1/plan
+-----------------------------------------------------------------------------------+
        │                                        │                         │
        ▼                                        ▼                         ▼
+-----------------------+              +-------------------+     +------------------+
| DETERMINISTIC SERVICES|              |  LANGGRAPH AGENT  |     |   RAG & EVIDENCE |
| - Resume Parser       |              |     STATE ENGINE  |     |   RETRIEVER      |
| - AST Code Analyzer   |              | - Mock Interview  |     | - Hybrid Search  |
| - Deterministic Math  |              | - Adaptive Probe  |     | - Dense (SBERT)  |
|   Scoring Engine      |              | - Learning Path   |     | - Sparse (BM25)  |
| - Schema Validator    |              | - Bullet Optimizer|     | - Reciprocal Rerank
+-----------------------+              +-------------------+     +------------------+
        │                                        │                         │
        └────────────────────────────────────────┼─────────────────────────┘
                                                 ▼
+-----------------------------------------------------------------------------------+
|                       DATA & PERSISTENCE LAYER (MongoDB)                          |
|  [Profiles Collection]  [JDs Collection]  [Evidence Nodes]  [Interview Sessions]  |
|  [Vector Embeddings Index (HNSW / Cosine)]                                       |
+-----------------------------------------------------------------------------------+
```

---

## 2. Technology Stack & Architectural Rationale

| Layer | Chosen Technology | Rationale & Justification | Alternatives Considered & Why Rejected |
| :--- | :--- | :--- | :--- |
| **Frontend** | **Next.js 14 (App Router) + TypeScript + Tailwind CSS** | Server-side rendering (SSR) for fast load times, strict type-safety across API contracts, modular component design for real-time interview state. | **Plain React (Vite)**: Lacks built-in SSR/Edge optimization; **Angular**: Overly verbose for rapid AI prototyping. |
| **Backend API** | **FastAPI (Python 3.11+)** | Native async/await support, automatic OpenAPI/Swagger documentation, high throughput with `uvicorn`, first-class Pydantic v2 data validation, seamless AI ecosystem integration. | **Django**: Too monolithic and heavy for async agent loops; **Flask**: Lacks native async performance and strict schema validation out-of-the-box. |
| **Agentic Framework**| **LangGraph (LangChain ecosystem)** | State-machine based acyclic/cyclic graphs with explicit state management, human-in-the-loop checkpoints, conditional branch routing, full auditability of agent transitions. | **AutoGen / CrewAI**: More conversational/black-box, harder to enforce deterministic state constraints and academic evaluation rigor. |
| **Database** | **MongoDB (Atlas / Community + Vector Search)** | Flexible schema for complex semi-structured candidate profiles, rich nested project/experience trees, built-in vector search support in modern versions. | **PostgreSQL (pgvector)**: Excellent alternative, but MongoDB's JSON-native BSON model matches complex, variable-schema resume ASTs more naturally. |
| **Embedding Model** | **HuggingFace Sentence-Transformers (e.g. all-MiniLM-L6-v2 or BAAI/bge-small-en-v1.5) / Gemini text-embedding-004** | Fast inference, 384–768 dimensional embeddings, high semantic accuracy on technical terminology. | **OpenAI text-embedding-3-small**: Good, but local/open embeddings ensure reproducible offline evaluation for student research. |

---

## 3. Agent vs. Deterministic Service Classification

> **Core System Design Rule**: *Never use an LLM where deterministic logic (algorithms, parsers, mathematical formulas, databases) can reliably, cheaply, and verifiably solve the problem.*

### 3.1 Decision Matrix: Why Function vs. Why Agent?

| Component / Task | Type | Rationale |
| :--- | :--- | :--- |
| **Resume Text & Structure Extraction** | **Deterministic Service** | Regex, rule-based PDF extractors (`pdfplumber`, `PyPDF2`, `python-docx`) parse layout and text deterministically without hallucination risk. |
| **Job Readiness Scoring Math** | **Deterministic Service** | Job readiness MUST be explainable, reproducible, and mathematically rigorous. Using an LLM to "guess a score" is unscientific and causes hallucinated metrics. |
| **Code Structure & Repo AST Inspection** | **Deterministic Service** | Python AST parser, `git log` parser, file-tree walk: exact, zero cost, absolute precision. |
| **JD Entity Classification** | **Hybrid (Rules + LLM)** | Initial regex dictionary lookup for 2,000+ known tech keywords (Python, Docker, Kafka) + Structured LLM fallback (JSON schema) for novel domain terms. |
| **Adaptive Mock Interviewer** | **LangGraph Agent** | Requires stateful multi-turn reasoning, dynamic follow-up generation based on candidate depth, ambiguity detection, and nuanced persona simulation. |
| **Resume Bullet Optimizer** | **Constrained LLM Agent** | Rewrites sentences into impact-driven XYZ format while constrained strictly by verified evidence nodes provided in context. |
| **Pedagogical Learning Planner** | **LangGraph Agent** | Synthesizes complex multi-modal gap analysis into a customized, milestone-driven study roadmap. |

---

## 4. Detailed Agent Specifications

### Agent 1: Adaptive Mock Interviewer (`AdaptiveInterviewAgent`)
- **Responsibility**: Conduct realistic, multi-turn technical interviews tailored to target JD and candidate's verified background.
- **Input**: `CandidateProfile`, `JDRequirements`, `DetectedSkillGaps`, `InterviewStateHistory`.
- **Output**: Next interview question, question classification (Project Deep-Dive / Gap Probe / Architectural), calibrated difficulty.
- **Tools Available**: `RetrieveEvidenceNodeTool`, `GetCandidateProjectDetailsTool`, `LookupRequirementDetailsTool`.
- **Why Agent?**: Needs to assess candidate answers in real-time, determine if the answer was shallow (requiring a probe) or comprehensive (advancing the graph), and maintain dynamic conversational flow.
- **Failure Mode & Fallback**: If LLM output fails schema validation, falls back to a curated benchmark question bank for that specific skill topic.

### Agent 2: Interview Evaluation Agent (`EvaluationAgent`)
- **Responsibility**: Objectively grade candidate transcripts across 7 distinct dimensions with verifiable justification.
- **Input**: `QuestionContext`, `CandidateAnswer`, `ExpectedKeyPoints`, `CandidateEvidenceNode`.
- **Output**: JSON schema with dimension scores (1–10), specific strengths, identified inaccuracies, model answer.
- **Tools Available**: `SemanticAnswerMatcherTool`, `ReferenceKnowledgeTool`.
- **Why Agent?**: Natural language reasoning is required to evaluate technical nuance, problem-solving structure, and communication clarity.
- **Failure Mode & Fallback**: If evaluation violates schema bounds, retries with strict structured output parser (`instructor` / Pydantic).

### Agent 3: Resume Optimizer Agent (`ResumeIntelligenceAgent`)
- **Responsibility**: Re-target resume bullets to highlight relevant competencies matching JD requirements.
- **Input**: `OriginalBullet`, `TargetJDRequirement`, `VerifiedEvidenceList`.
- **Output**: `OptimizedBullet` (XYZ formatted), `GroundedEvidenceIds` (list of citations).
- **Tools Available**: `EvidenceVerificationTool`.
- **Why Agent?**: Requires natural language synthesis to improve impact phrasing without violating ground truth facts.
- **Failure Mode & Fallback**: **Hallucination Validator Filter** — if the optimized bullet contains keywords not found in verified evidence, the transformation is rejected and original bullet preserved.

---

## 5. Backend Module Directory Architecture

```
backend/
├── app/
│   ├── api/                     # FastAPI Route Controllers
│   │   ├── v1/
│   │   │   ├── endpoints/
│   │   │   │   ├── profile.py   # Candidate Profile CRUD & Ingestion
│   │   │   │   ├── jd.py        # JD Ingestion & Skill Extraction
│   │   │   │   ├── match.py     # Evidence-Grounded Matching & Scoring
│   │   │   │   ├── resume.py    # Resume Optimization & Grounded Diff
│   │   │   │   ├── interview.py # Mock Interview SSE / WebSocket Session
│   │   │   │   ├── evaluation.py# Interview Transcript Scoring
│   │   │   │   └── learning.py  # Learning Roadmap & Reassessment
│   ├── core/                    # App Configuration, Security & Settings
│   │   ├── config.py            # Environment settings (Pydantic BaseSettings)
│   │   ├── security.py          # API Token hashing, CORS, input sanitization
│   │   └── logging.py           # Structured JSON logging
│   ├── models/                  # Pydantic Schemas & Domain Models
│   │   ├── profile.py           # CandidateProfile, Project, Experience, Skill
│   │   ├── jd.py                # JobDescription, RequirementItem
│   │   ├── evidence.py          # EvidenceNode, ClaimSource, ConfidenceScore
│   │   ├── match.py             # MatchResult, GapAnalysis, ReadinessScore
│   │   ├── interview.py         # InterviewState, Turn, EvaluationReport
│   │   └── learning.py          # LearningPlan, Milestone, ResourceItem
│   ├── db/                      # Database Connections & Repositories
│   │   ├── mongodb.py           # Motor/PyMongo Async Client
│   │   └── repositories/        # Generic & Entity-specific DAOs
│   ├── services/                # Deterministic Business Logic
│   │   ├── parser/              # Resume (PDF/DOCX) & JD Parsers
│   │   ├── matcher/             # Deterministic Readiness Math & Rule Engine
│   │   ├── github/              # GitHub REST API Ingestion & AST Parser
│   │   └── cert_verifier/       # Certificate & Link Verifier
│   ├── rag/                     # Retrieval-Augmented Generation Engine
│   │   ├── chunker.py           # Semantic Project & Document Chunker
│   │   ├── embedder.py          # Sentence-Transformers / Gemini Embeddings
│   │   ├── vector_store.py      # MongoDB Atlas Vector Search / Local HNSW
│   │   ├── hybrid_retriever.py  # Dense + BM25 Hybrid Retriever + RRF
│   │   └── reranker.py          # Cross-Encoder Reranker
│   └── agents/                  # LangGraph State Machines & Nodes
│       ├── state.py             # Global & Agent-specific TypedDict States
│       ├── interview_graph/     # Adaptive Mock Interview StateGraph
│       ├── resume_graph/        # Grounded Resume Optimizer Graph
│       └── learning_graph/      # Pedagogical Learning Planner Graph
├── tests/                       # Unit, Integration & Benchmark Tests
├── requirements.txt             # Locked Python Dependencies
└── Dockerfile                   # Reproducible Container Spec
```
