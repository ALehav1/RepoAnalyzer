import pytest
from src.ingestor.chunker import CodeChunker
from src.analysis.analyzer import CodeAnalyzer
from src.storage.vector_store import VectorStore

def test_code_chunker():
    """Test code chunking functionality."""
    chunker = CodeChunker()
    code = """def hello():
    print("Hello, World!")

def goodbye():
    print("Goodbye!")"""
    
    chunks = chunker.split_into_chunks(code, "test.py")
    assert len(chunks) > 0
    assert "hello" in chunks[0]["content"]
    assert chunks[0]["metadata"]["file_type"] == "py"

@pytest.mark.asyncio
async def test_code_analyzer():
    """Test code analysis functionality."""
    analyzer = CodeAnalyzer()
    chunk = {
        "content": "def hello():\n    print('Hello, World!')",
        "metadata": {
            "file_path": "test.py",
            "start_line": 1,
            "end_line": 2,
            "file_type": "py"
        }
    }
    
    analysis = await analyzer.analyze_chunk(chunk)
    assert "dimensions" in analysis
    assert "summary" in analysis
    assert isinstance(analysis["best_practice"], bool)

@pytest.mark.asyncio
async def test_vector_store():
    """Test vector store functionality."""
    store = VectorStore()
    chunk_text = "def hello():\n    print('Hello, World!')"
    metadata = {
        "file_path": "test.py",
        "start_line": 1,
        "end_line": 2,
        "file_type": "py"
    }
    
    # Test adding a chunk
    success = await store.add_code_chunk(chunk_text, metadata, "test_chunk_1")
    assert success
    
    # Test searching
    results = await store.search_similar("function that prints hello")
    assert "matches" in results
    assert len(results["matches"]) > 0
