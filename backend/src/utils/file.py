"""File-related utility functions."""

import json
from pathlib import Path
from typing import Dict, Tuple

def save_analysis_results(results: Dict, output_dir: Path, repo_name: str) -> None:
    """Save analysis results to a JSON file.
    
    Args:
        results: Analysis results to save
        output_dir: Directory to save results in
        repo_name: Name of the repository
    """
    output_dir.mkdir(parents=True, exist_ok=True)
    output_file = output_dir / f"{repo_name}_analysis.json"
    
    with open(output_file, 'w') as f:
        json.dump(results, f, indent=2)

def get_file_type(file_path: str) -> Tuple[str, bool]:
    """Determine file type and whether it should be analyzed.
    
    Args:
        file_path: Path to the file
        
    Returns:
        Tuple of (file_type, should_analyze)
    """
    file_path = file_path.lower()
    
    # File types that should be analyzed
    analyzable_extensions = {
        '.py': 'python',
        '.js': 'javascript',
        '.ts': 'typescript',
        '.tsx': 'react-typescript',
        '.jsx': 'react',
        '.java': 'java',
        '.go': 'go',
        '.rs': 'rust',
        '.cpp': 'cpp',
        '.c': 'c',
        '.h': 'c-header',
        '.hpp': 'cpp-header',
        '.rb': 'ruby',
        '.php': 'php',
        '.cs': 'csharp',
        '.scala': 'scala',
        '.kt': 'kotlin',
        '.swift': 'swift',
        '.m': 'objective-c',
        '.mm': 'objective-cpp'
    }
    
    ext = Path(file_path).suffix
    
    # Special cases for common file types
    if file_path.endswith(('readme.md', 'readme.txt')):
        return 'documentation', True
    elif file_path.endswith(('.gitignore', '.dockerignore')):
        return 'ignore-file', False
    elif file_path.endswith(('dockerfile', '.dockerfile')):
        return 'dockerfile', True
    elif file_path.endswith(('.yml', '.yaml')):
        return 'yaml', True
    elif file_path.endswith('.json'):
        return 'json', True
    elif file_path.endswith('.md'):
        return 'markdown', True
    elif file_path.endswith('.txt'):
        return 'text', True
    
    return analyzable_extensions.get(ext, 'unknown'), ext in analyzable_extensions

def is_test_file(file_path: str) -> bool:
    """Determine if a file is a test file.
    
    Args:
        file_path: Path to the file
        
    Returns:
        bool: True if the file is a test file
    """
    file_path = file_path.lower()
    test_patterns = [
        'test_',
        '_test',
        'spec_',
        '_spec',
        '/tests/',
        '/test/',
        '.test.',
        '.spec.'
    ]
    return any(pattern in file_path for pattern in test_patterns)
