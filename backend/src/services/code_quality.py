"""Code quality analysis service."""
import ast
import re
from typing import Dict, List, Optional, Tuple
from dataclasses import dataclass
from pathlib import Path
import radon.metrics
from radon.visitors import ComplexityVisitor
from radon.raw import analyze
from src.core.exceptions import AnalysisError
from src.schemas.metrics import MetricDetails, AnalysisMetrics
from src.core.logging import get_logger

logger = get_logger(__name__)

@dataclass
class FileMetrics:
    """Metrics for a single file."""
    path: str
    loc: int  # Lines of code
    sloc: int  # Source lines of code
    comments: int
    multi: int  # Multi-line strings
    blank: int  # Blank lines
    complexity: float
    maintainability: float
    duplicates: List[Tuple[int, int]]  # Line ranges of duplicate code

class CodeQualityService:
    """Service for analyzing code quality metrics."""
    
    def __init__(self):
        """Initialize the service."""
        self.COMPLEXITY_THRESHOLD = 10
        self.LINE_LENGTH_THRESHOLD = 100
        self.FUNCTION_LENGTH_THRESHOLD = 50
        self.MIN_COMMENT_RATIO = 0.1
        
    async def analyze_repository(self, repo_path: str) -> AnalysisMetrics:
        """Analyze code quality for an entire repository."""
        try:
            logger.info(f"Starting code quality analysis for repository: {repo_path}")
            
            # Collect all Python files
            python_files = list(Path(repo_path).rglob("*.py"))
            if not python_files:
                raise AnalysisError("No Python files found in repository")
            
            # Analyze each file
            file_metrics: List[FileMetrics] = []
            for file_path in python_files:
                metrics = await self._analyze_file(str(file_path))
                file_metrics.append(metrics)
            
            # Calculate overall metrics
            overall_metrics = self._calculate_overall_metrics(file_metrics)
            
            logger.info(f"Completed code quality analysis for repository: {repo_path}")
            return overall_metrics
            
        except Exception as e:
            logger.error(f"Error analyzing repository: {str(e)}")
            raise AnalysisError(f"Failed to analyze repository: {str(e)}")
    
    async def _analyze_file(self, file_path: str) -> FileMetrics:
        """Analyze a single Python file."""
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            # Basic metrics using radon
            raw_metrics = analyze(content)
            
            # Parse AST to count docstrings
            try:
                tree = ast.parse(content)
                docstring_count = self._count_docstrings(tree)
            except Exception:
                docstring_count = 0
            
            # Complexity metrics
            visitor = ComplexityVisitor.from_code(content)
            complexity = sum(item.complexity for item in visitor.functions)
            
            # Maintainability index
            mi = radon.metrics.mi_visit(content, multi=True)
            
            # Find duplicate code blocks
            duplicates = self._find_duplicates(content)
            
            return FileMetrics(
                path=file_path,
                loc=raw_metrics.loc,
                sloc=raw_metrics.sloc,
                comments=raw_metrics.comments + docstring_count,  # Include docstrings in comment count
                multi=raw_metrics.multi,
                blank=raw_metrics.blank,
                complexity=complexity,
                maintainability=mi,
                duplicates=duplicates
            )
            
        except Exception as e:
            logger.error(f"Error analyzing file {file_path}: {str(e)}")
            raise AnalysisError(f"Failed to analyze file {file_path}: {str(e)}")
    
    def _count_docstrings(self, tree: ast.AST) -> int:
        """Count docstrings in the AST."""
        count = 0
        for node in ast.walk(tree):
            if isinstance(node, (ast.FunctionDef, ast.ClassDef, ast.Module)):
                if ast.get_docstring(node):
                    count += 1
        return count
    
    def _find_duplicates(self, content: str) -> List[Tuple[int, int]]:
        """Find duplicate code blocks (simple implementation)."""
        lines = [line.strip() for line in content.split('\n')]  # Normalize lines
        duplicates = []
        
        # Simple sliding window approach
        window_size = 3  # Minimum duplicate block size
        
        # Skip empty lines and comments
        code_lines = []
        for i, line in enumerate(lines):
            if line and not line.startswith('#'):
                code_lines.append((i, line))
        
        # Look for duplicates
        for i in range(len(code_lines) - window_size + 1):
            block = '\n'.join(line for _, line in code_lines[i:i + window_size])
            if not block.strip():  # Skip empty blocks
                continue
                
            # Look for this block in the rest of the file
            for j in range(i + window_size, len(code_lines) - window_size + 1):
                compare_block = '\n'.join(line for _, line in code_lines[j:j + window_size])
                if block == compare_block:
                    # Get original line numbers
                    start_i = code_lines[i][0]
                    end_i = code_lines[i + window_size - 1][0]
                    start_j = code_lines[j][0]
                    end_j = code_lines[j + window_size - 1][0]
                    
                    duplicates.append((start_i + 1, end_i + 1))
                    duplicates.append((start_j + 1, end_j + 1))
        
        return duplicates
    
    def _calculate_overall_metrics(self, file_metrics: List[FileMetrics]) -> AnalysisMetrics:
        """Calculate overall repository metrics from individual file metrics."""
        total_loc = sum(m.loc for m in file_metrics)
        total_sloc = sum(m.sloc for m in file_metrics)
        total_comments = sum(m.comments for m in file_metrics)
        avg_complexity = sum(m.complexity for m in file_metrics) / len(file_metrics)
        avg_maintainability = sum(m.maintainability for m in file_metrics) / len(file_metrics)
        
        # Calculate scores (0-100 scale)
        complexity_score = max(0, min(100, 100 - (avg_complexity * 5)))
        maintainability_score = avg_maintainability
        
        # Calculate documentation score based on both comments and docstrings
        comment_ratio = total_comments / total_sloc if total_sloc > 0 else 0
        documentation_score = min(100, (comment_ratio / self.MIN_COMMENT_RATIO) * 100)
        
        # Count issues
        issues: Dict[str, int] = {
            "high_complexity": sum(1 for m in file_metrics if m.complexity > self.COMPLEXITY_THRESHOLD),
            "low_maintainability": sum(1 for m in file_metrics if m.maintainability < 65),
            "duplicate_code": sum(len(m.duplicates) // 2 for m in file_metrics)  # Divide by 2 since we count both occurrences
        }
        
        # Generate recommendations
        recommendations = []
        
        # Always provide at least one recommendation
        if avg_complexity > self.COMPLEXITY_THRESHOLD:
            recommendations.append("Consider breaking down complex functions to improve maintainability")
        if comment_ratio < self.MIN_COMMENT_RATIO:
            recommendations.append("Add more documentation to improve code clarity")
        if issues["duplicate_code"] > 0:
            recommendations.append("Reduce code duplication by extracting common functionality")
        if avg_maintainability < 65:
            recommendations.append("Improve code maintainability by simplifying complex logic and adding documentation")
        if not recommendations:
            recommendations.append("Consider adding more inline comments to improve code clarity")
        
        # Calculate overall code quality score
        code_quality_score = (
            complexity_score * 0.3 +
            maintainability_score * 0.3 +
            documentation_score * 0.4
        )
        
        return AnalysisMetrics(
            code_quality_score=code_quality_score,
            maintainability_score=maintainability_score,
            complexity_score=complexity_score,
            documentation_score=documentation_score,
            best_practices_score=maintainability_score * 0.8,  # Simplified calculation
            issues_count=issues,
            recommendations=recommendations
        )
