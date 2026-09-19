"""Service for orchestrating candidate profile ingestion, versioning, and evidence persistence."""
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional
from uuid import uuid4
import logging

from backend.app.db.repositories.profile_repo import ProfileRepository
from backend.app.db.repositories.evidence_repo import EvidenceRepository
from backend.app.models.profile import (
    AddProjectRequest,
    AuditSnapshot,
    CandidateProfile,
    EvidenceNode,
    ParsedResume,
    ProfileIngestResponse,
    ProjectItem,
)
from backend.app.services.parser.normalizer import extract_metrics, extract_skills_from_text
from backend.app.services.parser.resume_parser import ResumeParser

logger = logging.getLogger("careerx.service.profile")


class ProfilePersistenceService:
    """Manages the lifecycle, version updates, and evidence graph of candidate career memory."""

    def __init__(
        self,
        profile_repo: Optional[ProfileRepository] = None,
        evidence_repo: Optional[EvidenceRepository] = None,
    ) -> None:
        self.profile_repo = profile_repo or ProfileRepository()
        self.evidence_repo = evidence_repo or EvidenceRepository()

    async def ingest_resume_bytes(
        self,
        file_bytes: bytes,
        filename: str,
        candidate_id: Optional[str] = None,
    ) -> ProfileIngestResponse:
        """
        Parses resume bytes using Phase 2 ResumeParser, then persists or updates candidate profile
        under the Clean Replacement + Timestamp Audit strategy.
        """
        # 1. Deterministic Phase 2 parsing
        parsed: ParsedResume = ResumeParser.parse_bytes(file_bytes, filename)
        now_iso = datetime.now(timezone.utc).isoformat()

        # 2. Check if this is an existing candidate update
        existing: Optional[CandidateProfile] = None
        if candidate_id:
            existing = await self.profile_repo.get_by_candidate_id(candidate_id)
        elif parsed.email:
            existing = await self.profile_repo.get_by_email(parsed.email)

        if existing:
            # ---------------------------------------------------------
            # Profile Update Flow (Clean Replacement + Timestamp Audit)
            # ---------------------------------------------------------
            cid = existing.candidate_id
            snapshot = AuditSnapshot(
                version=existing.version,
                archived_at=now_iso,
                filename=filename,
                summary=f"Archived version {existing.version} on re-upload of {filename}.",
            )
            new_version = existing.version + 1
            updated_audit = existing.audit_history + [snapshot]

            # Deactivate previous resume-derived evidence
            await self.evidence_repo.deactivate_resume_evidence(cid, now_iso)

            # Generate new evidence nodes from newly uploaded resume
            new_nodes = self._decompose_evidence(cid, parsed, now_iso)
            if new_nodes:
                await self.evidence_repo.bulk_insert(new_nodes)

            # Cleanly replace active resume-derived profile state while preserving candidate_id and history
            update_data = {
                "full_name": parsed.full_name,
                "email": parsed.email or existing.email,
                "phone": parsed.phone or existing.phone,
                "github_username": parsed.github_url.split("/")[-1] if parsed.github_url else existing.github_username,
                "linkedin_url": parsed.linkedin_url or existing.linkedin_url,
                "portfolio_url": parsed.portfolio_url or existing.portfolio_url,
                "education": [e.model_dump() for e in parsed.education],
                "experiences": [e.model_dump() for e in parsed.experiences],
                "projects": [p.model_dump() for p in parsed.projects],
                "raw_skills": parsed.skills,
                "version": new_version,
                "audit_history": [s.model_dump() for s in updated_audit],
                "updated_at": now_iso,
            }

            updated_profile = await self.profile_repo.update_profile(cid, update_data)
            active_nodes = await self.evidence_repo.get_active_by_candidate_id(cid)

            return ProfileIngestResponse(
                candidate_id=cid,
                profile=updated_profile or existing,
                active_evidence_count=len(active_nodes),
                version=new_version,
                message=f"Candidate profile successfully updated to version {new_version}.",
            )

        else:
            # ---------------------------------------------------------
            # First-Time Ingestion Flow
            # ---------------------------------------------------------
            cid = candidate_id or f"usr_{uuid4().hex[:8]}"
            github_user = parsed.github_url.split("/")[-1] if parsed.github_url else None

            new_profile = CandidateProfile(
                candidate_id=cid,
                full_name=parsed.full_name,
                email=parsed.email,
                phone=parsed.phone,
                github_username=github_user,
                linkedin_url=parsed.linkedin_url,
                portfolio_url=parsed.portfolio_url,
                education=parsed.education,
                experiences=parsed.experiences,
                projects=parsed.projects,
                raw_skills=parsed.skills,
                version=1,
                audit_history=[],
                created_at=now_iso,
                updated_at=now_iso,
            )

            await self.profile_repo.insert_profile(new_profile)

            # Generate initial evidence nodes
            nodes = self._decompose_evidence(cid, parsed, now_iso)
            if nodes:
                await self.evidence_repo.bulk_insert(nodes)

            return ProfileIngestResponse(
                candidate_id=cid,
                profile=new_profile,
                active_evidence_count=len(nodes),
                version=1,
                message="Candidate career profile ingested and initialized at version 1.",
            )

    def _decompose_evidence(
        self, candidate_id: str, parsed: ParsedResume, timestamp_iso: str
    ) -> List[EvidenceNode]:
        """Decomposes projects and experiences into atomic, auditable EvidenceNodes."""
        nodes: List[EvidenceNode] = []

        # 1. Project-derived evidence nodes
        for proj in parsed.projects:
            has_repo = bool(proj.repo_url)
            tier = "STRONG" if has_repo else "CONTEXTUAL"
            score = 1.0 if has_repo else 0.75

            # If project has bullets, create node for each accomplishment claim
            if proj.bullets:
                for bullet in proj.bullets:
                    b_skills, _ = extract_skills_from_text(bullet)
                    nodes.append(
                        EvidenceNode(
                            evidence_id=f"ev_{uuid4().hex[:8]}",
                            candidate_id=candidate_id,
                            claim_text=bullet,
                            source_type="project_bullet",
                            source_reference=proj.title,
                            verifiable_url=proj.repo_url,
                            verified_skills=b_skills or proj.tech_stack,
                            confidence_tier=tier,
                            confidence_score=score,
                            is_active=True,
                            archived_at=None,
                            embedding=None,
                            created_at=timestamp_iso,
                        )
                    )
            else:
                # Fallback project claim node
                nodes.append(
                    EvidenceNode(
                        evidence_id=f"ev_{uuid4().hex[:8]}",
                        candidate_id=candidate_id,
                        claim_text=f"Built {proj.title} using {', '.join(proj.tech_stack)}",
                        source_type="project_bullet",
                        source_reference=proj.title,
                        verifiable_url=proj.repo_url,
                        verified_skills=proj.tech_stack,
                        confidence_tier=tier,
                        confidence_score=score,
                        is_active=True,
                        archived_at=None,
                        embedding=None,
                        created_at=timestamp_iso,
                    )
                )

        # 2. Experience-derived evidence nodes
        for exp in parsed.experiences:
            for bullet in exp.bullets:
                b_skills, _ = extract_skills_from_text(bullet)
                nodes.append(
                    EvidenceNode(
                        evidence_id=f"ev_{uuid4().hex[:8]}",
                        candidate_id=candidate_id,
                        claim_text=bullet,
                        source_type="experience_bullet",
                        source_reference=f"{exp.company} - {exp.role}",
                        verifiable_url=None,
                        verified_skills=b_skills,
                        confidence_tier="CONTEXTUAL",
                        confidence_score=0.75,
                        is_active=True,
                        archived_at=None,
                        embedding=None,
                        created_at=timestamp_iso,
                    )
                )

        return nodes

    async def add_standalone_project(
        self, candidate_id: str, req: AddProjectRequest
    ) -> CandidateProfile:
        """
        Manually append a project to a candidate's portfolio and mint corresponding evidence.
        Demonstrates additive Career Memory expansion.
        """
        existing = await self.profile_repo.get_by_candidate_id(candidate_id)
        if not existing:
            raise ValueError(f"Candidate profile with candidate_id='{candidate_id}' not found.")

        now_iso = datetime.now(timezone.utc).isoformat()
        bullets_text = " ".join(req.bullets)
        detected_metrics = extract_metrics(bullets_text)

        new_project = ProjectItem(
            title=req.title,
            repo_url=req.repo_url,
            live_url=req.live_url,
            tech_stack=req.tech_stack,
            bullets=req.bullets,
            metrics_detected=detected_metrics,
        )

        updated_profile = await self.profile_repo.append_project(candidate_id, new_project)

        # Mint new evidence nodes with source_type="manual_portfolio"
        has_repo = bool(req.repo_url)
        tier = "STRONG" if has_repo else "CONTEXTUAL"
        score = 1.0 if has_repo else 0.75

        new_nodes: List[EvidenceNode] = []
        if req.bullets:
            for bullet in req.bullets:
                b_skills, _ = extract_skills_from_text(bullet)
                new_nodes.append(
                    EvidenceNode(
                        evidence_id=f"ev_{uuid4().hex[:8]}",
                        candidate_id=candidate_id,
                        claim_text=bullet,
                        source_type="manual_portfolio",
                        source_reference=req.title,
                        verifiable_url=req.repo_url,
                        verified_skills=b_skills or req.tech_stack,
                        confidence_tier=tier,
                        confidence_score=score,
                        is_active=True,
                        archived_at=None,
                        embedding=None,
                        created_at=now_iso,
                    )
                )
        else:
            new_nodes.append(
                EvidenceNode(
                    evidence_id=f"ev_{uuid4().hex[:8]}",
                    candidate_id=candidate_id,
                    claim_text=f"Engineered {req.title} with {', '.join(req.tech_stack)}",
                    source_type="manual_portfolio",
                    source_reference=req.title,
                    verifiable_url=req.repo_url,
                    verified_skills=req.tech_stack,
                    confidence_tier=tier,
                    confidence_score=score,
                    is_active=True,
                    archived_at=None,
                    embedding=None,
                    created_at=now_iso,
                )
            )

        if new_nodes:
            await self.evidence_repo.bulk_insert(new_nodes)

        return updated_profile or existing

    async def get_profile(self, candidate_id: str) -> Optional[CandidateProfile]:
        """Fetch candidate career profile."""
        return await self.profile_repo.get_by_candidate_id(candidate_id)

    async def get_evidence(
        self, candidate_id: str, active_only: bool = True
    ) -> List[EvidenceNode]:
        """Fetch evidence nodes for a candidate."""
        if active_only:
            return await self.evidence_repo.get_active_by_candidate_id(candidate_id)
        return await self.evidence_repo.get_all_by_candidate_id(candidate_id)
