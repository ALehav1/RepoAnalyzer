import re
from typing import List, Dict, Any
from pathlib import Path

class CodeChunker:
    def __init__(self, max_chunk_size: int = 1000):
        self.max_chunk_size = max_chunk_size

    def split_into_chunks(self, content: str, file_path: str) -> List[Dict[str, Any]]:
        """Split code content into analyzable chunks.
        
        Args:
            content (str): The code content to split
            file_path (str): Path to the source file
            
        Returns:
            List[Dict[str, Any]]: List of chunks with metadata
        """
        # Get file extension
        ext = Path(file_path).suffix.lower()
        
        # Split content into lines
        lines = content.split('\n')
        
        chunks = []
        current_chunk = []
        current_size = 0
        
        for i, line in enumerate(lines):
            # Skip empty lines at start of chunk
            if not current_chunk and not line.strip():
                continue
                
            line_size = len(line)
            
            # If adding this line would exceed max size, save current chunk
            if current_size + line_size > self.max_chunk_size and current_chunk:
                chunks.append(self._create_chunk(current_chunk, file_path, ext))
                current_chunk = []
                current_size = 0
            
            current_chunk.append(line)
            current_size += line_size
        
        # Add final chunk if any
        if current_chunk:
            chunks.append(self._create_chunk(current_chunk, file_path, ext))
        
        return chunks
    
    def _create_chunk(self, lines: List[str], file_path: str, ext: str) -> Dict[str, Any]:
        """Create a chunk with metadata.
        
        Args:
            lines (List[str]): Lines of code in the chunk
            file_path (str): Path to the source file
            ext (str): File extension
            
        Returns:
            Dict[str, Any]: Chunk with metadata
        """
        return {
            "content": "\n".join(lines),
            "metadata": {
                "file_path": file_path,
                "extension": ext,
                "line_count": len(lines),
                "start_line": 0,  # TODO: Track actual line numbers
                "end_line": len(lines)
            }
        }
