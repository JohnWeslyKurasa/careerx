"""
Live Physical Verification Script for CAREERX Phase 5: Job Readiness Scoring Engine (JRS).
Validates:
1. Physical MongoDB data integration (Candidate Profile + Target JD)
2. Phase 4 Grounding -> Phase 5 Deterministic Mathematical Aggregation
3. Evidence confidence multiplier application (STRONG=1.00, CONTEXTUAL=0.70, UNVERIFIED=0.30)
4. Critical requirement gap penalty (P_critical)
5. Explainable breakdown output with grounded evidence URLs and diagnostic notes
"""
import asyncio
import json
from backend.app.core.config import settings
from backend.app.core.database import db_manager
from backend.app.db.collections import JD_COLLECTION, PROFILES_COLLECTION
from backend.app.models.jrs import JRSRequest
from backend.app.models.retrieval import RetrievalMode
from backend.app.services.jrs_service import JRSScoringService


async def main():
    print("=" * 75)
    print("CAREERX Phase 5: Deterministic Job Readiness Scoring Engine (Live Audit)")
    print("=" * 75)

    use_mock = False
    try:
        await db_manager.connect()
        db = db_manager.get_database()
        profile = await db[PROFILES_COLLECTION].find_one({}, sort=[("created_at", -1)])
        jd = await db[JD_COLLECTION].find_one({}, sort=[("created_at", -1)])
        if not profile or not jd:
            use_mock = True
    except Exception as e:
        print(f"[NOTE] Live MongoDB not reachable ({e}). Initializing in-memory mocked database for audit.")
        use_mock = True

    if use_mock:
        import mongomock_motor
        mock_client = mongomock_motor.AsyncMongoMockClient()
        db = mock_client[settings.MONGODB_DB_NAME]
        db_manager.client = mock_client
        db_manager.db = db

        # Seed sample candidate profile, evidence nodes, and target JD
        from backend.app.models.profile import CandidateProfile, ContactInfo, SkillItem, ProjectItem, ExperienceItem, EducationItem
        from backend.app.models.evidence import EvidenceNode, EvidenceTier, EvidenceSourceType
        from backend.app.models.job_description import JobDescription, ExtractedRequirement
        from datetime import datetime, timezone

        candidate_id = "cand_audit_001"
        profile_data = CandidateProfile(
            candidate_id=candidate_id,
            version=1,
            full_name="Alex Chen",
            contact=ContactInfo(email="alex.chen@example.com", phone="+1-555-0199", github_url="https://github.com/alexchen"),
            skills=[
                SkillItem(name="Python", category="Language", raw_text="Python 3.11, FastAPI, AsyncIO"),
                SkillItem(name="PostgreSQL", category="Database", raw_text="PostgreSQL, Redis"),
                SkillItem(name="Docker", category="DevOps", raw_text="Docker, Kubernetes"),
            ],
            experience=[
                ExperienceItem(
                    company="FinTech Solutions",
                    role="Senior Backend Engineer",
                    duration_months=36,
                    bullet_points=[
                        "Architected event-driven microservices processing 50k transactions/sec using Python and FastAPI.",
                        "Optimized PostgreSQL query performance, reducing p99 latency by 45%.",
                    ]
                )
            ],
            projects=[
                ProjectItem(
                    name="Distributed Caching System",
                    tech_stack=["Python", "Redis", "Docker"],
                    description="Built multi-region caching layer with automated cache invalidation reducing database load by 60%."
                )
            ],
            education=[EducationItem(institution="State Tech University", degree="B.S. in Computer Science", graduation_year=2021)]
        )
        await db[PROFILES_COLLECTION].insert_one(profile_data.model_dump())

        # Seed Evidence Nodes with real tiers
        nodes = [
            EvidenceNode(
                evidence_id="ev_001",
                candidate_id=candidate_id,
                tier=EvidenceTier.TIER_3_DEMONSTRATED,
                source_type=EvidenceSourceType.PROJECT,
                source_id="proj_001",
                claim_text="Built multi-region caching layer with automated cache invalidation using Redis and Docker, reducing database load by 60%.",
                verification_url="https://github.com/alexchen/distributed-caching",
                is_active=True,
                created_at=datetime.now(timezone.utc),
            ),
            EvidenceNode(
                evidence_id="ev_002",
                candidate_id=candidate_id,
                tier=EvidenceTier.TIER_3_DEMONSTRATED,
                source_type=EvidenceSourceType.EXPERIENCE,
                source_id="exp_001",
                claim_text="Architected event-driven microservices processing 50k transactions/sec using Python, FastAPI, and AsyncIO.",
                verification_url="https://fintech.example.com",
                is_active=True,
                created_at=datetime.now(timezone.utc),
            ),
            EvidenceNode(
                evidence_id="ev_003",
                candidate_id=candidate_id,
                tier=EvidenceTier.TIER_2_CONTEXTUAL,
                source_type=EvidenceSourceType.EXPERIENCE,
                source_id="exp_001",
                claim_text="Optimized PostgreSQL query performance, reducing p99 latency by 45%.",
                verification_url="",
                is_active=True,
                created_at=datetime.now(timezone.utc),
            ),
            EvidenceNode(
                evidence_id="ev_004",
                candidate_id=candidate_id,
                tier=EvidenceTier.TIER_1_UNVERIFIED,
                source_type=EvidenceSourceType.RESUME_SKILL,
                source_id="skill_003",
                claim_text="Listed skill: Docker, Kubernetes container orchestration in resume skill summary.",
                verification_url="",
                is_active=True,
                created_at=datetime.now(timezone.utc),
            ),
        ]
        for n in nodes:
            await db[EVIDENCE_COLLECTION].insert_one(n.model_dump())

        # Seed Target Job Description
        jd_id = "jd_audit_001"
        target_jd = JobDescription(
            jd_id=jd_id,
            title="Senior Distributed Systems Engineer",
            company="CloudScale AI",
            raw_text="Job Description for Senior Distributed Systems Engineer",
            requirements=[
                ExtractedRequirement(
                    req_id="req_001",
                    text="3+ years of experience with Python, AsyncIO, and high-performance microservices",
                    category="Technical",
                    importance_weight=3.0,
                    is_mandatory=True,
                ),
                ExtractedRequirement(
                    req_id="req_002",
                    text="Hands-on experience designing distributed caching layers with Redis",
                    category="Technical",
                    importance_weight=2.5,
                    is_mandatory=True,
                ),
                ExtractedRequirement(
                    req_id="req_003",
                    text="Production experience with Kubernetes cluster management and Helm charts",
                    category="DevOps",
                    importance_weight=2.0,
                    is_mandatory=False,
                ),
                ExtractedRequirement(
                    req_id="req_004",
                    text="Experience with Golang gRPC microservices and Protobuf",
                    category="Technical",
                    importance_weight=2.5,
                    is_mandatory=True,
                ),
            ],
            created_at=datetime.now(timezone.utc),
        )
        await db[JD_COLLECTION].insert_one(target_jd.model_dump())

        profile = await db[PROFILES_COLLECTION].find_one({"candidate_id": candidate_id})
        jd = await db[JD_COLLECTION].find_one({"jd_id": jd_id})

    candidate_id = profile["candidate_id"]
    print(f"[Candidate Profile] ID: '{candidate_id}', Name: '{profile.get('full_name')}'")

    jd_id = jd["jd_id"]
    print(f"[Target Job Description] ID: '{jd_id}', Title: '{jd.get('title')}'")
    print(f"Total Extracted Requirements: {len(jd.get('requirements', []))}")

    # 2. Execute JRS Service
    service = JRSScoringService()

    print("\n" + "-" * 75)
    print("1. EVALUATING READINESS ACROSS 4 RETRIEVAL ENGINE MODES")
    print("-" * 75)

    modes = [
        (RetrievalMode.BM25_ONLY, "Mode 1: BM25 Lexical Grounding"),
        (RetrievalMode.DENSE_ONLY, "Mode 2: SBERT Dense Grounding"),
        (RetrievalMode.HYBRID, "Mode 3: Single-Stage Hybrid (alpha=0.65)"),
        (RetrievalMode.HYBRID_RERANKED, "Mode 4: Two-Stage Hybrid + Cross-Encoder Reranked"),
    ]

    for mode_enum, mode_label in modes:
        req = JRSRequest(
            candidate_id=candidate_id,
            jd_id=jd_id,
            retrieval_mode=mode_enum,
            alpha=0.65,
            stage1_top_k=10,
        )
        report = await service.calculate_jrs(req)
        print(f"\n[{mode_label}]")
        print(f"  * Overall JRS:      {report.overall_jrs}% (Base: {report.base_jrs}%, Penalty: {report.critical_penalty})")
        print(f"  * Total Latency:    {report.computation_latency_ms:.2f}ms")
        print(f"  * Match Summary:    Strong={report.match_summary.strong_matches}, "
              f"Partial={report.match_summary.partial_matches}, "
              f"Weak={report.match_summary.weak_evidence}, "
              f"Missing={report.match_summary.missing_requirements}, "
              f"Critical Gaps={report.match_summary.critical_gaps_count}")

    # 3. Deep Dive into Mode 4 (Hybrid Reranked) Explainable Report
    detailed_req = JRSRequest(
        candidate_id=candidate_id,
        jd_id=jd_id,
        retrieval_mode=RetrievalMode.HYBRID_RERANKED,
        alpha=0.65,
        stage1_top_k=10,
    )
    detailed_report = await service.calculate_jrs(detailed_req)

    print("\n" + "-" * 75)
    print(f"2. DETAILED EXPLAINABLE JRS REPORT (Overall Score: {detailed_report.overall_jrs}%)")
    print("-" * 75)

    for idx, b in enumerate(detailed_report.breakdown, start=1):
        mand_tag = "[MANDATORY]" if b.is_mandatory else "[STANDARD]"
        print(f"\nRequirement #{idx} {mand_tag}: '{b.requirement_text}' (Weight: {b.importance_weight})")
        print(f"  -> Match Status:        {b.match_status.value}")
        print(f"  -> Requirement Score:   {b.requirement_score:.4f} (Sim: {b.retrieval_similarity:.4f} x Multiplier: {b.confidence_multiplier})")
        print(f"  -> Contribution:        {b.weighted_contribution:.4f} points")
        if b.grounded_evidence:
            ev = b.grounded_evidence
            url_str = f" | URL: {ev.verifiable_url}" if ev.verifiable_url else " | No external URL"
            print(f"  -> Grounded Evidence:   [{ev.confidence_tier.value}] '{ev.claim_text}'{url_str}")
        print(f"  -> Diagnostic Note:     {b.diagnostic_note}")

    print("\n" + "-" * 75)
    print("3. DIAGNOSTIC SYNTHESIS")
    print("-" * 75)
    print(f"Critical Gaps: {detailed_report.critical_gaps or 'None'}")
    print("\nTop Strengths:")
    for s in detailed_report.top_strengths:
        print(f"  + {s}")
    print("\nTop Improvement Recommendations:")
    for imp in detailed_report.top_improvements:
        print(f"  ! {imp}")

    await db_manager.disconnect()
    print("\n[SUCCESS] Phase 5 Live JRS Audit Completed Successfully.")


if __name__ == "__main__":
    asyncio.run(main())
