# CAREERX — Evidence Model & RAG Architecture

## 1. The Core Evidence Model

### 1.1 Fundamental Axiom
Traditional recruitment tools treat self-declared resume text as ground truth. In contrast, CAREERX models candidate qualification as an **Evidence-Grounded Directed Acyclic Graph (DAG)**:

$$\text{CLAIM} \xrightarrow{\text{sourced from}} \text{SOURCE} \xrightarrow{\text{validated by}} \text{EVIDENCE NODE} \xrightarrow{\text{calibrated into}} \text{CONFIDENCE SCORE}$$

```
+------------------------------------------------------------------------------------+
|                               CANDIDATE CLAIM                                      |
|              "Implemented distributed caching with Redis & Python"                 |
+------------------------------------------------------------------------------------+
                                         │
                                         ▼
+------------------------------------------------------------------------------------+
|                                SOURCE TRACE                                        |
|  - Source Type: GitHub Repository (`github_repo`)                                  |
|  - URL: `https://github.com/candidate/distributed-task-runner`                      |
|  - File/Commit: `services/cache.py` (Commit: `8a7b3c2`)                             |
+------------------------------------------------------------------------------------+
                                         │
                                         ▼
+------------------------------------------------------------------------------------+
|                              EVIDENCE NODE                                         |
|  - AST Check: Python AST verifies `import redis`, connection pool, TTL keys        |
|  - Project Depth: 45 commits over 3 months, unit tests with `pytest-redis`         |
|  - Demonstration: Answered Redis concurrency question correctly in Mock Interview |
+------------------------------------------------------------------------------------+
                                         │
                                         ▼
+------------------------------------------------------------------------------------+
|                            CONFIDENCE & READINESS                                  |
|  - Evidence Tier: STRONG (Verified Code Artifact + Interview Confirmation)         |
|  - Confidence Score: 0.95 (out of 1.0)                                             |
+------------------------------------------------------------------------------------+
```

### 1.2 The Four Evidence Tiers

| Evidence Tier | Criteria | Confidence Multiplier ($C_i$) |
| :--- | :--- | :--- |
| **STRONG** | Supported by verifiable code repository (AST parsed, active commits), verified credential, or high-scoring mock interview response. | $0.90 \le C_i \le 1.00$ |
| **PARTIAL** | Mentioned in academic coursework or secondary project summary, but lacks deep code verification, commit history, or verified links. | $0.50 \le C_i < 0.90$ |
| **UNVERIFIED** | Stated only in a generic resume skills list ("Python, C++, Docker") without any linked project, repo, or verifiable achievement. | $0.10 \le C_i < 0.50$ |
| **MISSING** | Neither claimed in resume nor supported by any project artifact in the candidate repository. | $C_i = 0.00$ |

---

## 2. Deep RAG (Retrieval-Augmented Generation) Architecture

CAREERX implements a production-grade, multi-stage RAG pipeline specifically designed for candidate career memory retrieval against complex job descriptions.

```
                  +----------------------------------------------------+
                  |               JOB DESCRIPTION (QUERY)              |
                  |  "Experience with FastAPI, MongoDB, & LangGraph"   |
                  +----------------------------------------------------+
                                             │
                       ┌─────────────────────┴─────────────────────┐
                       ▼                                           ▼
             +--------------------+                     +--------------------+
             |  DENSE RETRIEVER   |                     |  SPARSE RETRIEVER  |
             | (Bi-Encoder SBERT) |                     |   (BM25 Lexical)   |
             +--------------------+                     +--------------------+
                       │                                           │
                       │ Top-20 Dense Chunks                       │ Top-20 Keyword Chunks
                       └─────────────────────┬─────────────────────┘
                                             ▼
                             +-------------------------------+
                             | RECIPROCAL RANK FUSION (RRF)  |
                             |   $RRF(d) = \sum \frac{1}{k+r}$|
                             +-------------------------------+
                                             │
                                             ▼ Top-15 Candidate Chunks
                             +-------------------------------+
                             |    CROSS-ENCODER RERANKER     |
                             |  (ms-marco-MiniLM-L-6-v2)     |
                             +-------------------------------+
                                             │
                                             ▼ Top-5 Highly-Relevant Evidence Chunks
                             +-------------------------------+
                             |   GROUNDED CONTEXT BUILDER    |
                             |   (Injects Verified Facts)    |
                             +-------------------------------+
                                             │
                                             ▼
                             +-------------------------------+
                             |   STRICT STRUCTURED LLM       |
                             | (Pydantic / Instructor Output)|
                             +-------------------------------+
```

---

## 3. RAG Pipeline Stages Explained

### 3.1 Chunking Strategy: Semantic Entity & Section Chunking
Standard naive chunking (e.g., fixed 500 characters with 50 overlap) splits projects across arbitrary boundaries, cutting off tech stacks from project outcomes.
CAREERX utilizes **Domain-Aware Semantic Chunking**:
1. **Resume Chunks**: Partitioned strictly by entity boundary (`ProjectNode`, `ExperienceNode`, `EducationNode`, `SkillGroupNode`).
2. **Project Code/Readme Chunks**: Partitioned by architectural components (`ArchitectureOverview`, `APIEndpoints`, `DatabaseSchema`, `DeploymentConfig`).
3. **Chunk Metadata**: Every chunk is injected with immutable metadata:
   ```json
   {
     "chunk_id": "proj_task_runner_01",
     "entity_type": "project",
     "entity_name": "Distributed Task Runner",
     "verified_skills": ["Python", "Redis", "Celery", "Docker"],
     "source_url": "https://github.com/candidate/distributed-task-runner",
     "text": "Project: Distributed Task Runner\nDescription: Scalable background job engine handling 10k tasks/sec using Celery and Redis broker..."
   }
   ```

### 3.2 Dense Embedding vs. Sparse Lexical Search
- **Why Bi-Encoder (Dense)**: Encodes semantic meaning (e.g., "asynchronous queue worker" matches "Celery / RabbitMQ background task").
- **Why BM25 (Sparse)**: Exact keyword matching is critical for exact framework names and version numbers (e.g., "Python 3.11", "PostgreSQL", "OAuth2") where semantic models might conflate related but distinct tools.

### 3.3 Hybrid Fusion: Reciprocal Rank Fusion (RRF)
To combine dense and sparse rankings without arbitrary score normalization, we use Reciprocal Rank Fusion:

$$RRF\_Score(d) = \sum_{m \in M} \frac{1}{k + r_m(d)}$$

Where:
- $M = \{\text{Dense Retriever}, \text{BM25 Retriever}\}$
- $r_m(d)$ is the rank position of document $d$ in retriever $m$ (1-indexed).
- $k$ is a smoothing constant (standard benchmark: $k = 60$).

### 3.4 Cross-Encoder Reranker
Bi-encoders compute vector embeddings independently for query and document.
The Cross-Encoder takes $(Query, Document)$ simultaneously into a full self-attention transformer, capturing cross-attention interactions between every word in the JD requirement and candidate project evidence.
- Model: `cross-encoder/ms-marco-MiniLM-L-6-v2` or `bge-reranker-base`.
- Top-5 reranked evidence nodes are fed to the downstream agents.

---

## 4. Hallucination Control & Grounding Guardrails

To ensure academic and enterprise integrity:
1. **Negative Constraint System Prompts**: Explicitly instruct the LLM that any statement not backed by injected `<evidence_nodes>` must be flagged as `UNVERIFIED_OR_MISSING`.
2. **Post-Generation Evidence Diff Validator**:
   ```python
   def validate_grounding(generated_bullet: str, evidence_nodes: List[EvidenceNode]) -> bool:
       allowed_technologies = {tech for node in evidence_nodes for tech in node.verified_skills}
       extracted_techs = extract_tech_keywords(generated_bullet)
       hallucinated = extracted_techs - allowed_technologies
       if hallucinated:
           logger.warning(f"Hallucination detected: {hallucinated}")
           return False
       return True
   ```
3. **Traceable Citations**: Every generated bullet or interview feedback item contains a clickable `evidence_id` reference linked to the original parsed artifact.
