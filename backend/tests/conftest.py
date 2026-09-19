import pytest
from httpx import AsyncClient, ASGITransport
from typing import AsyncGenerator
from backend.app.main import app, lifespan


@pytest.fixture
def anyio_backend():
    return "asyncio"


@pytest.fixture
async def async_client() -> AsyncGenerator[AsyncClient, None]:
    """
    Asynchronous HTTP test client using httpx with application lifespan.
    """
    async with lifespan(app):
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            yield client
