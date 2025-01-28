import pytest
from fastapi.testclient import TestClient
from src.api.main import app
from src.config import VECTOR_STORE_DIR, REPOS_DIR, OUTPUT_DIR
from pathlib import Path
import shutil

@pytest.fixture
def test_client():
    """Create a test client for our FastAPI app."""
    return TestClient(app)

@pytest.fixture(autouse=True)
def clean_test_dirs():
    """Clean up test directories before and after each test."""
    # Create clean directories
    for dir_path in [VECTOR_STORE_DIR, REPOS_DIR, OUTPUT_DIR]:
        path = Path(dir_path)
        if path.exists():
            shutil.rmtree(path)
        path.mkdir(parents=True)
    
    yield
    
    # Clean up after test
    for dir_path in [VECTOR_STORE_DIR, REPOS_DIR, OUTPUT_DIR]:
        path = Path(dir_path)
        if path.exists():
            shutil.rmtree(path)
