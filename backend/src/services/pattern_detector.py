"""Pattern detection service for analyzing code and identifying design patterns."""
from typing import List, Dict, Any, Optional
import ast
from dataclasses import dataclass
from ..core.logging import get_logger

logger = get_logger(__name__)

@dataclass
class PatternContext:
    """Context information about a detected pattern."""
    complexity: int
    dependencies: List[str]
    methods: List[str]
    attributes: List[str]
    related_patterns: List[str]

@dataclass
class PatternMatch:
    """A detected design pattern instance."""
    name: str
    confidence: float
    line_number: int
    context: PatternContext

class PatternVisitor(ast.NodeVisitor):
    """AST visitor for detecting design patterns."""
    
    def __init__(self):
        self.patterns: List[PatternMatch] = []
        self.current_class: Optional[ast.ClassDef] = None
        self.imports: List[str] = []
        
    def visit_Import(self, node: ast.Import):
        """Record imported modules."""
        for name in node.names:
            self.imports.append(name.name)
        self.generic_visit(node)
        
    def visit_ImportFrom(self, node: ast.ImportFrom):
        """Record from-imports."""
        if node.module:
            for name in node.names:
                self.imports.append(f"{node.module}.{name.name}")
        self.generic_visit(node)
        
    def visit_ClassDef(self, node: ast.ClassDef):
        """Visit class definitions to detect patterns."""
        prev_class = self.current_class
        self.current_class = node
        
        # Get methods and attributes
        methods = []
        attributes = []
        for item in node.body:
            if isinstance(item, ast.FunctionDef):
                methods.append(item.name)
            elif isinstance(item, ast.Assign):
                for target in item.targets:
                    if isinstance(target, ast.Name):
                        attributes.append(target.id)
        
        # Detect Singleton Pattern
        if self._is_singleton(node):
            self.patterns.append(PatternMatch(
                name="singleton",
                confidence=0.95,
                line_number=node.lineno,
                context=PatternContext(
                    complexity=2,
                    dependencies=self.imports,
                    methods=methods,
                    attributes=attributes,
                    related_patterns=["monostate"]
                )
            ))
            
        # Detect Factory Pattern
        if self._is_factory(node):
            self.patterns.append(PatternMatch(
                name="factory",
                confidence=0.9,
                line_number=node.lineno,
                context=PatternContext(
                    complexity=3,
                    dependencies=self.imports,
                    methods=methods,
                    attributes=attributes,
                    related_patterns=["abstract_factory", "builder"]
                )
            ))
            
        # Detect Observer Pattern
        if self._is_observer(node):
            self.patterns.append(PatternMatch(
                name="observer",
                confidence=0.95,
                line_number=node.lineno,
                context=PatternContext(
                    complexity=2,
                    dependencies=self.imports,
                    methods=methods,
                    attributes=attributes,
                    related_patterns=["publisher_subscriber", "event_driven"]
                )
            ))
            
        # Detect Strategy Pattern
        if self._is_strategy(node):
            self.patterns.append(PatternMatch(
                name="strategy",
                confidence=0.8,
                line_number=node.lineno,
                context=PatternContext(
                    complexity=1,
                    dependencies=self.imports,
                    methods=methods,
                    attributes=attributes,
                    related_patterns=["state", "command"]
                )
            ))
            
        # Detect Command Pattern
        if self._is_command(node):
            self.patterns.append(PatternMatch(
                name="command",
                confidence=0.6,
                line_number=node.lineno,
                context=PatternContext(
                    complexity=1,
                    dependencies=self.imports,
                    methods=methods,
                    attributes=attributes,
                    related_patterns=["strategy", "chain_of_responsibility"]
                )
            ))
            
        # Visit child nodes
        self.generic_visit(node)
        self.current_class = prev_class
        
    def _is_singleton(self, node: ast.ClassDef) -> bool:
        """Detect Singleton pattern."""
        has_instance = False
        has_new_method = False
        
        for item in node.body:
            if isinstance(item, ast.Assign):
                for target in item.targets:
                    if isinstance(target, ast.Name) and target.id == "_instance":
                        has_instance = True
            elif isinstance(item, ast.FunctionDef) and item.name == "__new__":
                has_new_method = True
                
        return has_instance and has_new_method
        
    def _is_factory(self, node: ast.ClassDef) -> bool:
        """Detect Factory pattern."""
        has_create_method = False
        returns_different_types = False
        
        for item in node.body:
            if isinstance(item, ast.FunctionDef) and "create" in item.name.lower():
                has_create_method = True
                # Check if method has conditional returns
                for child in ast.walk(item):
                    if isinstance(child, (ast.If, ast.Match)):
                        returns_different_types = True
                        
        return has_create_method and returns_different_types
        
    def _is_observer(self, node: ast.ClassDef) -> bool:
        """Detect Observer pattern."""
        has_observers = False
        has_notify = False
        
        for item in node.body:
            if isinstance(item, ast.Assign):
                for target in item.targets:
                    if isinstance(target, ast.Name) and "observer" in target.id.lower():
                        has_observers = True
            elif isinstance(item, ast.FunctionDef):
                if item.name in ["notify", "update"]:
                    has_notify = True
                    
        return has_observers or has_notify
        
    def _is_strategy(self, node: ast.ClassDef) -> bool:
        """Detect Strategy pattern."""
        has_strategy_method = False
        is_abstract = False
        
        # Check for ABC inheritance
        for base in node.bases:
            if isinstance(base, ast.Name) and base.id == "ABC":
                is_abstract = True
                
        # Check for strategy-like method
        for item in node.body:
            if isinstance(item, ast.FunctionDef):
                if item.name in ["execute", "apply", "algorithm"]:
                    has_strategy_method = True
                    
        return has_strategy_method or is_abstract
        
    def _is_command(self, node: ast.ClassDef) -> bool:
        """Detect Command pattern."""
        has_execute = False
        has_receiver = False
        
        for item in node.body:
            if isinstance(item, ast.FunctionDef) and item.name == "execute":
                has_execute = True
            elif isinstance(item, ast.Assign):
                for target in item.targets:
                    if isinstance(target, ast.Name) and "receiver" in target.id.lower():
                        has_receiver = True
                        
        return has_execute or has_receiver

def analyze_patterns(code: str) -> List[PatternMatch]:
    """
    Analyze code for design patterns.
    
    Args:
        code: Python source code to analyze
        
    Returns:
        List of detected patterns
    """
    try:
        tree = ast.parse(code)
        visitor = PatternVisitor()
        visitor.visit(tree)
        return visitor.patterns
    except Exception as e:
        logger.error("Error analyzing patterns", error=str(e), exc_info=True)
        return []
