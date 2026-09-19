# CAREERX: An Agentic AI-Powered Job Readiness & Career Intelligence Platform

> **Final-Year B.Tech Major Project**  
> **Core Principle**: $\text{CLAIM} \longrightarrow \text{SOURCE} \longrightarrow \text{EVIDENCE} \longrightarrow \text{CONFIDENCE}$

---

## 🌟 Executive Overview

**CAREERX** is an explainable, research-grade, agentic career intelligence platform that shifts candidate evaluation from **unverified keyword claims** to **evidence-grounded job readiness**.

By orchestrating deterministic parsers, a hybrid RAG engine (Dense SBERT + Sparse BM25 + Cross-Encoder), deterministic mathematical scoring, and LangGraph stateful interview agents, CAREERX provides an end-to-end ecosystem for job readiness evaluation, dynamic gap closing, and interview preparation.

---

## 🛠️ Technology Stack

- **Frontend**: Vite, React 19, TypeScript, Tailwind CSS, Lucide Icons, Axios
- **Backend**: FastAPI (Python 3.11+), Pydantic v2, Uvicorn, Motor (Async MongoDB)
- **Agentic Engine**: LangGraph, LangChain Core
- **RAG & NLP**: Sentence-Transformers (`all-MiniLM-L6-v2`), Rank-BM25, Cross-Encoder (`ms-marco-MiniLM-L-6-v2`), `pdfplumber`, `python-docx`
- **Database**: MongoDB Atlas / Community Edition + Vector Search
- **External Integrations**: GitHub REST/GraphQL API, Official Verifiers

---

## 🚀 Teammate Quickstart & Local Setup Guide

Follow these steps to set up and run CAREERX on your local machine.

### Prerequisites

Ensure you have the following installed on your machine:
- **Python**: version `3.11` or higher (`python --version`)
- **Node.js**: version `18` or higher and `npm` (`node -v`, `npm -v`)
- **MongoDB**: Local MongoDB instance running on `localhost:27017` or a MongoDB Atlas connection URI
- **Git**: (`git --version`)

---

### 1. Clone the Repository

```bash
git clone https://github.com/DarshiniKurasa/Agent_hack.git
cd Agent_hack
```

---

### 2. Backend Setup (FastAPI)

1. **Navigate to the backend directory**:
   ```bash
   cd backend
   ```

2. **Create and activate a virtual environment**:
   - **Windows (PowerShell)**:
     ```powershell
     python -m venv .venv
     .\.venv\Scripts\Activate.ps1
     ```
   - **macOS / Linux**:
     ```bash
     python3 -m venv .venv
     source .venv/bin/activate
     ```

3. **Install Python dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

4. **Set up Environment Variables**:
   Copy the example environment file:
   - **Windows**:
     ```powershell
     copy .env.example .env
     ```
   - **macOS / Linux**:
     ```bash
     cp .env.example .env
     ```
   *Edit `.env` if you wish to adjust MongoDB URL (`MONGODB_URL`), port, or LLM keys.*

5. **Start the Backend API Server**:
   ```bash
   uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
   ```
   - Swagger / OpenAPI Docs: [http://localhost:8000/docs](http://localhost:8000/docs)
   - Health Check: [http://localhost:8000/api/v1/health](http://localhost:8000/api/v1/health)

---

### 3. Frontend Setup (React + Vite)

Open a new terminal window:

1. **Navigate to the frontend directory**:
   ```bash
   cd frontend
   ```

2. **Install Node dependencies**:
   ```bash
   npm install
   ```

3. **Set up Environment Variables**:
   Copy the frontend environment template:
   - **Windows**:
     ```powershell
     copy .env.example .env
     ```
   - **macOS / Linux**:
     ```bash
     cp .env.example .env
     ```

4. **Start the Frontend Development Server**:
   ```bash
   npm run dev
   ```
   - Open your browser at [http://localhost:5173](http://localhost:5173)

---

### 4. Running Verification Scripts & Test Suite

#### Run Unit & Integration Tests
Run pytest from the repository root:
```bash
pytest
```
*Expected: 40 tests passing.*

#### Run Phase Verification Scripts
Ensure backend dependencies and MongoDB are running, then run:
```bash
# Phase 3 MongoDB Persistence Verification
python scripts/verify_phase3_mongodb.py

# Phase 4 Hybrid RAG Retrieval Pipeline Verification
python scripts/verify_phase4_retrieval.py

# Phase 5 Job Readiness Score (JRS) Engine Verification
python scripts/verify_phase5_jrs.py
```

---

## 📂 Project Directory Structure

```text
careerx/
├── backend/
│   ├── app/
│   │   ├── api/v1/          # API routes and endpoints (health, profile, jd, retrieval, jrs)
│   │   ├── core/            # App configuration, database connection lifecycle
│   │   ├── db/              # Collections and MongoDB repositories
│   │   ├── models/          # Pydantic data schemas
│   │   └── services/        # Business logic (parsers, hybrid retrieval, JRS scoring)
│   ├── tests/               # Pytest unit & integration test suites
│   ├── .env.example         # Backend environment variable template
│   └── requirements.txt     # Python package requirements
├── frontend/
│   ├── src/                 # React components, API client, styles, and dashboard
│   ├── public/              # Static assets and icons
│   ├── .env.example         # Frontend environment variable template
│   ├── package.json         # Node dependencies
│   └── vite.config.ts       # Vite build config
├── docs/                    # Architectural specs, PRDs, and learning guides (Phases 0–5)
├── scripts/                 # Standalone phase verification scripts
├── careerx_review1.pptx     # B.Tech Major Project Review-1 presentation
├── careerx_review1.js       # PptxGenJS presentation generator script
├── pytest.ini               # Pytest configuration
└── README.md                # Project documentation & teammate quickstart
```

---

## 📚 Complete Project Architecture Documentation

All technical design specifications, research plans, and architectural blueprints are systematically documented in the [`docs/`](docs/) directory:

1. [**01. Project Charter & Requirements Specification (PRD)**](docs/01_PROJECT_CHARTER_AND_REQUIREMENTS.md)  
   *Problem statement, user personas, functional and non-functional requirements, project scope boundaries.*
2. [**02. System Architecture & Module Breakdown**](docs/02_SYSTEM_ARCHITECTURE_AND_MODULES.md)  
   *Layered clean architecture, tech stack rationale, module hierarchy, and Agent vs. Deterministic Service decision matrix.*
3. [**03. Evidence Model & RAG Architecture**](docs/03_EVIDENCE_MODEL_AND_RAG_ARCHITECTURE.md)  
   *Claim-to-Evidence DAG, 4 evidence tiers, semantic chunking, Hybrid Retrieval (Dense + BM25 + RRF), Cross-Encoder reranking, and hallucination guardrails.*
4. [**04. Scoring Methodology & Data Flow**](docs/04_SCORING_METHODOLOGY_AND_DATA_FLOW.md)  
   *Explainable mathematical formulation of the Job Readiness Score ($JRS$), sub-score breakdowns, critical gap penalties, and sequence data flows.*
5. [**05. Database Schema & API Plan**](docs/05_DATABASE_SCHEMA_AND_API_PLAN.md)  
   *MongoDB BSON document schemas, Vector Search index specifications, and RESTful/SSE endpoint contracts.*
6. [**06. Security, Privacy & Compliance**](docs/06_SECURITY_PRIVACY_AND_COMPLIANCE.md)  
   *Zero-trust secrets management, indirect prompt injection defense, official API compliance, and PII anonymization.*
7. [**07. Research-Oriented Evaluation Plan**](docs/07_RESEARCH_ORIENTED_EVALUATION_PLAN.md)  
   *Research questions (RQ1–RQ4), hypotheses, baselines, quantitative evaluation metrics, and ablation study matrix.*
8. [**08. Development Roadmap & Testing Strategy**](docs/08_DEVELOPMENT_ROADMAP_AND_TESTING.md)  
   *Phase 0 to Phase 16 breakdown, unit/integration/agent testing strategy, and viva defense checkpoints.*
9. [**09. Technical Design Review & Architecture**](docs/09_TECHNICAL_DESIGN_REVIEW_AND_ARCHITECTURE.md)  
   *Comprehensive technical design audit, edge cases, and Viva Defense Q&A bank.*
10. [**10. Product UX & Living Profile Specification**](docs/10_PRODUCT_UX_AND_LIVING_PROFILE_SPECIFICATION.md)  
    *Living Profile UX workflows, visual wireframes, and design token system.*
