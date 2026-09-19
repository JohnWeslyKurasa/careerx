"""
Hybrid Retrieval Engine for CAREERX.
Orchestrates BM25 lexical search, SBERT dense semantic search,
configurable score fusion, and Cross-Encoder reranking across 4 ablation modes.
"""
from typing import List, Tuple
import logging
from backend.app.models.profile import EvidenceNode
from backend.app.models.retrieval import RetrievalMode, RetrievedEvidenceItem
from backend.app.services.retrieval.sparse_retriever import SparseRetriever
from backend.app.services.retrieval.dense_retriever import DenseRetriever
from backend.app.services.retrieval.embedder import embedder_service
from backend.app.services.retrieval.reranker import reranker_service

logger = logging.getLogger("careerx.retrieval.hybrid")


class HybridRetriever:
    """Multi-stage hybrid evidence retrieval engine supporting 4 evaluation modes."""

    @staticmethod
    def retrieve(
        query: str,
        evidence_nodes: List[EvidenceNode],
        mode: RetrievalMode = RetrievalMode.HYBRID_RERANKED,
        alpha: float = 0.65,
        stage1_top_k: int = 15,
        final_top_k: int = 3,
    ) -> Tuple[List[RetrievedEvidenceItem], List[Tuple[str, List[float]]]]:
        """
        Executes evidence retrieval for a given query over candidate evidence nodes.
        Returns:
            (List[RetrievedEvidenceItem], List[(evidence_id, newly_computed_embedding)])
        """
        if not evidence_nodes or not query.strip():
            return [], []

        corpus_texts = [node.claim_text for node in evidence_nodes]
        new_embeddings: List[Tuple[str, List[float]]] = []

        # 1. Compute BM25 Lexical Scores
        sparse_retriever = SparseRetriever(corpus_texts)
        bm25_scores = sparse_retriever.score_query(query)

        # 2. Compute Dense SBERT Scores
        query_vector = embedder_service.encode_text(query)
        doc_vectors: List[List[float]] = []

        for node in evidence_nodes:
            if node.embedding and len(node.embedding) == 384:
                doc_vectors.append(node.embedding)
            else:
                # Compute embedding on-the-fly if not already stored
                computed_emb = embedder_service.encode_text(node.claim_text)
                node.embedding = computed_emb
                new_embeddings.append((node.evidence_id, computed_emb))
                doc_vectors.append(computed_emb)

        dense_scores = DenseRetriever.score_query(query_vector, doc_vectors)

        # 3. Compute Single-Stage Hybrid Scores: S_hybrid = alpha * S_dense + (1 - alpha) * S_sparse
        hybrid_scores = [
            float(alpha * d + (1.0 - alpha) * s)
            for d, s in zip(dense_scores, bm25_scores)
        ]

        # 4. Handle Execution Mode
        n_nodes = len(evidence_nodes)

        if mode == RetrievalMode.BM25_ONLY:
            ranked_indices = sorted(range(n_nodes), key=lambda i: bm25_scores[i], reverse=True)[:final_top_k]
            results = [
                RetrievedEvidenceItem(
                    evidence_id=evidence_nodes[i].evidence_id,
                    claim_text=evidence_nodes[i].claim_text,
                    source_type=evidence_nodes[i].source_type,
                    source_reference=evidence_nodes[i].source_reference,
                    verifiable_url=evidence_nodes[i].verifiable_url,
                    verified_skills=evidence_nodes[i].verified_skills,
                    confidence_tier=evidence_nodes[i].confidence_tier,
                    confidence_score=evidence_nodes[i].confidence_score,
                    bm25_score=round(bm25_scores[i], 4),
                    dense_score=round(dense_scores[i], 4),
                    hybrid_score=round(hybrid_scores[i], 4),
                    rerank_score=None,
                    final_score=round(bm25_scores[i], 4),
                )
                for i in ranked_indices
            ]
            return results, new_embeddings

        elif mode == RetrievalMode.DENSE_ONLY:
            ranked_indices = sorted(range(n_nodes), key=lambda i: dense_scores[i], reverse=True)[:final_top_k]
            results = [
                RetrievedEvidenceItem(
                    evidence_id=evidence_nodes[i].evidence_id,
                    claim_text=evidence_nodes[i].claim_text,
                    source_type=evidence_nodes[i].source_type,
                    source_reference=evidence_nodes[i].source_reference,
                    verifiable_url=evidence_nodes[i].verifiable_url,
                    verified_skills=evidence_nodes[i].verified_skills,
                    confidence_tier=evidence_nodes[i].confidence_tier,
                    confidence_score=evidence_nodes[i].confidence_score,
                    bm25_score=round(bm25_scores[i], 4),
                    dense_score=round(dense_scores[i], 4),
                    hybrid_score=round(hybrid_scores[i], 4),
                    rerank_score=None,
                    final_score=round(dense_scores[i], 4),
                )
                for i in ranked_indices
            ]
            return results, new_embeddings

        elif mode == RetrievalMode.HYBRID:
            ranked_indices = sorted(range(n_nodes), key=lambda i: hybrid_scores[i], reverse=True)[:final_top_k]
            results = [
                RetrievedEvidenceItem(
                    evidence_id=evidence_nodes[i].evidence_id,
                    claim_text=evidence_nodes[i].claim_text,
                    source_type=evidence_nodes[i].source_type,
                    source_reference=evidence_nodes[i].source_reference,
                    verifiable_url=evidence_nodes[i].verifiable_url,
                    verified_skills=evidence_nodes[i].verified_skills,
                    confidence_tier=evidence_nodes[i].confidence_tier,
                    confidence_score=evidence_nodes[i].confidence_score,
                    bm25_score=round(bm25_scores[i], 4),
                    dense_score=round(dense_scores[i], 4),
                    hybrid_score=round(hybrid_scores[i], 4),
                    rerank_score=None,
                    final_score=round(hybrid_scores[i], 4),
                )
                for i in ranked_indices
            ]
            return results, new_embeddings

        elif mode == RetrievalMode.HYBRID_RERANKED:
            # Stage 1: Filter Top-K candidates using single-stage hybrid score
            k_stage1 = min(stage1_top_k, n_nodes)
            stage1_indices = sorted(range(n_nodes), key=lambda i: hybrid_scores[i], reverse=True)[:k_stage1]

            # Stage 2: Cross-Encoder Reranking on Stage 1 candidates
            candidate_pairs = [(query, evidence_nodes[i].claim_text) for i in stage1_indices]
            rerank_scores = reranker_service.predict_scores(candidate_pairs)

            # Sort Stage 1 candidates by rerank score
            sorted_rerank = sorted(
                zip(stage1_indices, rerank_scores),
                key=lambda x: x[1],
                reverse=True
            )[:final_top_k]

            results = [
                RetrievedEvidenceItem(
                    evidence_id=evidence_nodes[idx].evidence_id,
                    claim_text=evidence_nodes[idx].claim_text,
                    source_type=evidence_nodes[idx].source_type,
                    source_reference=evidence_nodes[idx].source_reference,
                    verifiable_url=evidence_nodes[idx].verifiable_url,
                    verified_skills=evidence_nodes[idx].verified_skills,
                    confidence_tier=evidence_nodes[idx].confidence_tier,
                    confidence_score=evidence_nodes[idx].confidence_score,
                    bm25_score=round(bm25_scores[idx], 4),
                    dense_score=round(dense_scores[idx], 4),
                    hybrid_score=round(hybrid_scores[idx], 4),
                    rerank_score=round(score, 4),
                    final_score=round(score, 4),
                )
                for idx, score in sorted_rerank
            ]
            return results, new_embeddings

        raise ValueError(f"Unknown retrieval mode: {mode}")
