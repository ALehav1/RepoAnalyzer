"""Vector store service for code chunks and best practices."""

import chromadb
from chromadb.config import Settings
from chromadb.utils import embedding_functions
import logging
from typing import Dict, Any, List, Optional, Tuple
from pathlib import Path

logger = logging.getLogger(__name__)

class VectorStoreService:
    """Service for storing and retrieving code chunks and best practices using vector embeddings."""
    
    def __init__(self, persist_directory: Optional[str] = None):
        """Initialize the vector store service.
        
        Args:
            persist_directory: Optional directory to persist the vector store.
                If not provided, will use in-memory storage.
        """
        settings = Settings()
        if persist_directory:
            settings.persist_directory = persist_directory
            Path(persist_directory).mkdir(parents=True, exist_ok=True)
            
        self.client = chromadb.Client(settings)
        
        # Use OpenAI's text embedding model
        self.embedding_fn = embedding_functions.OpenAIEmbeddingFunction(
            api_key="",  # Will be set from environment
            model_name="text-embedding-ada-002"
        )
        
        # Create collections for different types of data
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
        """Add a code chunk to the vector store.
        
        Args:
            chunk_text: The code chunk text
            metadata: Metadata about the chunk
            chunk_id: Unique identifier for the chunk
            is_best_practice: Whether this chunk represents a best practice
        """
        try:
            collection = self.practices_collection if is_best_practice else self.code_collection
            collection.add(
                documents=[chunk_text],
                metadatas=[metadata],
                ids=[chunk_id]
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
        """Search for similar code chunks.
        
        Args:
            query: Search query
            n_results: Number of results to return
            include_best_practices: Whether to include best practices in search
            
        Returns:
            List of similar code chunks with their metadata
        """
        try:
            # Search in code collection
            code_results = self.code_collection.query(
                query_texts=[query],
                n_results=n_results
            )
            
            results = []
            if code_results['documents']:
                for doc, metadata, distance in zip(
                    code_results['documents'][0],
                    code_results['metadatas'][0],
                    code_results['distances'][0]
                ):
                    results.append({
                        'text': doc,
                        'metadata': metadata,
                        'similarity': 1 - distance,
                        'type': 'code'
                    })
            
            # Optionally search in best practices
            if include_best_practices:
                practice_results = self.practices_collection.query(
                    query_texts=[query],
                    n_results=n_results
                )
                
                if practice_results['documents']:
                    for doc, metadata, distance in zip(
                        practice_results['documents'][0],
                        practice_results['metadatas'][0],
                        practice_results['distances'][0]
                    ):
                        results.append({
                            'text': doc,
                            'metadata': metadata,
                            'similarity': 1 - distance,
                            'type': 'best_practice'
                        })
            
            # Sort by similarity
            results.sort(key=lambda x: x['similarity'], reverse=True)
            return results[:n_results]
            
        except Exception as e:
            logger.error(f"Error searching vector store: {str(e)}")
            raise
            
    def save_best_practice(self, practice: Dict[str, Any]) -> None:
        """Save a best practice.
        
        Args:
            practice: The best practice to save. Must contain:
                - text: The practice description
                - metadata: Additional metadata
                - id: Unique identifier
        """
        try:
            self.practices_collection.add(
                documents=[practice['text']],
                metadatas=[practice['metadata']],
                ids=[practice['id']]
            )
            logger.info(f"Saved best practice {practice['id']}")
            
        except Exception as e:
            logger.error(f"Error saving best practice: {str(e)}")
            raise
            
    def get_similar_practices(
        self,
        text: str,
        n_results: int = 5
    ) -> List[Dict[str, Any]]:
        """Find similar best practices.
        
        Args:
            text: Text to find similar practices for
            n_results: Number of results to return
            
        Returns:
            List of similar best practices with their metadata
        """
        try:
            results = self.practices_collection.query(
                query_texts=[text],
                n_results=n_results
            )
            
            if not results['documents']:
                return []
                
            practices = []
            for doc, metadata, distance in zip(
                results['documents'][0],
                results['metadatas'][0],
                results['distances'][0]
            ):
                practices.append({
                    'text': doc,
                    'metadata': metadata,
                    'similarity': 1 - distance
                })
                
            return practices
            
        except Exception as e:
            logger.error(f"Error getting similar practices: {str(e)}")
            raise
