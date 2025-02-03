"""Database infrastructure module."""
import os
import contextlib
from typing import AsyncIterator
from pathlib import Path
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from sqlalchemy.orm import DeclarativeBase

# Import all models to register them with SQLAlchemy
from ..models import Base, Repository, File, ChatMessage, BestPractice

class Base(DeclarativeBase):
    """Base class for all models."""
    pass

class DatabaseSessionManager:
    """Manages database sessions and connections."""
    def __init__(self):
        self._engine = None
        self._sessionmaker = None

    async def init(self):
        """Initialize the database connection."""
        db_path = Path(__file__).parent.parent.parent / "data" / "repoanalyzer.db"
        os.makedirs(db_path.parent, exist_ok=True)

        # Always use aiosqlite driver
        database_url = f"sqlite+aiosqlite:///{db_path.absolute()}"
        print(f"Using database URL: {database_url}")  # Debug print

        self._engine = create_async_engine(
            database_url,
            echo=True,  # Enable SQL logging
            pool_pre_ping=True,
            pool_recycle=300,
            connect_args={"check_same_thread": False}
        )
        self._sessionmaker = async_sessionmaker(
            autocommit=False,
            autoflush=False,
            bind=self._engine,
            expire_on_commit=False,
        )

        # Initialize database tables
        async with self._engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)

    async def close(self):
        """Close the database connection."""
        if self._engine is None:
            raise Exception("DatabaseSessionManager is not initialized")
        await self._engine.dispose()
        self._engine = None
        self._sessionmaker = None

    @contextlib.asynccontextmanager
    async def session(self) -> AsyncIterator[AsyncSession]:
        """Get a database session."""
        if self._sessionmaker is None:
            await self.init()
        session = self._sessionmaker()
        try:
            yield session
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()

# Create the session manager
sessionmanager = DatabaseSessionManager()

async def get_db() -> AsyncIterator[AsyncSession]:
    """Dependency for getting database sessions."""
    async with sessionmanager.session() as session:
        yield session
