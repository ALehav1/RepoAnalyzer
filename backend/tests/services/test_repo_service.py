"""Tests for repository service."""
import pytest
from datetime import datetime
from unittest.mock import Mock, patch
from sqlalchemy.orm import Session

from src.services.crud.repo_service import RepoCRUDService
from src.schemas.repository import RepositoryCreate, Repository
from src.schemas.metrics import AnalysisMetrics, MetricDetails
from src.core.exceptions import DatabaseError, RepositoryError

@pytest.fixture
def db_session():
    """Create a mock database session."""
    return Mock(spec=Session)

@pytest.fixture
def repo_service(db_session):
    """Create a repository service with mock db."""
    return RepoCRUDService(db_session)

@pytest.mark.asyncio
async def test_create_repository_success(repo_service):
    """Test successful repository creation."""
    # Setup
    repo_data = RepositoryCreate(
        url="https://github.com/user/repo",
        branch="main"
    )
    
    # Test
    repo = await repo_service.create_repository(repo_data)
    
    # Assert
    assert isinstance(repo, Repository)
    assert repo.name == "repo"
    assert repo.url == repo_data.url
    assert repo.branch == repo_data.branch
    assert repo.status == "pending"
    assert repo.is_valid is True

@pytest.mark.asyncio
async def test_create_repository_invalid_url(repo_service):
    """Test repository creation with invalid URL."""
    # Setup
    repo_data = RepositoryCreate(
        url="invalid-url",
        branch="main"
    )
    
    # Test & Assert
    with pytest.raises(RepositoryError):
        await repo_service.create_repository(repo_data)

@pytest.mark.asyncio
async def test_get_repository_success(repo_service):
    """Test successful repository retrieval."""
    # Setup
    repo_id = "test-id"
    mock_repo = Repository(
        id=repo_id,
        name="repo",
        url="https://github.com/user/repo",
        branch="main",
        status="pending",
        is_valid=True,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow()
    )
    repo_service.db.execute.return_value.scalar_one_or_none.return_value = mock_repo
    
    # Test
    repo = await repo_service.get_repository(repo_id)
    
    # Assert
    assert repo == mock_repo

@pytest.mark.asyncio
async def test_update_repository_status_success(repo_service):
    """Test successful repository status update."""
    # Setup
    repo_id = "test-id"
    metrics = {
        "code_quality": {
            "score": 85,
            "details": ["Good code organization"],
            "recommendations": ["Add more comments"]
        }
    }
    
    # Mock repository
    mock_repo = Repository(
        id=repo_id,
        name="repo",
        url="https://github.com/user/repo",
        branch="main",
        status="pending",
        is_valid=True,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow()
    )
    repo_service.db.execute.return_value.scalar_one.return_value = mock_repo
    
    # Test
    updated_repo = await repo_service.update_repository_status(
        repo_id,
        status="completed",
        metrics=metrics
    )
    
    # Assert
    assert updated_repo.status == "completed"
    assert updated_repo.metrics == metrics
    assert updated_repo.last_analyzed_at is not None

@pytest.mark.asyncio
async def test_list_repositories_success(repo_service):
    """Test successful repository listing."""
    # Setup
    mock_repos = [
        Repository(
            id="1",
            name="repo1",
            url="https://github.com/user/repo1",
            branch="main",
            status="completed",
            is_valid=True,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        ),
        Repository(
            id="2",
            name="repo2",
            url="https://github.com/user/repo2",
            branch="main",
            status="pending",
            is_valid=True,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )
    ]
    repo_service.db.execute.return_value.scalars.return_value.all.return_value = mock_repos
    
    # Test
    repos = await repo_service.list_repositories(status="completed")
    
    # Assert
    assert len(repos) == 2
    assert all(isinstance(repo, Repository) for repo in repos)
    assert repos[0].name == "repo1"
    assert repos[1].name == "repo2"
