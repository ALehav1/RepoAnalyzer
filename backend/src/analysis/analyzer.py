"""Code analysis functionality."""

from typing import List, Dict, Any, Optional
import re
import logging
from datetime import datetime

logger = logging.getLogger(__name__)

class CodeAnalyzer:
    """Analyzes code for patterns, complexity, and quality."""

    def __init__(self):
        """Initialize code analyzer."""
        self.patterns = {
            'complexity': [
                (r'for.*for', 'nested_loops'),
                (r'if.*if', 'nested_conditionals'),
                (r'try.*except.*except', 'multiple_except'),
                (r'def.*def', 'nested_functions')
            ],
            'quality': [
                (r'print\(', 'debug_print'),
                (r'#\s*TODO', 'todo_comment'),
                (r'except:\s*pass', 'bare_except'),
                (r'global\s+\w+', 'global_variable')
            ],
            'security': [
                (r'eval\(', 'eval_usage'),
                (r'exec\(', 'exec_usage'),
                (r'os\.system\(', 'os_system'),
                (r'subprocess\.call\(', 'subprocess_call')
            ]
        }

    def analyze_chunk(self, chunk: Dict[str, Any]) -> Dict[str, Any]:
        """Analyze a code chunk and return analysis results.
        
        Args:
            chunk: Dictionary containing code chunk and metadata
            
        Returns:
            Dict[str, Any]: Analysis results for the chunk
        """
        try:
            code = chunk['content']
            analysis = self.analyze_code(code)
            
            # Add chunk metadata to analysis
            analysis.update({
                'start_line': chunk['start_line'],
                'end_line': chunk['end_line'],
                'size': chunk['size'],
                'line_count': chunk['line_count']
            })
            
            logger.info(f"Analyzed chunk from lines {chunk['start_line']} to {chunk['end_line']}")
            return analysis
            
        except Exception as e:
            logger.error(f"Error analyzing chunk: {str(e)}")
            raise

    def analyze_code(self, code: str) -> Dict[str, Any]:
        """Analyze code for various metrics.
        
        Args:
            code: Source code string
            
        Returns:
            Dict[str, Any]: Analysis results
        """
        try:
            results = {
                'complexity': self._analyze_complexity(code),
                'quality': self._analyze_quality(code),
                'security': self._analyze_security(code),
                'metrics': self._calculate_metrics(code),
                'timestamp': datetime.utcnow().isoformat()
            }
            
            logger.info("Completed code analysis")
            return results
            
        except Exception as e:
            logger.error(f"Error analyzing code: {str(e)}")
            raise

    def _analyze_complexity(self, code: str) -> Dict[str, Any]:
        """Analyze code complexity.
        
        Args:
            code: Source code string
            
        Returns:
            Dict[str, Any]: Complexity metrics
        """
        try:
            results = {}
            for pattern, name in self.patterns['complexity']:
                matches = len(re.findall(pattern, code))
                results[name] = matches
            
            # Calculate cyclomatic complexity
            results['cyclomatic_complexity'] = (
                len(re.findall(r'\bif\b', code)) +
                len(re.findall(r'\bfor\b', code)) +
                len(re.findall(r'\bwhile\b', code)) +
                len(re.findall(r'except\b', code)) + 1
            )
            
            return results
            
        except Exception as e:
            logger.error(f"Error analyzing complexity: {str(e)}")
            raise

    def _analyze_quality(self, code: str) -> Dict[str, Any]:
        """Analyze code quality.
        
        Args:
            code: Source code string
            
        Returns:
            Dict[str, Any]: Quality metrics
        """
        try:
            results = {}
            for pattern, name in self.patterns['quality']:
                matches = len(re.findall(pattern, code))
                results[name] = matches
            
            # Calculate documentation ratio
            doc_lines = len(re.findall(r'"""[\s\S]*?"""', code))
            total_lines = len(code.split('\n'))
            results['documentation_ratio'] = doc_lines / total_lines if total_lines > 0 else 0
            
            return results
            
        except Exception as e:
            logger.error(f"Error analyzing quality: {str(e)}")
            raise

    def _analyze_security(self, code: str) -> Dict[str, Any]:
        """Analyze security concerns.
        
        Args:
            code: Source code string
            
        Returns:
            Dict[str, Any]: Security metrics
        """
        try:
            results = {}
            for pattern, name in self.patterns['security']:
                matches = len(re.findall(pattern, code))
                results[name] = matches
            
            return results
            
        except Exception as e:
            logger.error(f"Error analyzing security: {str(e)}")
            raise

    def _calculate_metrics(self, code: str) -> Dict[str, Any]:
        """Calculate various code metrics.
        
        Args:
            code: Source code string
            
        Returns:
            Dict[str, Any]: Code metrics
        """
        try:
            lines = code.split('\n')
            non_empty_lines = [line for line in lines if line.strip()]
            
            return {
                'total_lines': len(lines),
                'non_empty_lines': len(non_empty_lines),
                'average_line_length': sum(len(line) for line in non_empty_lines) / len(non_empty_lines) if non_empty_lines else 0,
                'max_line_length': max(len(line) for line in non_empty_lines) if non_empty_lines else 0
            }
            
        except Exception as e:
            logger.error(f"Error calculating metrics: {str(e)}")
            raise

    def get_recommendations(self, analysis_results: Dict[str, Any]) -> List[str]:
        """Generate recommendations based on analysis results.
        
        Args:
            analysis_results: Analysis results from analyze_code
            
        Returns:
            List[str]: List of recommendations
        """
        try:
            recommendations = []
            
            # Complexity recommendations
            if analysis_results['complexity']['cyclomatic_complexity'] > 10:
                recommendations.append(
                    "Consider breaking down complex functions to improve maintainability"
                )
            if analysis_results['complexity']['nested_loops'] > 0:
                recommendations.append(
                    "Nested loops detected. Consider extracting inner loops to separate functions"
                )
                
            # Quality recommendations
            if analysis_results['quality']['debug_print'] > 0:
                recommendations.append(
                    "Remove debug print statements and use proper logging"
                )
            if analysis_results['quality']['documentation_ratio'] < 0.1:
                recommendations.append(
                    "Increase code documentation coverage"
                )
                
            # Security recommendations
            security_issues = analysis_results['security']
            if any(security_issues.values()):
                recommendations.append(
                    "Security concerns detected. Review usage of potentially unsafe functions"
                )
                
            logger.info(f"Generated {len(recommendations)} recommendations")
            return recommendations
            
        except Exception as e:
            logger.error(f"Error generating recommendations: {str(e)}")
            raise
