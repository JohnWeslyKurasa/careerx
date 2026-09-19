"""
Pydantic Domain Models for Phase 5: Job Readiness Scoring Engine (JRS).
Defines schemas for requirement-level scoring, match diagnostics, and explainable report outputs.
"""
from enum import Enum
from typing import List, Optional
from pydantic import BaseModel, Field
from backend.app.models.profile import ConfidenceTier
from backend.app.models.retrieval import RetrievalMode


class MatchStatus(str, Enum):
    """Diagnostic match classification for an individual job requirement."""
    STRONG_MATCH = "STRONG_MATCH"       # S_j >= 0.70
    PARTIAL_MATCH = "PARTIAL_MATCH"     # 0.45 <= S_j < 0.70
    WEAK_EVIDENCE = "WEAK_EVIDENCE"     # 0.15 <= S_j < 0.45
    MISSING = "MISSING"                 # S_j < 0.15


class GroundedEvidenceSummary(BaseModel):
    """Summary of the specific evidence node grounded to a job requirement."""
    evidence_id: str = Field(..., description="Unique evidence identifier")
    claim_text: str = Field(..., description="Extracted candidate bullet or project claim")
    source_type: str = Field(..., description="Evidence origin (e.g. project_bullet, experience_bullet)")
    source_reference: Optional[str] = Field(None, description="Project name or role title")
    verifiable_url: Optional[str] = Field(None, description="External code repository or artifact URL")
    verified_skills: List[str] = Field(default_factory=list, description="Extracted canonical skills")
    confidence_tier: ConfidenceTier = Field(..., description="Verification tier of the evidence")
    confidence_score: float = Field(..., ge=0.0, le=1.0, description="Confidence score from Career Memory")
    retrieval_score: float = Field(..., ge=0.0, le=1.0, description="Calibrated similarity from Phase 4")


class RequirementScoreBreakdown(BaseModel):
    """Detailed score breakdown for a single JD requirement clause."""
    req_id: str = Field(..., description="Identifier of the JD requirement clause")
    requirement_text: str = Field(..., description="Full text of the requirement clause")
    category: Optional[str] = Field(None, description="Technical category tag")
    importance_weight: float = Field(..., ge=1.0, le=3.0, description="Imperative weight I_j")
    match_status: MatchStatus = Field(..., description="Diagnostic match status tier")
    requirement_score: float = Field(..., ge=0.0, le=1.0, description="S_j = Sim_j * C_j")
    weighted_contribution: float = Field(..., ge=0.0, description="I_j * S_j contribution")
    retrieval_similarity: float = Field(..., ge=0.0, le=1.0, description="Phase 4 similarity Sim(R_j, E_j)")
    confidence_tier: Optional[ConfidenceTier] = Field(None, description="Confidence tier of top evidence")
    confidence_multiplier: float = Field(..., ge=0.0, le=1.0, description="Numerical multiplier C_j")
    is_mandatory: bool = Field(..., description="True if importance weight >= 2.5")
    is_critical_gap: bool = Field(..., description="True if mandatory and missing/unverified")
    grounded_evidence: Optional[GroundedEvidenceSummary] = Field(None, description="Top-1 grounded evidence node")
    diagnostic_note: str = Field(..., description="Actionable explanation of the score and gap")


class JRSMatchSummary(BaseModel):
    """Aggregated match statistics across all requirements."""
    total_requirements: int = Field(..., ge=0)
    strong_matches: int = Field(..., ge=0)
    partial_matches: int = Field(..., ge=0)
    weak_evidence: int = Field(..., ge=0)
    missing_requirements: int = Field(..., ge=0)
    critical_gaps_count: int = Field(..., ge=0)


class JRSRequest(BaseModel):
    """Payload for calculating Job Readiness Score."""
    candidate_id: str = Field(..., description="Candidate user ID in Career Memory")
    jd_id: str = Field(..., description="Target Job Description ID")
    retrieval_mode: RetrievalMode = Field(
        default=RetrievalMode.HYBRID_RERANKED,
        description="Retrieval engine mode used for evidence grounding"
    )
    alpha: float = Field(
        default=0.65, ge=0.0, le=1.0,
        description="Hybrid dense fusion weight (used if retrieval_mode is hybrid or hybrid_reranked)"
    )
    stage1_top_k: int = Field(default=15, ge=1, le=50, description="Stage-1 retrieval recall depth")


class JRSResponse(BaseModel):
    """Comprehensive explainable Job Readiness Score report."""
    candidate_id: str = Field(..., description="Candidate ID")
    jd_id: str = Field(..., description="Job Description ID")
    jd_title: Optional[str] = Field(None, description="Job Title")
    overall_jrs: float = Field(..., ge=0.0, le=100.0, description="Final Job Readiness Score [0.0, 100.0]")
    base_jrs: float = Field(..., ge=0.0, le=100.0, description="Weighted Base Score before penalties [0.0, 100.0]")
    critical_penalty: float = Field(..., ge=0.0, le=25.0, description="Mandatory critical gap penalty deducted")
    retrieval_mode: RetrievalMode = Field(..., description="Retrieval ablation mode executed")
    match_summary: JRSMatchSummary = Field(..., description="Summary counts across match tiers")
    breakdown: List[RequirementScoreBreakdown] = Field(..., description="Per-requirement mathematical breakdown")
    critical_gaps: List[str] = Field(default_factory=list, description="Titles of missing mandatory requirements")
    top_strengths: List[str] = Field(default_factory=list, description="Top satisfied requirements with strong evidence")
    top_improvements: List[str] = Field(default_factory=list, description="Targeted actionable suggestions to improve readiness")
    computation_latency_ms: float = Field(..., ge=0.0, description="Computation time in milliseconds")
    evaluated_at: str = Field(..., description="ISO 8601 evaluation timestamp")
