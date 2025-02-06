"""Integration tests to verify API schemas match analyzer outputs."""
import pytest
from pathlib import Path
from typing import Dict, Any
from unittest.mock import Mock, patch, AsyncMock
from datetime import datetime

from fastapi.testclient import TestClient

from src.api.main import app
from src.services.analyzers.documentation import DocumentationAnalyzer
from src.services.analyzers.best_practices import BestPracticesAnalyzer
from src.schemas.analyzers.documentation import DocCoverage, RepoDocumentation
from src.schemas.analyzers.patterns import CodePattern, BestPracticesReport
from src.schemas.analyzers.progress import AnalysisProgress, AnalysisStatus
from src.core.exceptions import AnalysisError

client = TestClient(app)

@pytest.fixture
def mock_repo_path(tmp_path) -> Path:
    """Create a temporary test repository."""
    repo_dir = tmp_path / "test_repo"
    repo_dir.mkdir()
    
    # Create a test Python file
    test_file = repo_dir / "test.py"
    test_file.write_text('''
def undocumented_function(x, y):
    return x + y

def documented_function(a: int, b: int) -> int:
    """Add two numbers.
    
    Args:
        a: First number
        b: Second number
        
    Returns:
        Sum of the numbers
        
    Example:
        >>> documented_function(1, 2)
        3
    """
    return a + b

# TODO: Add more functions
''')
    
    return repo_dir

@pytest.mark.asyncio
async def test_documentation_analyzer_output_matches_schema(mock_repo_path):
    """Test that DocumentationAnalyzer output can be validated by our schemas."""
    analyzer = DocumentationAnalyzer()
    
    # Run analysis
    result = await analyzer.analyze(mock_repo_path)
    
    try:
        # Validate individual file coverage
        for file_coverage in result.file_scores.values():
            DocCoverage.model_validate(file_coverage.model_dump())
        
        # Validate full repository documentation
        RepoDocumentation.model_validate(result.model_dump())
    except ValidationError as e:
        pytest.fail(f"Schema validation failed: {e}")

@pytest.mark.asyncio
async def test_best_practices_analyzer_output_matches_schema(mock_repo_path):
    """Test that BestPracticesAnalyzer output can be validated by our schemas."""
    analyzer = BestPracticesAnalyzer()
    
    # Run analysis
    result = await analyzer.analyze(mock_repo_path)
    
    try:
        # Validate individual patterns
        for pattern in result.patterns:
            CodePattern.model_validate(pattern.model_dump())
        
        # Validate full report
        BestPracticesReport.model_validate(result.model_dump())
    except ValidationError as e:
        pytest.fail(f"Schema validation failed: {e}")

@pytest.mark.asyncio
async def test_api_response_matches_analyzer_output():
    """Test that API response matches analyzer output structure."""
    with patch('src.api.routes.analysis.DocumentationAnalyzer') as mock_doc_analyzer, \
         patch('src.api.routes.analysis.BestPracticesAnalyzer') as mock_bp_analyzer, \
         patch('pathlib.Path.exists', return_value=True), \
         patch('src.api.routes.analysis.AnalysisProgress') as mock_progress, \
         patch('src.api.routes.analysis.AnalysisStatus') as mock_status:
        
        # Mock analyzer responses
        mock_doc_result = RepoDocumentation(
            coverage_score=85.5,
            type_hint_score=90.0,
            example_score=75.0,
            readme_score=95.0,
            api_doc_score=80.0,
            file_scores={
                "test.py": DocCoverage(
                    file_path="test.py",
                    total_items=2,
                    documented_items=1,
                    type_hint_coverage=50.0,
                    example_count=1,
                    todos_count=1,
                    missing_docs=["undocumented_function"]
                )
            },
            recommendations=["Add docstring to undocumented_function"],
            analyzed_at=datetime.utcnow().isoformat()
        )
        
        mock_bp_result = BestPracticesReport(
            patterns=[
                CodePattern(
                    pattern_type="missing_type_hints",
                    description="Function missing type hints",
                    file_path="test.py",
                    line_number=1,
                    code="def undocumented_function(x, y):",
                    severity="warning",
                    recommendation="Add type hints to function parameters"
                )
            ],
            score=85.0,
            recommendations=["Add type hints to all functions"]
        )
        
        # Set up async mocks
        mock_doc_analyzer.return_value.analyze = AsyncMock(return_value=mock_doc_result)
        mock_bp_analyzer.return_value.analyze = AsyncMock(return_value=mock_bp_result)
        
        # Make API request
        response = client.post(
            "/api/analysis/analyze",
            json={
                "repo_path": "/tmp/test_repo",
                "analysis_types": ["documentation", "best_practices"]
            }
        )
        
        assert response.status_code == 202
        data = response.json()
        assert data["status"] == "accepted"
        assert data["message"] == "Analysis started"

@pytest.mark.asyncio
async def test_error_responses_match_schema():
    """Test that error responses follow expected schema."""
    with patch('pathlib.Path.exists', return_value=False):
        response = client.post(
            "/api/analysis/analyze",
            json={
                "repo_path": "/nonexistent/path",
                "analysis_types": ["documentation"]
            }
        )

        assert response.status_code == 400
        data = response.json()
        assert "error" in data
        assert "Repository path" in data["error"]
