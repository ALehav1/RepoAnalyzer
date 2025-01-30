"""Code chunking utilities."""

from typing import List, Dict, Any
import re
import logging

logger = logging.getLogger(__name__)

class CodeChunker:
    """Utility class for chunking code into analyzable segments."""

    def __init__(self, max_chunk_size: int = 1000):
        """Initialize code chunker.
        
        Args:
            max_chunk_size: Maximum size of a code chunk in characters
        """
        self.max_chunk_size = max_chunk_size

    def split_into_chunks(self, code: str) -> List[Dict[str, Any]]:
        """Split code into logical chunks.
        
        Args:
            code: Source code string
            
        Returns:
            List[Dict[str, Any]]: List of code chunks with metadata
        """
        try:
            # Split code into lines
            lines = code.split('\n')
            chunks = []
            current_chunk = []
            current_size = 0
            
            for line_num, line in enumerate(lines, 1):
                # Skip empty lines
                if not line.strip():
                    continue
                    
                line_size = len(line)
                
                # If adding this line would exceed max size, create new chunk
                if current_size + line_size > self.max_chunk_size and current_chunk:
                    chunks.append(self._create_chunk_metadata(current_chunk))
                    current_chunk = []
                    current_size = 0
                
                current_chunk.append((line_num, line))
                current_size += line_size
            
            # Add remaining lines as final chunk
            if current_chunk:
                chunks.append(self._create_chunk_metadata(current_chunk))
            
            logger.info(f"Split code into {len(chunks)} chunks")
            return chunks
            
        except Exception as e:
            logger.error(f"Error chunking code: {str(e)}")
            raise

    def _create_chunk_metadata(self, chunk_lines: List[tuple]) -> Dict[str, Any]:
        """Create metadata for a code chunk.
        
        Args:
            chunk_lines: List of (line_number, line) tuples
            
        Returns:
            Dict[str, Any]: Chunk metadata
        """
        try:
            lines = [line for _, line in chunk_lines]
            line_numbers = [num for num, _ in chunk_lines]
            
            return {
                'content': '\n'.join(lines),
                'start_line': min(line_numbers),
                'end_line': max(line_numbers),
                'size': sum(len(line) for line in lines),
                'line_count': len(lines)
            }
            
        except Exception as e:
            logger.error(f"Error creating chunk metadata: {str(e)}")
            raise

    def extract_imports(self, code: str) -> List[str]:
        """Extract import statements from code.
        
        Args:
            code: Source code string
            
        Returns:
            List[str]: List of import statements
        """
        try:
            import_pattern = r'^(?:from\s+[\w.]+\s+)?import\s+[\w,\s.]+(?:\s+as\s+\w+)?'
            imports = []
            
            for line in code.split('\n'):
                line = line.strip()
                if re.match(import_pattern, line):
                    imports.append(line)
                    
            logger.info(f"Extracted {len(imports)} import statements")
            return imports
            
        except Exception as e:
            logger.error(f"Error extracting imports: {str(e)}")
            raise
