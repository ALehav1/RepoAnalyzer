"""Tests for the RepoProcessor service."""

import pytest
from datetime import datetime
import uuid
from sqlalchemy import select

from src.services.repo_processor import RepoProcessor
from src.models.base import Repository

@pytest.mark.asyncio
async def test_list_repositories(test_db):
    """Test listing repositories."""
    # Create test repositories
    repo1 = Repository(
        id=str(uuid.uuid4()),
        url="https://github.com/test/repo1",
        created_at=datetime.utcnow(),
        analysis_status="completed",
        analysis_progress=100
    )
    repo2 = Repository(
        id=str(uuid.uuid4()),
        url="https://github.com/test/repo2",
        created_at=datetime.utcnow(),
        analysis_status="processing",
        analysis_progress=50
    )
    
    # Add to database
    test_db.add(repo1)
    test_db.add(repo2)
    await test_db.commit()
    
    # Test listing
    processor = RepoProcessor(test_db)
    repos = await processor._list_repositories()
    
    # Verify results
    assert len(repos) == 2
    assert any(r.url == repo1.url for r in repos)
    assert any(r.url == repo2.url for r in repos)
    
@pytest.mark.asyncio
async def test_get_repository(test_db):
    """Test getting a repository by ID."""
    # Create test repository
    repo_id = str(uuid.uuid4())
    repo = Repository(
        id=repo_id,
        url="https://github.com/test/repo",
        created_at=datetime.utcnow(),
        analysis_status="completed",
        analysis_progress=100
    )
    
    # Add to database
    test_db.add(repo)
    await test_db.commit()
    
    # Test getting repository
    processor = RepoProcessor(test_db)
    result = await processor._get_repository(repo_id)
    
    # Verify result
    assert result is not None
    assert result.id == repo_id
    assert result.url == repo.url
    
@pytest.mark.asyncio
async def test_get_nonexistent_repository(test_db):
    """Test getting a repository that doesn't exist."""
    processor = RepoProcessor(test_db)
    result = await processor._get_repository(str(uuid.uuid4()))
    assert result is None
