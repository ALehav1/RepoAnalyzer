import pytest
from fastapi.testclient import TestClient
from unittest.mock import patch, MagicMock
import os

def test_health_check(client: TestClient):
    """Test the health check endpoint."""
    response = client.get("/api/health")
    assert response.status_code == 200
    assert response.json() == {"status": "healthy"}

@pytest.mark.asyncio
async def test_analyze_repo_invalid_url(client: TestClient):
    """Test analyzing a repository with an invalid URL."""
    response = client.post(
        "/api/repositories/analyze",
        json={"url": "invalid_url"}
    )
    assert response.status_code == 422
    assert "detail" in response.json()

@pytest.mark.asyncio
@patch('src.services.github.GithubService.get_repo_info')
async def test_analyze_repo_success(mock_get_repo_info: MagicMock, client: TestClient):
    """Test successful repository analysis."""
    # Mock GitHub API response
    mock_get_repo_info.return_value = {
        "name": "test-repo",
        "description": "Test repository",
        "stargazers_count": 10,
        "forks_count": 5
    }
    
    response = client.post(
        "/api/repositories/analyze",
        json={"url": "https://github.com/test/test-repo"}
    )
    assert response.status_code == 202
    assert "task_id" in response.json()

@pytest.mark.asyncio
async def test_get_analysis_progress(client: TestClient):
    """Test getting analysis progress."""
    response = client.get("/api/repositories/progress/test-id")
    assert response.status_code == 404

@pytest.mark.asyncio
async def test_create_repository(client: TestClient):
    """Test creating a new repository."""
    response = client.post(
        "/api/v1/repositories",
        json={
            "url": "https://github.com/test/test-repo",
            "name": "test-repo",
            "branch": "main"
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "test-repo"
    assert data["status"] in ["cloned", "updated"]

@pytest.mark.asyncio
async def test_get_repository(client: TestClient):
    """Test getting repository information."""
    # First create a repository
    client.post(
        "/api/v1/repositories",
        json={
            "url": "https://github.com/test/test-repo",
            "name": "test-repo",
            "branch": "main"
        }
    )
    
    # Then get its information
    response = client.get("/api/v1/repositories/test-repo")
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "test-repo"
    assert "local_path" in data

@pytest.mark.asyncio
async def test_analyze_patterns(client: TestClient, tmp_path):
    """Test pattern analysis endpoint."""
    # Create a test file
    test_file = tmp_path / "test_patterns.py"
    test_file.write_text("""
    class Singleton:
        _instance = None
        def __new__(cls):
            if cls._instance is None:
                cls._instance = super().__new__(cls)
            return cls._instance
    """)
    
    response = client.post(
        "/api/v1/patterns/analyze",
        json={"file_path": str(test_file)}
    )
    assert response.status_code == 200
    data = response.json()
    assert "patterns" in data
    patterns = data["patterns"]
    assert len(patterns) > 0
    assert any(p["name"] == "singleton" for p in patterns)

@pytest.mark.asyncio
async def test_analyze_invalid_file(client: TestClient):
    """Test pattern analysis with invalid file."""
    response = client.post(
        "/api/v1/patterns/analyze",
        json={"file_path": "/nonexistent/file.py"}
    )
    assert response.status_code == 404

@pytest.mark.asyncio
async def test_analyze_invalid_python(client: TestClient, tmp_path):
    """Test pattern analysis with invalid Python code."""
    # Create a test file with invalid Python
    test_file = tmp_path / "invalid.py"
    test_file.write_text("class Invalid syntax")
    
    response = client.post(
        "/api/v1/patterns/analyze",
        json={"file_path": str(test_file)}
    )
    assert response.status_code == 400

@pytest.mark.asyncio
async def test_create_repository_invalid_url(client: TestClient):
    """Test creating a repository with invalid URL."""
    response = client.post(
        "/api/v1/repositories",
        json={
            "url": "invalid-url",
            "name": "test-repo",
            "branch": "main"
        }
    )
    assert response.status_code == 400
    assert "detail" in response.json()

@pytest.mark.asyncio
async def test_get_nonexistent_repository(client: TestClient):
    """Test getting a repository that doesn't exist."""
    response = client.get("/api/v1/repositories/nonexistent")
    assert response.status_code == 404
    assert "detail" in response.json()

@pytest.mark.asyncio
async def test_chat_empty_history(client: TestClient):
    """Test getting chat history when none exists."""
    response = client.get("/api/chat/history/test-repo")
    assert response.status_code == 200
    assert "messages" in response.json()
    assert len(response.json()["messages"]) == 0

@pytest.mark.asyncio
async def test_send_chat_message_invalid(client: TestClient):
    """Test sending an invalid chat message."""
    response = client.post(
        "/api/chat/message",
        json={"repo_id": "test-repo", "message": ""}
    )
    assert response.status_code == 422
    assert "detail" in response.json()

def test_get_best_practices_empty(client: TestClient):
    """Test getting best practices when none exist."""
    response = client.get("/api/practices")
    assert response.status_code == 200
    assert "practices" in response.json()
    assert len(response.json()["practices"]) == 0
