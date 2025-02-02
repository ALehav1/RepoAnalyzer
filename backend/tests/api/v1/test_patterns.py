"""Tests for pattern detection API endpoints."""
import pytest
from pathlib import Path
from fastapi.testclient import TestClient
from unittest.mock import Mock, patch
import sys
import os

# Add the project root to the Python path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../")))

from tests.test_app import test_app
from src.core.exceptions import PatternDetectionError, FileAccessError

# Create test client
client = TestClient(test_app)

def test_analyze_patterns_valid_file(tmp_path):
    """Test successful pattern analysis with valid file."""
    # Create a test Python file
    test_file = tmp_path / "test.py"
    test_file.write_text("""
class Factory:
    def create(self):
        pass
    """)
    
    # Mock the pattern detector
    mock_pattern = {
        "name": "factory",
        "confidence": 0.85,
        "line_number": 2,
        "context": {
            "complexity": 1,
            "dependencies": [],
            "methods": ["create"],
            "attributes": [],
            "related_patterns": []
        }
    }
    
    with patch("src.services.pattern_detectors.advanced_pattern_detector.AdvancedPatternDetector.analyze_file") as mock_analyze:
        mock_analyze.return_value = [mock_pattern]
        
        response = client.post("/api/v1/patterns/analyze", json={"file_path": str(test_file)})
        
        assert response.status_code == 200
        data = response.json()
        assert len(data["patterns"]) == 1
        pattern = data["patterns"][0]
        assert pattern["name"] == "factory"
        assert pattern["confidence"] == 0.85
        assert pattern["line_number"] == 2
        assert "complexity" in pattern["context"]

def test_analyze_patterns_file_not_found():
    """Test error handling when file doesn't exist."""
    response = client.post("/api/v1/patterns/analyze", json={"file_path": "/nonexistent/file.py"})
    assert response.status_code == 400
    data = response.json()
    assert data["detail"]["error_code"] == "FILE_ACCESS_ERROR"
    assert "File not found" in data["detail"]["message"]

def test_analyze_patterns_invalid_extension():
    """Test error handling for non-Python files."""
    # Create a temporary file with .txt extension
    test_file = "/tmp/test.txt"
    with open(test_file, "w") as f:
        f.write("test")
    
    response = client.post("/api/v1/patterns/analyze", json={"file_path": test_file})
    assert response.status_code == 400
    data = response.json()
    assert data["detail"]["error_code"] == "FILE_ACCESS_ERROR"
    assert "Only Python files are supported" in data["detail"]["message"]

def test_analyze_patterns_detection_error():
    """Test error handling when pattern detection fails."""
    # Create a temporary Python file
    test_file = "/tmp/test.py"
    with open(test_file, "w") as f:
        f.write("test")
    
    with patch("src.services.pattern_detectors.advanced_pattern_detector.AdvancedPatternDetector.analyze_file") as mock_analyze:
        mock_analyze.side_effect = PatternDetectionError(
            message="Failed to analyze patterns",
            details={"error": "AST parsing failed"}
        )
        
        response = client.post("/api/v1/patterns/analyze", json={"file_path": test_file})
        assert response.status_code == 500
        data = response.json()
        assert data["detail"]["error_code"] == "PATTERN_DETECTION_ERROR"
        assert "Failed to analyze patterns" in data["detail"]["message"]

def test_analyze_patterns_invalid_input():
    """Test input validation."""
    # Test missing file_path
    response = client.post("/api/v1/patterns/analyze", json={})
    assert response.status_code == 422
    
    # Test empty file_path
    response = client.post("/api/v1/patterns/analyze", json={"file_path": ""})
    assert response.status_code == 422
    
    # Test relative path
    response = client.post("/api/v1/patterns/analyze", json={"file_path": "relative/path.py"})
    assert response.status_code == 422
    data = response.json()
    assert "File path must be absolute" in str(data["detail"])
