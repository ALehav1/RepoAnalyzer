"""Service for analyzing and extracting best practices from repositories."""
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
class CodePattern:
    """Represents a code pattern found in the repository."""
    name: str
    description: str
    examples: List[str]
    file_paths: List[str]
    frequency: int
    impact: str  # "high", "medium", "low"
    category: str  # "design", "performance", "security", "maintainability"

@dataclass
class BestPracticesReport:
    """Report containing best practices analysis results."""
    patterns: List[CodePattern]
    recommendations: List[str]
    design_score: float
    performance_score: float
    security_score: float
    maintainability_score: float
    analyzed_at: str

class BestPracticesAnalyzer:
    """Service for analyzing and extracting best practices from repositories."""

    def __init__(self):
        """Initialize the analyzer."""
        self.pattern_descriptions = {
            # Design Patterns
            "factory": "Creates objects without explicitly specifying their exact classes",
            "singleton": "Ensures a class has only one instance with global access",
            "observer": "Defines one-to-many dependency between objects",
            "strategy": "Defines family of algorithms and makes them interchangeable",
            "decorator": "Attaches additional responsibilities to objects dynamically",
            "adapter": "Converts interface of a class into another interface",
            "command": "Encapsulates request as an object",
            "composite": "Composes objects into tree structures",
            "facade": "Provides unified interface to a set of interfaces",
            "proxy": "Provides surrogate for another object to control access",
            
            # Performance Patterns
            "caching": "Stores computation results for future requests",
            "lazy_loading": "Defers initialization of resource until needed",
            "bulk_operations": "Processes multiple items in batch for efficiency",
            "connection_pool": "Maintains pool of reusable connections",
            "object_pool": "Pre-instantiates and maintains collection of objects",
            "flyweight": "Minimizes memory use by sharing data across objects",
            "pagination": "Divides data into discrete pages",
            "indexing": "Uses database indexes for faster queries",
            "asynchronous": "Processes operations asynchronously",
            "memoization": "Caches results of expensive function calls",
            
            # Security Patterns
            "input_validation": "Validates and sanitizes input data",
            "authentication": "Verifies identity of users or systems",
            "authorization": "Controls access to resources",
            "encryption": "Protects sensitive data",
            "rate_limiting": "Controls rate of requests to protect resources",
            "session_management": "Manages user sessions securely",
            "audit_logging": "Logs security-relevant events",
            "secure_communication": "Ensures secure data transmission",
            "error_handling": "Handles errors without exposing sensitive info",
            "secure_configuration": "Manages security configuration safely",
            
            # Maintainability Patterns
            "dependency_injection": "Injects dependencies instead of creating them",
            "interface_segregation": "Splits interfaces into smaller ones",
            "single_responsibility": "Ensures class has only one reason to change",
            "testing": "Includes automated tests",
            "documentation": "Provides comprehensive documentation",
            "loose_coupling": "Minimizes dependencies between components",
            "high_cohesion": "Ensures related functionality stays together",
            "clean_architecture": "Separates concerns into layers",
            "code_generation": "Generates code automatically",
            "configuration_management": "Manages configuration externally"
        }
        
        self.design_patterns = {
            "factory": r"(?i)create|factory|build|new",
            "singleton": r"(?i)instance|get_instance",
            "observer": r"(?i)notify|subscribe|observer",
            "strategy": r"(?i)strategy|algorithm|policy",
            "decorator": r"(?i)decorate|wrap|enhance",
            "adapter": r"(?i)adapter|interface|convert",
            "command": r"(?i)command|request|execute",
            "composite": r"(?i)composite|container|component",
            "facade": r"(?i)facade|interface|unified",
            "proxy": r"(?i)proxy|surrogate|control"
        }
        
        self.performance_patterns = {
            "caching": r"(?i)cache|memoize|store",
            "lazy_loading": r"(?i)lazy|defer|load_when",
            "bulk_operations": r"(?i)bulk|batch|many",
            "connection_pool": r"(?i)pool|connection|database",
            "object_pool": r"(?i)pool|object|collection",
            "flyweight": r"(?i)flyweight|share|data",
            "pagination": r"(?i)paginate|page|limit",
            "indexing": r"(?i)index|optimize|speed",
            "asynchronous": r"(?i)async|await|thread",
            "memoization": r"(?i)memoize|cache|result"
        }
        
        self.security_patterns = {
            "input_validation": r"(?i)validate|sanitize|clean",
            "authentication": r"(?i)auth|login|verify",
            "authorization": r"(?i)permission|role|access",
            "encryption": r"(?i)encrypt|decrypt|hash",
            "rate_limiting": r"(?i)rate|limit|throttle",
            "session_management": r"(?i)session|manage|secure",
            "audit_logging": r"(?i)audit|log|security",
            "secure_communication": r"(?i)secure|communication|encrypt",
            "error_handling": r"(?i)error|handle|exception",
            "secure_configuration": r"(?i)secure|config|manage"
        }
        
        self.maintainability_patterns = {
            "dependency_injection": r"(?i)inject|provide|container",
            "interface_segregation": r"(?i)interface|segregate|small",
            "single_responsibility": r"(?i)single|responsibility|change",
            "testing": r"(?i)test|mock|fixture",
            "documentation": r"(?i)doc|comment|explain",
            "loose_coupling": r"(?i)loose|couple|dependency",
            "high_cohesion": r"(?i)high|cohesion|related",
            "clean_architecture": r"(?i)clean|architecture|layer",
            "code_generation": r"(?i)generate|code|automatic",
            "configuration_management": r"(?i)config|manage|external"
        }

    async def analyze_repository(self, repo_path: str) -> BestPracticesReport:
        """Analyze a repository for best practices and patterns."""
        try:
            logger.info(f"Starting best practices analysis for repository: {repo_path}")
            
            # Collect Python files
            python_files = list(Path(repo_path).rglob("*.py"))
            if not python_files:
                raise AnalysisError("No Python files found in repository")

            # Initialize pattern tracking
            patterns: List[CodePattern] = []
            
            # Analyze each category
            design_patterns = await self._analyze_design_patterns(python_files)
            performance_patterns = await self._analyze_performance_patterns(python_files)
            security_patterns = await self._analyze_security_patterns(python_files)
            maintainability_patterns = await self._analyze_maintainability_patterns(python_files)
            
            patterns.extend(design_patterns)
            patterns.extend(performance_patterns)
            patterns.extend(security_patterns)
            patterns.extend(maintainability_patterns)
            
            # Calculate scores
            design_score = self._calculate_category_score(patterns, "design")
            performance_score = self._calculate_category_score(patterns, "performance")
            security_score = self._calculate_category_score(patterns, "security")
            maintainability_score = self._calculate_category_score(patterns, "maintainability")
            
            # Generate recommendations
            recommendations = self._generate_recommendations(patterns)

            from datetime import datetime
            report = BestPracticesReport(
                patterns=patterns,
                recommendations=recommendations,
                design_score=design_score,
                performance_score=performance_score,
                security_score=security_score,
                maintainability_score=maintainability_score,
                analyzed_at=datetime.utcnow().isoformat()
            )

            logger.info(f"Completed best practices analysis for repository: {repo_path}")
            return report

        except Exception as e:
            logger.error(f"Error analyzing repository best practices: {str(e)}")
            raise AnalysisError(f"Failed to analyze repository best practices: {str(e)}")

    async def _analyze_design_patterns(self, python_files: List[Path]) -> List[CodePattern]:
        """Analyze files for design patterns."""
        patterns: List[CodePattern] = []
        
        for pattern_name, pattern_regex in self.design_patterns.items():
            matching_files: List[str] = []
            examples: List[str] = []
            frequency = 0
            
            for file_path in python_files:
                with open(file_path, 'r', encoding='utf-8') as f:
                    content = f.read()
                    matches = re.finditer(pattern_regex, content, re.MULTILINE)
                    match_count = len(list(matches))
                    
                    if match_count > 0:
                        frequency += match_count
                        matching_files.append(str(file_path))
                        
                        # Extract example
                        tree = ast.parse(content)
                        for node in ast.walk(tree):
                            if isinstance(node, (ast.ClassDef, ast.FunctionDef)):
                                if re.search(pattern_regex, ast.get_source_segment(content, node)):
                                    examples.append(ast.get_source_segment(content, node))
                                    break
            
            if matching_files:
                patterns.append(CodePattern(
                    name=pattern_name,
                    description=self._get_pattern_description(pattern_name),
                    examples=examples[:3],  # Limit to 3 examples
                    file_paths=matching_files,
                    frequency=frequency,
                    impact=self._determine_impact(frequency),
                    category="design"
                ))
        
        return patterns

    async def _analyze_performance_patterns(self, python_files: List[Path]) -> List[CodePattern]:
        """Analyze files for performance patterns."""
        patterns: List[CodePattern] = []
        
        for pattern_name, pattern_regex in self.performance_patterns.items():
            matching_files: List[str] = []
            examples: List[str] = []
            frequency = 0
            
            for file_path in python_files:
                with open(file_path, 'r', encoding='utf-8') as f:
                    content = f.read()
                    matches = re.finditer(pattern_regex, content, re.MULTILINE)
                    match_count = len(list(matches))
                    
                    if match_count > 0:
                        frequency += match_count
                        matching_files.append(str(file_path))
                        
                        # Extract example
                        tree = ast.parse(content)
                        for node in ast.walk(tree):
                            if isinstance(node, (ast.ClassDef, ast.FunctionDef)):
                                if re.search(pattern_regex, ast.get_source_segment(content, node)):
                                    examples.append(ast.get_source_segment(content, node))
                                    break
            
            if matching_files:
                patterns.append(CodePattern(
                    name=pattern_name,
                    description=self._get_pattern_description(pattern_name),
                    examples=examples[:3],
                    file_paths=matching_files,
                    frequency=frequency,
                    impact=self._determine_impact(frequency),
                    category="performance"
                ))
        
        return patterns

    async def _analyze_security_patterns(self, python_files: List[Path]) -> List[CodePattern]:
        """Analyze files for security patterns."""
        patterns: List[CodePattern] = []
        
        for pattern_name, pattern_regex in self.security_patterns.items():
            matching_files: List[str] = []
            examples: List[str] = []
            frequency = 0
            
            for file_path in python_files:
                with open(file_path, 'r', encoding='utf-8') as f:
                    content = f.read()
                    matches = re.finditer(pattern_regex, content, re.MULTILINE)
                    match_count = len(list(matches))
                    
                    if match_count > 0:
                        frequency += match_count
                        matching_files.append(str(file_path))
                        
                        # Extract example
                        tree = ast.parse(content)
                        for node in ast.walk(tree):
                            if isinstance(node, (ast.ClassDef, ast.FunctionDef)):
                                if re.search(pattern_regex, ast.get_source_segment(content, node)):
                                    examples.append(ast.get_source_segment(content, node))
                                    break
            
            if matching_files:
                patterns.append(CodePattern(
                    name=pattern_name,
                    description=self._get_pattern_description(pattern_name),
                    examples=examples[:3],
                    file_paths=matching_files,
                    frequency=frequency,
                    impact=self._determine_impact(frequency),
                    category="security"
                ))
        
        return patterns

    async def _analyze_maintainability_patterns(self, python_files: List[Path]) -> List[CodePattern]:
        """Analyze files for maintainability patterns."""
        patterns: List[CodePattern] = []
        
        for pattern_name, pattern_regex in self.maintainability_patterns.items():
            matching_files: List[str] = []
            examples: List[str] = []
            frequency = 0
            
            for file_path in python_files:
                with open(file_path, 'r', encoding='utf-8') as f:
                    content = f.read()
                    matches = re.finditer(pattern_regex, content, re.MULTILINE)
                    match_count = len(list(matches))
                    
                    if match_count > 0:
                        frequency += match_count
                        matching_files.append(str(file_path))
                        
                        # Extract example
                        tree = ast.parse(content)
                        for node in ast.walk(tree):
                            if isinstance(node, (ast.ClassDef, ast.FunctionDef)):
                                if re.search(pattern_regex, ast.get_source_segment(content, node)):
                                    examples.append(ast.get_source_segment(content, node))
                                    break
            
            if matching_files:
                patterns.append(CodePattern(
                    name=pattern_name,
                    description=self._get_pattern_description(pattern_name),
                    examples=examples[:3],
                    file_paths=matching_files,
                    frequency=frequency,
                    impact=self._determine_impact(frequency),
                    category="maintainability"
                ))
        
        return patterns

    def _get_pattern_description(self, pattern_name: str) -> str:
        """Get description for a pattern."""
        return self.pattern_descriptions.get(pattern_name, "No description available")

    def _determine_impact(self, frequency: int) -> str:
        """Determine impact level based on pattern frequency."""
        if frequency >= 10:
            return "high"
        elif frequency >= 5:
            return "medium"
        return "low"

    def _calculate_category_score(self, patterns: List[CodePattern], category: str) -> float:
        """Calculate score for a specific category."""
        category_patterns = [p for p in patterns if p.category == category]
        if not category_patterns:
            return 0.0
        
        total_impact = sum(
            {"high": 3, "medium": 2, "low": 1}[p.impact]
            for p in category_patterns
        )
        max_possible = len(self.design_patterns) * 3  # All patterns with high impact
        
        return min(100, (total_impact / max_possible) * 100)

    def _generate_recommendations(self, patterns: List[CodePattern]) -> List[str]:
        """Generate recommendations based on patterns found."""
        recommendations = []
        
        # Check for missing patterns
        all_patterns = {
            **self.design_patterns,
            **self.performance_patterns,
            **self.security_patterns,
            **self.maintainability_patterns
        }
        found_patterns = {p.name for p in patterns}
        missing_patterns = set(all_patterns.keys()) - found_patterns
        
        # Group recommendations by category
        if missing_patterns & set(self.design_patterns.keys()):
            recommendations.append(
                "Consider implementing more design patterns to improve code structure and reusability"
            )
        
        if missing_patterns & set(self.performance_patterns.keys()):
            recommendations.append(
                "Add performance optimization patterns like caching and bulk operations"
            )
        
        if missing_patterns & set(self.security_patterns.keys()):
            recommendations.append(
                "Strengthen security by implementing authentication, authorization, and data protection patterns"
            )
        
        if missing_patterns & set(self.maintainability_patterns.keys()):
            recommendations.append(
                "Improve maintainability with dependency injection, interface segregation, and automated testing"
            )
        
        # Add specific pattern recommendations
        for pattern in patterns:
            if pattern.impact == "high":
                recommendations.append(
                    f"Good use of {pattern.name} pattern in {len(pattern.file_paths)} files. "
                    "Consider documenting this pattern for team reference."
                )
            elif pattern.impact == "low":
                recommendations.append(
                    f"Consider expanding use of {pattern.name} pattern beyond its current "
                    f"{len(pattern.file_paths)} locations"
                )
        
        return recommendations
