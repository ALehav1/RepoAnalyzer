"""Database configuration module."""
from contextlib import contextmanager
from typing import Iterator, AsyncGenerator
import structlog
from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker

logger = structlog.get_logger(__name__)

# Create SQLite engine
engine = create_engine(
    "sqlite:///./repo_analyzer.db",
    connect_args={"check_same_thread": False},
    echo=True
)

# Create session factory
SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

# Create async engine
async_engine = create_async_engine(
    "sqlite+aiosqlite:///./repo_analyzer.db",
    echo=True
)

# Create async session maker
async_session_maker = async_sessionmaker(
    async_engine,
    class_=AsyncSession,
    expire_on_commit=False,
)

# Create declarative base
Base = declarative_base()

@contextmanager
def get_db() -> Iterator[Session]:
    """Get database session.
    
    Yields:
        Session: Database session
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

async def get_async_session() -> AsyncGenerator[AsyncSession, None]:
    """Get async database session."""
    async with async_session_maker() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise

# Initialize database
def init_db():
    """Initialize database."""
    Base.metadata.create_all(bind=engine)

# Initialize the database schema
init_db()

if __name__ == "__main__":
    init_db()
