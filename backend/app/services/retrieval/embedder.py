"""
SBERT Dense Embedding Service for CAREERX.
Wraps sentence-transformers with the all-MiniLM-L6-v2 baseline model.
"""
import logging
from typing import List
import numpy as np

logger = logging.getLogger("careerx.retrieval.embedder")

DEFAULT_EMBEDDING_MODEL = "sentence-transformers/all-MiniLM-L6-v2"
EMBEDDING_DIM = 384


class SentenceEmbedder:
    """Singleton wrapper around SentenceTransformer to prevent redundant model loads."""

    _instance = None
    _model = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(SentenceEmbedder, cls).__new__(cls)
        return cls._instance

    def _load_model(self):
        if self._model is None:
            from sentence_transformers import SentenceTransformer

            logger.info(f"Loading SBERT model '{DEFAULT_EMBEDDING_MODEL}'...")
            self._model = SentenceTransformer(DEFAULT_EMBEDDING_MODEL)
            logger.info("SBERT model successfully loaded into memory.")

    def encode_text(self, text: str) -> List[float]:
        """Encodes a single sentence into a normalized 384-dimensional float vector."""
        self._load_model()
        vec = self._model.encode(text, convert_to_numpy=True, normalize_embeddings=True)
        return [float(x) for x in vec]

    def encode_batch(self, texts: List[str]) -> List[List[float]]:
        """Encodes a batch of sentences efficiently."""
        if not texts:
            return []
        self._load_model()
        matrix = self._model.encode(
            texts,
            convert_to_numpy=True,
            normalize_embeddings=True,
            batch_size=32,
            show_progress_bar=False,
        )
        return [[float(x) for x in row] for row in matrix]


embedder_service = SentenceEmbedder()
