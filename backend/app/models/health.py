from datetime import datetime, timezone
from typing import Dict
from pydantic import BaseModel, Field


class HealthResponse(BaseModel):
    """
    Standardized API health response model.
    """

    status: str = Field(..., description="Overall system status (healthy | degraded)")
    app_name: str = Field(..., description="Application name")
    app_env: str = Field(..., description="Runtime environment (development | production)")
    database_connected: bool = Field(..., description="Whether MongoDB is reachable")
    services: Dict[str, str] = Field(..., description="Status breakdown of individual subsystems")
    timestamp: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        description="UTC timestamp of the health check",
    )

    model_config = {
        "json_schema_extra": {
            "example": {
                "status": "healthy",
                "app_name": "CAREERX",
                "app_env": "development",
                "database_connected": True,
                "services": {
                    "api": "online",
                    "database": "connected",
                },
                "timestamp": "2026-08-26T11:30:00Z",
            }
        }
    }
