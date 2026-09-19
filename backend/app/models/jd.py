from enum import Enum
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field


class CategoryEnum(str, Enum):
    """Categorization of job requirements."""

    HARD_SKILL = "HARD_SKILL"
    DATABASE = "DATABASE"
    ARCHITECTURE = "ARCHITECTURE"
    TOOL = "TOOL"
    THEORETICAL = "THEORETICAL"
    SOFT_SKILL = "SOFT_SKILL"


class RequirementItem(BaseModel):
    """Granular requirement extracted from a job description."""

    req_id: str = Field(..., description="Unique identifier (e.g. req_01)")
    category: CategoryEnum = Field(CategoryEnum.HARD_SKILL, description="Requirement technical category")
    text: str = Field(..., description="Requirement sentence or clause")
    canonical_skills: List[str] = Field(default_factory=list, description="Canonical skills identified")
    importance_weight: float = Field(2.0, ge=1.0, le=3.0, description="Importance weight: 1.0 (low) to 3.0 (critical)")


class ParsedJobDescription(BaseModel):
    """Complete parsed job description representation."""

    title: str = Field(..., description="Role / Job Title")
    company: Optional[str] = Field(None, description="Hiring organization / company")
    requirements: List[RequirementItem] = Field(default_factory=list, description="Decomposed requirement list")
    interview_topics: List[str] = Field(default_factory=list, description="Synthesized technical interview themes")
    raw_text: str = Field(..., description="Sanitized original JD text")
    extraction_metadata: Dict[str, Any] = Field(default_factory=dict, description="Metadata on extraction performance")


class JDParseRequest(BaseModel):
    """Request payload for JD text analysis."""

    raw_text: str = Field(..., min_length=10, description="Full raw job description text")
    title: Optional[str] = Field(None, description="Optional job title if known")
    company: Optional[str] = Field(None, description="Optional company name if known")


class JobDescription(BaseModel):
    """Persistent job description document schema."""

    jd_id: str = Field(..., description="Unique business identifier (e.g. jd_backend_001)")
    title: str = Field(..., description="Role / Job Title")
    company: Optional[str] = Field(None, description="Hiring organization / company")
    raw_text: str = Field(..., description="Sanitized original JD text")
    requirements: List[RequirementItem] = Field(default_factory=list, description="Decomposed requirement list")
    interview_topics: List[str] = Field(default_factory=list, description="Synthesized technical interview themes")
    created_at: str = Field(..., description="ISO timestamp of initial ingestion")


class JDIngestResponse(BaseModel):
    """API response envelope after ingesting a target JD into MongoDB."""

    jd_id: str = Field(..., description="Persistent JD ID")
    job_description: JobDescription = Field(..., description="Persisted job description object")
    requirements_count: int = Field(..., description="Total granular requirements extracted")
    message: str = Field("Job description ingested and persisted successfully.", description="Status message")
