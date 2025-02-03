"""Test custom exceptions."""
import pytest
from src.core.exceptions import (
    RepoAnalyzerError,
    DatabaseError,
    RepositoryError,
    AnalysisError,
    ValidationError,
    NotFoundError
)

def test_base_error():
    """Test base error class."""
    error = RepoAnalyzerError(
        message="Test error",
        error_code="TEST_ERROR",
        status_code=400,
        details={"key": "value"}
    )
    
    assert error.message == "Test error"
    assert error.error_code == "TEST_ERROR"
    assert error.status_code == 400
    assert error.details == {"key": "value"}
    assert str(error) == "Test error"

def test_database_error():
    """Test database error."""
    error = DatabaseError(
        message="Database connection failed",
        details={"connection": "localhost"}
    )
    
    assert error.message == "Database connection failed"
    assert error.error_code == "DATABASE_ERROR"
    assert error.status_code == 500
    assert error.details == {"connection": "localhost"}

def test_repository_error():
    """Test repository error."""
    error = RepositoryError(
        message="Invalid repository URL",
        details={"url": "invalid://url"}
    )
    
    assert error.message == "Invalid repository URL"
    assert error.error_code == "REPOSITORY_ERROR"
    assert error.status_code == 400
    assert error.details == {"url": "invalid://url"}

def test_analysis_error():
    """Test analysis error."""
    error = AnalysisError(
        message="Analysis timeout",
        details={"timeout": 300}
    )
    
    assert error.message == "Analysis timeout"
    assert error.error_code == "ANALYSIS_ERROR"
    assert error.status_code == 500
    assert error.details == {"timeout": 300}

def test_validation_error():
    """Test validation error."""
    error = ValidationError(
        message="Invalid input",
        details={"field": "name", "error": "required"}
    )
    
    assert error.message == "Invalid input"
    assert error.error_code == "VALIDATION_ERROR"
    assert error.status_code == 400
    assert error.details == {"field": "name", "error": "required"}

def test_not_found_error():
    """Test not found error."""
    error = NotFoundError(
        message="Repository not found",
        details={"id": "123"}
    )
    
    assert error.message == "Repository not found"
    assert error.error_code == "NOT_FOUND"
    assert error.status_code == 404
    assert error.details == {"id": "123"}
