"""
Dense Vector Semantic Retrieval Service for CAREERX.
Performs cosine similarity search between query vectors and candidate evidence embeddings.
"""
from typing import List, Optional
import numpy as np


class DenseRetriever:
    """Computes semantic similarity between dense sentence embeddings."""

    @staticmethod
    def cosine_similarity(vec_a: List[float], vec_b: List[float]) -> float:
        """Computes cosine similarity between two 1D vectors."""
        a = np.array(vec_a, dtype=np.float32)
        b = np.array(vec_b, dtype=np.float32)
        norm_a = np.linalg.norm(a)
        norm_b = np.linalg.norm(b)
        if norm_a == 0.0 or norm_b == 0.0:
            return 0.0
        sim = float(np.dot(a, b) / (norm_a * norm_b))
        # Clamp to [-1.0, 1.0] to prevent floating point inaccuracies
        return max(-1.0, min(1.0, sim))

    @staticmethod
    def score_query(
        query_vector: List[float], doc_vectors: List[Optional[List[float]]]
    ) -> List[float]:
        """
        Computes cosine similarity of query_vector against all doc_vectors.
        Returns calibrated scores in range [0.0, 1.0].
        If a document has no pre-computed embedding, score is 0.0.
        """
        scores: List[float] = []
        q = np.array(query_vector, dtype=np.float32)
        norm_q = np.linalg.norm(q)

        if norm_q == 0.0:
            return [0.0] * len(doc_vectors)

        for d in doc_vectors:
            if d is None or len(d) == 0:
                scores.append(0.0)
                continue
            doc_arr = np.array(d, dtype=np.float32)
            norm_d = np.linalg.norm(doc_arr)
            if norm_d == 0.0:
                scores.append(0.0)
                continue
            cos = float(np.dot(q, doc_arr) / (norm_q * norm_d))
            # Normalize to [0, 1]: negative cosine similarities are clipped to 0.0
            scores.append(max(0.0, min(1.0, cos)))

        return scores
