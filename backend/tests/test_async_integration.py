"""Integration test for async operations in the RepoAnalyzer application.

This module tests the interaction between FastAPI, ChromaDB, and other async operations
to help identify potential stalling points.
"""
import asyncio
import logging
import sys
import tempfile
from typing import AsyncGenerator, List

import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient
from httpx import AsyncClient
import chromadb
from chromadb.config import Settings as ChromaSettings

# Configure detailed logging
logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    stream=sys.stdout
)
logger = logging.getLogger(__name__)


class TestChromaDB:
    """Test wrapper for ChromaDB operations."""
    
    def __init__(self, persist_dir: str):
        self.client = chromadb.PersistentClient(
            path=persist_dir,
            settings=ChromaSettings(
                anonymized_telemetry=False,
                allow_reset=True
            )
        )
        self.collection = self.client.create_collection("test_collection")
    
    async def add_documents(self, texts: List[str]) -> None:
        """Add documents to ChromaDB."""
        self.collection.add(
            documents=texts,
            ids=[f"id_{i}" for i in range(len(texts))]
        )
        logger.info(f"Added {len(texts)} documents to ChromaDB")
    
    async def query(self, query_text: str) -> List[str]:
        """Query documents from ChromaDB."""
        results = self.collection.query(
            query_texts=[query_text],
            n_results=2
        )
        return results['documents'][0]


def create_test_app(chroma_db: TestChromaDB) -> FastAPI:
    """Create FastAPI test application."""
    app = FastAPI()
    
    @app.post("/add")
    async def add_documents(texts: List[str]) -> dict:
        await chroma_db.add_documents(texts)
        return {"status": "success", "count": len(texts)}
    
    @app.get("/query/{text}")
    async def query_documents(text: str) -> dict:
        results = await chroma_db.query(text)
        return {"results": results}
    
    return app


@pytest.fixture
def temp_dir():
    """Create temporary directory for ChromaDB."""
    with tempfile.TemporaryDirectory() as tmp_dir:
        yield tmp_dir


@pytest.fixture
def chroma_db(temp_dir):
    """Create ChromaDB test instance."""
    return TestChromaDB(temp_dir)


@pytest.fixture
def app(chroma_db):
    """Create FastAPI test application."""
    return create_test_app(chroma_db)


@pytest.fixture
async def async_client(app) -> AsyncGenerator[AsyncClient, None]:
    """Create async test client."""
    async with AsyncClient(app=app, base_url="http://test") as client:
        yield client


@pytest.mark.asyncio
async def test_concurrent_operations(async_client: AsyncClient):
    """Test concurrent ChromaDB operations through FastAPI endpoints."""
    logger.info("Starting concurrent operations test")
    
    # Add documents
    texts = [
        "Test document one",
        "Test document two",
        "Another test document"
    ]
    
    response = await async_client.post("/add", json=texts)
    assert response.status_code == 200
    assert response.json()["count"] == len(texts)
    
    # Perform concurrent queries
    async def query(text: str) -> dict:
        response = await async_client.get(f"/query/{text}")
        assert response.status_code == 200
        return response.json()
    
    queries = ["test", "document", "another"]
    tasks = [query(q) for q in queries]
    
    # Wait for all queries with timeout
    try:
        results = await asyncio.wait_for(
            asyncio.gather(*tasks),
            timeout=10.0
        )
        logger.info(f"Completed {len(results)} concurrent queries")
        
        # Verify results
        for result in results:
            assert "results" in result
            assert len(result["results"]) > 0
            
    except asyncio.TimeoutError:
        logger.error("Concurrent operations timed out")
        raise
    except Exception as e:
        logger.error(f"Test failed: {str(e)}", exc_info=True)
        raise


if __name__ == "__main__":
    import uvicorn
    
    # Create test app
    temp_dir = tempfile.mkdtemp()
    chroma_db = TestChromaDB(temp_dir)
    app = create_test_app(chroma_db)
    
    # Run with uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)
