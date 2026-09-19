from fastapi import APIRouter
from backend.app.api.v1.health import router as health_router
from backend.app.api.v1.endpoints.profile import router as profile_router
from backend.app.api.v1.endpoints.jd import router as jd_router
from backend.app.api.v1.endpoints.retrieval import router as retrieval_router
from backend.app.api.v1.endpoints.jrs import router as jrs_router

api_v1_router = APIRouter()

# Register V1 Sub-routers
api_v1_router.include_router(health_router, prefix="", tags=["Health"])
api_v1_router.include_router(profile_router, prefix="/profile", tags=["Candidate Profile"])
api_v1_router.include_router(jd_router, prefix="/jd", tags=["Job Description"])
api_v1_router.include_router(retrieval_router, prefix="/retrieval", tags=["Evidence Retrieval & Hybrid RAG"])
api_v1_router.include_router(jrs_router, prefix="", tags=["Job Readiness Scoring"])

# Future Phase Routers will be registered here cleanly:
# api_v1_router.include_router(match_router, prefix="/match", tags=["Matching & JRS"])
# api_v1_router.include_router(interview_router, prefix="/interview", tags=["Mock Interview"])

