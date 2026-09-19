# CAREERX — Technical Design Review & Architecture Specification

> **Core Positioning**: CAREERX investigates an evidence-grounded approach to job-specific readiness assessment by connecting job requirements with progressively stronger forms of candidate evidence and providing an explainable readiness assessment.
>
> **Production Philosophy**: CAREERX uses production-aware software architecture from the beginning, while advanced production infrastructure such as message queues, distributed worker services, cloud vector databases, comprehensive observability, auto-scaling, and enterprise authentication will be introduced later.

---

## 1. Revised Evidence Model & Taxonomy

Stronger evidence does not automatically prove expertise. Rather, higher evidence levels provide greater grounding confidence for a candidate's stated qualifications.

```
+---------------------------------------------------------------------------------------+
|                               FOUR-LEVEL EVIDENCE MODEL                               |
+-------+----------------------------+--------------------------------------------------+
| Level | Category                   | Description & Source Context                     |
+-------+----------------------------+--------------------------------------------------+
| L1    | Self-Reported Claim        | Skills or tools listed without supporting        |
|       |                            | context (e.g., in a skills list block).          |
+-------+----------------------------+--------------------------------------------------+
| L2    | Contextual Evidence        | Skills supported by work or project descriptions |
|       |                            | detailing implementation context and outcomes.   |
+-------+----------------------------+--------------------------------------------------+
| L3    | Artifact / External        | User-provided project artifacts, documentation,  |
|       | Evidence                   | repositories, published packages, or portfolios. |
+-------+----------------------------+--------------------------------------------------+
| L4    | Demonstrated Capability    | Technical coding assessments, problem-solving    |
|       |                            | submissions, or adaptive mock interview trials.  |
+-------+----------------------------+--------------------------------------------------+
```

### Scope Allocation
* **V1 MVP**: Evaluates **Level 1 (Self-Reported Claims)** and **Level 2 (Contextual Evidence)** extracted from candidate resumes, with optional support for **Level 3 (User-Provided Project Artifacts & Links)**.
* **Phase 2 (Post-MVP)**: Introduces **Level 4 (Demonstrated Capability)** via stateful adaptive mock interviews, and automated Level 3 repository inspections.

---

## 2. Terminology & Conceptual Guardrails

* **Evidence-Supported Claim** (replacing *"verified evidence"*): Indicates that a claim is grounded in contextual project or artifact documentation, without asserting third-party cryptographic verification.
* **Deterministic, Reproducible & Explainable Scoring** (replacing *"unhackable scoring"*): Signifies that the mathematical aggregation logic is transparent and deterministic, while acknowledging that upstream LLM information extraction remains probabilistic.
* **Readiness Assessment Framing**: If no practical assessment or interview demonstration exists, the system outputs:
  $$\text{"Readiness based on available evidence"}$$
  avoiding any claim of measuring absolute candidate capability.

---

## 3. Job Readiness Taxonomy & Mathematical Formulation

### 3.1 Taxonomy Dimensions

```
   A. REQUIREMENT MATCH          B. EVIDENCE STRENGTH           C. DEMONSTRATED CAPABILITY
   (Semantic proximity between   (Reliability tier: L1 Claim    (Performance observed in
   requirement & candidate text)  vs L2 Context vs L3 Artifact)  practical tests / interview)
             │                                 │                             │
             └─────────────────────────────────┼─────────────────────────────┘
                                               ▼
                                  D. JOB READINESS (JRS)
                  (Synthesis: Match × Evidence Strength + Demonstration - Gaps)
```

1. **Requirement Match ($Sim(R_j, E_j) \in [0, 1]$)**: Semantic alignment between job requirement $R_j$ and candidate evidence chunk $E_j$.
2. **Evidence Strength ($S_j \in [0, 1]$)**:
   * Level 3 (Artifact / External Evidence): $S_j = 1.00$
   * Level 2 (Contextual Project/Work Evidence): $S_j = 0.75$
   * Level 1 (Self-Reported Claim): $S_j = 0.30$
   * Missing (No Evidence Found): $S_j = 0.00$
3. **Demonstrated Capability ($D_j \in [0, 1]$)**: Observed performance score from interactive assessments (Phase 2).
4. **Job Readiness Score ($JRS$)**:
   $$JRS = \max\left(0, \; \left( \sum_{j=1}^N w_j \cdot Sim(R_j, E_j) \cdot S_j \right) \times 100 - P_{\text{mandatory}} \right)$$
   Where:
   * $w_j$ is the normalized importance weight ($\sum w_j = 1.0$) across Mandatory, Preferred, and Nice-to-have requirements.
   * $P_{\text{mandatory}} = \min(20.0, \; 10.0 \times \sum_{j \in \text{Mandatory}} \mathbb{I}(S_j == 0.0))$.

---

## 4. RAG Architecture & Research Evaluation Plan

```
========================================================================================
                            PROGRESSIVE RAG & RESEARCH PLAN
========================================================================================

 [V1 MVP Baseline]
  Dense Semantic Retrieval (Bi-Encoder Embeddings + In-Memory Cosine Match)
  ├── Fast, clean baseline
  └── Evaluated empirically against ground truth annotations

 [Research & Comparative Ablation (Phase 9)]
  Experimental comparison across 4 distinct retrieval configurations:
  1. Sparse Retrieval Only (BM25)
  2. Dense Retrieval Only (Bi-Encoder: all-MiniLM-L6-v2)
  3. Hybrid Retrieval (Dense + BM25 via Reciprocal Rank Fusion)
  4. Hybrid Retrieval + Cross-Encoder Reranking (ms-marco-MiniLM-L-6-v2)

  Evaluated Metrics:
  - Precision@K (K = 1, 3, 5)
  - Recall@K
  - Mean Reciprocal Rank (MRR)
  - Normalized Discounted Cumulative Gain (NDCG@K)
  - Retrieval Latency (ms per query)
========================================================================================
```

---

## 5. System Architecture (Production-Aware Modular Monolith)

```
========================================================================================
                          CAREERX SYSTEM ARCHITECTURE
========================================================================================

 [FRONTEND CLIENT] [MVP]
   React 18 + TypeScript + Vite + Tailwind CSS + Lucide Icons + Axios
   ├── Resume & JD Ingestion Portal
   ├── Interactive Evidence Grounding Matrix
   ├── Explainable JRS Score Breakdown View
   └── [PHASE 7] Adaptive Interview Terminal
                                    │
                                    │ HTTP / REST / JSON
                                    ▼
 [BACKEND API GATEWAY] [MVP]
   FastAPI (Python 3.11+) + Uvicorn + Pydantic v2 Contracts
   ├── /api/v1/profile (Upload & Parse Resume)
   ├── /api/v1/jd (Parse & Extract Requirements)
   ├── /api/v1/match (Execute Grounding & JRS Scoring)
   └── [PHASE 7] /api/v1/interview (LangGraph State Machine)
                                    │
         ┌──────────────────────────┼──────────────────────────┐
         ▼                          ▼                          ▼
 [DETERMINISTIC SERVICES]   [RAG & RETRIEVAL LAYER]    [AGENTIC WORKFLOW LAYER]
 [MVP]                      [MVP / RESEARCH]           [PHASE 7 & 8]
 ├── PDF/DOCX Parser        ├── Sentence-Transformers  └── LangGraph Engine
 ├── JRS Scoring Engine     ├── In-Memory Cosine Match     ├── Interview StateGraph
 ├── Evidence Classifier    └── [RESEARCH] Hybrid RAG      ├── Adaptive Questioner
 └── Penalty Calculator         (BM25 + RRF + Rerank)      └── 3-Rubric Evaluator
         │                          │                          │
         └──────────────────────────┼──────────────────────────┘
                                    ▼
 [DATABASE & PERSISTENCE] [MVP]
   MongoDB (Motor Async Driver)
   ├── CandidateProfiles Collection
   ├── JobDescriptions Collection
   ├── MatchEvaluations Collection
   └── [PHASE 7] InterviewTranscripts Collection
========================================================================================
```

---

## 6. Revised 9-Phase Development Roadmap

```
Phase 1 — Foundation: FastAPI + Pydantic v2 + MongoDB + React/Vite Scaffolding
   ↓
Phase 2 — Resume + JD Parsing: Deterministic PDF/DOCX Ingestion & Section Segmentation
   ↓
Phase 3 — Structured Candidate & JD Intelligence: Pydantic-enforced LLM Extraction
   ↓
Phase 4 — Evidence Retrieval & Grounding: Semantic Search & Evidence Level Classifier
   ↓
Phase 5 — Matching + JRS: Deterministic Mathematical Readiness Engine & Gap Diagnostics
   ↓
Phase 6 — Frontend + Complete MVP: Interactive Evidence Matrix & Dashboard
   ↓
Phase 7 — Resume Intelligence + Adaptive Interview: LangGraph State Machine & Q&A
   ↓
Phase 8 — Learning + Reassessment: Gap Synthesis & Readiness Trajectory Recalculation
   ↓
Phase 9 — External Evidence + Research + Hardening: GitHub Probes, Ablation Suite & Thesis
```
