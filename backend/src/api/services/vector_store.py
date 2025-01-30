"""Vector store service for managing code embeddings and similarity search."""

import chromadb
from chromadb.config import Settings
from typing import List, Dict, Any, Optional
import logging

logger = logging.getLogger(__name__)

class VectorStoreService:
    """Service for managing vector storage and retrieval operations."""
    
    def __init__(self, persist_directory: str = "./chroma_db"):
        """Initialize vector store with persistence directory."""
        try:
            self.client = chromadb.Client(Settings(
                persist_directory=persist_directory,
                anonymized_telemetry=False
            ))
            logger.info(f"Initialized ChromaDB with persist directory: {persist_directory}")
        except Exception as e:
            logger.error(f"Failed to initialize ChromaDB: {str(e)}")
            raise

    def add_code_chunk(self, chunk_text: str, metadata: Dict[str, Any], chunk_id: str) -> None:
        """Add a code chunk to the vector store."""
        try:
            collection = self.client.get_or_create_collection("code_chunks")
            collection.add(
                documents=[chunk_text],
                metadatas=[metadata],
                ids=[chunk_id]
            )
            logger.info(f"Added code chunk with ID: {chunk_id}")
        except Exception as e:
            logger.error(f"Failed to add code chunk: {str(e)}")
            raise

    def get_similar_chunks(
        self,
        query_text: str,
        n_results: int = 5,
        where: Optional[Dict[str, Any]] = None
    ) -> List[Dict[str, Any]]:
        """Get similar code chunks based on query text."""
        try:
            collection = self.client.get_collection("code_chunks")
            results = collection.query(
                query_texts=[query_text],
                n_results=n_results,
                where=where
            )
            logger.info(f"Retrieved {len(results.get('documents', [[]])[0])} similar chunks")
            return [
                {
                    "id": id_,
                    "text": doc,
                    "metadata": meta,
                    "distance": dist
                }
                for id_, doc, meta, dist in zip(
                    results["ids"][0],
                    results["documents"][0],
                    results["metadatas"][0],
                    results["distances"][0]
                )
            ]
        except Exception as e:
            logger.error(f"Failed to query similar chunks: {str(e)}")
            raise

    def delete_chunk(self, chunk_id: str) -> None:
        """Delete a code chunk from the vector store."""
        try:
            collection = self.client.get_collection("code_chunks")
            collection.delete(ids=[chunk_id])
            logger.info(f"Deleted code chunk with ID: {chunk_id}")
        except Exception as e:
            logger.error(f"Failed to delete code chunk: {str(e)}")
            raise

    def clear_all(self) -> None:
        """Clear all data from the vector store."""
        try:
            self.client.reset()
            logger.info("Cleared all data from vector store")
        except Exception as e:
            logger.error(f"Failed to clear vector store: {str(e)}")
            raise
