"""
Cross-Encoder Reranker Service for CAREERX.
Provides high-precision second-stage reranking over top candidate evidence.
"""
import logging
from typing import List, Tuple
import numpy as np

logger = logging.getLogger("careerx.retrieval.reranker")

DEFAULT_RERANKER_MODEL = "cross-encoder/ms-marco-MiniLM-L-6-v2"


class CrossEncoderReranker:
    """Singleton wrapper around CrossEncoder."""

    _instance = None
    _model = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(CrossEncoderReranker, cls).__new__(cls)
        return cls._instance

    def _load_model(self):
        if self._model is None:
            from sentence_transformers import CrossEncoder

            logger.info(f"Loading Cross-Encoder model '{DEFAULT_RERANKER_MODEL}'...")
            self._model = CrossEncoder(DEFAULT_RERANKER_MODEL)
            logger.info("Cross-Encoder model successfully loaded.")

    def predict_scores(self, pairs: List[Tuple[str, str]]) -> List[float]:
        """
        Given list of (query, passage) pairs, computes calibrated relevance scores in [0.0, 1.0].
        Applies logistic sigmoid to raw logits.
        """
        if not pairs:
            return []
        self._load_model()
        raw_scores = self._model.predict(pairs, show_progress_bar=False)
        scores = np.array(raw_scores, dtype=np.float32)
        # Logistic sigmoid calibration
        probs = 1.0 / (1.0 + np.exp(-scores))
        return [float(x) for x in probs]


reranker_service = CrossEncoderReranker()
