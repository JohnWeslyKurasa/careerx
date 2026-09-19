# CAREERX — Research-Oriented Evaluation Plan & Methodology

## 1. Research Formulation & Scientific Novelty

### 1.1 Research Title
**"Evidence-Grounded Job Readiness: An Explainable, Agentic Retrieval-Augmented Framework for Career Intelligence and Adaptive Assessment"**

### 1.2 The Core Scientific Problem
Current automated career tools suffer from two major flaws:
1. **ATS Blindness**: Syntactic keyword matchers fail to capture semantic skill alignment.
2. **Generative Hallucination**: Ungrounded LLMs invent accomplishments and give arbitrary, unexplainable readiness ratings.

CAREERX investigates how **multi-source evidence grounding (code AST, commit history, interactive adaptive dialog)** can produce robust, explainable, and hallucination-free job readiness metrics.

---

## 2. Research Questions (RQs) & Hypotheses

| ID | Research Question | Formal Hypothesis ($H_a$) |
| :--- | :--- | :--- |
| **RQ1** | How does Hybrid RAG (Dense SBERT + Sparse BM25 + Cross-Encoder Reranking) compare to Naive Vector Search in retrieving evidence for technical JD requirements? | $H_1$: Hybrid RAG yields significantly higher $Precision@K$ and $NDCG@5$ ($p < 0.01$) over naive vector retrieval, particularly for exact framework version matches. |
| **RQ2** | To what extent does evidence-constrained resume bullet generation eliminate hallucinated technical claims compared to unconstrained LLMs? | $H_2$: Strict evidence grounding reduces the Hallucination Rate ($\%$) of unverified tech claims from $>35\%$ to $<2\%$. |
| **RQ3** | Does a stateful LangGraph adaptive interview agent produce more calibrated technical probing than static single-prompt LLM interviewers? | $H_3$: State-driven adaptive questioning achieves higher conversational relevance and depth scores as rated by human evaluators. |
| **RQ4** | How well does the deterministic multi-factor $JRS$ correlate with expert human technical interview scores? | $H_4$: Deterministic $JRS$ achieves a Spearman Rank Correlation $\rho \ge 0.78$ against senior engineer evaluation rubrics. |

---

## 3. Baseline Systems for Comparative Benchmarking

1. **Baseline 1 (Lexical ATS)**: TF-IDF + Cosine Similarity keyword matcher (standard legacy ATS baseline).
2. **Baseline 2 (Naive Vector RAG)**: Single-stage Dense Vector Search (OpenAI / SBERT) without hybrid sparse fusion or reranking.
3. **Baseline 3 (Unconstrained LLM)**: Direct zero-shot LLM prompt (e.g. GPT-4 / Gemini) without retrieval grounding or AST verification.
4. **Proposed System (CAREERX)**: Hybrid RRF + Cross-Encoder + Deterministic Scoring + LangGraph Adaptive Simulation.

---

## 4. Quantitative Evaluation Metrics

### 4.1 Retrieval Quality Metrics (RQ1)
- **Precision@K** ($K=3, 5$): Fraction of retrieved evidence nodes that actually substantiate the JD requirement.
- **Mean Reciprocal Rank (MRR)**: Evaluates how high the first relevant evidence node appears in the ranked list.
- **NDCG@5 (Normalized Discounted Cumulative Gain)**: Measures ranking quality considering graded relevance (Strong vs Partial).

### 4.2 Hallucination & Faithfulness Metrics (RQ2)
- **Extraneous Entity Insertion Rate ($EEIR$)**: Percentage of generated bullet points containing tools/libraries not found in the candidate's verified evidence store:
  $$EEIR = \frac{N_{\text{unverified\_tech\_terms}}}{N_{\text{total\_generated\_tech\_terms}}} \times 100\%$$

### 4.3 Correlation & Alignment Metrics (RQ4)
- **Spearman Rank Correlation ($\rho$) & Pearson ($r$)**: Measuring alignment between algorithmic $JRS$ and blind human panel scores across 50 benchmark candidate-JD pairs.

---

## 5. Ablation Study Matrix

To prove the necessity of each component in your project defense/viva:
1. **Model A (Full CAREERX)**: Complete Hybrid RAG + Cross-Encoder + LangGraph + Deterministic Math.
2. **Ablation 1 (No BM25)**: Dense embeddings only (evaluates loss of exact keyword/version accuracy).
3. **Ablation 2 (No Cross-Encoder)**: First-stage retrieval directly fed to LLM without reranking.
4. **Ablation 3 (No Grounding Filter)**: Unconstrained LLM resume rewriting (measures hallucination jump).
5. **Ablation 4 (Pure LLM Scoring)**: Direct prompt scoring instead of deterministic formula (measures variance & drift).
