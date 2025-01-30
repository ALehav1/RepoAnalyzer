import pytest
from fastapi.testclient import TestClient
from unittest.mock import patch, MagicMock

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

def test_get_best_practices_empty(client: TestClient):
    """Test getting best practices when none exist."""
    response = client.get("/api/practices")
    assert response.status_code == 200
    assert "practices" in response.json()
    assert len(response.json()["practices"]) == 0

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
