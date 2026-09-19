"""
Deterministic Job Readiness Scoring (JRS) Service for CAREERX.
Implements evidence-grounded multi-criteria requirement evaluation,
confidence-weighted aggregation, critical gap penalties, and explainable reporting.
"""
from datetime import datetime, timezone
import logging
import time
from typing import List, Optional, Tuple
from fastapi import HTTPException, status
from backend.app.db.repositories.jd_repo import JobDescriptionRepository
from backend.app.db.repositories.profile_repo import ProfileRepository
from backend.app.models.jd import JobDescription
from backend.app.models.jrs import (
    GroundedEvidenceSummary,
    JRSMatchSummary,
    JRSRequest,
    JRSResponse,
    MatchStatus,
    RequirementScoreBreakdown,
)
from backend.app.models.profile import ConfidenceTier
from backend.app.models.retrieval import MatchJDRequest, RequirementMatchResult, RetrievedEvidenceItem
from backend.app.services.retrieval_service import EvidenceRetrievalService

logger = logging.getLogger("careerx.jrs.service")

# ---------------------------------------------------------------------------
# Methodological Constants & Baseline Parameters (Provisional for Phase 15)
# ---------------------------------------------------------------------------
CONFIDENCE_MULTIPLIERS = {
    ConfidenceTier.DEMONSTRATED: 1.00,  # [ARCHITECTURAL REQUIREMENT]
    ConfidenceTier.STRONG: 1.00,        # [ARCHITECTURAL REQUIREMENT]
    ConfidenceTier.CONTEXTUAL: 0.70,    # [PROVISIONAL PARAMETER]
    ConfidenceTier.UNVERIFIED: 0.30,    # [PROVISIONAL PARAMETER]
}

MIN_SIMILARITY_THRESHOLD = 0.15         # [PROVISIONAL PARAMETER] - Relevance noise floor
MANDATORY_WEIGHT_THRESHOLD = 2.5        # [ENGINEERING CHOICE] - I_j >= 2.5 is mandatory
CRITICAL_GAP_PENALTY_RATE = 8.0         # [PROVISIONAL PARAMETER] - Points deducted per missing mandatory skill
MAX_CRITICAL_GAP_PENALTY = 25.0         # [PROVISIONAL PARAMETER] - Penalty ceiling

STRONG_MATCH_THRESHOLD = 0.70           # [ARCHITECTURAL REQUIREMENT] - S_j >= 0.70
PARTIAL_MATCH_THRESHOLD = 0.45          # [ARCHITECTURAL REQUIREMENT] - 0.45 <= S_j < 0.70
WEAK_EVIDENCE_THRESHOLD = 0.15          # [ARCHITECTURAL REQUIREMENT] - 0.15 <= S_j < 0.45


class JRSScoringEngine:
    """Pure mathematical deterministic scoring engine for Job Readiness (Zero-LLM)."""

    @staticmethod
    def evaluate_requirement(
        req_id: str,
        requirement_text: str,
        category: Optional[str],
        importance_weight: float,
        retrieved_items: List[RetrievedEvidenceItem],
    ) -> RequirementScoreBreakdown:
        """
        Evaluates a single requirement clause against its top retrieved evidence node.
        Computes S_j = Sim(R_j, E_j) * C_j and assigns diagnostic status.
        """
        is_mandatory = importance_weight >= MANDATORY_WEIGHT_THRESHOLD

        # Case 1: Zero evidence retrieved or similarity is below the noise floor
        if not retrieved_items or retrieved_items[0].final_score < MIN_SIMILARITY_THRESHOLD:
            return RequirementScoreBreakdown(
                req_id=req_id,
                requirement_text=requirement_text,
                category=category,
                importance_weight=importance_weight,
                match_status=MatchStatus.MISSING,
                requirement_score=0.0,
                weighted_contribution=0.0,
                retrieval_similarity=0.0,
                confidence_tier=None,
                confidence_multiplier=0.0,
                is_mandatory=is_mandatory,
                is_critical_gap=is_mandatory,
                grounded_evidence=None,
                diagnostic_note=(
                    "CRITICAL GAP: Missing verified evidence for mandatory core requirement."
                    if is_mandatory
                    else "Missing evidence: No matching project or experience found in Career Memory."
                ),
            )

        # Case 2: Top-1 Evidence Node Pairing (Baseline Decision)
        top_node = retrieved_items[0]
        sim = max(0.0, min(1.0, float(top_node.final_score)))
        tier = top_node.confidence_tier
        mult = CONFIDENCE_MULTIPLIERS.get(tier, 0.30)
        s_j = max(0.0, min(1.0, sim * mult))
        weighted_contrib = importance_weight * s_j

        # Classify diagnostic status
        if s_j >= STRONG_MATCH_THRESHOLD:
            status_enum = MatchStatus.STRONG_MATCH
            note = "Strong match: Verified project code, metrics, or interview performance satisfies this requirement."
        elif s_j >= PARTIAL_MATCH_THRESHOLD:
            status_enum = MatchStatus.PARTIAL_MATCH
            note = "Partial match: Contextual experience found. Add a public code link or repository to elevate to Strong."
        elif s_j >= WEAK_EVIDENCE_THRESHOLD:
            status_enum = MatchStatus.WEAK_EVIDENCE
            note = "Weak evidence: Claim is an unverified skill bullet or peripheral mention. Vulnerable to technical grilling."
        else:
            status_enum = MatchStatus.MISSING
            note = "Insufficient relevance: Evidence is below practical qualification threshold."

        is_critical_gap = is_mandatory and (mult < 0.30 or status_enum == MatchStatus.MISSING)

        grounded_summary = GroundedEvidenceSummary(
            evidence_id=top_node.evidence_id,
            claim_text=top_node.claim_text,
            source_type=top_node.source_type,
            source_reference=top_node.source_reference,
            verifiable_url=top_node.verifiable_url,
            verified_skills=top_node.verified_skills,
            confidence_tier=tier,
            confidence_score=round(top_node.confidence_score, 4),
            retrieval_score=round(sim, 4),
        )

        return RequirementScoreBreakdown(
            req_id=req_id,
            requirement_text=requirement_text,
            category=category,
            importance_weight=importance_weight,
            match_status=status_enum,
            requirement_score=round(s_j, 4),
            weighted_contribution=round(weighted_contrib, 4),
            retrieval_similarity=round(sim, 4),
            confidence_tier=tier,
            confidence_multiplier=round(mult, 4),
            is_mandatory=is_mandatory,
            is_critical_gap=is_critical_gap,
            grounded_evidence=grounded_summary,
            diagnostic_note=note,
        )

    @classmethod
    def compute_jrs(
        cls,
        candidate_id: str,
        jd_id: str,
        jd_title: Optional[str],
        match_results: List[RequirementMatchResult],
        retrieval_mode: str,
        latency_ms: float = 0.0,
    ) -> JRSResponse:
        """
        Executes multi-criteria importance-weighted aggregation and critical gap deduction.
        Returns complete JRSResponse report.
        """
        if not match_results:
            raise ValueError("Cannot calculate JRS: requirements match list is empty.")

        breakdown: List[RequirementScoreBreakdown] = []
        total_weight = 0.0
        weighted_score_sum = 0.0
        missing_mandatory_count = 0

        # 1. Evaluate each requirement individually
        for match in match_results:
            item_breakdown = cls.evaluate_requirement(
                req_id=match.req_id,
                requirement_text=match.requirement_text,
                category=None,
                importance_weight=match.importance_weight,
                retrieved_items=match.retrieved_evidence,
            )
            breakdown.append(item_breakdown)
            total_weight += item_breakdown.importance_weight
            weighted_score_sum += item_breakdown.weighted_contribution

            if item_breakdown.is_critical_gap:
                missing_mandatory_count += 1

        # 2. Prevent division by zero (Defensive Protection)
        if total_weight <= 0.0:
            total_weight = float(len(match_results)) * 2.0

        # 3. Compute Base JRS in [0.0, 100.0]
        base_jrs = max(0.0, min(100.0, 100.0 * (weighted_score_sum / total_weight)))

        # 4. Compute Critical Gap Penalty P_critical
        raw_penalty = float(missing_mandatory_count) * CRITICAL_GAP_PENALTY_RATE
        critical_penalty = min(MAX_CRITICAL_GAP_PENALTY, raw_penalty)

        # 5. Final Bounded JRS Score
        final_jrs = max(0.0, min(100.0, base_jrs - critical_penalty))

        # 6. Synthesize Summary Counts & Gaps
        summary = JRSMatchSummary(
            total_requirements=len(breakdown),
            strong_matches=sum(1 for b in breakdown if b.match_status == MatchStatus.STRONG_MATCH),
            partial_matches=sum(1 for b in breakdown if b.match_status == MatchStatus.PARTIAL_MATCH),
            weak_evidence=sum(1 for b in breakdown if b.match_status == MatchStatus.WEAK_EVIDENCE),
            missing_requirements=sum(1 for b in breakdown if b.match_status == MatchStatus.MISSING),
            critical_gaps_count=missing_mandatory_count,
        )

        critical_gaps = [
            b.requirement_text for b in breakdown if b.is_critical_gap
        ]

        # Top Strengths: Requirements with highest scores (>= 0.70)
        top_strengths = [
            f"{b.requirement_text} ({b.match_status.value})"
            for b in sorted(breakdown, key=lambda x: x.requirement_score, reverse=True)
            if b.requirement_score >= STRONG_MATCH_THRESHOLD
        ][:3]

        # Top Improvements: Prioritize missing/weak requirements with highest importance weights
        top_improvements = []
        improvement_candidates = sorted(
            [b for b in breakdown if b.requirement_score < STRONG_MATCH_THRESHOLD],
            key=lambda x: (x.importance_weight, -x.requirement_score),
            reverse=True,
        )
        for cand in improvement_candidates[:3]:
            if cand.is_critical_gap or cand.match_status == MatchStatus.MISSING:
                top_improvements.append(
                    f"Prioritize building a project demonstrating: '{cand.requirement_text}' (Mandatory Core Skill)."
                )
            elif cand.match_status == MatchStatus.WEAK_EVIDENCE:
                top_improvements.append(
                    f"Elevate '{cand.requirement_text}' by adding a project repository or quantifiable metrics."
                )
            elif cand.match_status == MatchStatus.PARTIAL_MATCH:
                top_improvements.append(
                    f"Attach a public GitHub repository link for '{cand.requirement_text}' to verify code depth."
                )

        return JRSResponse(
            candidate_id=candidate_id,
            jd_id=jd_id,
            jd_title=jd_title,
            overall_jrs=round(final_jrs, 2),
            base_jrs=round(base_jrs, 2),
            critical_penalty=round(critical_penalty, 2),
            retrieval_mode=retrieval_mode,
            match_summary=summary,
            breakdown=breakdown,
            critical_gaps=critical_gaps,
            top_strengths=top_strengths,
            top_improvements=top_improvements,
            computation_latency_ms=round(latency_ms, 2),
            evaluated_at=datetime.now(timezone.utc).isoformat(),
        )


class JRSScoringService:
    """Application orchestration service connecting MongoDB and the JRS Engine."""

    def __init__(
        self,
        retrieval_service: Optional[EvidenceRetrievalService] = None,
        profile_repo: Optional[ProfileRepository] = None,
        jd_repo: Optional[JobDescriptionRepository] = None,
    ) -> None:
        self.retrieval_service = retrieval_service or EvidenceRetrievalService()
        self.profile_repo = profile_repo or ProfileRepository()
        self.jd_repo = jd_repo or JobDescriptionRepository()

    async def calculate_jrs(self, request: JRSRequest) -> JRSResponse:
        """Calculates full Job Readiness Score report for candidate against target JD."""
        start_time = time.perf_counter()

        # 1. Verify candidate profile exists
        profile = await self.profile_repo.get_by_candidate_id(request.candidate_id)
        if not profile:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Candidate profile '{request.candidate_id}' not found.",
            )

        # 2. Verify target JD exists
        jd: Optional[JobDescription] = await self.jd_repo.get_by_id(request.jd_id)
        if not jd:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Target Job Description '{request.jd_id}' not found.",
            )

        if not jd.requirements:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail=f"Job Description '{request.jd_id}' contains no extracted requirements to score against.",
            )

        # 3. Retrieve Grounded Evidence across all JD requirements via Phase 4 Engine
        match_req = MatchJDRequest(
            candidate_id=request.candidate_id,
            jd_id=request.jd_id,
            mode=request.retrieval_mode,
            alpha=request.alpha,
            stage1_top_k=request.stage1_top_k,
            final_top_k=3,
        )
        jd_match_response = await self.retrieval_service.match_target_jd(match_req)

        # 4. Compute Deterministic JRS
        calc_start = time.perf_counter()
        response = JRSScoringEngine.compute_jrs(
            candidate_id=request.candidate_id,
            jd_id=request.jd_id,
            jd_title=jd.title,
            match_results=jd_match_response.matches,
            retrieval_mode=request.retrieval_mode,
            latency_ms=(time.perf_counter() - start_time) * 1000.0,
        )

        logger.info(
            f"Calculated JRS={response.overall_jrs}% (Base={response.base_jrs}%, Penalty={response.critical_penalty}) "
            f"for candidate={request.candidate_id} against jd={request.jd_id}"
        )
        return response
