"""
OpenAI Dense Embedding Service for CAREERX.
Uses OpenAI text-embedding-3-small API — no local model, no PyTorch dependency.
Vercel-compatible: lightweight HTTP calls only.
"""
import logging
import os
from typing import List

import numpy as np

logger = logging.getLogger("careerx.retrieval.embedder")

DEFAULT_EMBEDDING_MODEL = "text-embedding-3-small"
EMBEDDING_DIM = 1536  # OpenAI text-embedding-3-small output dimension


class SentenceEmbedder:
    """
    Singleton embedding client backed by OpenAI text-embedding-3-small.
    Drop-in replacement for the previous SentenceTransformer-based embedder.
    """

    _instance = None
    _client = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(SentenceEmbedder, cls).__new__(cls)
        return cls._instance

    def _get_client(self):
        """Lazily initialize the OpenAI client on first use."""
        if self._client is None:
            from openai import OpenAI  # already a dependency — no new package needed

            api_key = os.environ.get("OPENAI_API_KEY", "")
            if not api_key:
                logger.warning(
                    "OPENAI_API_KEY is not set. Embedding calls will return zero vectors."
                )
            self._client = OpenAI(api_key=api_key)
        return self._client

    def _embed(self, texts: List[str]) -> List[List[float]]:
        """Call OpenAI Embeddings API and return normalized float vectors."""
        if not texts:
            return []
        try:
            client = self._get_client()
            response = client.embeddings.create(
                model=DEFAULT_EMBEDDING_MODEL,
                input=texts,
            )
            vectors = [item.embedding for item in response.data]
            # L2-normalise so cosine similarity == dot product
            result = []
            for vec in vectors:
                arr = np.array(vec, dtype=np.float32)
                norm = np.linalg.norm(arr)
                if norm > 0:
                    arr = arr / norm
                result.append([float(x) for x in arr])
            return result
        except Exception as exc:
            logger.error(f"OpenAI embedding call failed: {exc}")
            # Return zero vectors so the pipeline degrades gracefully
            return [[0.0] * EMBEDDING_DIM for _ in texts]

    def encode_text(self, text: str) -> List[float]:
        """Encodes a single text into a normalized 1536-dimensional float vector."""
        results = self._embed([text])
        return results[0] if results else [0.0] * EMBEDDING_DIM

    def encode_batch(self, texts: List[str]) -> List[List[float]]:
        """Encodes a batch of texts efficiently via a single API call."""
        if not texts:
            return []
        return self._embed(texts)


embedder_service = SentenceEmbedder()

