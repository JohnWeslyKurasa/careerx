import logging
from contextlib import asynccontextmanager
from typing import AsyncGenerator
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from backend.app.api.v1.router import api_v1_router
from backend.app.core.config import settings
from backend.app.core.database import db_manager

# Configure structured application logging
logging.basicConfig(
    level=logging.INFO if not settings.DEBUG else logging.DEBUG,
    format="%(asctime)s | %(levelname)-8s | %(name)s : %(message)s",
)
logger = logging.getLogger("careerx.main")


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    """
    Application lifespan context manager for startup and shutdown event handling.
    """
    logger.info(f"Starting {settings.APP_NAME} in [{settings.APP_ENV}] mode...")
    # Initialize MongoDB connection pool
    await db_manager.connect()
    if db_manager.db is not None:
        try:
            from backend.app.db.collections import ensure_indexes
            await ensure_indexes(db_manager.db)
        except Exception as exc:
            logger.warning(f"Database indexes initialization deferred or skipped: {exc}")
    yield
    # Gracefully close connections on application teardown
    logger.info(f"Shutting down {settings.APP_NAME}...")
    await db_manager.disconnect()


def create_application() -> FastAPI:
    """
    Application factory initializing FastAPI with middleware, routers, and metadata.
    """
    app = FastAPI(
        title=f"{settings.APP_NAME} API Gateway",
        description=(
            "Evidence-Grounded Job Readiness & Career Intelligence Platform API. "
            "Exposes endpoints for document parsing, structured LLM extraction, "
            "RAG semantic grounding, and deterministic JRS calculation."
        ),
        version="1.0.0",
        docs_url="/docs",
        redoc_url="/redoc",
        openapi_url="/openapi.json",
        lifespan=lifespan,
    )

    # Configure Cross-Origin Resource Sharing (CORS)
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins_list,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Mount API Routers
    app.include_router(api_v1_router, prefix=settings.API_V1_PREFIX)

    @app.get("/", include_in_schema=False)
    async def root_redirect():
        return JSONResponse(
            content={
                "name": settings.APP_NAME,
                "status": "online",
                "version": "1.0.0",
                "docs": "/docs",
                "api_v1": f"{settings.API_V1_PREFIX}/health",
            }
        )

    @app.exception_handler(Exception)
    async def global_exception_handler(request: Request, exc: Exception):
        logger.error(f"Unhandled server error on {request.method} {request.url.path}: {exc}", exc_info=True)
        return JSONResponse(
            status_code=500,
            content={
                "error": "InternalServerError",
                "message": "An unexpected server error occurred.",
                "path": request.url.path,
            },
        )

    return app


app = create_application()
