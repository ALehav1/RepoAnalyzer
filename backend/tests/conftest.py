"""Test configuration and fixtures."""

import pytest
import pytest_asyncio
from fastapi.testclient import TestClient
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool
import os
import tempfile
import shutil
from pathlib import Path
import asyncio

from src.database import Base, get_db
from src.models.base import Repository
from src.main import app

# Create test database
TEST_DATABASE_URL = "sqlite+aiosqlite:///:memory:"

@pytest_asyncio.fixture
async def test_db():
    """Create a test database."""
    engine = create_async_engine(
        TEST_DATABASE_URL,
        poolclass=StaticPool,
        connect_args={"check_same_thread": False},
    )

    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
        await conn.run_sync(Base.metadata.create_all)

    async_session = sessionmaker(
        engine, class_=AsyncSession, expire_on_commit=False
    )

    async with async_session() as session:
        yield session
        await session.rollback()
        await session.close()

    await engine.dispose()

@pytest_asyncio.fixture
async def client(test_db):
    """Create a test client with database session."""
    async def override_get_db():
        try:
            yield test_db
        finally:
            await test_db.close()

    app.dependency_overrides[get_db] = override_get_db
    yield TestClient(app)
    app.dependency_overrides.clear()

@pytest.fixture
def event_loop():
    """Create an instance of the default event loop for each test case."""
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()

@pytest.fixture
def temp_dir():
    """Create a temporary directory for test files."""
    path = tempfile.mkdtemp()
    yield path
    shutil.rmtree(path)
