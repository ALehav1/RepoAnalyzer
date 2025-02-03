"""Vector store service for code chunks and best practices."""
import chromadb
from chromadb.config import Settings as ChromaSettings
from chromadb.utils import embedding_functions
import logging
from typing import Dict, Any, List, Optional
import asyncio
from fastapi.concurrency import run_in_threadpool
import numpy as np

logger = logging.getLogger(__name__)

class MockEmbeddingFunction(embedding_functions.EmbeddingFunction):
    """Mock embedding function for testing."""
    def __call__(self, texts: List[str]) -> List[List[float]]:
        # Generate deterministic mock embeddings based on text length
        return [np.array([len(text) / 100] * 10).astype(np.float32).tolist() for text in texts]

class VectorStoreService:
    """Service for storing and retrieving code chunks and best practices using vector embeddings."""
    
    _instance = None
    _client = None
    _test_mode = False
    
    @classmethod
    def get_instance(cls, test_mode: bool = False) -> 'VectorStoreService':
        """Get singleton instance of VectorStoreService."""
        if cls._instance is None:
            cls._instance = cls(test_mode)
        return cls._instance
    
    @classmethod
    def reset_instance(cls):
        """Reset the singleton instance (useful for testing)."""
        cls._instance = None
        cls._client = None
    
    def __init__(self, test_mode: bool = False):
        """Initialize the vector store service."""
        logger.info("Initializing VectorStoreService...")
        self._test_mode = test_mode
        
        # Configure ChromaDB - use in-memory storage for testing
        chroma_settings = ChromaSettings(
            is_persistent=False  # Use in-memory storage
        )
        
        # Initialize ChromaDB client
        if VectorStoreService._client is None:
            logger.info("Creating new ChromaDB client...")
            VectorStoreService._client = chromadb.Client(chroma_settings)
            
        self.client = VectorStoreService._client
        
        # Initialize embedding function
        logger.info("Initializing embedding function...")
        self.embedding_fn = MockEmbeddingFunction()
        logger.info("Using mock embedding function")
        
        # Create collections
        logger.info("Creating collections...")
        self._init_collections()
        logger.info("VectorStoreService initialization complete")
    
    def _init_collections(self) -> None:
        """Initialize ChromaDB collections."""
        self.code_collection = self.client.get_or_create_collection(
            name="code_chunks",
            embedding_function=self.embedding_fn
        )
        
        self.practices_collection = self.client.get_or_create_collection(
            name="best_practices",
            embedding_function=self.embedding_fn
        )
    
    async def add_code_chunk(
        self, 
        chunk_text: str, 
        metadata: Dict[str, Any], 
        chunk_id: str,
        is_best_practice: bool = False
    ) -> None:
        """Add a code chunk to the vector store."""
        try:
            collection = self.practices_collection if is_best_practice else self.code_collection
            
            # Run blocking ChromaDB operation in threadpool
            await run_in_threadpool(
                lambda: collection.add(
                    documents=[chunk_text],
                    metadatas=[metadata],
                    ids=[chunk_id]
                )
            )
            
            logger.info(f"Added code chunk {chunk_id} to vector store")
            
        except Exception as e:
            logger.error(f"Error adding code chunk to vector store: {str(e)}")
            raise
    
    async def search_code_chunks(
        self,
        query: str,
        n_results: int = 5,
        include_best_practices: bool = True
    ) -> List[Dict[str, Any]]:
        """Search for similar code chunks."""
        try:
            # Return empty list for empty queries
            if not query.strip():
                return []
            
            results = []
            
            # Search code collection
            code_results = await run_in_threadpool(
                lambda: self.code_collection.query(
                    query_texts=[query],
                    n_results=n_results
                )
            )
            
            if code_results['documents']:
                # Normalize distances to be between 0 and 1
                distances = code_results['distances'][0]
                max_dist = max(distances) if distances else 1
                
                for doc, metadata, distance in zip(
                    code_results['documents'][0],
                    code_results['metadatas'][0],
                    distances
                ):
                    results.append({
                        'text': doc,
                        'metadata': metadata,
                        'similarity': distance / max_dist if max_dist > 0 else 0,
                        'type': 'code'
                    })
            
            # Optionally search best practices
            if include_best_practices:
                practice_results = await run_in_threadpool(
                    lambda: self.practices_collection.query(
                        query_texts=[query],
                        n_results=n_results
                    )
                )
                
                if practice_results['documents']:
                    distances = practice_results['distances'][0]
                    max_dist = max(distances) if distances else 1
                    
                    for doc, metadata, distance in zip(
                        practice_results['documents'][0],
                        practice_results['metadatas'][0],
                        distances
                    ):
                        results.append({
                            'text': doc,
                            'metadata': metadata,
                            'similarity': distance / max_dist if max_dist > 0 else 0,
                            'type': 'best_practice'
                        })
            
            # Sort by similarity (ascending since lower distance = more similar)
            results.sort(key=lambda x: x['similarity'])
            return results[:n_results]
            
        except Exception as e:
            logger.error(f"Error searching vector store: {str(e)}")
            raise
