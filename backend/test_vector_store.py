"""Test the vector store functionality."""
import asyncio
import pytest
from src.services.vector_store import VectorStoreService
import logging

# Configure logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

@pytest.fixture(autouse=True)
async def setup_teardown():
    """Setup and teardown for each test."""
    VectorStoreService.reset_instance()
    yield
    VectorStoreService.reset_instance()

@pytest.mark.asyncio
async def test_add_and_search():
    """Test adding and searching code chunks."""
    # Initialize service
    store = VectorStoreService.get_instance()
    
    # Add a simple code chunk
    await store.add_code_chunk(
        "def hello(): print('world')",
        {"language": "python"},
        "test1"
    )
    
    # Search for it
    results = await store.search_code_chunks("print hello")
    
    # Verify results
    assert len(results) > 0
    assert "hello" in results[0]["text"]
    assert results[0]["metadata"]["language"] == "python"

if __name__ == "__main__":
    asyncio.run(test_add_and_search())
