"""Tests for the best practices analyzer service."""
import os
import pytest
from pathlib import Path
from src.services.best_practices_analyzer import BestPracticesAnalyzer, CodePattern

# Create a temporary test directory
@pytest.fixture
def test_repo_dir(tmp_path):
    """Create a temporary repository directory with test files."""
    repo_dir = tmp_path / "test_repo"
    repo_dir.mkdir()
    
    # Create a file with design patterns
    design_file = repo_dir / "design_patterns.py"
    design_file.write_text('''
"""Module implementing various design patterns."""
from typing import Dict, Any

class UserFactory:
    """Factory for creating different types of users."""
    
    @classmethod
    def create_user(cls, user_type: str, **kwargs) -> 'User':
        """Create a user of the specified type."""
        if user_type == "admin":
            return AdminUser(**kwargs)
        return RegularUser(**kwargs)

class Singleton:
    """Singleton pattern implementation."""
    _instance = None
    
    @classmethod
    def get_instance(cls):
        """Get the singleton instance."""
        if cls._instance is None:
            cls._instance = cls()
        return cls._instance

class EventObserver:
    """Observer pattern implementation."""
    def __init__(self):
        self.subscribers = []
    
    def subscribe(self, callback):
        """Subscribe to events."""
        self.subscribers.append(callback)
    
    def notify(self, event):
        """Notify all subscribers."""
        for subscriber in self.subscribers:
            subscriber(event)
''')

    # Create a file with performance patterns
    perf_file = repo_dir / "performance.py"
    perf_file.write_text('''
"""Module implementing performance patterns."""
from functools import lru_cache
from typing import List

class DataProcessor:
    """Class for processing data efficiently."""
    
    def __init__(self):
        self._cache = {}
    
    @lru_cache(maxsize=100)
    def process_data(self, data: str) -> str:
        """Process data with caching."""
        return data.upper()
    
    def bulk_process(self, items: List[str]) -> List[str]:
        """Process multiple items in bulk."""
        return [self.process_data(item) for item in items]
    
    def lazy_load(self, item_id: str):
        """Lazy load an expensive resource."""
        if item_id not in self._cache:
            self._cache[item_id] = self._load_from_db(item_id)
        return self._cache[item_id]
''')

    # Create a file with security patterns
    security_file = repo_dir / "security.py"
    security_file.write_text('''
"""Module implementing security patterns."""
import hashlib
from typing import Optional

class SecurityManager:
    """Class for handling security concerns."""
    
    def validate_input(self, data: str) -> bool:
        """Validate user input."""
        return bool(data and len(data) < 100)
    
    def authenticate_user(self, username: str, password: str) -> bool:
        """Authenticate a user."""
        hashed = self._hash_password(password)
        return self._check_credentials(username, hashed)
    
    def check_permission(self, user_id: str, resource: str) -> bool:
        """Check if user has permission to access resource."""
        return self._get_user_role(user_id).can_access(resource)
    
    def encrypt_data(self, data: str) -> str:
        """Encrypt sensitive data."""
        return self._encryption_service.encrypt(data)
''')

    # Create a file with maintainability patterns
    maint_file = repo_dir / "maintainability.py"
    maint_file.write_text('''
"""Module implementing maintainability patterns."""
from abc import ABC, abstractmethod
from typing import Protocol
from dataclasses import dataclass
from dependency_injector import containers, providers

class UserService:
    """Service with single responsibility of managing users."""
    def __init__(self, user_repo, email_service):
        self.user_repo = user_repo
        self.email_service = email_service

class DataProcessor(Protocol):
    """Interface segregation example."""
    def process(self, data: str) -> str: ...

@dataclass
class TestData:
    """Data class for testing."""
    name: str
    value: int

def test_user_service():
    """Test function for user service."""
    service = UserService(MockUserRepo(), MockEmailService())
    assert service.get_user("123") is not None
''')

    return repo_dir

@pytest.mark.asyncio
async def test_analyze_repository(test_repo_dir):
    """Test repository-wide best practices analysis."""
    analyzer = BestPracticesAnalyzer()
    report = await analyzer.analyze_repository(str(test_repo_dir))
    
    # Test overall scores
    assert report.design_score >= 70  # Good design pattern usage
    assert report.performance_score >= 60  # Decent performance patterns
    assert report.security_score >= 70  # Good security practices
    assert report.maintainability_score >= 70  # Good maintainability
    
    # Test pattern detection
    patterns_by_name = {p.name: p for p in report.patterns}
    
    # Design patterns
    assert "factory" in patterns_by_name
    assert "singleton" in patterns_by_name
    assert "observer" in patterns_by_name
    
    # Performance patterns
    assert "caching" in patterns_by_name
    assert "lazy_loading" in patterns_by_name
    assert "bulk_operations" in patterns_by_name
    
    # Security patterns
    assert "input_validation" in patterns_by_name
    assert "authentication" in patterns_by_name
    assert "authorization" in patterns_by_name
    assert "encryption" in patterns_by_name
    
    # Maintainability patterns
    assert "dependency_injection" in patterns_by_name
    assert "interface_segregation" in patterns_by_name
    assert "single_responsibility" in patterns_by_name
    assert "testing" in patterns_by_name
    
    # Test pattern details
    factory_pattern = patterns_by_name["factory"]
    assert factory_pattern.impact == "high"
    assert factory_pattern.category == "design"
    assert len(factory_pattern.examples) > 0
    assert "design_patterns.py" in factory_pattern.file_paths[0]
    
    # Test recommendations
    assert len(report.recommendations) > 0
    assert any("design pattern" in r.lower() for r in report.recommendations)

@pytest.mark.asyncio
async def test_analyze_empty_repository(tmp_path):
    """Test analysis of an empty repository."""
    analyzer = BestPracticesAnalyzer()
    
    with pytest.raises(Exception) as exc_info:
        await analyzer.analyze_repository(str(tmp_path))
    assert "No Python files found" in str(exc_info.value)

@pytest.mark.asyncio
async def test_analyze_design_patterns(test_repo_dir):
    """Test design pattern analysis."""
    analyzer = BestPracticesAnalyzer()
    patterns = await analyzer._analyze_design_patterns([
        Path(test_repo_dir) / "design_patterns.py"
    ])
    
    pattern_names = {p.name for p in patterns}
    assert "factory" in pattern_names
    assert "singleton" in pattern_names
    assert "observer" in pattern_names
    
    factory_pattern = next(p for p in patterns if p.name == "factory")
    assert factory_pattern.frequency > 0
    assert len(factory_pattern.examples) > 0
    assert factory_pattern.impact in ["high", "medium", "low"]

@pytest.mark.asyncio
async def test_analyze_performance_patterns(test_repo_dir):
    """Test performance pattern analysis."""
    analyzer = BestPracticesAnalyzer()
    patterns = await analyzer._analyze_performance_patterns([
        Path(test_repo_dir) / "performance.py"
    ])
    
    pattern_names = {p.name for p in patterns}
    assert "caching" in pattern_names
    assert "lazy_loading" in pattern_names
    assert "bulk_operations" in pattern_names
    
    caching_pattern = next(p for p in patterns if p.name == "caching")
    assert caching_pattern.frequency > 0
    assert len(caching_pattern.examples) > 0
    assert caching_pattern.impact in ["high", "medium", "low"]

@pytest.mark.asyncio
async def test_analyze_security_patterns(test_repo_dir):
    """Test security pattern analysis."""
    analyzer = BestPracticesAnalyzer()
    patterns = await analyzer._analyze_security_patterns([
        Path(test_repo_dir) / "security.py"
    ])
    
    pattern_names = {p.name for p in patterns}
    assert "input_validation" in pattern_names
    assert "authentication" in pattern_names
    assert "authorization" in pattern_names
    assert "encryption" in pattern_names
    
    validation_pattern = next(p for p in patterns if p.name == "input_validation")
    assert validation_pattern.frequency > 0
    assert len(validation_pattern.examples) > 0
    assert validation_pattern.impact in ["high", "medium", "low"]

@pytest.mark.asyncio
async def test_analyze_maintainability_patterns(test_repo_dir):
    """Test maintainability pattern analysis."""
    analyzer = BestPracticesAnalyzer()
    patterns = await analyzer._analyze_maintainability_patterns([
        Path(test_repo_dir) / "maintainability.py"
    ])
    
    pattern_names = {p.name for p in patterns}
    assert "dependency_injection" in pattern_names
    assert "interface_segregation" in pattern_names
    assert "single_responsibility" in pattern_names
    assert "testing" in pattern_names
    
    di_pattern = next(p for p in patterns if p.name == "dependency_injection")
    assert di_pattern.frequency > 0
    assert len(di_pattern.examples) > 0
    assert di_pattern.impact in ["high", "medium", "low"]

def test_get_pattern_description():
    """Test pattern description retrieval."""
    analyzer = BestPracticesAnalyzer()
    
    # Test design pattern description
    assert "Creates objects" in analyzer._get_pattern_description("factory")
    
    # Test performance pattern description
    assert "computation results" in analyzer._get_pattern_description("caching")
    
    # Test security pattern description
    assert "identity" in analyzer._get_pattern_description("authentication")
    
    # Test maintainability pattern description
    assert "dependencies" in analyzer._get_pattern_description("dependency_injection")
    
    # Test unknown pattern
    assert "No description available" in analyzer._get_pattern_description("unknown_pattern")

def test_determine_impact():
    """Test impact level determination."""
    analyzer = BestPracticesAnalyzer()
    
    assert analyzer._determine_impact(15) == "high"
    assert analyzer._determine_impact(7) == "medium"
    assert analyzer._determine_impact(3) == "low"

def test_calculate_category_score():
    """Test category score calculation."""
    analyzer = BestPracticesAnalyzer()
    
    patterns = [
        CodePattern(
            name="factory",
            description="Factory pattern",
            examples=["example"],
            file_paths=["file.py"],
            frequency=10,
            impact="high",
            category="design"
        ),
        CodePattern(
            name="singleton",
            description="Singleton pattern",
            examples=["example"],
            file_paths=["file.py"],
            frequency=5,
            impact="medium",
            category="design"
        )
    ]
    
    score = analyzer._calculate_category_score(patterns, "design")
    assert 0 <= score <= 100
    
    # Test empty patterns
    assert analyzer._calculate_category_score([], "design") == 0.0

def test_generate_recommendations():
    """Test recommendation generation."""
    analyzer = BestPracticesAnalyzer()
    
    patterns = [
        CodePattern(
            name="factory",
            description="Factory pattern",
            examples=["example"],
            file_paths=["file1.py", "file2.py"],
            frequency=10,
            impact="high",
            category="design"
        )
    ]
    
    recommendations = analyzer._generate_recommendations(patterns)
    assert len(recommendations) > 0
    assert any("factory" in r.lower() for r in recommendations)
