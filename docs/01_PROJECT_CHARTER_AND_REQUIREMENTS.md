# CAREERX — Project Charter & Requirements Specification (PRD)

## 1. Executive Summary & Problem Statement

### 1.1 The Problem
In the modern technical recruitment landscape, both students and early-career job seekers face significant structural challenges:
1. **Generic Resume Inflation & Hallucinated Claims**: Resumes are packed with buzzwords and unverified skill claims (e.g., "Expert in Python", "Deep Learning Practitioner") without traceable evidence.
2. **Black-Box Keyword Matchers (ATS)**: Existing Applicant Tracking Systems (ATS) rely on lexical keyword matching (TF-IDF, simple regex) which penalizes authentic candidates who use synonyms, while rewarding keyword-stuffed resumes.
3. **Disconnected Preparation Ecosystems**: Job hunting, resume building, mock interviews, and skill upskilling occur in disjointed silos. A candidate gets a rejection without actionable insights into *why* they fell short or *how* to systematically close the verified gap.
4. **Lack of Evidence-Grounded Readiness**: No platform verifies whether a claimed skill is backed by projects, source code, verified certifications, or demonstrated technical depth in live adaptive simulations.

### 1.2 The CAREERX Solution
**CAREERX** is an **Agentic AI-Powered Job Readiness and Career Intelligence Platform** designed to shift the paradigm from **"Keyword-Claimed Qualifications"** to **"Evidence-Grounded Readiness"**.

The core governing axiom is:
$$\text{CLAIM} \longrightarrow \text{SOURCE} \longrightarrow \text{EVIDENCE} \longrightarrow \text{CONFIDENCE}$$

CAREERX transforms a Job Description (JD) and a Candidate Profile into an explainable, multi-dimensional Readiness Vector backed by verifiable proof (GitHub repositories, commits, project artifacts, certified coursework, and adaptive technical interview transcripts).

---

## 2. Core User Personas

| Persona | Role | Pain Points | CAREERX Value Proposition |
| :--- | :--- | :--- | :--- |
| **Arjun (Final-Year B.Tech)** | Job Seeker / Candidate | Applies to 100+ jobs with 0 callbacks; doesn't know why his resume fails; struggles with dynamic technical interviews. | Clear gap analysis mapped to specific JDs; evidence-backed resume suggestions; adaptive AI mock interview targeted at exact weak points. |
| **Prof. Sharma (Placement Officer / Guide)** | Evaluator / Faculty | Cannot gauge if student resumes contain real skills vs copy-pasted projects; needs explainable metrics for job readiness. | Transparent audit trail showing verified projects, commit depth, and deterministic scoring breakdown. |
| **Sneha (Technical Recruiter / Mock Interviewer)** | Hiring Benchmark | Spends hours sifting through inflated resumes to find actual project contributors. | Receives structured evidence cards highlighting verified skills, code depth, and interview performance scores. |

---

## 3. Functional Requirements (FR)

### FR-1: Career Profile & Memory Ingestion
- **FR-1.1**: Parse resumes in PDF and DOCX formats into structured JSON (Education, Experience, Projects, Skills, Certifications).
- **FR-1.2**: Extract granular metadata: project tech stack, repo links, date ranges, role descriptions, quantifiable metrics.
- **FR-1.3**: Ingest external verification sources: GitHub public repositories (via official GitHub REST/GraphQL API), certificates, and verified project deliverables.

### FR-2: Job Description (JD) Intelligence
- **FR-2.1**: Ingest raw JD text or uploaded JD documents.
- **FR-2.2**: Decompose JD into explicit requirements:
  - Hard Technical Skills (Languages, Frameworks, Databases, Tools)
  - Core Theoretical Competencies (DSA, System Design, OS, DBMS)
  - Experience Level & Minimum Qualifications
  - Key Performance Responsibilities
- **FR-2.3**: Generate an expected *Technical Interview Knowledge Graph* mapped to the JD.

### FR-3: Evidence-Grounded Matching Engine
- **FR-3.1**: Map each extracted JD requirement against the candidate's career memory.
- **FR-3.2**: Classify requirement coverage into four deterministic tiers:
  - **Strong Evidence**: Direct, verified project artifacts + code commits or certified assessment.
  - **Partial Evidence**: Claimed skill supported by coursework or secondary mention without verified deep codebase proof.
  - **Unverified Claim**: Stated on resume without any traceable project, link, or assessment artifact.
  - **Missing**: No claim or evidence found in candidate profile.
- **FR-3.3**: Compute an explainable, multi-factor **Job Readiness Score ($JRS$)** (0–100%).

### FR-4: JD-Specific Resume Intelligence & Optimization
- **FR-4.1**: Re-order and prioritize project bullets based on JD semantic relevance.
- **FR-4.2**: Refactor bullet points using the Google XYZ Formula: *"Accomplished [X] as measured by [Y], by doing [Z]"*.
- **FR-4.3**: **Anti-Hallucination Guardrail**: Strictly forbid injecting technologies or accomplishments not present in the candidate's verified career profile.
- **FR-4.4**: Provide a side-by-side claim-to-evidence diff audit trail.

### FR-5: Adaptive Mock Interview Agent
- **FR-5.1**: Initialize interview context using JD requirements, candidate projects, and detected skill gaps.
- **FR-5.2**: State-driven dynamic questioning:
  - Deep-dive into projects claimed in candidate's resume (e.g., asking architectural trade-offs, code specifics).
  - Probe identified skill gaps with calibrated difficulty (Easy $\rightarrow$ Medium $\rightarrow$ Hard).
  - Adjust follow-up questions based on the candidate's prior answer depth (probing shallow answers, challenging strong answers).

### FR-6: Multi-Dimensional Interview Evaluation
- **FR-6.1**: Evaluate every candidate response across 7 criteria:
  1. Technical Correctness
  2. Semantic Relevance to Question
  3. Technical Depth & Nuance
  4. Problem Solving & Architectural Reasoning
  5. Communication Clarity & Structure (STAR Method)
  6. Concrete Examples & Evidence Usage
  7. Code/Pseudocode Accuracy (if applicable)
- **FR-6.2**: Provide actionable, pedagogical feedback with model answer references.

### FR-7: Skill Gap & Pedagogical Learning Agent
- **FR-7.1**: Isolate critical missing or partial competencies required by the target JD.
- **FR-7.2**: Curate structured, prioritized learning pathways:
  - Internal candidate notes/projects review.
  - Curated open-access resources (official docs, standard papers, benchmark tutorials).
  - Mini-project/implementation challenges designed to produce verifiable evidence.

### FR-8: Reassessment & Dynamic Readiness Recalculation
- **FR-8.1**: Trigger targeted micro-assessments or code submissions after learning.
- **FR-8.2**: Re-compute the Candidate Readiness Vector and update the historical trajectory chart.

---

## 4. Non-Functional Requirements (NFR)

| Metric / Dimension | Requirement Specification | Rationale & Viva Defense |
| :--- | :--- | :--- |
| **Explainability** | Every score and match output must provide a human-auditable mathematical breakdown and source citation. | Prevents "black-box" LLM hallucination and enables academic review. |
| **Deterministic Guardrails** | Deterministic operations (parsing, score weighting, regex matching) must be handled by pure code, not LLM prompts. | Guarantees reproducibility, low latency, and zero token waste on deterministic logic. |
| **Latency & Performance** | API responses for matching < 2.5s; Streaming token generation for mock interview questions with First-Token-Time < 800ms. | Interactive real-time conversational interview experience. |
| **Security & Privacy** | Zero plaintext storage of API tokens, zero user credential logging, rate-limited public endpoints, sanitize prompt inputs to prevent prompt injection. | OWASP Top 10 for LLM Applications compliance. |
| **Extensibility & Modularity** | Clean separation between REST Controllers, LangGraph State Engines, Vector Search services, and Data Repositories. | Scalability and ease of unit testing. |

---

## 5. Scope & Boundary Conditions

### In-Scope:
- Ingesting PDF/DOCX resumes and plain/HTML job descriptions.
- Hybrid search (Dense Embeddings + Sparse BM25) over candidate portfolio artifacts.
- LangGraph-based state machine for adaptive mock interviews.
- Transparent mathematical scoring formula for Job Readiness.
- Synthetic and real-world evaluation benchmarks.

### Explicitly Out-of-Scope (Important for Project Defense):
- *No Automated Hiring Guarantee*: CAREERX assesses and trains readiness; it does not claim to predict corporate hiring manager bias or guaranteed placement.
- *No Web Scraping of Protected Sites*: No scraping of LinkedIn profiles behind logins. Only official public APIs (e.g., GitHub REST API) or user-uploaded data are used.
