"""Tests for pattern detector service."""
import pytest
from src.services.pattern_detector import analyze_patterns, PatternMatch, PatternContext

def test_singleton_detection():
    """Test detection of Singleton pattern."""
    code = '''
    class Singleton:
        _instance = None
        
        def __new__(cls):
            if cls._instance is None:
                cls._instance = super().__new__(cls)
            return cls._instance
    '''
    
    patterns = analyze_patterns(code)
    assert len(patterns) > 0
    singleton_patterns = [p for p in patterns if p.name == "singleton"]
    assert len(singleton_patterns) == 1
    
    pattern = singleton_patterns[0]
    assert pattern.confidence > 0.9
    assert "_instance" in pattern.context.attributes
    assert "__new__" in pattern.context.methods

def test_factory_detection():
    """Test detection of Factory pattern."""
    code = '''
    class Factory:
        def create_product(self, type):
            if type == "A":
                return ProductA()
            elif type == "B":
                return ProductB()
    '''
    
    patterns = analyze_patterns(code)
    assert len(patterns) > 0
    factory_patterns = [p for p in patterns if p.name == "factory"]
    assert len(factory_patterns) == 1
    
    pattern = factory_patterns[0]
    assert pattern.confidence > 0.8
    assert "create_product" in pattern.context.methods
    assert "abstract_factory" in pattern.context.related_patterns

def test_observer_detection():
    """Test detection of Observer pattern."""
    code = '''
    class Subject:
        def __init__(self):
            self._observers = []
            
        def notify(self):
            for observer in self._observers:
                observer.update()
    '''
    
    patterns = analyze_patterns(code)
    assert len(patterns) > 0
    observer_patterns = [p for p in patterns if p.name == "observer"]
    assert len(observer_patterns) == 1
    
    pattern = observer_patterns[0]
    assert pattern.confidence > 0.9
    assert "notify" in pattern.context.methods
    assert "_observers" in pattern.context.attributes

def test_strategy_detection():
    """Test detection of Strategy pattern."""
    code = '''
    from abc import ABC, abstractmethod
    
    class Strategy(ABC):
        @abstractmethod
        def execute(self, data):
            pass
    '''
    
    patterns = analyze_patterns(code)
    assert len(patterns) > 0
    strategy_patterns = [p for p in patterns if p.name == "strategy"]
    assert len(strategy_patterns) == 1
    
    pattern = strategy_patterns[0]
    assert pattern.confidence > 0.7
    assert "execute" in pattern.context.methods
    assert "abc.ABC" in pattern.context.dependencies

def test_command_detection():
    """Test detection of Command pattern."""
    code = '''
    class Command:
        def __init__(self, receiver):
            self.receiver = receiver
            
        def execute(self):
            self.receiver.action()
    '''
    
    patterns = analyze_patterns(code)
    assert len(patterns) > 0
    command_patterns = [p for p in patterns if p.name == "command"]
    assert len(command_patterns) == 1
    
    pattern = command_patterns[0]
    assert pattern.confidence > 0.5
    assert "execute" in pattern.context.methods
    assert "receiver" in pattern.context.attributes

def test_multiple_patterns():
    """Test detection of multiple patterns in the same code."""
    code = '''
    class Singleton:
        _instance = None
        def __new__(cls):
            if cls._instance is None:
                cls._instance = super().__new__(cls)
            return cls._instance
            
    class Factory:
        def create_product(self, type):
            if type == "A":
                return ProductA()
            return ProductB()
    '''
    
    patterns = analyze_patterns(code)
    pattern_names = {p.name for p in patterns}
    assert "singleton" in pattern_names
    assert "factory" in pattern_names
    
    # Check confidence levels
    singleton = next(p for p in patterns if p.name == "singleton")
    factory = next(p for p in patterns if p.name == "factory")
    assert singleton.confidence > 0.9
    assert factory.confidence > 0.8

def test_invalid_code():
    """Test handling of invalid code."""
    code = '''
    class Invalid
        def broken_method()
    '''
    
    patterns = analyze_patterns(code)
    assert patterns == []

def test_empty_code():
    """Test handling of empty code."""
    patterns = analyze_patterns("")
    assert patterns == []

def test_no_patterns():
    """Test code without any patterns."""
    code = '''
    def simple_function():
        return 42
    '''
    
    patterns = analyze_patterns(code)
    assert patterns == []

def test_pattern_context():
    """Test pattern context information."""
    code = '''
    from abc import ABC
    from typing import List
    
    class Strategy(ABC):
        def __init__(self):
            self.data = []
            
        def execute(self, input_data: List[str]) -> List[str]:
            return self.process(input_data)
    '''
    
    patterns = analyze_patterns(code)
    strategy_patterns = [p for p in patterns if p.name == "strategy"]
    assert len(strategy_patterns) == 1
    
    context = strategy_patterns[0].context
    assert "abc.ABC" in context.dependencies
    assert "typing.List" in context.dependencies
    assert "execute" in context.methods
    assert "data" in context.attributes
    assert context.complexity > 0
