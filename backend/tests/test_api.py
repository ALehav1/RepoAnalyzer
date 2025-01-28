import pytest
from fastapi.testclient import TestClient

def test_analyze_repo_invalid_url(test_client: TestClient):
    """Test analyzing a repository with an invalid URL."""
    response = test_client.post("/api/analyze-repo", json={"url": "invalid_url"})
    assert response.status_code == 500
    assert "error" in response.json()

def test_search_empty_query(test_client: TestClient):
    """Test searching with an empty query."""
    response = test_client.post("/api/search", json={"query": ""})
    assert response.status_code == 200
    assert "results" in response.json()
    assert len(response.json()["results"]) == 0

def test_get_best_practices_empty(test_client: TestClient):
    """Test getting best practices when none exist."""
    response = test_client.get("/api/best-practices")
    assert response.status_code == 200
    assert "best_practices" in response.json()
    assert len(response.json()["best_practices"]) == 0
