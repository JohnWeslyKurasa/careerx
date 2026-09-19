"""CAREERX Database Layer."""
from backend.app.db.collections import (
    PROFILES_COLLECTION,
    EVIDENCE_COLLECTION,
    JD_COLLECTION,
    ensure_indexes,
)

__all__ = [
    "PROFILES_COLLECTION",
    "EVIDENCE_COLLECTION",
    "JD_COLLECTION",
    "ensure_indexes",
]
