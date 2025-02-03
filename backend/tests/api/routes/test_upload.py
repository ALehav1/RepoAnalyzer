"""Tests for repository upload functionality."""
import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient
from unittest.mock import AsyncMock, patch, MagicMock
import io
import csv
from datetime import datetime

from src.api.routes.upload import router, get_upload_service
from src.schemas.upload import CSVUploadResponse, CSVUploadStatus
from src.core.exceptions import ValidationError
from src.services.upload import CSVUploadService
from src.api.middleware.error_handler import ErrorHandlerMiddleware

app = FastAPI()
app.add_middleware(ErrorHandlerMiddleware)
app.include_router(router, prefix="/api")

@pytest.fixture
def mock_service():
    """Create a mock upload service."""
    service = MagicMock(spec=CSVUploadService)
    
    # Create async mock for process_csv
    async_process_csv = AsyncMock()
    service.process_csv = async_process_csv
    
    # Override the dependency
    app.dependency_overrides[get_upload_service] = lambda: service
    
    yield service
    
    # Clean up
    app.dependency_overrides.clear()

@pytest.fixture
def client():
    """Create a test client."""
    return TestClient(app)

@pytest.fixture
def valid_csv_content():
    """Create valid CSV content for testing."""
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["url", "name", "description"])
    writer.writerow([
        "https://github.com/user/repo1",
        "Test Repo 1",
        "A test repository"
    ])
    writer.writerow([
        "https://github.com/user/repo2",
        "Test Repo 2",
        "Another test repository"
    ])
    return output.getvalue().encode('utf-8')

@pytest.fixture
def invalid_csv_content():
    """Create invalid CSV content for testing."""
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["invalid_header"])
    writer.writerow(["not_a_url"])
    return output.getvalue().encode('utf-8')

@pytest.mark.asyncio
async def test_upload_repositories_success(client, mock_service, valid_csv_content):
    """Test successful CSV upload."""
    # Configure mock
    mock_service.process_csv.return_value = (
        "test-task-id",
        CSVUploadStatus(
            task_id="test-task-id",
            status="pending",
            total_repositories=2,
            processed_repositories=0,
            started_at=datetime.utcnow()
        )
    )
    
    # Make request
    response = client.post(
        "/api/upload/repositories",
        files={"file": ("test.csv", valid_csv_content, "text/csv")}
    )
    
    # Check response
    assert response.status_code == 200
    data = response.json()
    assert data["task_id"] == "test-task-id"
    assert data["total_repositories"] == 2
    assert data["accepted_repositories"] == 2
    assert data["rejected_repositories"] == 0
    
    # Verify service called
    mock_service.process_csv.assert_called_once()

@pytest.mark.asyncio
async def test_upload_repositories_invalid_file(client, mock_service):
    """Test upload with invalid file type."""
    response = client.post(
        "/api/upload/repositories",
        files={"file": ("test.txt", b"not a csv", "text/plain")}
    )
    
    assert response.status_code == 422
    data = response.json()
    assert "Invalid file type" in data["message"]

@pytest.mark.asyncio
async def test_upload_repositories_invalid_csv(client, mock_service, invalid_csv_content):
    """Test upload with invalid CSV headers."""
    # Configure mock to raise ValidationError
    mock_service.process_csv.side_effect = ValidationError(
        message="Invalid CSV headers"
    )
    
    response = client.post(
        "/api/upload/repositories",
        files={"file": ("test.csv", invalid_csv_content, "text/csv")}
    )
    
    assert response.status_code == 422
    data = response.json()
    assert "Invalid CSV headers" in data["message"]
    
    # Verify service called
    mock_service.process_csv.assert_called_once()

@pytest.mark.asyncio
async def test_get_upload_status_success(client, mock_service):
    """Test successful status retrieval."""
    task_id = "test-task-id"
    
    # Configure mock
    mock_service.get_upload_status.return_value = CSVUploadStatus(
        task_id=task_id,
        status="processing",
        total_repositories=2,
        processed_repositories=1,
        started_at=datetime.utcnow()
    )
    
    # Make request
    response = client.get(f"/api/upload/repositories/{task_id}")
    
    # Check response
    assert response.status_code == 200
    data = response.json()
    assert data["task_id"] == task_id
    assert data["status"] == "processing"
    assert data["total_repositories"] == 2
    assert data["processed_repositories"] == 1
    
    # Verify service called
    mock_service.get_upload_status.assert_called_once_with(task_id)

@pytest.mark.asyncio
async def test_get_upload_status_not_found(client, mock_service):
    """Test status retrieval for non-existent task."""
    task_id = "non-existent-task"
    
    # Configure mock to raise ValidationError
    mock_service.get_upload_status.side_effect = ValidationError(
        message="Upload task not found"
    )
    
    # Make request
    response = client.get(f"/api/upload/repositories/{task_id}")
    
    # Check response
    assert response.status_code == 422
    data = response.json()
    assert "Upload task not found" in data["message"]
    
    # Verify service called
    mock_service.get_upload_status.assert_called_once_with(task_id)

@pytest.mark.asyncio
async def test_upload_empty_file(client, mock_service):
    """Test upload with empty file."""
    response = client.post(
        "/api/upload/repositories",
        files={"file": ("test.csv", b"", "text/csv")}
    )
    
    assert response.status_code == 422
    data = response.json()
    assert "Empty file" in data["message"]

@pytest.mark.asyncio
async def test_upload_missing_file(client):
    """Test upload without file."""
    response = client.post("/api/upload/repositories")
    assert response.status_code == 422

@pytest.mark.asyncio
async def test_upload_large_csv(client, mock_service):
    """Test upload with large CSV file."""
    # Create large CSV content
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["url", "name", "description"])
    
    # Add 1000 repositories
    for i in range(1000):
        writer.writerow([
            f"https://github.com/user/repo{i}",
            f"Test Repo {i}",
            f"Repository {i}"
        ])
    
    content = output.getvalue().encode('utf-8')
    
    # Configure mock
    mock_service.process_csv.return_value = (
        "test-task-id",
        CSVUploadStatus(
            task_id="test-task-id",
            status="pending",
            total_repositories=1000,
            processed_repositories=0,
            started_at=datetime.utcnow()
        )
    )
    
    # Make request
    response = client.post(
        "/api/upload/repositories",
        files={"file": ("test.csv", content, "text/csv")}
    )
    
    # Check response
    assert response.status_code == 200
    data = response.json()
    assert data["total_repositories"] == 1000
    assert data["accepted_repositories"] == 1000
    assert data["rejected_repositories"] == 0
    
    # Verify service called
    mock_service.process_csv.assert_called_once()

@pytest.mark.asyncio
async def test_upload_malformed_csv(client, mock_service):
    """Test upload with malformed CSV."""
    # Create malformed CSV content
    content = b'url,name\nmalformed"data'
    
    # Configure mock to raise ValidationError
    mock_service.process_csv.side_effect = ValidationError(
        message="Malformed CSV"
    )
    
    response = client.post(
        "/api/upload/repositories",
        files={"file": ("test.csv", content, "text/csv")}
    )
    
    assert response.status_code == 422
    data = response.json()
    assert "Malformed CSV" in data["message"]

@pytest.mark.asyncio
async def test_upload_duplicate_urls(client, mock_service):
    """Test upload with duplicate repository URLs."""
    # Create CSV with duplicate URLs
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["url", "name", "description"])
    writer.writerow([
        "https://github.com/user/repo1",
        "Test Repo 1",
        "A test repository"
    ])
    writer.writerow([
        "https://github.com/user/repo1",  # Duplicate URL
        "Test Repo 1 Duplicate",
        "Another test repository"
    ])
    content = output.getvalue().encode('utf-8')
    
    # Configure mock
    mock_service.process_csv.return_value = (
        "test-task-id",
        CSVUploadStatus(
            task_id="test-task-id",
            status="pending",
            total_repositories=2,
            processed_repositories=0,
            started_at=datetime.utcnow(),
            failed_repositories=[
                {
                    "url": "https://github.com/user/repo1",
                    "error": "Duplicate repository URL"
                }
            ]
        )
    )
    
    # Make request
    response = client.post(
        "/api/upload/repositories",
        files={"file": ("test.csv", content, "text/csv")}
    )
    
    # Check response
    assert response.status_code == 200
    data = response.json()
    assert data["total_repositories"] == 2
    assert data["accepted_repositories"] == 1
    assert data["rejected_repositories"] == 1

@pytest.mark.asyncio
async def test_get_upload_status_completed(client, mock_service):
    """Test status retrieval for completed upload."""
    task_id = "test-task-id"
    completed_at = datetime.utcnow()
    
    # Configure mock
    mock_service.get_upload_status.return_value = CSVUploadStatus(
        task_id=task_id,
        status="completed",
        total_repositories=2,
        processed_repositories=2,
        started_at=datetime.utcnow(),
        completed_at=completed_at
    )
    
    # Make request
    response = client.get(f"/api/upload/repositories/{task_id}")
    
    # Check response
    assert response.status_code == 200
    data = response.json()
    assert data["task_id"] == task_id
    assert data["status"] == "completed"
    assert data["total_repositories"] == 2
    assert data["processed_repositories"] == 2
    assert "completed_at" in data
    
    # Verify service called
    mock_service.get_upload_status.assert_called_once_with(task_id)

@pytest.mark.asyncio
async def test_get_upload_status_failed(client, mock_service):
    """Test status retrieval for failed upload."""
    task_id = "test-task-id"
    error_message = "Database connection failed"
    
    # Configure mock
    mock_service.get_upload_status.return_value = CSVUploadStatus(
        task_id=task_id,
        status="failed",
        total_repositories=2,
        processed_repositories=1,
        started_at=datetime.utcnow(),
        completed_at=datetime.utcnow(),
        error=error_message
    )
    
    # Make request
    response = client.get(f"/api/upload/repositories/{task_id}")
    
    # Check response
    assert response.status_code == 200
    data = response.json()
    assert data["task_id"] == task_id
    assert data["status"] == "failed"
    assert data["error"] == error_message
    
    # Verify service called
    mock_service.get_upload_status.assert_called_once_with(task_id)
