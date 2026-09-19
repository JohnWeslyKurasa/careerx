import logging
from typing import Optional
from urllib.parse import urlsplit, urlunsplit
from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
from backend.app.core.config import settings

logger = logging.getLogger("careerx.database")


def _sanitize_mongodb_uri(uri: str) -> str:
    """Sanitize MongoDB URI by masking credentials for secure logging."""
    try:
        parsed = urlsplit(uri)
        if parsed.password:
            netloc = f"{parsed.username}:****@{parsed.hostname}"
            if parsed.port:
                netloc += f":{parsed.port}"
            return urlunsplit((parsed.scheme, netloc, parsed.path, parsed.query, parsed.fragment))
        return uri
    except Exception:
        return "mongodb://[sanitized]"


class DatabaseManager:
    """
    Manages the Async Motor MongoDB connection lifecycle.
    """

    def __init__(self) -> None:
        self.client: Optional[AsyncIOMotorClient] = None
        self.db: Optional[AsyncIOMotorDatabase] = None

    async def connect(self) -> None:
        """Initialize the MongoDB client connection pool."""
        try:
            sanitized_uri = _sanitize_mongodb_uri(settings.MONGODB_URL)
            logger.info(f"Connecting to MongoDB at: {sanitized_uri}")
            self.client = AsyncIOMotorClient(
                settings.MONGODB_URL,
                serverSelectionTimeoutMS=2000,  # 2-second timeout for local responsiveness
            )
            self.db = self.client[settings.MONGODB_DB_NAME]
            # Perform a lightweight ping to verify connection
            await self.client.admin.command("ping")
            logger.info(f"Successfully connected to MongoDB database: '{settings.MONGODB_DB_NAME}'")
        except Exception as e:
            logger.warning(
                f"MongoDB connection ping failed: {e}. "
                f"The application will start, but database operations may fail until MongoDB is active."
            )

    async def disconnect(self) -> None:
        """Close the MongoDB client connection pool."""
        if self.client:
            logger.info("Closing MongoDB connection pool...")
            self.client.close()
            self.client = None
            self.db = None
            logger.info("MongoDB connection pool closed.")

    def get_database(self) -> AsyncIOMotorDatabase:
        """Return the active MongoDB database instance."""
        if self.db is None:
            raise RuntimeError(
                "MongoDB database is not initialized. Ensure connect() has been awaited in lifespan."
            )
        return self.db

    async def ping(self) -> bool:
        """Check if the database is currently reachable."""
        if not self.client:
            return False
        try:
            await self.client.admin.command("ping")
            return True
        except Exception:
            return False


# Singleton Database Manager Instance
db_manager = DatabaseManager()


def get_database() -> Optional[AsyncIOMotorDatabase]:
    """Dependency / helper to retrieve the active database instance."""
    return db_manager.db
