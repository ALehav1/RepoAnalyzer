"""Database session management."""
from contextlib import asynccontextmanager, contextmanager
from typing import AsyncGenerator, Generator
from sqlalchemy.orm import Session, sessionmaker
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy import create_engine
import logging

from ..config.settings import settings

logger = logging.getLogger(__name__)

class SessionManager:
    """Manages database sessions."""

    def __init__(self):
        """Initialize session factories."""
        self.sync_engine = create_engine(settings.database_url)
        self.async_engine = create_async_engine(settings.async_database_url)
        
        self.sync_session_factory = sessionmaker(
            bind=self.sync_engine,
            autocommit=False,
            autoflush=False
        )
        
        self.async_session_factory = sessionmaker(
            bind=self.async_engine,
            class_=AsyncSession,
            autocommit=False,
            autoflush=False
        )

    @contextmanager
    def sync_session(self) -> Generator[Session, None, None]:
        """Get a synchronous database session."""
        session = self.sync_session_factory()
        try:
            yield session
        except Exception as e:
            logger.error(f"Error in sync session: {str(e)}")
            session.rollback()
            raise
        finally:
            session.close()

    @asynccontextmanager
    async def async_session(self) -> AsyncGenerator[AsyncSession, None]:
        """Get an asynchronous database session."""
        session = self.async_session_factory()
        try:
            yield session
        except Exception as e:
            logger.error(f"Error in async session: {str(e)}")
            await session.rollback()
            raise
        finally:
            await session.close()

    @contextmanager
    def sync_transaction(self) -> Generator[Session, None, None]:
        """Get a synchronous session with transaction."""
        with self.sync_session() as session:
            with session.begin():
                yield session

    @asynccontextmanager
    async def async_transaction(self) -> AsyncGenerator[AsyncSession, None]:
        """Get an asynchronous session with transaction."""
        async with self.async_session() as session:
            async with session.begin():
                yield session

session_manager = SessionManager()
