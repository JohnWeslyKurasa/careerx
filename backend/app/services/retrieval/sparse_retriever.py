"""
BM25 Lexical Retrieval Service for CAREERX.
Provides sparse token-matching, software-engineering stopword filtering,
lightweight technical stemming, term-frequency saturation, and length normalization.
"""
import re
from typing import List
from rank_bm25 import BM25Okapi

STOPWORDS = {
    "a", "an", "the", "and", "or", "but", "if", "in", "on", "at", "by",
    "for", "with", "about", "against", "between", "into", "through", "during",
    "before", "after", "above", "below", "to", "from", "up", "down", "of",
    "off", "over", "under", "is", "are", "was", "were", "be", "been", "being",
    "have", "has", "had", "do", "does", "did", "will", "would", "shall", "should",
    "can", "could", "may", "might", "must", "i", "you", "he", "she", "it",
    "we", "they", "this", "that", "these", "those", "as", "using", "used",
}


def stem_token(token: str) -> str:
    """Lightweight suffix stripper for technical terms."""
    if token.endswith("ing") and len(token) > 4:
        return token[:-3]
    if token.endswith("ed") and len(token) > 3:
        return token[:-2]
    if token.endswith("es") and len(token) > 3:
        return token[:-2]
    if token.endswith("s") and not token.endswith("ss") and len(token) > 2:
        return token[:-1]
    return token


def tokenize_code_and_text(text: str) -> List[str]:
    """
    Tokenizes text for software engineering corpora.
    Preserves technical terms like 'c++', 'c#', 'ci/cd', 'node.js', 'fastapi'.
    Filters common English stopwords and applies lightweight stemming.
    """
    text = text.lower()
    raw_tokens = re.findall(r'[a-z0-9+#_./-]+', text)
    filtered = []
    for t in raw_tokens:
        clean = t.strip('.-/')
        if len(clean) > 1 and clean not in STOPWORDS:
            filtered.append(stem_token(clean))
    return filtered


class SparseRetriever:
    """Computes BM25 lexical relevance scores across candidate evidence nodes."""

    def __init__(self, corpus_texts: List[str]) -> None:
        self.corpus_texts = corpus_texts
        self.tokenized_corpus = [tokenize_code_and_text(doc) for doc in corpus_texts]
        # Handle empty or zero-token corpus safely
        if self.tokenized_corpus and any(len(t) > 0 for t in self.tokenized_corpus):
            self.bm25 = BM25Okapi(self.tokenized_corpus)
        else:
            self.bm25 = None

    def score_query(self, query: str) -> List[float]:
        """
        Scores all corpus documents against the query.
        Returns min-max normalized scores in range [0.0, 1.0].
        """
        if not self.bm25 or not self.corpus_texts:
            return [0.0] * len(self.corpus_texts)

        query_tokens = tokenize_code_and_text(query)
        if not query_tokens:
            return [0.0] * len(self.corpus_texts)

        raw_scores = self.bm25.get_scores(query_tokens)
        
        max_score = float(max(raw_scores)) if len(raw_scores) > 0 else 0.0
        min_score = float(min(raw_scores)) if len(raw_scores) > 0 else 0.0

        if max_score <= 0.0 or max_score == min_score:
            return [1.0 if s > 0.0 else 0.0 for s in raw_scores]

        normalized = [(float(s) - min_score) / (max_score - min_score) for s in raw_scores]
        return normalized
