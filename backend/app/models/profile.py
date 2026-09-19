from enum import Enum
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field


class ConfidenceTier(str, Enum):
    """The 4-tier confidence hierarchy in CAREERX Evidence Model."""
    STRONG = "STRONG"
    CONTEXTUAL = "CONTEXTUAL"
    UNVERIFIED = "UNVERIFIED"
    DEMONSTRATED = "DEMONSTRATED"


class EducationItem(BaseModel):
    """Structured model for a single education entry."""

    institution: str = Field(..., description="College, university, or school name")
    degree: str = Field(..., description="Degree obtained or pursued (e.g. B.Tech Computer Science)")
    major: Optional[str] = Field(None, description="Major or field of study")
    gpa: Optional[float] = Field(None, description="GPA or percentage if reported")
    start_year: Optional[int] = Field(None, description="Year studies commenced")
    grad_year: Optional[int] = Field(None, description="Year of graduation or expected graduation")


class ExperienceItem(BaseModel):
    """Structured model for a single work experience or internship entry."""

    company: str = Field(..., description="Organization or company name")
    role: str = Field(..., description="Job role or internship title")
    duration: Optional[str] = Field(None, description="Duration string (e.g. May 2025 - Aug 2025)")
    bullets: List[str] = Field(default_factory=list, description="Extracted accomplishment bullet points")


class ProjectItem(BaseModel):
    """Structured model for a candidate technical project."""

    title: str = Field(..., description="Project name / title")
    repo_url: Optional[str] = Field(None, description="Verifiable GitHub repository URL if present")
    live_url: Optional[str] = Field(None, description="Live deployment or demo URL if present")
    tech_stack: List[str] = Field(default_factory=list, description="Technologies, languages, frameworks detected")
    bullets: List[str] = Field(default_factory=list, description="Project accomplishment bullet points")
    metrics_detected: List[str] = Field(default_factory=list, description="Quantifiable metrics or numbers detected")


class ParsedResume(BaseModel):
    """Complete parsed candidate resume representation."""

    full_name: str = Field(..., description="Candidate full name")
    email: Optional[str] = Field(None, description="Email address")
    phone: Optional[str] = Field(None, description="Contact phone number")
    github_url: Optional[str] = Field(None, description="GitHub profile URL")
    linkedin_url: Optional[str] = Field(None, description="LinkedIn profile URL")
    portfolio_url: Optional[str] = Field(None, description="Personal portfolio or website URL")

    education: List[EducationItem] = Field(default_factory=list, description="Education records")
    experiences: List[ExperienceItem] = Field(default_factory=list, description="Work experiences & internships")
    projects: List[ProjectItem] = Field(default_factory=list, description="Technical projects")
    skills: List[str] = Field(default_factory=list, description="All canonical skills detected across sections")

    raw_text: Optional[str] = Field(None, description="Sanitized full-text representation")
    extraction_metadata: Dict[str, Any] = Field(default_factory=dict, description="Metadata on extraction performance")


class AuditSnapshot(BaseModel):
    """Archival snapshot recorded whenever a candidate profile version updates."""

    version: int = Field(..., description="Archived profile version number")
    archived_at: str = Field(..., description="ISO timestamp when version was archived")
    filename: Optional[str] = Field(None, description="Filename of the resume uploaded for this version")
    summary: Optional[str] = Field(None, description="Summary notes of changes or updates")


class CandidateProfile(BaseModel):
    """Persistent candidate career profile document schema."""

    candidate_id: str = Field(..., description="Unique business identifier (e.g. usr_98a7f1e2)")
    full_name: str = Field(..., description="Candidate full name")
    email: Optional[str] = Field(None, description="Primary email address")
    phone: Optional[str] = Field(None, description="Contact phone number")
    github_username: Optional[str] = Field(None, description="GitHub username extracted or linked")
    linkedin_url: Optional[str] = Field(None, description="LinkedIn profile URL")
    portfolio_url: Optional[str] = Field(None, description="Portfolio or website link")

    education: List[EducationItem] = Field(default_factory=list, description="Academic records")
    experiences: List[ExperienceItem] = Field(default_factory=list, description="Work experiences & internships")
    projects: List[ProjectItem] = Field(default_factory=list, description="Active portfolio projects")
    raw_skills: List[str] = Field(default_factory=list, description="Aggregated canonical technical skills")

    version: int = Field(1, description="Monotonically incrementing profile version number")
    audit_history: List[AuditSnapshot] = Field(default_factory=list, description="History of past versions & updates")
    created_at: str = Field(..., description="ISO timestamp of initial creation")
    updated_at: str = Field(..., description="ISO timestamp of most recent update")


class EvidenceNode(BaseModel):
    """Granular, auditable evidence item supporting career memory."""

    evidence_id: str = Field(..., description="Unique evidence identifier (e.g. ev_01j7x8a9)")
    candidate_id: str = Field(..., description="Foreign reference to owning candidate_id")
    claim_text: str = Field(..., description="Atomic technical accomplishment or capability claim")
    source_type: str = Field(..., description="Evidence origin: experience_bullet, project_bullet, manual_portfolio, interview_transcript")
    source_reference: str = Field(..., description="Contextual origin (e.g. project title or company role)")
    verifiable_url: Optional[str] = Field(None, description="Publicly verifiable link (e.g. GitHub repo)")
    verified_skills: List[str] = Field(default_factory=list, description="Canonical skills confirmed in this claim")
    confidence_tier: str = Field("CONTEXTUAL", description="Confidence tier: STRONG, CONTEXTUAL, UNVERIFIED, DEMONSTRATED")
    confidence_score: float = Field(0.75, ge=0.0, le=1.0, description="Numerical confidence value")
    is_active: bool = Field(True, description="True if this evidence is current; False if archived/deleted")
    archived_at: Optional[str] = Field(None, description="ISO timestamp when deactivated if applicable")
    embedding: Optional[List[float]] = Field(None, description="384-dimensional dense vector embedding (populated in Phase 4)")
    created_at: str = Field(..., description="ISO timestamp of evidence generation")


class ProfileIngestResponse(BaseModel):
    """API response envelope after ingesting a resume into MongoDB."""

    candidate_id: str = Field(..., description="Persistent candidate ID")
    profile: CandidateProfile = Field(..., description="Persisted profile object")
    active_evidence_count: int = Field(..., description="Number of active evidence nodes created/maintained")
    version: int = Field(..., description="Active profile version number")
    message: str = Field("Profile ingested and persisted successfully.", description="Status message")


class AddProjectRequest(BaseModel):
    """Request payload for manually adding a standalone portfolio project."""

    title: str = Field(..., min_length=2, description="Project title")
    repo_url: Optional[str] = Field(None, description="GitHub repository URL")
    live_url: Optional[str] = Field(None, description="Live demo or deployment URL")
    tech_stack: List[str] = Field(default_factory=list, description="Technologies used")
    bullets: List[str] = Field(default_factory=list, description="Accomplishment bullet points")
