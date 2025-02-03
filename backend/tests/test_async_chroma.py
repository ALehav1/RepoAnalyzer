"""Test async functionality with ChromaDB operations.

This module provides test cases for async operations with ChromaDB to help diagnose
potential stalling issues.
"""
import asyncio
import logging
import sys
from asyncio import TimeoutError
from typing import Any, Callable, Coroutine, List
import tempfile
import shutil
import os

import pytest
import chromadb
from chromadb.config import Settings as ChromaSettings

# Configure detailed logging
logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    stream=sys.stdout
)
logger = logging.getLogger(__name__)


class AsyncChromaError(Exception):
    """Exception raised when an async ChromaDB operation fails."""
    pass


class ChromaTestClient:
    """Test client for ChromaDB operations."""
    
    def __init__(self, persist_dir: str):
        """Initialize ChromaDB client with persistence directory."""
        self.persist_dir = persist_dir
        self.client = chromadb.PersistentClient(
            path=persist_dir,
            settings=ChromaSettings(
                anonymized_telemetry=False,
                allow_reset=True
            )
        )
        self.collection = self.client.create_collection("test_collection")
        
    async def add_embeddings(self, texts: List[str], delay: float = 0) -> None:
        """Add embeddings to the collection with optional delay.
        
        Args:
            texts: List of texts to embed
            delay: Optional delay in seconds before operation
        """
        if delay:
            await asyncio.sleep(delay)
            
        try:
            # Using ids that match the text position for easy verification
            self.collection.add(
                documents=texts,
                ids=[f"id_{i}" for i in range(len(texts))]
            )
            logger.info(f"Added {len(texts)} embeddings to collection")
        except Exception as e:
            logger.error(f"Failed to add embeddings: {str(e)}", exc_info=True)
            raise AsyncChromaError(f"Failed to add embeddings: {str(e)}")
    
    async def query_embeddings(self, query_text: str, delay: float = 0) -> List[str]:
        """Query embeddings from the collection with optional delay.
        
        Args:
            query_text: Text to query
            delay: Optional delay in seconds before operation
            
        Returns:
            List of matching documents
        """
        if delay:
            await asyncio.sleep(delay)
            
        try:
            results = self.collection.query(
                query_texts=[query_text],
                n_results=2
            )
            logger.info(f"Query returned {len(results['documents'][0])} results")
            return results['documents'][0]
        except Exception as e:
            logger.error(f"Failed to query embeddings: {str(e)}", exc_info=True)
            raise AsyncChromaError(f"Failed to query embeddings: {str(e)}")


async def run_with_timeout(
    coro: Callable[..., Coroutine[Any, Any, Any]],
    timeout: float = 5.0,
    **kwargs: Any
) -> Any:
    """Run an async operation with a timeout.
    
    Args:
        coro: Async function to run
        timeout: Maximum time to wait in seconds
        **kwargs: Arguments to pass to coro
        
    Returns:
        Result from the coroutine
        
    Raises:
        AsyncChromaError: If the operation times out or fails
    """
    try:
        logger.info(f"Running {coro.__name__} with {timeout}s timeout")
        result = await asyncio.wait_for(coro(**kwargs), timeout=timeout)
        logger.info(f"Operation completed successfully")
        return result
    except TimeoutError:
        logger.error(f"Operation timed out after {timeout}s")
        raise AsyncChromaError(f"Operation timed out after {timeout}s")
    except Exception as e:
        logger.error(f"Operation failed: {str(e)}", exc_info=True)
        raise AsyncChromaError(f"Operation failed: {str(e)}")


@pytest.fixture
async def chroma_client():
    """Fixture to create and cleanup ChromaDB client."""
    # Create temporary directory for ChromaDB
    temp_dir = tempfile.mkdtemp()
    client = ChromaTestClient(temp_dir)
    
    yield client
    
    # Cleanup
    shutil.rmtree(temp_dir)


@pytest.mark.asyncio
async def test_chroma_add_embeddings(chroma_client: ChromaTestClient) -> None:
    """Test adding embeddings to ChromaDB."""
    logger.info("Starting ChromaDB add embeddings test")
    texts = ["This is a test document", "Another test document"]
    
    await run_with_timeout(
        chroma_client.add_embeddings,
        texts=texts,
        delay=0.1
    )
    
    # Verify embeddings were added
    results = await run_with_timeout(
        chroma_client.query_embeddings,
        query_text="test document"
    )
    assert len(results) > 0
    assert "test document" in results[0].lower()
    logger.info("ChromaDB add embeddings test completed successfully")


@pytest.mark.asyncio
async def test_chroma_timeout(chroma_client: ChromaTestClient) -> None:
    """Test that ChromaDB operations timeout correctly."""
    logger.info("Starting ChromaDB timeout test")
    texts = ["Test document for timeout"]
    
    with pytest.raises(AsyncChromaError) as exc_info:
        await run_with_timeout(
            chroma_client.add_embeddings,
            timeout=0.1,
            texts=texts,
            delay=1.0  # Delay longer than timeout
        )
    assert "timed out" in str(exc_info.value)
    logger.info("ChromaDB timeout test completed successfully")


if __name__ == "__main__":
    logger.info("Starting ChromaDB tests")
    try:
        asyncio.run(test_chroma_add_embeddings(ChromaTestClient(tempfile.mkdtemp())))
        logger.info("All ChromaDB tests completed successfully")
    except KeyboardInterrupt:
        logger.info("Tests interrupted by user")
    except Exception as e:
        logger.error(f"Tests failed with error: {str(e)}", exc_info=True)
        sys.exit(1)
