"""Metrics schemas."""
from pydantic import BaseModel, Field
from typing import Dict, List, Optional
from datetime import datetime

class MetricDetails(BaseModel):
    """Detailed metrics for a specific category."""
    score: float = Field(..., description="Score for this metric category (0-100)")
    details: List[str] = Field(default_factory=list, description="List of detailed findings")
    recommendations: List[str] = Field(default_factory=list, description="List of recommendations for improvement")

    class Config:
        """Pydantic config."""
        json_schema_extra = {
            "example": {
                "score": 85.5,
                "details": [
                    "Good code organization",
                    "Low complexity",
                    "Consistent naming conventions"
                ],
                "recommendations": [
                    "Add more inline comments",
                    "Consider breaking down large functions",
                    "Add type hints to function parameters"
                ]
            }
        }

class AnalysisMetrics(BaseModel):
    """Analysis metrics schema."""
    code_quality_score: float = Field(..., description="Overall code quality score")
    maintainability_score: float = Field(..., description="Code maintainability score")
    complexity_score: float = Field(..., description="Code complexity score")
    test_coverage: Optional[float] = Field(None, description="Test coverage percentage")
    documentation_score: float = Field(..., description="Documentation quality score")
    best_practices_score: float = Field(..., description="Adherence to best practices score")
    security_score: Optional[float] = Field(None, description="Security assessment score")
    performance_score: Optional[float] = Field(None, description="Performance assessment score")
    issues_count: Dict[str, int] = Field(default_factory=dict, description="Count of issues by category")
    recommendations: List[str] = Field(default_factory=list, description="List of improvement recommendations")
    analyzed_at: datetime = Field(default_factory=datetime.utcnow, description="When the analysis was performed")

    class Config:
        """Pydantic config."""
        json_schema_extra = {
            "example": {
                "code_quality_score": 85.5,
                "maintainability_score": 90.0,
                "complexity_score": 82.3,
                "test_coverage": 75.5,
                "documentation_score": 88.0,
                "best_practices_score": 92.0,
                "security_score": 95.0,
                "performance_score": 87.5,
                "issues_count": {
                    "critical": 0,
                    "high": 2,
                    "medium": 5,
                    "low": 8
                },
                "recommendations": [
                    "Add more unit tests to improve coverage",
                    "Consider implementing input validation",
                    "Document public API endpoints"
                ],
                "analyzed_at": "2025-01-31T10:00:00Z"
            }
        }
