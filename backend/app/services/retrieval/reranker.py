"""
OpenAI Embeddings-based Reranker for CAREERX.
Replaces the sentence-transformers CrossEncoder with cosine similarity over
OpenAI text-embedding-3-small vectors. Vercel-compatible: no local model.
"""
import logging
from typing import List, Tuple

import numpy as np

from backend.app.services.retrieval.embedder import embedder_service

logger = logging.getLogger("careerx.retrieval.reranker")


class CrossEncoderReranker:
    """
    Singleton reranker using OpenAI embeddings + cosine similarity.
    Drop-in replacement for the previous CrossEncoder-based reranker.
    The (query, passage) relevance score is computed as cosine similarity
    between their respective embedding vectors.
    """

    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(CrossEncoderReranker, cls).__new__(cls)
        return cls._instance

    def predict_scores(self, pairs: List[Tuple[str, str]]) -> List[float]:
        """
        Given a list of (query, passage) pairs, computes relevance scores in [0.0, 1.0]
        using cosine similarity between OpenAI embeddings.
        """
        if not pairs:
            return []

        # Deduplicate texts to minimise API calls
        queries = [p[0] for p in pairs]
        passages = [p[1] for p in pairs]
        all_texts = queries + passages

        try:
            all_vectors = embedder_service.encode_batch(all_texts)
            query_vecs = all_vectors[: len(queries)]
            passage_vecs = all_vectors[len(queries) :]

            scores = []
            for q_vec, p_vec in zip(query_vecs, passage_vecs):
                q = np.array(q_vec, dtype=np.float32)
                p = np.array(p_vec, dtype=np.float32)
                norm_q = np.linalg.norm(q)
                norm_p = np.linalg.norm(p)
                if norm_q == 0.0 or norm_p == 0.0:
                    scores.append(0.0)
                else:
                    cos = float(np.dot(q, p) / (norm_q * norm_p))
                    # Normalise from [-1, 1] to [0, 1]
                    scores.append(max(0.0, min(1.0, (cos + 1.0) / 2.0)))
            return scores

        except Exception as exc:
            logger.error(f"Reranker scoring failed: {exc}")
            return [0.0] * len(pairs)


reranker_service = CrossEncoderReranker()

