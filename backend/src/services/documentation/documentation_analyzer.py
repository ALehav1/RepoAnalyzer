"""Service for analyzing code documentation."""
import ast
from pathlib import Path
from typing import Dict, List, Optional, Tuple

class DocumentationAnalyzer:
    """Analyzer for code documentation."""

    def analyze_file(self, file_path: Path) -> Dict[str, float]:
        """Analyze documentation coverage for a file."""
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            tree = ast.parse(content)
            stats = self._analyze_tree(tree)
            
            total_nodes = stats['total_nodes']
            documented_nodes = stats['documented_nodes']
            
            if total_nodes == 0:
                return {
                    'coverage': 0.0,
                    'quality': 0.0,
                    'completeness': 0.0
                }
            
            coverage = documented_nodes / total_nodes
            quality = self._calculate_doc_quality(stats['doc_strings'])
            completeness = self._calculate_doc_completeness(stats['doc_strings'])
            
            return {
                'coverage': coverage,
                'quality': quality,
                'completeness': completeness
            }
            
        except Exception as e:
            print(f"Error analyzing documentation in {file_path}: {str(e)}")
            return {
                'coverage': 0.0,
                'quality': 0.0,
                'completeness': 0.0
            }

    def _analyze_tree(self, tree: ast.AST) -> Dict[str, any]:
        """Analyze AST tree for documentation statistics."""
        stats = {
            'total_nodes': 0,
            'documented_nodes': 0,
            'doc_strings': []
        }
        
        for node in ast.walk(tree):
            if isinstance(node, (ast.FunctionDef, ast.ClassDef, ast.AsyncFunctionDef, ast.Module)):
                stats['total_nodes'] += 1
                
                docstring = ast.get_docstring(node)
                if docstring:
                    stats['documented_nodes'] += 1
                    stats['doc_strings'].append(docstring)
        
        return stats

    def _calculate_doc_quality(self, docstrings: List[str]) -> float:
        """Calculate documentation quality score."""
        if not docstrings:
            return 0.0
        
        total_score = 0.0
        
        for doc in docstrings:
            score = 0.0
            
            # Check length
            if len(doc.split()) >= 3:
                score += 0.3
            
            # Check for parameters or returns
            if ':param' in doc or ':return' in doc:
                score += 0.3
            
            # Check for code examples
            if '>>>' in doc or 'Example:' in doc:
                score += 0.2
            
            # Check for type hints
            if ':type' in doc or '->' in doc:
                score += 0.2
            
            total_score += score
        
        return min(1.0, total_score / len(docstrings))

    def _calculate_doc_completeness(self, docstrings: List[str]) -> float:
        """Calculate documentation completeness score."""
        if not docstrings:
            return 0.0
        
        total_score = 0.0
        
        for doc in docstrings:
            score = 0.0
            
            # Check for description
            if len(doc.strip().split('\n')[0]) > 10:
                score += 0.4
            
            # Check for parameters documentation
            if ':param' in doc:
                score += 0.3
            
            # Check for return value documentation
            if ':return' in doc:
                score += 0.3
            
            total_score += score
        
        return min(1.0, total_score / len(docstrings))

    def analyze_repository(self, repo_path: Path) -> Dict[str, any]:
        """Analyze documentation for an entire repository."""
        total_files = 0
        total_coverage = 0.0
        total_quality = 0.0
        total_completeness = 0.0
        file_scores = {}
        
        for file_path in repo_path.rglob('*.py'):
            if file_path.is_file():
                scores = self.analyze_file(file_path)
                relative_path = str(file_path.relative_to(repo_path))
                file_scores[relative_path] = scores
                
                total_files += 1
                total_coverage += scores['coverage']
                total_quality += scores['quality']
                total_completeness += scores['completeness']
        
        if total_files == 0:
            return {
                'average_coverage': 0.0,
                'average_quality': 0.0,
                'average_completeness': 0.0,
                'file_scores': {}
            }
        
        return {
            'average_coverage': total_coverage / total_files,
            'average_quality': total_quality / total_files,
            'average_completeness': total_completeness / total_files,
            'file_scores': file_scores
        }
