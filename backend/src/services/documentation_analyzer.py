"""Documentation analysis service for analyzing documentation coverage and quality."""
import ast
import os
from typing import Dict, List, Optional, Set, Tuple
from dataclasses import dataclass
import re
from pathlib import Path
import ast
from src.core.exceptions import AnalysisError
from src.core.logging import get_logger

logger = get_logger(__name__)

@dataclass
class DocCoverage:
    """Documentation coverage metrics for a Python file."""
    file_path: str
    total_items: int  # Total number of documentable items (functions, classes, modules)
    documented_items: int  # Number of items with docstrings
    type_hint_coverage: float  # Percentage of function parameters with type hints
    example_count: int  # Number of code examples in docstrings
    todos_count: int  # Number of TODO comments
    missing_docs: List[str]  # List of items missing documentation

@dataclass
class RepoDocumentation:
    """Documentation metrics for an entire repository."""
    coverage_score: float  # Overall documentation coverage (0-100)
    type_hint_score: float  # Type hint coverage score (0-100)
    example_score: float  # Code example coverage score (0-100)
    readme_score: float  # README.md completeness score (0-100)
    api_doc_score: float  # API documentation score (0-100)
    file_scores: Dict[str, DocCoverage]  # Individual file scores
    recommendations: List[str]  # List of documentation improvement recommendations
    analyzed_at: str  # ISO format timestamp

class DocumentationAnalyzer:
    """Service for analyzing documentation coverage and quality."""

    def __init__(self):
        """Initialize the analyzer."""
        self.README_SECTIONS = {
            "overview": 5,
            "installation": 10,
            "usage": 15,
            "configuration": 10,
            "api": 20,
            "examples": 15,
            "contributing": 10,
            "license": 5,
            "dependencies": 10
        }
        self.MIN_DOCSTRING_WORDS = 10
        self.MIN_README_WORDS = 100

    async def analyze_repository(self, repo_path: str) -> RepoDocumentation:
        """Analyze documentation coverage for an entire repository."""
        try:
            logger.info(f"Starting documentation analysis for repository: {repo_path}")
            
            # Collect Python files
            python_files = list(Path(repo_path).rglob("*.py"))
            if not python_files:
                raise AnalysisError("No Python files found in repository")

            # Analyze each file
            file_scores: Dict[str, DocCoverage] = {}
            total_items = 0
            total_documented = 0
            total_type_hints = 0.0
            total_examples = 0

            for file_path in python_files:
                coverage = await self._analyze_file(str(file_path))
                file_scores[str(file_path)] = coverage
                total_items += coverage.total_items
                total_documented += coverage.documented_items
                total_type_hints += coverage.type_hint_coverage * coverage.total_items
                total_examples += coverage.example_count

            # Calculate overall scores
            coverage_score = (total_documented / total_items * 100) if total_items > 0 else 0
            type_hint_score = (total_type_hints / total_items) if total_items > 0 else 0
            example_score = min(100, (total_examples / len(python_files) * 50))  # Expect ~2 examples per file
            
            # Analyze README
            readme_score = await self._analyze_readme(repo_path)
            
            # Analyze API documentation
            api_doc_score = await self._analyze_api_docs(repo_path)
            
            # Generate recommendations
            recommendations = self._generate_recommendations(
                coverage_score,
                type_hint_score,
                example_score,
                readme_score,
                api_doc_score,
                file_scores
            )

            from datetime import datetime
            metrics = RepoDocumentation(
                coverage_score=coverage_score,
                type_hint_score=type_hint_score,
                example_score=example_score,
                readme_score=readme_score,
                api_doc_score=api_doc_score,
                file_scores=file_scores,
                recommendations=recommendations,
                analyzed_at=datetime.utcnow().isoformat()
            )

            logger.info(f"Completed documentation analysis for repository: {repo_path}")
            return metrics

        except Exception as e:
            logger.error(f"Error analyzing repository documentation: {str(e)}")
            raise AnalysisError(f"Failed to analyze repository documentation: {str(e)}")

    async def _analyze_file(self, file_path: str) -> DocCoverage:
        """Analyze documentation coverage for a single Python file."""
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()

            tree = ast.parse(content)
            
            # Track documentable items and their documentation status
            items: List[Tuple[str, bool, float]] = []  # (name, has_docs, type_hint_coverage)
            example_count = 0
            todos_count = 0
            missing_docs: List[str] = []

            # Check module docstring
            if ast.get_docstring(tree):
                items.append(("module", True, 0))
                if ">>>" in ast.get_docstring(tree):
                    example_count += 1
            else:
                items.append(("module", False, 0))
                missing_docs.append(f"Module docstring missing in {os.path.basename(file_path)}")

            # Visit all nodes
            for node in ast.walk(tree):
                if isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef, ast.ClassDef)):
                    name = node.name
                    has_docs = bool(ast.get_docstring(node))
                    
                    # Check for type hints in functions
                    type_hint_coverage = 0.0
                    if isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef)):
                        args_with_hints = len([arg for arg in node.args.args if arg.annotation])
                        total_args = len(node.args.args)
                        type_hint_coverage = args_with_hints / total_args if total_args > 0 else 1.0
                        
                        # Check docstring for examples
                        docstring = ast.get_docstring(node)
                        if docstring and ">>>" in docstring:
                            example_count += 1
                    
                    items.append((name, has_docs, type_hint_coverage))
                    
                    if not has_docs:
                        missing_docs.append(f"Missing docstring for {name}")

            # Count TODO comments
            todos_count = len(re.findall(r'#\s*TODO:', content))

            # Calculate metrics
            total_items = len(items)
            documented_items = sum(1 for _, has_docs, _ in items if has_docs)
            avg_type_hint_coverage = (
                sum(cov for _, _, cov in items) / len(items)
                if items else 0
            )

            return DocCoverage(
                file_path=file_path,
                total_items=total_items,
                documented_items=documented_items,
                type_hint_coverage=avg_type_hint_coverage,
                example_count=example_count,
                todos_count=todos_count,
                missing_docs=missing_docs
            )

        except Exception as e:
            logger.error(f"Error analyzing file {file_path}: {str(e)}")
            raise AnalysisError(f"Failed to analyze file {file_path}: {str(e)}")

    async def _analyze_readme(self, repo_path: str) -> float:
        """Analyze README.md completeness and quality."""
        try:
            readme_path = os.path.join(repo_path, "README.md")
            if not os.path.exists(readme_path):
                return 0.0

            with open(readme_path, 'r', encoding='utf-8') as f:
                content = f.read().lower()

            score = 0.0
            
            # Check section presence and content
            for section, weight in self.README_SECTIONS.items():
                # Check if section exists (either as heading or bold text)
                if re.search(rf'#\s*{section}|[*_]{2}{section}[*_]{2}', content, re.I):
                    score += weight * 0.5  # 50% for having the section
                    
                    # Find section content
                    match = re.search(
                        rf'#\s*{section}.*?(?=#{2,}|$)|[*_]{2}{section}[*_]{2}.*?(?=#{2,}|$)',
                        content,
                        re.I | re.S
                    )
                    if match and len(match.group(0).split()) >= self.MIN_README_WORDS:
                        score += weight * 0.5  # 50% for having sufficient content

            return score

        except Exception as e:
            logger.error(f"Error analyzing README: {str(e)}")
            return 0.0

    async def _analyze_api_docs(self, repo_path: str) -> float:
        """Analyze API documentation completeness and quality."""
        try:
            api_score = 0.0
            total_weight = 0
            
            # Look for API documentation in common locations
            api_doc_paths = [
                os.path.join(repo_path, "docs", "api"),
                os.path.join(repo_path, "docs", "API.md"),
                os.path.join(repo_path, "API.md"),
            ]
            
            for path in api_doc_paths:
                if os.path.exists(path):
                    if os.path.isdir(path):
                        # Score based on number and quality of API doc files
                        doc_files = list(Path(path).rglob("*.md"))
                        api_score += len(doc_files) * 20  # 20 points per doc file
                        total_weight = max(100, len(doc_files) * 20)
                    else:
                        # Score single API doc file
                        with open(path, 'r', encoding='utf-8') as f:
                            content = f.read()
                        
                        # Check for common API doc elements
                        if re.search(r'#\s*API\s+Reference', content, re.I):
                            api_score += 20
                        if re.search(r'```[^`]+```', content):  # Code examples
                            api_score += 20
                        if re.search(r'Parameters|Returns|Raises', content):
                            api_score += 20
                        if re.search(r'Example|Usage', content):
                            api_score += 20
                        if len(content.split()) >= self.MIN_README_WORDS:
                            api_score += 20
                        total_weight = 100
                        break

            return min(100, (api_score / total_weight * 100) if total_weight > 0 else 0)

        except Exception as e:
            logger.error(f"Error analyzing API documentation: {str(e)}")
            return 0.0

    def _generate_recommendations(
        self,
        coverage_score: float,
        type_hint_score: float,
        example_score: float,
        readme_score: float,
        api_doc_score: float,
        file_scores: Dict[str, DocCoverage]
    ) -> List[str]:
        """Generate documentation improvement recommendations."""
        recommendations = []

        # Coverage recommendations
        if coverage_score < 80:
            recommendations.append(
                "Improve overall documentation coverage by adding docstrings to "
                "functions, classes, and modules"
            )
            # Find worst documented files
            worst_files = sorted(
                file_scores.items(),
                key=lambda x: x[1].documented_items / x[1].total_items if x[1].total_items > 0 else 0
            )[:3]
            for file_path, coverage in worst_files:
                recommendations.append(
                    f"Add missing documentation in {os.path.basename(file_path)}: "
                    f"{', '.join(coverage.missing_docs[:3])}"
                )

        # Type hint recommendations
        if type_hint_score < 70:
            recommendations.append(
                "Improve type hint coverage by adding type annotations to function parameters "
                "and return values"
            )

        # Example recommendations
        if example_score < 60:
            recommendations.append(
                "Add more code examples in docstrings to demonstrate usage"
            )

        # README recommendations
        if readme_score < 80:
            missing_sections = [
                section for section, weight in self.README_SECTIONS.items()
                if not any(r.startswith(f"# {section}") for r in recommendations)
            ]
            if missing_sections:
                recommendations.append(
                    f"Improve README.md by adding or expanding sections: "
                    f"{', '.join(missing_sections)}"
                )

        # API documentation recommendations
        if api_doc_score < 70:
            recommendations.append(
                "Improve API documentation by adding detailed endpoint descriptions, "
                "request/response examples, and error handling"
            )

        return recommendations
