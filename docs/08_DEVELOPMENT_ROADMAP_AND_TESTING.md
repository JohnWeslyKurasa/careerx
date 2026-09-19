# CAREERX — Development Roadmap & Testing Strategy

## 1. 17-Phase Incremental Development Roadmap

```
Phase 0: Requirements, Architecture & Project Charter (CURRENT)
   ↓
Phase 1: Environment & Project Scaffolding (FastAPI, Next.js, Docker, MongoDB)
   ↓
Phase 2: Resume & Job Description Parsing Engine
   ↓
Phase 3: Career Profile & Career Memory Ingestion
   ↓
Phase 4: RAG & Evidence Retrieval Engine (Hybrid Search + Cross-Encoder)
   ↓
Phase 5: Evidence-Grounded Job Matching & Deterministic JRS Scoring
   ↓
Phase 6: Grounded Resume Intelligence & Anti-Hallucination Bullet Refactoring
   ↓
Phase 7: Adaptive Mock Interview State Machine (LangGraph)
   ↓
Phase 8: 7-Dimensional Interview Transcript Evaluation
   ↓
Phase 9: Pedagogical Skill Gap & Learning Agent
   ↓
Phase 10: Dynamic Reassessment & Readiness Trajectory Recalculation
   ↓
Phase 11: GitHub API & AST Repository Code Inspection
   ↓
Phase 12: Certificate & Academic Verification Services
   ↓
Phase 13: Next.js Frontend UI/UX Refinement & Real-Time SSE/WebSocket
   ↓
Phase 14: End-to-End System Integration & Robustness Testing
   ↓
Phase 15: Empirical Research Experiments & Ablation Benchmark Suite
   ↓
Phase 16: Final Major Project Thesis, Presentation (PPT), & Viva Defense Prep
```

---

## 2. Phase-by-Phase Deliverables & Learning Checkpoints

| Phase | Core Objective | Key Deliverables | Pedagogical Concept Taught |
| :--- | :--- | :--- | :--- |
| **Phase 0** | System Design & Documentation | Architecture diagrams, schemas, scoring math, RAG specs. | Clean Architecture, Agent vs Function criteria, RRF formula. |
| **Phase 1** | Scaffolding & Setup | FastAPI backend boilerplate, Next.js 14 frontend, MongoDB connection. | Async Python event loops, Pydantic v2 validation, Next.js App Router. |
| **Phase 2** | Ingestion & Parsing | `pdfplumber` / `python-docx` extractors, JD entity regex/NER extractors. | Document parsing ASTs, structured entity extraction, error boundaries. |
| **Phase 3** | Career Profile Memory | Structured profile storage, project metadata modeling in MongoDB. | Document modeling, BSON indexing, relational normalization in NoSQL. |
| **Phase 4** | RAG & Retrieval Engine | SBERT dense embedding, BM25 sparse index, Reciprocal Rank Fusion, Cross-Encoder reranker. | Vector search algorithms, HNSW index, Bi-Encoder vs Cross-Encoder trade-offs. |
| **Phase 5** | Job Matching & Scoring | Deterministic $JRS$ scoring service, Strong/Partial/Unverified/Missing tier classifier. | Multi-factor mathematical aggregation, explainable AI, ranking metrics. |
| **Phase 6** | Resume Intelligence | XYZ bullet optimizer, hallucination keyword checker. | Constrained LLM generation, few-shot prompt engineering, regex guardrails. |
| **Phase 7** | Mock Interview State Engine | LangGraph `StateGraph`, dynamic state transitions, memory checkpointing. | Stateful agent graphs, cyclic vs acyclic workflows, conditional edges. |
| **Phase 8** | Multi-Dimensional Evaluation | 7-dimension rubric evaluator, structured JSON output parser (`instructor`). | Multi-criteria rubric grading, prompt calibration, schema enforcement. |
| **Phase 9** | Learning Agent | Pedagogical gap synthesizer, curated resource aggregator. | Agent tool invocation, hierarchical task decomposition. |
| **Phase 10**| Dynamic Reassessment | Micro-assessment evaluation, vector update, $JRS$ recalculation. | Incremental vector index updates, state rehydration. |
| **Phase 11**| GitHub Code Ingestion | GitHub REST/GraphQL client, Python AST inspection (`ast.parse`). | Abstract Syntax Tree traversal, static code analysis, rate-limit backoff. |
| **Phase 12**| Verification Engine | Certificate metadata parser, verifiable URL resolver. | Cryptographic verification concepts, outbound link verification. |
| **Phase 13**| Next.js Frontend Polish | Radar charts, Evidence Matrix UI, Streaming interview chat. | Server-Sent Events (SSE), React hooks, Tailwind design systems. |
| **Phase 14**| Testing & Hardening | >85% unit test coverage, load testing, edge case handling. | Test-Driven Development (TDD), mocking async services, pytest fixtures. |
| **Phase 15**| Research Experiments | RQ1–RQ4 automated benchmark runs, ablation scripts, LaTeX tables. | Statistical significance testing ($p$-values), Spearman correlation, NDCG. |
| **Phase 16**| Viva & Documentation | Final Thesis report (IEEE format), slide deck, Viva Q&A rehearsal. | Technical defense strategies, academic presentation skills. |

---

## 3. Comprehensive Testing Strategy

### 3.1 Unit Testing (`pytest`)
- Target: $\ge 85\%$ code coverage on all deterministic services (`services/`, `rag/`, `models/`).
- Automated tests for:
  - Exact mathematical output of $JRS$ formula across edge cases (0 projects, all unverified, all strong).
  - Resume PDF parsing boundary conditions (corrupted files, scanned text warnings).
  - Evidence Tier classification accuracy.

### 3.2 Agent & LLM Evaluation Testing
- Deterministic Mock LLM fixture (`pytest-mock` / `vcrpy`) to record and replay LLM responses for deterministic CI/CD runs without incurring API costs.
- Invariant tests on LangGraph states: verify that state transitions never enter undefined states or infinite loops.

### 3.3 Integration & API Testing
- `httpx` async test client verifying end-to-end status codes, response payloads, and Pydantic validation errors.
