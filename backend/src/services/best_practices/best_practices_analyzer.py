"""Service for analyzing code best practices."""
from pathlib import Path
from typing import Dict, List, Optional
import ast
from ..pattern_detectors.advanced_pattern_detector import AdvancedPatternDetector

class BestPracticesAnalyzer:
    """Analyzer for code best practices."""

    def __init__(self):
        """Initialize the analyzer."""
        self.pattern_detector = AdvancedPatternDetector()

    async def analyze_repository(self, repo_path: Path) -> Dict[str, any]:
        """Analyze best practices for an entire repository."""
        results = {
            'design_score': 0.0,
            'performance_score': 0.0,
            'security_score': 0.0,
            'maintainability_score': 0.0,
            'patterns': [],
            'recommendations': []
        }

        try:
            # Analyze patterns
            pattern_results = await self._analyze_patterns(repo_path)
            results['patterns'] = pattern_results['patterns']
            
            # Calculate scores
            scores = self._calculate_scores(pattern_results)
            results.update(scores)
            
            # Generate recommendations
            results['recommendations'] = self._generate_recommendations(
                pattern_results,
                scores
            )
            
        except Exception as e:
            print(f"Error analyzing best practices: {str(e)}")
            results['error'] = str(e)
        
        return results

    async def _analyze_patterns(self, repo_path: Path) -> Dict[str, any]:
        """Analyze design patterns in the repository."""
        results = {
            'patterns': [],
            'pattern_counts': {},
            'pattern_quality': {},
            'issues': []
        }
        
        for file_path in repo_path.rglob('*.py'):
            try:
                matches = await self.pattern_detector.analyze_file(file_path)
                for match in matches:
                    pattern = {
                        'name': match.pattern_name,
                        'file': str(file_path.relative_to(repo_path)),
                        'line': match.line_number,
                        'confidence': match.confidence,
                        'snippet': match.code_snippet,
                        'context': match.context,
                        'category': self._get_pattern_category(match.pattern_name),
                        'impact': self._assess_pattern_impact(match)
                    }
                    results['patterns'].append(pattern)
                    
                    # Update pattern counts
                    if match.pattern_name not in results['pattern_counts']:
                        results['pattern_counts'][match.pattern_name] = 0
                    results['pattern_counts'][match.pattern_name] += 1
                    
                    # Track pattern quality
                    if match.pattern_name not in results['pattern_quality']:
                        results['pattern_quality'][match.pattern_name] = []
                    results['pattern_quality'][match.pattern_name].append(match.confidence)
                    
            except Exception as e:
                results['issues'].append({
                    'file': str(file_path),
                    'error': str(e)
                })
        
        return results

    def _get_pattern_category(self, pattern_name: str) -> str:
        """Get category for a pattern."""
        categories = {
            'factory': 'design',
            'singleton': 'design',
            'observer': 'design',
            'strategy': 'design',
            'facade': 'design',
            'adapter': 'design',
            'chain_of_responsibility': 'design',
            'caching': 'performance',
            'pooling': 'performance',
            'lazy_loading': 'performance',
            'authentication': 'security',
            'authorization': 'security',
            'validation': 'security',
            'decorator': 'maintainability',
            'composite': 'maintainability',
            'proxy': 'maintainability'
        }
        return categories.get(pattern_name, 'other')

    def _assess_pattern_impact(self, match: any) -> str:
        """Assess the impact of a pattern match."""
        if match.confidence > 0.8:
            return 'high'
        elif match.confidence > 0.6:
            return 'medium'
        return 'low'

    def _calculate_scores(self, results: Dict[str, any]) -> Dict[str, float]:
        """Calculate scores based on pattern analysis."""
        scores = {
            'design_score': 0.0,
            'performance_score': 0.0,
            'security_score': 0.0,
            'maintainability_score': 0.0
        }
        
        if not results['patterns']:
            return scores
        
        # Calculate category scores
        category_patterns = {
            'design': [],
            'performance': [],
            'security': [],
            'maintainability': []
        }
        
        for pattern in results['patterns']:
            category = pattern['category']
            if category in category_patterns:
                category_patterns[category].append(pattern)
        
        # Weight factors for scoring
        weights = {
            'confidence': 0.4,
            'impact': 0.3,
            'implementation': 0.3
        }
        
        # Calculate scores for each category
        for category, patterns in category_patterns.items():
            if not patterns:
                continue
                
            category_score = 0.0
            for pattern in patterns:
                # Confidence score
                confidence_score = pattern['confidence'] * weights['confidence']
                
                # Impact score
                impact_score = {
                    'high': 1.0,
                    'medium': 0.7,
                    'low': 0.4
                }[pattern['impact']] * weights['impact']
                
                # Implementation score (based on context)
                impl_score = self._calculate_implementation_score(pattern) * weights['implementation']
                
                pattern_score = confidence_score + impact_score + impl_score
                category_score += pattern_score
            
            category_score = min(100.0, (category_score / len(patterns)) * 100)
            scores[f'{category}_score'] = category_score
        
        return scores

    def _calculate_implementation_score(self, pattern: Dict[str, any]) -> float:
        """Calculate implementation quality score for a pattern."""
        score = 0.0
        context = pattern.get('context', {})
        
        # Check complexity
        complexity = context.get('complexity', 10)
        if complexity < 5:
            score += 0.4
        elif complexity < 10:
            score += 0.2
        
        # Check dependencies
        dependencies = len(context.get('dependencies', []))
        if dependencies < 3:
            score += 0.3
        elif dependencies < 6:
            score += 0.2
        
        # Check scope
        if context.get('scope') == 'class':
            score += 0.3
        elif context.get('scope') == 'module':
            score += 0.2
        
        return min(1.0, score)

    def _generate_recommendations(
        self,
        pattern_results: Dict[str, any],
        scores: Dict[str, float]
    ) -> List[str]:
        """Generate recommendations based on analysis results."""
        recommendations = []
        
        # Pattern-based recommendations
        if pattern_results['patterns']:
            pattern_issues = self._analyze_pattern_issues(pattern_results)
            recommendations.extend(pattern_issues)
        
        # Score-based recommendations
        for category, score in scores.items():
            if score < 60:
                category_name = category.replace('_score', '')
                recommendations.append(
                    f"Improve {category_name} patterns implementation. Current score: {score:.1f}/100"
                )
        
        # Implementation recommendations
        implementation_issues = self._analyze_implementation_issues(pattern_results)
        recommendations.extend(implementation_issues)
        
        return recommendations

    def _analyze_pattern_issues(self, results: Dict[str, any]) -> List[str]:
        """Analyze issues with pattern implementations."""
        issues = []
        
        # Check pattern distribution
        pattern_counts = results['pattern_counts']
        if len(pattern_counts) < 3:
            issues.append(
                "Consider implementing more design patterns to improve code organization"
            )
        
        # Check pattern quality
        pattern_quality = results['pattern_quality']
        for pattern, confidences in pattern_quality.items():
            avg_confidence = sum(confidences) / len(confidences)
            if avg_confidence < 0.6:
                issues.append(
                    f"Improve {pattern} pattern implementation - low confidence score"
                )
        
        # Check pattern combinations
        patterns_found = set(pattern_counts.keys())
        recommended_combinations = {
            'factory': {'builder', 'prototype'},
            'observer': {'mediator', 'command'},
            'strategy': {'factory', 'command'}
        }
        
        for pattern, recommended in recommended_combinations.items():
            if pattern in patterns_found:
                missing = recommended - patterns_found
                if missing:
                    issues.append(
                        f"Consider implementing {', '.join(missing)} patterns to complement {pattern} pattern"
                    )
        
        return issues

    def _analyze_implementation_issues(self, results: Dict[str, any]) -> List[str]:
        """Analyze implementation-specific issues."""
        issues = []
        
        # Analyze complexity
        high_complexity = []
        for pattern in results['patterns']:
            if pattern['context'].get('complexity', 0) > 10:
                high_complexity.append(pattern['name'])
        
        if high_complexity:
            issues.append(
                f"Reduce complexity in {', '.join(set(high_complexity))} pattern implementations"
            )
        
        # Analyze dependencies
        high_dependencies = []
        for pattern in results['patterns']:
            if len(pattern['context'].get('dependencies', [])) > 5:
                high_dependencies.append(pattern['name'])
        
        if high_dependencies:
            issues.append(
                f"Reduce dependencies in {', '.join(set(high_dependencies))} pattern implementations"
            )
        
        return issues
