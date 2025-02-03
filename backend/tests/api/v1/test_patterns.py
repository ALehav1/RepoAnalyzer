"""Tests for pattern detection API endpoints."""
import pytest
from fastapi.testclient import TestClient
from pathlib import Path
import tempfile
import os
from unittest.mock import patch
from src.main import app

client = TestClient(app)

def create_test_file(content: str) -> str:
    """Create a temporary test file with the given content."""
    with tempfile.NamedTemporaryFile(mode='w', suffix='.py', delete=False) as f:
        f.write(content)
        return str(Path(f.name).absolute())

def test_analyze_patterns_valid_file(tmp_path):
    """Test successful pattern analysis with valid file."""
    # Create a test Python file
    test_file = tmp_path / "test.py"
    test_file.write_text("""
class Factory:
    def create(self):
        pass
    """)

    response = client.post("/api/v1/patterns/analyze", json={"file_path": str(test_file.absolute())})
    assert response.status_code == 200
    data = response.json()
    assert "patterns" in data
    assert isinstance(data["patterns"], list)

def test_analyze_factory_pattern():
    """Test factory pattern detection."""
    code = """
class ProductFactory:
    @classmethod
    def create_product(cls, product_type: str):
        if product_type == "A":
            return ProductA()
        return ProductB()

class ProductA:
    pass

class ProductB:
    pass
    """
    file_path = create_test_file(code)
    response = client.post("/api/v1/patterns/analyze", json={"file_path": file_path})
    assert response.status_code == 200
    patterns = response.json()["patterns"]
    
    factory_patterns = [p for p in patterns if p["name"] == "factory"]
    assert len(factory_patterns) > 0
    assert factory_patterns[0]["confidence"] > 0.7

def test_analyze_singleton_pattern():
    """Test singleton pattern detection."""
    code = """
class Singleton:
    _instance = None
    
    @classmethod
    def get_instance(cls):
        if cls._instance is None:
            cls._instance = cls()
        return cls._instance
    """
    file_path = create_test_file(code)
    response = client.post("/api/v1/patterns/analyze", json={"file_path": file_path})
    assert response.status_code == 200
    patterns = response.json()["patterns"]
    
    singleton_patterns = [p for p in patterns if p["name"] == "singleton"]
    assert len(singleton_patterns) > 0
    assert singleton_patterns[0]["confidence"] > 0.8

def test_analyze_observer_pattern():
    """Test observer pattern detection."""
    code = """
class Subject:
    def __init__(self):
        self._observers = []
    
    def attach(self, observer):
        self._observers.append(observer)
    
    def notify(self):
        for observer in self._observers:
            observer.update()

class Observer:
    def update(self):
        pass
    """
    file_path = create_test_file(code)
    response = client.post("/api/v1/patterns/analyze", json={"file_path": file_path})
    assert response.status_code == 200
    patterns = response.json()["patterns"]
    
    observer_patterns = [p for p in patterns if p["name"] == "observer"]
    assert len(observer_patterns) > 0
    assert observer_patterns[0]["confidence"] > 0.6

def test_analyze_strategy_pattern():
    """Test strategy pattern detection."""
    code = """
class Strategy:
    def execute(self, data):
        pass

class ConcreteStrategyA(Strategy):
    def execute(self, data):
        return data.upper()

class ConcreteStrategyB(Strategy):
    def execute(self, data):
        return data.lower()
    """
    file_path = create_test_file(code)
    response = client.post("/api/v1/patterns/analyze", json={"file_path": file_path})
    assert response.status_code == 200
    patterns = response.json()["patterns"]
    
    strategy_patterns = [p for p in patterns if p["name"] == "strategy"]
    assert len(strategy_patterns) > 0
    assert strategy_patterns[0]["confidence"] > 0.7

def test_analyze_decorator_pattern():
    """Test decorator pattern detection."""
    code = """
class Component:
    def operation(self):
        pass

class Decorator(Component):
    def __init__(self, component):
        self._component = component
    
    def wrap(self):
        return self._component.operation()
    """
    file_path = create_test_file(code)
    response = client.post("/api/v1/patterns/analyze", json={"file_path": file_path})
    assert response.status_code == 200
    patterns = response.json()["patterns"]
    
    decorator_patterns = [p for p in patterns if p["name"] == "decorator"]
    assert len(decorator_patterns) > 0
    assert decorator_patterns[0]["confidence"] > 0.7

def test_analyze_command_pattern():
    """Test command pattern detection."""
    code = """
class Command:
    def execute(self):
        pass

class ConcreteCommand(Command):
    def __init__(self, receiver):
        self._receiver = receiver
    
    def execute(self):
        self._receiver.action()
    """
    file_path = create_test_file(code)
    response = client.post("/api/v1/patterns/analyze", json={"file_path": file_path})
    assert response.status_code == 200
    patterns = response.json()["patterns"]
    
    command_patterns = [p for p in patterns if p["name"] == "command"]
    assert len(command_patterns) > 0
    assert command_patterns[0]["confidence"] > 0.7

def test_analyze_invalid_file():
    """Test handling of invalid file paths."""
    response = client.post("/api/v1/patterns/analyze", json={"file_path": "/nonexistent/file.py"})
    assert response.status_code == 404
    assert "File not found" in response.json()["detail"]

def test_analyze_syntax_error():
    """Test handling of Python syntax errors."""
    code = """
class InvalidPython:
    def broken_method()  # Missing colon
        pass
    """
    file_path = create_test_file(code)
    response = client.post("/api/v1/patterns/analyze", json={"file_path": file_path})
    assert response.status_code == 422
    assert "Syntax error" in response.json()["detail"]

def test_pattern_context():
    """Test that pattern context includes required information."""
    code = """
class TestClass:
    def method1(self):
        if True:
            pass
        for i in range(10):
            pass
    
    def method2(self):
        while True:
            pass
    """
    file_path = create_test_file(code)
    response = client.post("/api/v1/patterns/analyze", json={"file_path": file_path})
    assert response.status_code == 200
    patterns = response.json()["patterns"]
    
    for pattern in patterns:
        assert "complexity" in pattern["context"]
        assert "dependencies" in pattern["context"]
        assert "methods" in pattern["context"]
        assert "attributes" in pattern["context"]
        assert "related_patterns" in pattern["context"]

@pytest.fixture(autouse=True)
def cleanup():
    """Clean up temporary test files after each test."""
    yield
    # Clean up any remaining temporary Python files
    temp_dir = tempfile.gettempdir()
    for file in os.listdir(temp_dir):
        if file.endswith('.py'):
            try:
                os.remove(os.path.join(temp_dir, file))
            except OSError:
                pass
