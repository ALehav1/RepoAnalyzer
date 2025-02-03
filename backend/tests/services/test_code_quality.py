"""Tests for code quality service."""
import pytest
from pathlib import Path
import tempfile
import os
from src.services.code_quality import CodeQualityService
from src.core.exceptions import AnalysisError

@pytest.fixture
def code_quality_service():
    """Create a code quality service instance."""
    return CodeQualityService()

@pytest.fixture
def sample_python_file():
    """Create a temporary Python file with sample code."""
    with tempfile.NamedTemporaryFile(suffix='.py', delete=False, mode='w') as f:
        f.write('''
def complex_function(x, y):
    """A complex function with high cyclomatic complexity."""
    if x > 0:
        if y > 0:
            return x + y
        else:
            return x - y
    else:
        if y > 0:
            return -x + y
        else:
            return -x - y

def simple_function():
    """A simple function with good documentation."""
    return True

class TestClass:
    """A test class with methods."""
    
    def __init__(self):
        """Initialize the class."""
        self.value = 0
    
    def duplicate_code_1(self):
        """First instance of duplicate code."""
        x = 1
        y = 2
        z = x + y
        return z
    
    def duplicate_code_2(self):
        """Second instance of duplicate code."""
        x = 1
        y = 2
        z = x + y
        return z
''')
        return f.name

@pytest.fixture
def empty_repo(tmp_path):
    """Create an empty repository structure."""
    repo_dir = tmp_path / "test_repo"
    repo_dir.mkdir()
    return str(repo_dir)

@pytest.fixture
def sample_repo(tmp_path, sample_python_file):
    """Create a sample repository with Python files."""
    repo_dir = tmp_path / "test_repo"
    repo_dir.mkdir()
    
    # Copy sample file to repo
    dest_file = repo_dir / "main.py"
    with open(sample_python_file, 'r') as src, open(dest_file, 'w') as dst:
        dst.write(src.read())
    
    return str(repo_dir)

@pytest.mark.asyncio
async def test_analyze_empty_repository(code_quality_service, empty_repo):
    """Test analyzing an empty repository."""
    with pytest.raises(AnalysisError, match="No Python files found"):
        await code_quality_service.analyze_repository(empty_repo)

@pytest.mark.asyncio
async def test_analyze_repository(code_quality_service, sample_repo):
    """Test analyzing a repository with Python files."""
    metrics = await code_quality_service.analyze_repository(sample_repo)
    
    assert metrics.code_quality_score > 0
    assert metrics.complexity_score > 0
    assert metrics.maintainability_score > 0
    assert metrics.documentation_score > 0
    assert metrics.best_practices_score > 0
    assert len(metrics.recommendations) > 0
    assert metrics.issues_count["duplicate_code"] > 0

@pytest.mark.asyncio
async def test_analyze_file(code_quality_service, sample_python_file):
    """Test analyzing a single Python file."""
    metrics = await code_quality_service._analyze_file(sample_python_file)
    
    assert metrics.loc > 0
    assert metrics.sloc > 0
    assert metrics.comments > 0
    assert metrics.complexity > 0
    assert metrics.maintainability > 0
    assert len(metrics.duplicates) > 0

@pytest.mark.asyncio
async def test_analyze_invalid_file(code_quality_service):
    """Test analyzing an invalid Python file."""
    with tempfile.NamedTemporaryFile(suffix='.py', delete=False, mode='w') as f:
        f.write('invalid python code}{')
    
    with pytest.raises(AnalysisError, match="Failed to analyze file"):
        await code_quality_service._analyze_file(f.name)
    
    os.unlink(f.name)

@pytest.mark.asyncio
async def test_analyze_nonexistent_file(code_quality_service):
    """Test analyzing a nonexistent file."""
    with pytest.raises(AnalysisError, match="Failed to analyze file"):
        await code_quality_service._analyze_file("/nonexistent/file.py")
