"""Database configuration module."""
import os
from pathlib import Path
from typing import AsyncGenerator
from dotenv import load_dotenv
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
import logging

from .models.base import Base

logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()

# Create instance directory if it doesn't exist
instance_dir = Path("instance")
instance_dir.mkdir(parents=True, exist_ok=True)
logger.info(f"Using instance directory: {instance_dir.absolute()}")

# Database configuration
DATABASE_URL = os.getenv(
    "DATABASE_URL", 
    f"sqlite+aiosqlite:///{instance_dir}/app.db"
).replace("sqlite://", "sqlite+aiosqlite://")
logger.info(f"Using database URL: {DATABASE_URL}")

# Configure SQLAlchemy engine with better defaults
engine = create_async_engine(
    DATABASE_URL,
    echo=False,
    pool_pre_ping=True,
    pool_recycle=300,
    connect_args={"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}
)

# Configure session maker with better defaults
async_session_maker = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False
)

async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """Get a database session."""
    async with async_session_maker() as session:
        try:
            yield session
        except Exception as e:
            logger.error(f"Database session error: {str(e)}")
            await session.rollback()
            raise
        finally:
            await session.close()

async def init_db() -> None:
    """Initialize the database schema."""
    try:
        logger.info("Creating database tables...")
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
        logger.info("Database tables created successfully")
    except Exception as e:
        logger.error(f"Failed to initialize database: {str(e)}")
        raise

if __name__ == "__main__":
    import asyncio
    asyncio.run(init_db())
