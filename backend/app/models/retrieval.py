from enum import Enum
from typing import List, Optional
from pydantic import BaseModel, Field
from backend.app.models.profile import ConfidenceTier


class RetrievalMode(str, Enum):
    BM25_ONLY = "bm25_only"
    DENSE_ONLY = "dense_only"
    HYBRID = "hybrid"
    HYBRID_RERANKED = "hybrid_reranked"


class RetrievalQueryRequest(BaseModel):
    candidate_id: str = Field(..., description="Candidate user ID to retrieve evidence for")
    requirement_text: str = Field(..., min_length=3, description="JD requirement clause or target skill query")
    mode: RetrievalMode = Field(default=RetrievalMode.HYBRID_RERANKED, description="Ablation evaluation mode")
    alpha: float = Field(default=0.65, ge=0.0, le=1.0, description="Hybrid fusion weight for dense score")
    stage1_top_k: int = Field(default=15, ge=1, le=50, description="Depth of initial candidate recall")
    final_top_k: int = Field(default=3, ge=1, le=20, description="Number of final evidence nodes to return")
    include_archived: bool = Field(default=False, description="Filter for active evidence only (True only for research audit)")


class RetrievedEvidenceItem(BaseModel):
    evidence_id: str
    claim_text: str
    source_type: str
    source_reference: Optional[str] = None
    verifiable_url: Optional[str] = None
    verified_skills: List[str] = Field(default_factory=list)
    confidence_tier: ConfidenceTier
    confidence_score: float
    bm25_score: Optional[float] = None
    dense_score: Optional[float] = None
    hybrid_score: Optional[float] = None
    rerank_score: Optional[float] = None
    final_score: float


class RetrievalResponse(BaseModel):
    candidate_id: str
    requirement_text: str
    mode: RetrievalMode
    alpha: float
    total_active_evaluated: int
    latency_ms: float
    results: List[RetrievedEvidenceItem]


class MatchJDRequest(BaseModel):
    candidate_id: str = Field(..., description="Target candidate ID")
    jd_id: str = Field(..., description="Target Job Description ID")
    mode: RetrievalMode = Field(default=RetrievalMode.HYBRID_RERANKED, description="Retrieval ablation mode")
    alpha: float = Field(default=0.65, ge=0.0, le=1.0, description="Dense weight")
    stage1_top_k: int = Field(default=15, ge=1, le=50)
    final_top_k: int = Field(default=3, ge=1, le=20)


class RequirementMatchResult(BaseModel):
    req_id: str
    requirement_text: str
    importance_weight: float
    retrieved_evidence: List[RetrievedEvidenceItem]


class JDMatchResponse(BaseModel):
    candidate_id: str
    jd_id: str
    mode: RetrievalMode
    matches: List[RequirementMatchResult]
    total_latency_ms: float
