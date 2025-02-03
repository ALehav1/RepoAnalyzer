"""Service for analyzing code quality."""
from typing import Dict, List, Optional
from pathlib import Path
import ast
import radon.complexity as radon
from ...schemas.repository import AnalysisMetrics
from ..pattern_detectors.advanced_pattern_detector import AdvancedPatternDetector

class CodeQualityService:
    """Service for analyzing code quality metrics."""

    def __init__(self):
        """Initialize the code quality service."""
        self.pattern_detector = AdvancedPatternDetector()

    async def analyze_repository(self, repo_path: Path) -> AnalysisMetrics:
        """Analyze code quality for an entire repository."""
        metrics = {
            'total_files': 0,
            'total_lines': 0,
            'average_file_size': 0.0,
            'complexity_score': 0.0,
            'maintainability_score': 0.0,
            'test_coverage': None,
            'documentation_coverage': None,
            'security_score': None,
            'performance_score': None
        }

        python_files = list(repo_path.rglob('*.py'))
        if not python_files:
            return metrics

        # Collect file metrics
        file_sizes = []
        total_complexity = 0
        for file_path in python_files:
            metrics['total_files'] += 1
            
            # Count lines and file size
            content = file_path.read_text()
            lines = content.splitlines()
            metrics['total_lines'] += len(lines)
            file_sizes.append(file_path.stat().st_size)
            
            # Calculate complexity
            try:
                tree = ast.parse(content)
                complexity = self._calculate_file_complexity(tree)
                total_complexity += complexity
            except SyntaxError:
                continue

        # Calculate averages
        if metrics['total_files'] > 0:
            metrics['average_file_size'] = sum(file_sizes) / metrics['total_files']
            metrics['complexity_score'] = total_complexity / metrics['total_files']
            
            # Normalize scores to 0-100 range
            metrics['maintainability_score'] = self._calculate_maintainability_score(
                metrics['complexity_score'],
                metrics['average_file_size'],
                metrics['total_lines'] / metrics['total_files']
            )

        return metrics

    def _calculate_file_complexity(self, tree: ast.AST) -> float:
        """Calculate complexity score for a file."""
        complexity = 0
        
        for node in ast.walk(tree):
            # Count control flow statements
            if isinstance(node, (ast.If, ast.While, ast.For, ast.Try,
                               ast.ExceptHandler, ast.With, ast.AsyncWith,
                               ast.AsyncFor)):
                complexity += 1
            
            # Count function and class definitions
            elif isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef, ast.ClassDef)):
                complexity += 1
                
            # Count boolean operations
            elif isinstance(node, ast.BoolOp):
                complexity += len(node.values) - 1
                
            # Count return statements
            elif isinstance(node, ast.Return) and isinstance(node.value, ast.Compare):
                complexity += 1
        
        return complexity

    def _calculate_maintainability_score(
        self,
        complexity: float,
        avg_file_size: float,
        avg_lines: float
    ) -> float:
        """Calculate maintainability score based on various metrics."""
        # Convert metrics to 0-100 scale
        complexity_score = max(0, min(100, (1 - complexity/10) * 100))
        size_score = max(0, min(100, (1 - avg_file_size/10000) * 100))
        lines_score = max(0, min(100, (1 - avg_lines/500) * 100))
        
        # Weight the scores
        return (
            complexity_score * 0.4 +
            size_score * 0.3 +
            lines_score * 0.3
        )

    async def analyze_patterns(self, repo_path: Path) -> Dict[str, List[Dict]]:
        """Analyze design patterns in the repository."""
        patterns = {}
        
        for file_path in repo_path.rglob('*.py'):
            try:
                matches = await self.pattern_detector.analyze_file(file_path)
                for match in matches:
                    if match.pattern_name not in patterns:
                        patterns[match.pattern_name] = []
                    patterns[match.pattern_name].append({
                        'file': str(file_path.relative_to(repo_path)),
                        'line': match.line_number,
                        'confidence': match.confidence,
                        'snippet': match.code_snippet,
                        'context': match.context
                    })
            except Exception as e:
                print(f"Error analyzing {file_path}: {str(e)}")
                continue
        
        return patterns
