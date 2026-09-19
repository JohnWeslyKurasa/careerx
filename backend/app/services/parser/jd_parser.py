import re
import time
from typing import Any, Dict, List, Optional

from backend.app.models.jd import (
    CategoryEnum,
    ParsedJobDescription,
    RequirementItem,
)
from backend.app.services.parser.normalizer import (
    extract_skills_from_text,
    normalize_text,
)

HIGH_WEIGHT_KEYWORDS = [
    "must have",
    "required",
    "essential",
    "mandatory",
    "proven experience",
    "minimum",
    "strong proficiency",
    "deep understanding",
    "at least",
]

LOW_WEIGHT_KEYWORDS = [
    "nice to have",
    "plus",
    "preferred",
    "bonus",
    "optional",
    "good to have",
    "familiarity with",
]


class JobDescriptionParser:
    """
    Deterministic Job Description Parsing Service.
    Decomposes raw JD text into granular requirement items, canonical skill tags,
    importance weights, and synthesized interview themes.
    """

    @classmethod
    def parse_text(
        cls,
        raw_text: str,
        title: Optional[str] = None,
        company: Optional[str] = None,
    ) -> ParsedJobDescription:
        """Parse raw job description text into a structured ParsedJobDescription model."""
        start_time = time.perf_counter()

        sanitized_text = normalize_text(raw_text)
        if len(sanitized_text.strip()) < 20:
            raise ValueError("Job description text is too short to extract requirements.")

        inferred_title = title or cls._infer_job_title(sanitized_text)
        inferred_company = company or cls._infer_company(sanitized_text)

        requirements = cls._extract_requirements(sanitized_text)
        interview_topics = cls._synthesize_interview_topics(requirements)

        elapsed_ms = int((time.perf_counter() - start_time) * 1000)

        return ParsedJobDescription(
            title=inferred_title,
            company=inferred_company,
            requirements=requirements,
            interview_topics=interview_topics,
            raw_text=sanitized_text,
            extraction_metadata={
                "character_count": len(sanitized_text),
                "requirements_extracted": len(requirements),
                "parsing_time_ms": elapsed_ms,
            },
        )

    @classmethod
    def _infer_job_title(cls, text: str) -> str:
        """Infer job title from the opening lines of a JD."""
        lines = [l.strip() for l in text.splitlines() if l.strip()]
        for line in lines[:4]:
            lower = line.lower()
            if any(term in lower for term in ["engineer", "developer", "architect", "intern", "scientist", "analyst"]):
                clean = re.sub(r"^(job title|role|position)\s*[:=]\s*", "", line, flags=re.IGNORECASE).strip()
                return clean[:60]

        return "Software Engineer"

    @classmethod
    def _infer_company(cls, text: str) -> Optional[str]:
        """Infer company name from common JD patterns."""
        match = re.search(r"\b(?:at|with|join)\s+([A-Z][A-Za-z0-9\s&]+?)(?:\s+(?:is looking|is seeking|team|\.|\n))", text)
        if match:
            company_candidate = match.group(1).strip()
            if len(company_candidate) < 40:
                return company_candidate

        return None

    @classmethod
    def _extract_requirements(cls, text: str) -> List[RequirementItem]:
        """Decompose text into individual requirement clauses."""
        requirements: List[RequirementItem] = []
        lines = text.splitlines()

        candidate_clauses: List[str] = []

        for line in lines:
            line_str = line.strip()
            if not line_str:
                continue

            # Check if line is a bullet item
            if line_str.startswith("-") or line_str.startswith("•") or line_str.startswith("*"):
                clause = line_str.lstrip("-•* ").strip()
                if len(clause) > 8:
                    candidate_clauses.append(clause)
            elif any(
                keyword in line_str.lower()
                for keyword in ["experience in", "experience with", "knowledge of", "proficient", "ability to", "hands-on"]
            ):
                candidate_clauses.append(line_str)

        # Fallback: if no bullets were found, split by sentences
        if not candidate_clauses:
            candidate_clauses = [
                s.strip() for s in re.split(r"[.;]\s+", text) if len(s.strip()) > 15
            ]

        req_counter = 1
        for clause in candidate_clauses:
            skills, skill_categories = extract_skills_from_text(clause)
            if not skills and len(clause) < 25:
                continue

            # Determine Category
            category = CategoryEnum.HARD_SKILL
            if skills:
                primary_skill = skills[0]
                cat_str = skill_categories.get(primary_skill, "HARD_SKILL")
                try:
                    category = CategoryEnum(cat_str)
                except ValueError:
                    category = CategoryEnum.HARD_SKILL
            elif "design" in clause.lower() or "architecture" in clause.lower():
                category = CategoryEnum.ARCHITECTURE
            elif "communication" in clause.lower() or "team" in clause.lower() or "agile" in clause.lower():
                category = CategoryEnum.SOFT_SKILL

            # Determine Weight
            lower_clause = clause.lower()
            weight = 2.0
            if any(k in lower_clause for k in HIGH_WEIGHT_KEYWORDS):
                weight = 3.0
            elif any(k in lower_clause for k in LOW_WEIGHT_KEYWORDS):
                weight = 1.0

            req_id = f"req_{req_counter:02d}"
            requirements.append(
                RequirementItem(
                    req_id=req_id,
                    category=category,
                    text=clause,
                    canonical_skills=skills,
                    importance_weight=weight,
                )
            )
            req_counter += 1

        return requirements

    @classmethod
    def _synthesize_interview_topics(cls, requirements: List[RequirementItem]) -> List[str]:
        """Synthesize 3-6 core technical interview themes from requirements."""
        topics: List[str] = []
        unique_skills: Set[str] = set()

        for req in requirements:
            for skill in req.canonical_skills:
                unique_skills.add(skill)

        # Group high-frequency domains
        if "FastAPI" in unique_skills or "Python" in unique_skills:
            topics.append("Async Python & FastAPI Architecture")
        if "MongoDB" in unique_skills or "PostgreSQL" in unique_skills or "Redis" in unique_skills:
            topics.append("Database Schema Design & In-Memory Caching")
        if "Docker" in unique_skills or "Kubernetes" in unique_skills or "CI/CD" in unique_skills:
            topics.append("Containerization, Deployment & CI/CD Pipelines")
        if "REST" in unique_skills or "Microservices" in unique_skills:
            topics.append("RESTful API Standards & Service Decomposition")
        if "System Design" in unique_skills or "Data Structures & Algorithms" in unique_skills:
            topics.append("System Scalability, Concurrency & Data Structures")

        # Fallback if specific frameworks not matched
        if not topics:
            for skill in list(unique_skills)[:4]:
                topics.append(f"{skill} Practical Application & Best Practices")

        return topics[:5]
