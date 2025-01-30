import pytest
from unittest.mock import patch, MagicMock, AsyncMock
from datetime import datetime
import git
from pathlib import Path
from src.services.analyzer import RepositoryAnalyzer, AnalysisProgress, AnalysisCache
from src.services.exceptions import (
    InvalidRepositoryURLError,
    RepositoryNotFoundError,
    GitOperationError,
    AnalysisError
)
from src.services.git_utils import extract_repo_info

@pytest.fixture
def analysis_progress():
    return AnalysisProgress()

@pytest.fixture
def analysis_cache():
    return AnalysisCache(ttl_minutes=1)

@pytest.fixture
def mock_db():
    return AsyncMock()

@pytest.fixture
def mock_github_service():
    mock = AsyncMock()
    mock.get_repo_info.return_value = {
        "name": "test-repo",
        "stargazers_count": 10,
        "files": [{"path": "test.py", "type": "python"}]
    }
    return mock

@pytest.fixture
def mock_git():
    mock = MagicMock()
    mock.return_value.remotes.origin.pull = MagicMock()
    return mock

@pytest.fixture
def mock_progress_tracker():
    """Mock progress tracker."""
    mock = MagicMock()
    mock.get_progress.return_value = {"status": "completed", "progress": 100}
    return mock

@pytest.fixture
def mock_error_progress_tracker():
    """Mock progress tracker that returns error status."""
    mock = MagicMock()
    mock.get_progress.return_value = {"status": "failed", "progress": 0}
    return mock

@pytest.fixture
def analyzer(mock_db, mock_github_service, mock_progress_tracker):
    """Create analyzer instance with mocked dependencies."""
    analyzer = RepositoryAnalyzer(db=mock_db, github_service=mock_github_service)
    analyzer.progress_tracker = mock_progress_tracker
    # Create data directory
    analyzer.data_dir.mkdir(parents=True, exist_ok=True)
    return analyzer

def test_analysis_progress_lifecycle(analysis_progress):
    """Test the complete lifecycle of analysis progress tracking."""
    repo_id = "test-repo"
    
    # Test start
    analysis_progress.start_analysis(repo_id)
    progress = analysis_progress.get_progress(repo_id)
    assert progress["status"] == "in_progress"
    assert progress["progress"] == 0
    assert progress["error"] is None
    
    # Test update
    analysis_progress.update_progress(repo_id, 50)
    progress = analysis_progress.get_progress(repo_id)
    assert progress["progress"] == 50
    
    # Test completion
    analysis_progress.complete_analysis(repo_id)
    progress = analysis_progress.get_progress(repo_id)
    assert progress["status"] == "completed"
    assert progress["progress"] == 100
    assert progress["completed_at"] is not None

def test_analysis_progress_failure(analysis_progress):
    """Test handling of analysis failure."""
    repo_id = "test-repo"
    error_msg = "Test error"
    
    analysis_progress.start_analysis(repo_id)
    analysis_progress.fail_analysis(repo_id, error_msg)
    
    progress = analysis_progress.get_progress(repo_id)
    assert progress["status"] == "failed"
    assert progress["error"] == error_msg
    assert progress["completed_at"] is not None

def test_analysis_cache_lifecycle(analysis_cache):
    """Test the lifecycle of analysis cache."""
    key = "test-key"
    data = {"test": "data"}
    
    # Test cache miss
    assert analysis_cache.get(key) is None
    
    # Test cache set and hit
    analysis_cache.set(key, data)
    cached_data = analysis_cache.get(key)
    assert cached_data == data

@pytest.mark.asyncio
async def test_analyze_repository_success(analyzer, mock_github_service, mock_git):
    """Test successful repository analysis."""
    repo_url = "https://github.com/test/repo"
    
    with patch('git.Repo', mock_git):
        result = await analyzer.analyze_repository(repo_url)
        
        # Verify repository info
        assert result["repository"]["name"] == "test-repo"
        assert result["repository"]["stargazers_count"] == 10
        
        # Verify file analysis
        assert len(result["files"]) == 1
        assert result["files"][0]["path"] == "test.py"
        assert result["files"][0]["type"] == "python"
        
        # Verify progress tracking
        progress = analyzer.progress_tracker.get_progress("test-repo")
        assert progress["status"] == "completed"
        assert progress["progress"] == 100

@pytest.mark.asyncio
async def test_analyze_repository_with_cache(analyzer, mock_github_service):
    """Test repository analysis with caching."""
    repo_url = "https://github.com/test/repo"
    cached_data = {
        "repository": {"name": "cached-repo"},
        "files": [{"path": "cached.py"}],
        "analyzed_at": datetime.utcnow().isoformat()
    }

    # Set cache
    analyzer.analysis_cache.set("repo", cached_data)

    # Analysis should use cached data
    result = await analyzer.analyze_repository(repo_url)

    # Verify cached data is returned
    assert result == cached_data
    
    # Verify GitHub API was not called
    mock_github_service.get_repo_info.assert_not_called()

@pytest.mark.asyncio
async def test_analyze_repository_failure(analyzer, mock_github_service, mock_error_progress_tracker):
    """Test handling of repository analysis failure."""
    repo_url = "https://github.com/test/repo"
    mock_github_service.get_repo_info.side_effect = Exception("API Error")
    analyzer.progress_tracker = mock_error_progress_tracker

    with pytest.raises(AnalysisError) as exc:
        await analyzer.analyze_repository(repo_url)
    
    assert "API Error" in str(exc.value)
    
    # Verify error is tracked
    progress = analyzer.progress_tracker.get_progress("test-repo")
    assert progress["status"] == "failed"
    assert progress["progress"] == 0

@pytest.mark.asyncio
async def test_clone_or_pull_repo_new(analyzer, mock_git):
    """Test cloning a new repository."""
    repo_url = "https://github.com/test/repo"
    
    with patch('git.Repo', mock_git):
        local_path = await analyzer.clone_or_pull_repo(repo_url)
        
        # Verify clone was called
        mock_git.clone_from.assert_called_once_with(repo_url, Path(local_path))
        
        # Verify pull was not called
        repo_instance = mock_git.return_value
        assert not repo_instance.remotes.origin.pull.called

@pytest.mark.asyncio
async def test_clone_or_pull_repo_existing(analyzer, mock_git):
    """Test pulling an existing repository."""
    repo_url = "https://github.com/test/repo"
    
    # Create repo directory with .git
    repo_path = analyzer.data_dir / "repo"
    repo_path.mkdir(parents=True, exist_ok=True)
    (repo_path / '.git').mkdir(parents=True, exist_ok=True)
    
    with patch('git.Repo', mock_git):
        local_path = await analyzer.clone_or_pull_repo(repo_url)
        
        # Verify clone was not called
        assert not mock_git.clone_from.called
        
        # Verify pull was called
        repo_instance = mock_git.return_value
        repo_instance.remotes.origin.pull.assert_called_once()

@pytest.mark.asyncio
async def test_clone_or_pull_repo_invalid_url(analyzer):
    """Test handling of invalid repository URL."""
    invalid_urls = [
        "not-a-url",
        "http://not-github.com/test/repo",
        "https://github.com/",
        "https://github.com/no-repo"
    ]
    
    for url in invalid_urls:
        with pytest.raises(InvalidRepositoryURLError) as exc:
            await analyzer.clone_or_pull_repo(url)
        assert "Invalid GitHub repository URL" in str(exc.value)

@pytest.mark.asyncio
async def test_clone_or_pull_repo_git_error(analyzer, mock_git):
    """Test handling of git operation errors."""
    repo_url = "https://github.com/test/repo"
    
    # Set up mock to raise error
    mock_git.side_effect = git.GitCommandError("clone", "Repository not found")
    
    with patch('git.Repo', mock_git):
        with pytest.raises(RepositoryNotFoundError) as exc:
            await analyzer.clone_or_pull_repo(repo_url)
        assert "Repository not found" in str(exc.value)

@pytest.mark.asyncio
async def test_clone_or_pull_repo_other_git_error(analyzer, mock_git):
    """Test handling of other git operation errors."""
    repo_url = "https://github.com/test/repo"
    
    # Set up mock to raise error
    mock_git.clone_from.side_effect = git.GitCommandError("clone", "Permission denied")
    
    with patch('git.Repo', mock_git):
        with pytest.raises(GitOperationError) as exc:
            await analyzer.clone_or_pull_repo(repo_url)
        assert "Git operation failed" in str(exc.value)

def test_determine_file_type(analyzer):
    """Test file type determination."""
    test_cases = [
        ("test.py", "python"),
        ("main.js", "javascript"),
        ("app.tsx", "react-typescript"),
        ("README.md", "markdown"),
        ("unknown.xyz", "unknown")
    ]
    
    for file_path, expected_type in test_cases:
        assert analyzer._determine_file_type(file_path) == expected_type

def test_is_generated_file(analyzer):
    """Test generated file detection."""
    generated_files = [
        "dist/bundle.js",
        "build/generated.py",
        "auto-generated-file.ts"
    ]
    
    normal_files = [
        "src/main.py",
        "tests/test_api.py",
        "README.md"
    ]
    
    for file_path in generated_files:
        assert analyzer._is_generated_file(file_path) is True
        
    for file_path in normal_files:
        assert analyzer._is_generated_file(file_path) is False

def test_is_test_file(analyzer):
    """Test test file detection."""
    test_files = [
        "test_api.py",
        "api_test.py",
        "tests/component.test.js",
        "src/tests/unit/test_utils.py"
    ]
    
    non_test_files = [
        "main.py",
        "utils.js",
        "testing.md"
    ]
    
    for file_path in test_files:
        assert analyzer._is_test_file(file_path) is True
        
    for file_path in non_test_files:
        assert analyzer._is_test_file(file_path) is False

def test_extract_repo_info():
    """Test repository info extraction from URL."""
    # Test valid URLs
    test_cases = [
        ("https://github.com/owner/repo", ("owner", "repo")),
        ("https://github.com/owner/repo.git", ("owner", "repo")),
        ("http://github.com/owner/repo", ("owner", "repo")),
        ("https://github.com/owner/repo/", ("owner", "repo"))
    ]
    
    for url, expected in test_cases:
        assert extract_repo_info(url) == expected
    
    # Test invalid URLs
    invalid_urls = [
        "not-a-url",
        "http://not-github.com/owner/repo",
        "https://github.com/",
        "https://github.com/no-repo"
    ]
    
    for url in invalid_urls:
        with pytest.raises(ValueError):
            extract_repo_info(url)

@pytest.mark.asyncio
async def test_clone_or_pull_repo_cleanup(analyzer, mock_git):
    """Test repository cleanup on error."""
    repo_url = "https://github.com/test/repo"
    
    # Set up mock to raise error during clone
    mock_git.clone_from.side_effect = Exception("Simulated error")
    
    with patch('git.Repo', mock_git):
        with pytest.raises(GitOperationError):
            await analyzer.clone_or_pull_repo(repo_url)
    
    # Verify cleanup was attempted
    repo_dir = analyzer.data_dir / "repo"
    assert not repo_dir.exists()
