"""Tests for the vector store service."""

import pytest
from unittest.mock import MagicMock, patch
import chromadb
from chromadb.config import Settings
from src.services.vector_store import VectorStoreService

@pytest.fixture
def mock_chroma_client():
    """Create a mock ChromaDB client."""
    client = MagicMock()
    
    # Mock collections
    code_collection = MagicMock()
    practices_collection = MagicMock()
    
    # Setup collection query responses
    code_collection.query.return_value = {
        'documents': [['def test(): pass']],
        'metadatas': [{'file': 'test.py', 'type': 'python'}],
        'distances': [[0.1]]
    }
    
    practices_collection.query.return_value = {
        'documents': [['Use descriptive variable names']],
        'metadatas': [{'category': 'style', 'language': 'python'}],
        'distances': [[0.2]]
    }
    
    client.get_or_create_collection.side_effect = [code_collection, practices_collection]
    return client

@pytest.fixture
def vector_store(mock_chroma_client):
    """Create a VectorStoreService with mocked dependencies."""
    store = VectorStoreService()
    store.client = mock_chroma_client
    store.embedding_fn = lambda texts: [[0.1] * 1536 for _ in texts]
    return store

@pytest.mark.asyncio
async def test_add_code_chunk(vector_store):
    """Test adding a code chunk to the vector store."""
    chunk_text = "def test(): pass"
    metadata = {"file": "test.py", "type": "python"}
    chunk_id = "test_1"
    
    await vector_store.add_code_chunk(chunk_text, metadata, chunk_id)
    
    # Verify chunk was added to code collection
    vector_store.code_collection.add.assert_called_once_with(
        documents=[chunk_text],
        metadatas=[metadata],
        ids=[chunk_id]
    )

@pytest.mark.asyncio
async def test_add_best_practice_chunk(vector_store):
    """Test adding a best practice chunk to the vector store."""
    practice_text = "Use descriptive variable names"
    metadata = {"category": "style", "language": "python"}
    chunk_id = "practice_1"
    
    await vector_store.add_code_chunk(
        practice_text,
        metadata,
        chunk_id,
        is_best_practice=True
    )
    
    # Verify practice was added to practices collection
    vector_store.practices_collection.add.assert_called_once_with(
        documents=[practice_text],
        metadatas=[metadata],
        ids=[chunk_id]
    )

@pytest.mark.asyncio
async def test_search_code_chunks(vector_store):
    """Test searching for code chunks."""
    query = "test function"
    results = await vector_store.search_code_chunks(query, n_results=1)
    
    # Verify search results
    assert len(results) == 1
    assert results[0]['text'] == 'def test(): pass'
    assert results[0]['metadata']['file'] == 'test.py'
    assert results[0]['type'] == 'code'
    assert results[0]['similarity'] == 0.9  # 1 - distance

@pytest.mark.asyncio
async def test_search_with_best_practices(vector_store):
    """Test searching including best practices."""
    query = "coding style"
    results = await vector_store.search_code_chunks(
        query,
        n_results=2,
        include_best_practices=True
    )
    
    # Verify combined results
    assert len(results) == 2
    assert any(r['type'] == 'code' for r in results)
    assert any(r['type'] == 'best_practice' for r in results)

@pytest.mark.asyncio
async def test_save_best_practice(vector_store):
    """Test saving a best practice."""
    practice = {
        'text': 'Use meaningful variable names',
        'metadata': {'category': 'style'},
        'id': 'practice_1'
    }
    
    vector_store.save_best_practice(practice)
    
    # Verify practice was saved
    vector_store.practices_collection.add.assert_called_once_with(
        documents=[practice['text']],
        metadatas=[practice['metadata']],
        ids=[practice['id']]
    )

def test_get_similar_practices(vector_store):
    """Test finding similar best practices."""
    text = "variable naming conventions"
    results = vector_store.get_similar_practices(text)
    
    # Verify similar practices were found
    assert len(results) == 1
    assert results[0]['text'] == 'Use descriptive variable names'
    assert results[0]['metadata']['category'] == 'style'
    assert results[0]['similarity'] == 0.8  # 1 - distance

@pytest.mark.asyncio
async def test_add_code_chunk_error(vector_store):
    """Test error handling when adding code chunks."""
    vector_store.code_collection.add.side_effect = Exception("Database error")
    
    with pytest.raises(Exception) as exc:
        await vector_store.add_code_chunk("test", {}, "test_1")
    assert "Database error" in str(exc.value)

@pytest.mark.asyncio
async def test_search_error(vector_store):
    """Test error handling during search."""
    vector_store.code_collection.query.side_effect = Exception("Search error")
    
    with pytest.raises(Exception) as exc:
        await vector_store.search_code_chunks("test")
    assert "Search error" in str(exc.value)

def test_persistence(tmp_path):
    """Test vector store persistence."""
    # Create persistent store
    store1 = VectorStoreService(persist_directory=str(tmp_path))
    
    # Add some data
    store1.practices_collection.add(
        documents=["test practice"],
        metadatas=[{"test": True}],
        ids=["test1"]
    )
    
    # Create new store with same persistence
    store2 = VectorStoreService(persist_directory=str(tmp_path))
    
    # Verify data persisted
    results = store2.practices_collection.get(ids=["test1"])
    assert results['documents'][0] == "test practice"
    assert results['metadatas'][0]['test'] is True
