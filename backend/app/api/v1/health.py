from fastapi import APIRouter, status
from backend.app.core.config import settings
from backend.app.core.database import db_manager
from backend.app.models.health import HealthResponse

router = APIRouter(tags=["Health & Monitoring"])


@router.get(
    "/health",
    response_model=HealthResponse,
    status_code=status.HTTP_200_OK,
    summary="System Health & Database Ping",
    description="Returns the operational status of the FastAPI backend and connected subsystems.",
)
async def check_health() -> HealthResponse:
    """
    Check the overall health of the API and test MongoDB connectivity.
    """
    is_db_connected = await db_manager.ping()
    overall_status = "healthy" if is_db_connected else "degraded"

    return HealthResponse(
        status=overall_status,
        app_name=settings.APP_NAME,
        app_env=settings.APP_ENV,
        database_connected=is_db_connected,
        services={
            "api_gateway": "online",
            "database": "connected" if is_db_connected else "disconnected",
        },
    )
