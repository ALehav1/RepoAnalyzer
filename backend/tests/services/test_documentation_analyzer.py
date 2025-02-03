"""Tests for the documentation analyzer service."""
import os
import pytest
from pathlib import Path
from src.services.documentation_analyzer import DocumentationAnalyzer, DocCoverage

# Create a temporary test directory
@pytest.fixture
def test_repo_dir(tmp_path):
    """Create a temporary repository directory with test files."""
    repo_dir = tmp_path / "test_repo"
    repo_dir.mkdir()
    
    # Create a well-documented Python file
    good_file = repo_dir / "good.py"
    good_file.write_text('''
"""This is a well-documented module."""
from typing import List, Dict

class GoodClass:
    """A well-documented class with type hints."""
    
    def __init__(self, name: str):
        """Initialize with a name.
        
        Args:
            name: The name of the instance
        """
        self.name = name
    
    def process_data(self, data: List[int]) -> Dict[str, int]:
        """Process the input data.
        
        Example:
            >>> obj = GoodClass("test")
            >>> obj.process_data([1, 2, 3])
            {"sum": 6}
        
        Args:
            data: List of integers to process
            
        Returns:
            Dictionary with processing results
        """
        return {"sum": sum(data)}
''')

    # Create a poorly documented Python file
    bad_file = repo_dir / "bad.py"
    bad_file.write_text('''
class BadClass:
    def __init__(self, name):
        self.name = name
    
    def process_data(self, data):
        # TODO: Add error handling
        return {"sum": sum(data)}
''')

    # Create a README.md
    readme = repo_dir / "README.md"
    readme.write_text('''
# Test Repository

## Overview
This is a test repository.

## Installation
Install dependencies:
```bash
pip install -r requirements.txt
```

## Usage
Example usage:
```python
from good import GoodClass
obj = GoodClass("test")
```

## Configuration
Configure using environment variables.

## API
API documentation goes here.

## Examples
More examples here.

## Contributing
Contribution guidelines.

## License
MIT License
''')

    # Create API documentation
    api_docs_dir = repo_dir / "docs" / "api"
    api_docs_dir.mkdir(parents=True)
    api_doc = api_docs_dir / "api.md"
    api_doc.write_text('''
# API Reference

## GoodClass

### process_data
Process data with the following parameters:

Parameters:
- data (List[int]): Input data

Returns:
- Dict[str, int]: Processing results

Example:
```python
obj.process_data([1, 2, 3])
```
''')

    return repo_dir

@pytest.mark.asyncio
async def test_analyze_repository(test_repo_dir):
    """Test repository-wide documentation analysis."""
    analyzer = DocumentationAnalyzer()
    metrics = await analyzer.analyze_repository(str(test_repo_dir))
    
    # Test overall scores
    assert metrics.coverage_score >= 50  # At least 50% coverage
    assert metrics.type_hint_score >= 50  # At least 50% type hint coverage
    assert metrics.example_score >= 50  # At least one example per file
    assert metrics.readme_score >= 80  # Well-structured README
    assert metrics.api_doc_score >= 70  # Good API documentation
    
    # Test file-specific metrics
    good_file = str(test_repo_dir / "good.py")
    bad_file = str(test_repo_dir / "bad.py")
    
    assert good_file in metrics.file_scores
    assert bad_file in metrics.file_scores
    
    good_coverage = metrics.file_scores[good_file]
    bad_coverage = metrics.file_scores[bad_file]
    
    # Test good file metrics
    assert good_coverage.documented_items / good_coverage.total_items >= 0.8
    assert good_coverage.type_hint_coverage >= 0.8
    assert good_coverage.example_count >= 1
    assert len(good_coverage.missing_docs) == 0
    
    # Test bad file metrics
    assert bad_coverage.documented_items / bad_coverage.total_items <= 0.5
    assert bad_coverage.type_hint_coverage <= 0.5
    assert bad_coverage.example_count == 0
    assert bad_coverage.todos_count >= 1
    assert len(bad_coverage.missing_docs) > 0
    
    # Test recommendations
    assert len(metrics.recommendations) > 0
    assert any("type hint" in r.lower() for r in metrics.recommendations)
    assert any("example" in r.lower() for r in metrics.recommendations)

@pytest.mark.asyncio
async def test_analyze_empty_repository(tmp_path):
    """Test analysis of an empty repository."""
    analyzer = DocumentationAnalyzer()
    
    with pytest.raises(Exception) as exc_info:
        await analyzer.analyze_repository(str(tmp_path))
    assert "No Python files found" in str(exc_info.value)

@pytest.mark.asyncio
async def test_analyze_readme(test_repo_dir):
    """Test README analysis."""
    analyzer = DocumentationAnalyzer()
    score = await analyzer._analyze_readme(str(test_repo_dir))
    
    assert score >= 80  # README has all required sections
    
    # Test with missing README
    no_readme_dir = test_repo_dir / "empty"
    no_readme_dir.mkdir()
    no_readme_score = await analyzer._analyze_readme(str(no_readme_dir))
    assert no_readme_score == 0

@pytest.mark.asyncio
async def test_analyze_api_docs(test_repo_dir):
    """Test API documentation analysis."""
    analyzer = DocumentationAnalyzer()
    score = await analyzer._analyze_api_docs(str(test_repo_dir))
    
    assert score >= 70  # API docs have good coverage
    
    # Test with missing API docs
    no_api_dir = test_repo_dir / "empty"
    no_api_dir.mkdir()
    no_api_score = await analyzer._analyze_api_docs(str(no_api_dir))
    assert no_api_score == 0

@pytest.mark.asyncio
async def test_analyze_file(test_repo_dir):
    """Test individual file analysis."""
    analyzer = DocumentationAnalyzer()
    
    # Test well-documented file
    good_file = str(test_repo_dir / "good.py")
    good_coverage = await analyzer._analyze_file(good_file)
    
    assert good_coverage.documented_items / good_coverage.total_items >= 0.8
    assert good_coverage.type_hint_coverage >= 0.8
    assert good_coverage.example_count >= 1
    assert len(good_coverage.missing_docs) == 0
    
    # Test poorly documented file
    bad_file = str(test_repo_dir / "bad.py")
    bad_coverage = await analyzer._analyze_file(bad_file)
    
    assert bad_coverage.documented_items / bad_coverage.total_items <= 0.5
    assert bad_coverage.type_hint_coverage <= 0.5
    assert bad_coverage.example_count == 0
    assert bad_coverage.todos_count >= 1
    assert len(bad_coverage.missing_docs) > 0
