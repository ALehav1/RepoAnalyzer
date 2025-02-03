"""Tests for the advanced pattern detector."""
import ast
import pytest
from pathlib import Path
from src.services.pattern_detectors.advanced_pattern_detector import (
    AdvancedPatternDetector,
    PatternMatch
)

@pytest.fixture
def detector():
    """Create a pattern detector instance."""
    return AdvancedPatternDetector()

@pytest.fixture
def sample_factory_code():
    """Sample code implementing a factory pattern."""
    return """
class ProductFactory:
    @classmethod
    def create_product(cls, product_type: str):
        if product_type == "A":
            return ProductA()
        elif product_type == "B":
            return ProductB()
        raise ValueError(f"Unknown product type: {product_type}")

class ProductA:
    pass

class ProductB:
    pass
"""

@pytest.fixture
def sample_singleton_code():
    """Sample code implementing a singleton pattern."""
    return """
class Singleton:
    _instance = None
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance
    
    @classmethod
    def get_instance(cls):
        if cls._instance is None:
            cls._instance = cls()
        return cls._instance
"""

@pytest.fixture
def sample_observer_code():
    """Sample code implementing an observer pattern."""
    return """
class Subject:
    def __init__(self):
        self._observers = []
        self._state = None

    def attach(self, observer):
        self._observers.append(observer)

    def detach(self, observer):
        self._observers.remove(observer)

    def notify(self):
        for observer in self._observers:
            observer.update(self._state)

class Observer:
    def update(self, state):
        pass
"""

@pytest.fixture
def sample_chain_code():
    """Sample code implementing a chain of responsibility pattern."""
    return """
class Handler:
    def __init__(self):
        self._next_handler = None

    def set_next(self, handler):
        self._next_handler = handler
        return handler

    def handle(self, request):
        if self._next_handler:
            return self._next_handler.handle(request)
        return None

class ConcreteHandlerA(Handler):
    def handle(self, request):
        if request == "A":
            return "Handled by A"
        return super().handle(request)

class ConcreteHandlerB(Handler):
    def handle(self, request):
        if request == "B":
            return "Handled by B"
        return super().handle(request)
"""

@pytest.fixture
def temp_file(tmp_path):
    """Create a temporary file."""
    return tmp_path / "test_code.py"

@pytest.mark.asyncio
async def test_factory_pattern_detection(detector, sample_factory_code, temp_file):
    """Test detection of factory pattern."""
    temp_file.write_text(sample_factory_code)
    matches = await detector.analyze_file(temp_file)
    
    factory_matches = [m for m in matches if m.pattern_name == "factory"]
    assert len(factory_matches) > 0
    
    match = factory_matches[0]
    assert match.confidence > 0.7
    assert "ProductFactory" in match.code_snippet
    assert match.context["complexity"] > 0

@pytest.mark.asyncio
async def test_singleton_pattern_detection(detector, sample_singleton_code, temp_file):
    """Test detection of singleton pattern."""
    temp_file.write_text(sample_singleton_code)
    matches = await detector.analyze_file(temp_file)
    
    singleton_matches = [m for m in matches if m.pattern_name == "singleton"]
    assert len(singleton_matches) > 0
    
    match = singleton_matches[0]
    assert match.confidence > 0.7
    assert "_instance" in match.code_snippet
    assert match.context["scope"] == "class"

@pytest.mark.asyncio
async def test_observer_pattern_detection(detector, sample_observer_code, temp_file):
    """Test detection of observer pattern."""
    temp_file.write_text(sample_observer_code)
    matches = await detector.analyze_file(temp_file)
    
    observer_matches = [m for m in matches if m.pattern_name == "observer"]
    assert len(observer_matches) > 0
    
    match = observer_matches[0]
    assert match.confidence > 0.6
    assert "notify" in match.code_snippet
    assert "update" in match.code_snippet

@pytest.mark.asyncio
async def test_chain_pattern_detection(detector, sample_chain_code, temp_file):
    """Test detection of chain of responsibility pattern."""
    temp_file.write_text(sample_chain_code)
    matches = await detector.analyze_file(temp_file)
    
    chain_matches = [m for m in matches if m.pattern_name == "chain_of_responsibility"]
    assert len(chain_matches) > 0
    
    match = chain_matches[0]
    assert match.confidence > 0.6
    assert "handle" in match.code_snippet
    assert "_next_handler" in match.code_snippet

@pytest.mark.asyncio
async def test_multiple_patterns_in_file(detector, temp_file):
    """Test detection of multiple patterns in a single file."""
    code = """
class Singleton:
    _instance = None
    
    @classmethod
    def get_instance(cls):
        if cls._instance is None:
            cls._instance = cls()
        return cls._instance

class ProductFactory:
    @classmethod
    def create_product(cls, product_type):
        if product_type == "A":
            return ProductA()
        return ProductB()
"""
    temp_file.write_text(code)
    matches = await detector.analyze_file(temp_file)
    
    pattern_names = {m.pattern_name for m in matches}
    assert "singleton" in pattern_names
    assert "factory" in pattern_names

def test_confidence_calculation(detector):
    """Test confidence score calculation for patterns."""
    code = """
class MyFactory:
    def create_something(self):  # Partial match - method name only
        return object()
"""
    tree = ast.parse(code)
    class_node = next(n for n in ast.walk(tree) if isinstance(n, ast.ClassDef))
    
    confidence = detector._calculate_pattern_confidence(
        class_node,
        {"methods": ["create"], "return_style": "dynamic"},
        {},
        {"method_match": 0.6, "return_style": 0.4}
    )
    
    assert 0.3 <= confidence <= 0.7  # Partial match should have moderate confidence

def test_pattern_context_extraction(detector):
    """Test extraction of pattern context information."""
    code = """
class ComplexPattern:
    def __init__(self):
        self.helper = Helper()
    
    def method_a(self):
        self.helper.do_something()
    
    def method_b(self):
        if condition:
            self.method_a()
"""
    tree = ast.parse(code)
    class_node = next(n for n in ast.walk(tree) if isinstance(n, ast.ClassDef))
    
    context = detector._extract_pattern_context(class_node, {})
    
    assert context["complexity"] > 1  # Should account for if statement
    assert "method_a" in context["dependencies"]
    assert context["scope"] == "class"

@pytest.mark.asyncio
async def test_edge_cases(detector, temp_file):
    """Test pattern detection with edge cases."""
    # Empty file
    temp_file.write_text("")
    matches = await detector.analyze_file(temp_file)
    assert len(matches) == 0
    
    # Invalid syntax
    temp_file.write_text("class:")
    matches = await detector.analyze_file(temp_file)
    assert len(matches) == 0
    
    # Huge file
    huge_code = "class A:\n    pass\n" * 1000
    temp_file.write_text(huge_code)
    matches = await detector.analyze_file(temp_file)
    assert isinstance(matches, list)  # Should handle large files gracefully

@pytest.mark.asyncio
async def test_semantic_pattern_detection(detector, temp_file):
    """Test detection of patterns based on semantic understanding."""
    code = """
class UserInterface:
    def __init__(self):
        self.database = Database()
        self.logger = Logger()
        self.validator = Validator()
    
    def process_request(self, request):
        if self.validator.validate(request):
            result = self.database.query(request)
            self.logger.log(result)
            return result
        return None
"""
    temp_file.write_text(code)
    matches = await detector.analyze_file(temp_file)
    
    facade_matches = [m for m in matches if m.pattern_name == "facade"]
    assert len(facade_matches) > 0  # Should detect facade pattern
    
    match = facade_matches[0]
    assert match.confidence > 0.6
    assert "UserInterface" in match.code_snippet

@pytest.mark.asyncio
async def test_pattern_relationships(detector, temp_file):
    """Test detection of related patterns."""
    code = """
class EventManager:
    _instance = None  # Singleton
    
    def __init__(self):
        self._listeners = []
    
    @classmethod
    def get_instance(cls):
        if cls._instance is None:
            cls._instance = cls()
        return cls._instance
    
    def subscribe(self, listener):
        self._listeners.append(listener)  # Observer
    
    def notify(self, event):
        for listener in self._listeners:
            listener.handle_event(event)
"""
    temp_file.write_text(code)
    matches = await detector.analyze_file(temp_file)
    
    # Should detect both singleton and observer patterns
    pattern_names = {m.pattern_name for m in matches}
    assert "singleton" in pattern_names
    assert "observer" in pattern_names
    
    # Check for pattern relationships in context
    for match in matches:
        if match.pattern_name == "singleton":
            assert "observer" in match.context.get("related_patterns", [])
