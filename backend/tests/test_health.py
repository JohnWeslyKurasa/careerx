import pytest
from httpx import AsyncClient


@pytest.mark.anyio
async def test_root_endpoint(async_client: AsyncClient):
    """Test that root endpoint returns application metadata."""
    response = await async_client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "CAREERX"
    assert data["status"] == "online"
    assert "docs" in data


@pytest.mark.anyio
async def test_health_endpoint_schema(async_client: AsyncClient):
    """Test that health check endpoint returns valid HealthResponse schema."""
    response = await async_client.get("/api/v1/health")
    assert response.status_code == 200
    data = response.json()

    assert data["app_name"] == "CAREERX"
    assert data["status"] in ["healthy", "degraded"]
    assert isinstance(data["database_connected"], bool)
    assert "api_gateway" in data["services"]
    assert data["services"]["api_gateway"] == "online"
    assert "timestamp" in data


@pytest.mark.anyio
async def test_cors_headers(async_client: AsyncClient):
    """Test that CORS preflight response headers are correctly configured."""
    response = await async_client.options(
        "/api/v1/health",
        headers={
            "Origin": "http://localhost:5173",
            "Access-Control-Request-Method": "GET",
        },
    )
    assert response.status_code == 200
    assert response.headers.get("access-control-allow-origin") == "http://localhost:5173"


@pytest.mark.anyio
async def test_health_endpoint_degraded_when_db_disconnected(async_client: AsyncClient, monkeypatch):
    """Test that the system gracefully reports degraded status when MongoDB ping fails."""
    from backend.app.core.database import db_manager

    async def mock_failed_ping():
        return False

    monkeypatch.setattr(db_manager, "ping", mock_failed_ping)

    response = await async_client.get("/api/v1/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "degraded"
    assert data["database_connected"] is False
    assert data["services"]["database"] == "disconnected"


@pytest.mark.anyio
async def test_database_manager_ping():
    """Directly test the DatabaseManager ping function."""
    from backend.app.core.database import db_manager

    # When connected, ping should return a boolean
    result = await db_manager.ping()
    assert isinstance(result, bool)
