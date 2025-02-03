"""Test database models."""
import pytest
from datetime import datetime, timezone
import uuid

from src.models.base import Repository, File, FileMetric, AnalysisRun, AnalysisStatus

@pytest.mark.asyncio
async def test_repository_model(test_db):
    """Test repository model."""
    # Create repository
    repo = Repository(
        url="https://github.com/test/repo",
        name="test-repo",
        description="Test repository"
    )
    test_db.add(repo)
    await test_db.commit()
    
    # Fetch repository
    result = await test_db.get(Repository, repo.id)
    
    # Check fields
    assert result.url == "https://github.com/test/repo"
    assert result.name == "test-repo"
    assert result.description == "Test repository"
    assert result.analysis_status == AnalysisStatus.PENDING
    assert result.analysis_progress == 0.0
    assert result.analysis_result is None
    assert result.job_id is None
    assert result.last_error is None
    assert isinstance(result.created_at, datetime)
    assert isinstance(result.updated_at, datetime)

@pytest.mark.asyncio
async def test_file_model(test_db):
    """Test file model."""
    # Create repository
    repo = Repository(
        url="https://github.com/test/repo",
        name="test-repo"
    )
    test_db.add(repo)
    await test_db.commit()
    
    # Create file
    file = File(
        repository_id=repo.id,
        path="src/main.py",
        size=1024,
        content="print('hello')",
        language="python",
        is_test=False,
        is_generated=False
    )
    test_db.add(file)
    await test_db.commit()
    
    # Fetch file
    result = await test_db.get(File, file.id)
    
    # Check fields
    assert result.repository_id == repo.id
    assert result.path == "src/main.py"
    assert result.size == 1024
    assert result.content == "print('hello')"
    assert result.language == "python"
    assert result.is_test is False
    assert result.is_generated is False
    assert isinstance(result.created_at, datetime)
    assert isinstance(result.updated_at, datetime)

@pytest.mark.asyncio
async def test_file_metric_model(test_db):
    """Test file metric model."""
    # Create repository and file
    repo = Repository(
        url="https://github.com/test/repo",
        name="test-repo"
    )
    test_db.add(repo)
    await test_db.commit()
    
    file = File(
        repository_id=repo.id,
        path="src/main.py",
        size=1024,
        content="print('hello')",
        language="python",
        is_test=False,
        is_generated=False
    )
    test_db.add(file)
    await test_db.commit()
    
    # Create file metric
    metric = FileMetric(
        file_id=file.id,
        lines_of_code=100,
        comment_lines=20,
        complexity=5,
        function_count=3,
        class_count=1,
        documentation_score=0.8,
        maintainability_score=0.7
    )
    test_db.add(metric)
    await test_db.commit()
    
    # Fetch metric
    result = await test_db.get(FileMetric, metric.id)
    
    # Check fields
    assert result.file_id == file.id
    assert result.lines_of_code == 100
    assert result.comment_lines == 20
    assert result.complexity == 5
    assert result.function_count == 3
    assert result.class_count == 1
    assert result.documentation_score == 0.8
    assert result.maintainability_score == 0.7
    assert isinstance(result.created_at, datetime)
    assert isinstance(result.updated_at, datetime)

@pytest.mark.asyncio
async def test_analysis_run_model(test_db):
    """Test analysis run model."""
    # Create repository
    repo = Repository(
        url="https://github.com/test/repo",
        name="test-repo"
    )
    test_db.add(repo)
    await test_db.commit()
    
    # Create analysis run
    run = AnalysisRun(
        repository_id=repo.id,
        version="1.0.0"
    )
    test_db.add(run)
    await test_db.commit()
    
    # Fetch run
    result = await test_db.get(AnalysisRun, run.id)
    
    # Check fields
    assert result.repository_id == repo.id
    assert result.status == AnalysisStatus.PENDING
    assert result.version == "1.0.0"
    assert result.error is None
    assert result.result is None
    assert isinstance(result.started_at, datetime)
    assert result.completed_at is None

@pytest.mark.asyncio
async def test_model_relationships(test_db):
    """Test model relationships."""
    # Create repository
    repo = Repository(
        url="https://github.com/test/repo",
        name="test-repo",
        description="Test repository"
    )
    test_db.add(repo)
    await test_db.commit()
    
    # Create file
    file = File(
        repository_id=repo.id,
        path="src/main.py",
        size=1024,
        content="print('hello')",
        language="python",
        is_test=False,
        is_generated=False
    )
    test_db.add(file)
    await test_db.commit()
    
    # Create file metric
    metric = FileMetric(
        file_id=file.id,
        lines_of_code=100,
        comment_lines=20,
        complexity=5,
        function_count=3,
        class_count=1,
        documentation_score=0.8,
        maintainability_score=0.7
    )
    test_db.add(metric)
    await test_db.commit()
    
    # Create analysis run
    run = AnalysisRun(
        repository_id=repo.id,
        status=AnalysisStatus.COMPLETED,
        progress=1.0,
        result={"score": 0.8},
        error=None
    )
    test_db.add(run)
    await test_db.commit()
    
    # Test repository -> files relationship
    repo_result = await test_db.get(Repository, repo.id)
    assert len(repo_result.files) == 1
    assert repo_result.files[0].id == file.id
    
    # Test repository -> analysis_runs relationship
    assert len(repo_result.analysis_runs) == 1
    assert repo_result.analysis_runs[0].id == run.id
    
    # Test file -> metrics relationship
    file_result = await test_db.get(File, file.id)
    assert len(file_result.metrics) == 1
    assert file_result.metrics[0].id == metric.id
    
    # Test file -> repository relationship
    assert file_result.repository.id == repo.id
    
    # Test metric -> file relationship
    metric_result = await test_db.get(FileMetric, metric.id)
    assert metric_result.file.id == file.id
    
    # Test analysis run -> repository relationship
    run_result = await test_db.get(AnalysisRun, run.id)
    assert run_result.repository.id == repo.id
