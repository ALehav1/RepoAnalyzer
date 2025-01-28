from typing import List, Dict, Optional
import re
from dataclasses import dataclass

@dataclass
class CodeChunk:
    content: str
    start_line: int
    end_line: int
    language: str
    metadata: Dict

class CodeChunker:
    def __init__(self, max_chunk_size: int = 200):
        self.max_chunk_size = max_chunk_size

    def detect_language(self, file_path: str) -> str:
        """Detect programming language from file extension."""
        ext_map = {
            '.py': 'python',
            '.js': 'javascript',
            '.ts': 'typescript',
            '.jsx': 'javascript',
            '.tsx': 'typescript',
            '.java': 'java',
            '.go': 'go',
            '.cpp': 'cpp',
            '.c': 'c',
            '.h': 'c',
            '.hpp': 'cpp'
        }
        ext = file_path[file_path.rfind('.'):].lower()
        return ext_map.get(ext, 'unknown')

    def chunk_code(self, content: str, file_path: str) -> List[CodeChunk]:
        """Split code into semantic chunks."""
        language = self.detect_language(file_path)
        lines = content.splitlines()
        chunks = []
        
        current_chunk = []
        current_start = 0
        in_comment_block = False
        
        for i, line in enumerate(lines):
            line = line.strip()
            
            # Handle comment blocks
            if language in ['python', 'javascript', 'typescript']:
                if '"""' in line or "'''" in line:
                    in_comment_block = not in_comment_block
                
            # Check if we should start a new chunk
            if len(current_chunk) >= self.max_chunk_size or \
               (not in_comment_block and self._is_chunk_boundary(line, language)):
                if current_chunk:
                    chunk_content = '\n'.join(current_chunk)
                    chunks.append(CodeChunk(
                        content=chunk_content,
                        start_line=current_start,
                        end_line=i-1,
                        language=language,
                        metadata=self._extract_metadata(chunk_content, language)
                    ))
                    current_chunk = []
                    current_start = i
            
            current_chunk.append(lines[i])  # Use original line with whitespace
        
        # Add the last chunk
        if current_chunk:
            chunk_content = '\n'.join(current_chunk)
            chunks.append(CodeChunk(
                content=chunk_content,
                start_line=current_start,
                end_line=len(lines)-1,
                language=language,
                metadata=self._extract_metadata(chunk_content, language)
            ))
        
        return chunks

    def _is_chunk_boundary(self, line: str, language: str) -> bool:
        """Determine if a line represents a natural chunk boundary."""
        if not line:
            return False
            
        # Language-specific patterns for chunk boundaries
        patterns = {
            'python': [
                r'^class\s+\w+',
                r'^def\s+\w+',
                r'^@\w+',
                r'^if\s+__name__\s*==\s*[\'"]__main__[\'"]'
            ],
            'javascript': [
                r'^class\s+\w+',
                r'^function\s+\w+',
                r'^const\s+\w+\s*=\s*function',
                r'^export\s+',
                r'^import\s+'
            ],
            'typescript': [
                r'^class\s+\w+',
                r'^interface\s+\w+',
                r'^type\s+\w+',
                r'^function\s+\w+',
                r'^const\s+\w+\s*=\s*function',
                r'^export\s+',
                r'^import\s+'
            ]
        }
        
        lang_patterns = patterns.get(language, [])
        return any(re.match(pattern, line) for pattern in lang_patterns)

    def _extract_metadata(self, content: str, language: str) -> Dict:
        """Extract useful metadata from the chunk content."""
        metadata = {
            'has_imports': False,
            'has_class_def': False,
            'has_function_def': False,
            'has_decorators': False,
            'comment_ratio': 0.0
        }
        
        lines = content.splitlines()
        comment_count = 0
        
        for line in lines:
            line = line.strip()
            
            # Count comments
            if language == 'python':
                if line.startswith('#') or line.startswith('"""') or line.startswith("'''"):
                    comment_count += 1
            elif language in ['javascript', 'typescript']:
                if line.startswith('//') or line.startswith('/*') or line.startswith('*'):
                    comment_count += 1
            
            # Check for imports
            if (language == 'python' and (line.startswith('import ') or line.startswith('from '))) or \
               (language in ['javascript', 'typescript'] and (line.startswith('import ') or line.startswith('require('))):
                metadata['has_imports'] = True
            
            # Check for class definitions
            if re.match(r'^class\s+\w+', line):
                metadata['has_class_def'] = True
            
            # Check for function definitions
            if language == 'python':
                if re.match(r'^def\s+\w+', line):
                    metadata['has_function_def'] = True
            else:
                if re.match(r'^(function\s+\w+|\w+\s*=\s*function)', line):
                    metadata['has_function_def'] = True
            
            # Check for decorators (Python)
            if language == 'python' and line.startswith('@'):
                metadata['has_decorators'] = True
        
        if lines:
            metadata['comment_ratio'] = comment_count / len(lines)
        
        return metadata
