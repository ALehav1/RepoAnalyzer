"""Tests for vector store service."""
import pytest
from unittest.mock import AsyncMock, MagicMock, patch
import numpy as np
import tempfile
import shutil
import os
from pathlib import Path
from chromadb.api.types import EmbeddingFunction

from src.services.vector_store import VectorStoreService
from src.models.base import File

class MockEmbeddingFunction(EmbeddingFunction):
    """Mock implementation of ChromaDB's EmbeddingFunction."""
    def __call__(self, input: list[str]) -> list[list[float]]:
        """Generate mock embeddings."""
        return [np.random.rand(1536).tolist() for _ in input]

@pytest.fixture
def mock_openai_embeddings():
    """Mock OpenAI embeddings."""
    with patch('chromadb.utils.embedding_functions.OpenAIEmbeddingFunction') as mock:
        mock.return_value = MockEmbeddingFunction()
        yield mock

def test_vector_store_initialization(mock_openai_embeddings):
    """Test vector store initialization."""
    store = VectorStoreService.get_instance()  # Use in-memory store
    assert store is not None
    
    # Test singleton pattern
    store2 = VectorStoreService.get_instance()
    assert store is store2

@pytest.mark.asyncio
async def test_add_code_chunk(mock_openai_embeddings):
    """Test adding a code chunk to the vector store."""
    store = VectorStoreService.get_instance()  # Use in-memory store
    
    # Add code chunk
    chunk_id = "test1"
    content = "def test_function():\n    pass"
    metadata = {"path": "/test/file.py", "language": "python"}
    
    await store.add_code_chunk(content, metadata, chunk_id)
    
    # Verify chunk was added
    results = await store.search_code_chunks("test function")
    assert len(results) > 0
    assert results[0]['text'] == content
    assert results[0]['similarity'] >= 0  # Distance should be non-negative
    assert results[0]['similarity'] <= 1  # Distance should be normalized
    assert results[0]['metadata'] == metadata

@pytest.mark.asyncio
async def test_search_code_chunks(mock_openai_embeddings):
    """Test searching for similar code chunks."""
    store = VectorStoreService.get_instance()  # Use in-memory store
    
    # Add multiple chunks
    chunks = [
        ("chunk1", "def function1():\n    pass", {"path": "/test/file1.py"}),
        ("chunk2", "def function2():\n    return True", {"path": "/test/file2.py"}),
        ("chunk3", "class TestClass:\n    pass", {"path": "/test/file3.py"})
    ]
    
    for chunk_id, content, metadata in chunks:
        await store.add_code_chunk(content, metadata, chunk_id)
    
    # Search for functions
    results = await store.search_code_chunks("function")
    assert len(results) >= 2
    assert any("function" in r['text'] for r in results)  # At least one function in results
    assert all(0 <= r['similarity'] <= 1 for r in results)  # All distances normalized
    
    # Search for class
    results = await store.search_code_chunks("class")
    assert len(results) >= 1
    assert any("TestClass" in r['text'] for r in results)  # Class should be in results

@pytest.mark.asyncio
async def test_best_practices(mock_openai_embeddings):
    """Test best practices functionality."""
    store = VectorStoreService.get_instance()  # Use in-memory store
    
    # Add a best practice
    practice = {
        'id': 'bp1',
        'text': 'Always use type hints in Python functions',
        'metadata': {
            'category': 'python',
            'importance': 'high'
        }
    }
    
    store.save_best_practice(practice)
    
    # Search for similar practices
    results = store.get_similar_practices("type hints")
    assert len(results) > 0
    assert 'type hints' in results[0]['text'].lower()

@pytest.mark.asyncio
async def test_error_handling(mock_openai_embeddings):
    """Test error handling in vector store operations."""
    store = VectorStoreService.get_instance()  # Use in-memory store
    
    # Test adding with invalid ID
    with pytest.raises(Exception):
        await store.add_code_chunk(None, {}, None)
    
    # Test searching with empty query
    results = await store.search_code_chunks("")
    assert len(results) == 0
