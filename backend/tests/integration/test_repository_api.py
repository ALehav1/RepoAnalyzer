"""Integration tests for repository API endpoints."""
import pytest
from httpx import AsyncClient
from fastapi import FastAPI
import asyncio
from datetime import datetime

from src.main import app
from src.schemas.repository import RepositoryCreate, Repository, AnalysisResponse
from src.services.crud.repo_service import RepoCRUDService

@pytest.fixture
async def client():
    """Create async test client."""
    async with AsyncClient(app=app, base_url="http://test") as client:
        yield client

@pytest.fixture
def valid_repo_data():
    """Valid repository data for testing."""
    return {
        "url": "https://github.com/user/test-repo",
        "branch": "main",
        "depth": 1
    }

@pytest.mark.asyncio
async def test_create_repository(client, valid_repo_data):
    """Test repository creation endpoint."""
    response = await client.post("/api/repositories", json=valid_repo_data)
    
    assert response.status_code == 200
    data = response.json()
    
    assert data["url"] == valid_repo_data["url"]
    assert data["branch"] == valid_repo_data["branch"]
    assert data["name"] == "test-repo"
    assert data["status"] == "pending"
    assert data["is_valid"] is True
    assert "id" in data
    assert "created_at" in data
    assert "updated_at" in data

@pytest.mark.asyncio
async def test_create_repository_invalid_url(client):
    """Test repository creation with invalid URL."""
    invalid_data = {
        "url": "invalid-url",
        "branch": "main"
    }
    
    response = await client.post("/api/repositories", json=invalid_data)
    assert response.status_code == 400
    assert "Invalid repository URL" in response.json()["detail"]

@pytest.mark.asyncio
async def test_analyze_repository(client, valid_repo_data):
    """Test repository analysis endpoint."""
    # First create a repository
    create_response = await client.post("/api/repositories", json=valid_repo_data)
    assert create_response.status_code == 200
    repo_id = create_response.json()["id"]
    
    # Start analysis
    response = await client.post(f"/api/repositories/{repo_id}/analyze")
    assert response.status_code == 200
    data = response.json()
    
    assert data["repository"]["id"] == repo_id
    assert data["status"] == "in_progress"

@pytest.mark.asyncio
async def test_get_analysis_status(client, valid_repo_data):
    """Test getting analysis status endpoint."""
    # First create a repository
    create_response = await client.post("/api/repositories", json=valid_repo_data)
    assert create_response.status_code == 200
    repo_id = create_response.json()["id"]
    
    # Start analysis
    await client.post(f"/api/repositories/{repo_id}/analyze")
    
    # Get status
    response = await client.get(f"/api/repositories/{repo_id}/status")
    assert response.status_code == 200
    data = response.json()
    
    assert data["repository"]["id"] == repo_id
    assert data["status"] in ["pending", "in_progress", "completed", "failed"]

@pytest.mark.asyncio
async def test_cancel_analysis(client, valid_repo_data):
    """Test cancelling analysis endpoint."""
    # First create a repository
    create_response = await client.post("/api/repositories", json=valid_repo_data)
    assert create_response.status_code == 200
    repo_id = create_response.json()["id"]
    
    # Start analysis
    await client.post(f"/api/repositories/{repo_id}/analyze")
    
    # Cancel analysis
    response = await client.post(f"/api/repositories/{repo_id}/cancel")
    assert response.status_code == 200
    assert response.json()["message"] == "Analysis cancelled successfully"
    
    # Verify status is failed
    status_response = await client.get(f"/api/repositories/{repo_id}/status")
    assert status_response.status_code == 200
    assert status_response.json()["status"] == "failed"
    assert "cancelled by user" in status_response.json()["error"].lower()

@pytest.mark.asyncio
async def test_nonexistent_repository(client):
    """Test endpoints with non-existent repository ID."""
    repo_id = "nonexistent-id"
    
    # Try to start analysis
    response = await client.post(f"/api/repositories/{repo_id}/analyze")
    assert response.status_code == 404
    assert "not found" in response.json()["detail"].lower()
    
    # Try to get status
    response = await client.get(f"/api/repositories/{repo_id}/status")
    assert response.status_code == 404
    assert "not found" in response.json()["detail"].lower()
    
    # Try to cancel analysis
    response = await client.post(f"/api/repositories/{repo_id}/cancel")
    assert response.status_code == 404
    assert "not found" in response.json()["detail"].lower()
