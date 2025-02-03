"""Advanced Pattern Detector for analyzing design patterns in Python code.

This module provides sophisticated pattern detection capabilities using AST analysis
and relationship tracking between different patterns and code components.

Key Features:
1. Pattern Detection:
   - Detects common design patterns (Factory, Singleton, Observer, etc.)
   - Calculates confidence scores based on pattern-specific rules
   - Handles multiple patterns within the same class

2. Code Analysis:
   - Analyzes code structure using Python's AST
   - Tracks method calls and dependencies
   - Calculates code complexity metrics

3. Relationship Detection:
   - Identifies relationships between patterns
   - Tracks internal method calls within classes
   - Maps dependencies between different code components

Usage:
    detector = AdvancedPatternDetector()
    matches = await detector.analyze_file(file_path)
    for match in matches:
        print(f"Found {match.name} with confidence {match.confidence}")
"""

import ast
import logging
from dataclasses import dataclass
from pathlib import Path
from typing import Dict, List, Any, Set, Optional

logger = logging.getLogger(__name__)

@dataclass
class PatternContext:
    complexity: int
    dependencies: List[str]
    methods: List[str]
    attributes: List[str]
    related_patterns: List[str]

@dataclass
class PatternMatch:
    name: str
    confidence: float
    line_number: int
    context: PatternContext

class AdvancedPatternDetector:
    """Advanced pattern detector that uses AST analysis to identify design patterns."""
    
    def __init__(self):
        self.patterns = {
            'factory': self._detect_factory_pattern,
            'singleton': self._detect_singleton_pattern,
            'observer': self._detect_observer_pattern,
            'strategy': self._detect_strategy_pattern,
            'decorator': self._detect_decorator_pattern,
            'command': self._detect_command_pattern,
        }
        
    async def analyze_file(self, file_path: str) -> List[PatternMatch]:
        """Analyze a file for design patterns."""
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            tree = ast.parse(content)
            patterns: List[PatternMatch] = []
            
            for pattern_name, detector in self.patterns.items():
                try:
                    matches = detector(tree)
                    patterns.extend(matches)
                except Exception as e:
                    logger.error(f"Error detecting {pattern_name} pattern: {str(e)}")
            
            return patterns
            
        except FileNotFoundError:
            logger.error(f"File not found: {file_path}")
            raise FileNotFoundError(f"File not found: {file_path}")
        except SyntaxError as e:
            logger.error(f"Syntax error in file {file_path}: {str(e)}")
            raise SyntaxError(f"Syntax error in file {file_path}: {str(e)}")
        except Exception as e:
            logger.error(f"Error analyzing file {file_path}: {str(e)}")
            raise RuntimeError(f"Error analyzing file {file_path}: {str(e)}")

    def _get_complexity(self, node: ast.AST) -> int:
        """Calculate cyclomatic complexity."""
        complexity = 1
        for child in ast.walk(node):
            if isinstance(child, (ast.If, ast.While, ast.For, ast.ExceptHandler)):
                complexity += 1
            elif isinstance(child, ast.BoolOp):
                complexity += len(child.values) - 1
        return complexity

    def _get_dependencies(self, tree: ast.AST) -> List[str]:
        """Extract dependencies from imports."""
        dependencies = []
        for node in ast.walk(tree):
            if isinstance(node, ast.Import):
                dependencies.extend(name.name for name in node.names)
            elif isinstance(node, ast.ImportFrom):
                dependencies.append(f"{node.module}.{node.names[0].name}")
        return dependencies

    def _get_methods(self, class_node: ast.ClassDef) -> List[str]:
        """Extract method names from a class."""
        return [node.name for node in class_node.body if isinstance(node, ast.FunctionDef)]

    def _get_attributes(self, class_node: ast.ClassDef) -> List[str]:
        """Extract attribute names from a class."""
        attributes = []
        for node in class_node.body:
            if isinstance(node, ast.AnnAssign) and isinstance(node.target, ast.Name):
                attributes.append(node.target.id)
            elif isinstance(node, ast.Assign):
                for target in node.targets:
                    if isinstance(target, ast.Name):
                        attributes.append(target.id)
        return attributes

    def _detect_factory_pattern(self, tree: ast.AST) -> List[PatternMatch]:
        """Detect Factory pattern implementations."""
        patterns = []
        for node in ast.walk(tree):
            if isinstance(node, ast.ClassDef):
                # Look for create/factory methods
                factory_methods = [n for n in node.body 
                                 if isinstance(n, ast.FunctionDef) and 
                                 ('create' in n.name.lower() or 'factory' in n.name.lower())]
                
                if factory_methods:
                    # Increase base confidence for better pattern matching
                    confidence = min(0.7 + (len(factory_methods) * 0.1), 0.95)
                    
                    # Additional confidence if class name contains 'factory'
                    if 'factory' in node.name.lower():
                        confidence = min(confidence + 0.1, 0.95)
                    
                    context = PatternContext(
                        complexity=self._get_complexity(node),
                        dependencies=self._get_dependencies(tree),
                        methods=self._get_methods(node),
                        attributes=self._get_attributes(node),
                        related_patterns=['builder', 'abstract_factory']
                    )
                    patterns.append(PatternMatch(
                        name='factory',
                        confidence=confidence,
                        line_number=node.lineno,
                        context=context
                    ))
        return patterns

    def _detect_singleton_pattern(self, tree: ast.AST) -> List[PatternMatch]:
        """Detect Singleton pattern implementations."""
        patterns = []
        for node in ast.walk(tree):
            if isinstance(node, ast.ClassDef):
                # Look for singleton characteristics
                has_instance = any('_instance' in attr for attr in self._get_attributes(node))
                has_get_instance = any('get_instance' in method.lower() for method in self._get_methods(node))
                
                if has_instance and has_get_instance:
                    confidence = 0.9
                    context = PatternContext(
                        complexity=self._get_complexity(node),
                        dependencies=self._get_dependencies(tree),
                        methods=self._get_methods(node),
                        attributes=self._get_attributes(node),
                        related_patterns=['monostate']
                    )
                    patterns.append(PatternMatch(
                        name='singleton',
                        confidence=confidence,
                        line_number=node.lineno,
                        context=context
                    ))
        return patterns

    def _detect_observer_pattern(self, tree: ast.AST) -> List[PatternMatch]:
        """Detect Observer pattern implementations."""
        patterns = []
        subject_classes = []
        observer_classes = []
        
        # First pass: identify potential subjects and observers
        for node in ast.walk(tree):
            if isinstance(node, ast.ClassDef):
                methods = self._get_methods(node)
                attributes = self._get_attributes(node)
                
                # Check for Subject characteristics
                has_notify = any('notify' in method.lower() for method in methods)
                has_observers_list = any('observer' in attr.lower() for attr in attributes)
                has_attach = any('attach' in method.lower() or 'subscribe' in method.lower() for method in methods)
                
                if has_notify or (has_observers_list and has_attach):
                    subject_classes.append(node)
                
                # Check for Observer characteristics
                has_update = any('update' in method.lower() for method in methods)
                if has_update or 'observer' in node.name.lower():
                    observer_classes.append(node)
        
        # Calculate confidence based on complete pattern implementation
        if subject_classes and observer_classes:
            base_confidence = 0.8  # Higher base confidence when both parts exist
            
            for subject in subject_classes:
                methods = self._get_methods(subject)
                attributes = self._get_attributes(subject)
                
                # Calculate confidence based on implementation completeness
                confidence = base_confidence
                
                # Boost confidence based on implementation details
                if any('notify' in m.lower() for m in methods):
                    confidence = min(confidence + 0.1, 0.95)
                if any('attach' in m.lower() or 'subscribe' in m.lower() for m in methods):
                    confidence = min(confidence + 0.05, 0.95)
                if any('observer' in attr.lower() for attr in attributes):
                    confidence = min(confidence + 0.05, 0.95)
                
                context = PatternContext(
                    complexity=self._get_complexity(subject),
                    dependencies=self._get_dependencies(tree),
                    methods=methods,
                    attributes=attributes,
                    related_patterns=['publisher_subscriber', 'event_driven']
                )
                patterns.append(PatternMatch(
                    name='observer',
                    confidence=confidence,
                    line_number=subject.lineno,
                    context=context
                ))
        
        return patterns

    def _detect_strategy_pattern(self, tree: ast.AST) -> List[PatternMatch]:
        """Detect Strategy pattern implementations."""
        patterns = []
        for node in ast.walk(tree):
            if isinstance(node, ast.ClassDef):
                # Look for strategy characteristics
                methods = self._get_methods(node)
                has_execute = any('execute' in method.lower() for method in methods)
                has_strategy = 'strategy' in node.name.lower()
                
                if has_execute or has_strategy:
                    confidence = 0.8 if has_execute and has_strategy else 0.6
                    context = PatternContext(
                        complexity=self._get_complexity(node),
                        dependencies=self._get_dependencies(tree),
                        methods=methods,
                        attributes=self._get_attributes(node),
                        related_patterns=['state', 'command']
                    )
                    patterns.append(PatternMatch(
                        name='strategy',
                        confidence=confidence,
                        line_number=node.lineno,
                        context=context
                    ))
        return patterns

    def _detect_decorator_pattern(self, tree: ast.AST) -> List[PatternMatch]:
        """Detect Decorator pattern implementations."""
        patterns = []
        for node in ast.walk(tree):
            if isinstance(node, ast.ClassDef):
                # Look for decorator characteristics
                bases = [base.id for base in node.bases if isinstance(base, ast.Name)]
                methods = self._get_methods(node)
                
                if len(bases) > 0 and any('wrap' in method.lower() for method in methods):
                    confidence = 0.8
                    context = PatternContext(
                        complexity=self._get_complexity(node),
                        dependencies=self._get_dependencies(tree),
                        methods=methods,
                        attributes=self._get_attributes(node),
                        related_patterns=['proxy', 'adapter']
                    )
                    patterns.append(PatternMatch(
                        name='decorator',
                        confidence=confidence,
                        line_number=node.lineno,
                        context=context
                    ))
        return patterns

    def _detect_command_pattern(self, tree: ast.AST) -> List[PatternMatch]:
        """Detect Command pattern implementations."""
        patterns = []
        for node in ast.walk(tree):
            if isinstance(node, ast.ClassDef):
                # Look for command characteristics
                methods = self._get_methods(node)
                has_execute = any('execute' in method.lower() for method in methods)
                has_command = 'command' in node.name.lower()
                
                if has_execute or has_command:
                    confidence = 0.8 if has_execute and has_command else 0.6
                    context = PatternContext(
                        complexity=self._get_complexity(node),
                        dependencies=self._get_dependencies(tree),
                        methods=methods,
                        attributes=self._get_attributes(node),
                        related_patterns=['strategy', 'chain_of_responsibility']
                    )
                    patterns.append(PatternMatch(
                        name='command',
                        confidence=confidence,
                        line_number=node.lineno,
                        context=context
                    ))
        return patterns
