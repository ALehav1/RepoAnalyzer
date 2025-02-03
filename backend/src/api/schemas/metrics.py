"""Pydantic schemas for analysis metrics."""

from pydantic import BaseModel, Field
from typing import List, Optional

class MetricDetails(BaseModel):
    """Schema for individual metric details."""
    score: float = Field(..., ge=0, le=100, description="Score from 0-100")
    details: List[str] = Field(..., description="List of detailed findings")
    recommendations: Optional[List[str]] = Field(default=None, description="List of recommendations for improvement")

class AnalysisMetrics(BaseModel):
    """Schema for all analysis metrics."""
    code_quality: MetricDetails = Field(..., description="Code quality metrics")
    documentation: MetricDetails = Field(..., description="Documentation metrics")
    best_practices: MetricDetails = Field(..., description="Best practices metrics")
    performance: Optional[MetricDetails] = Field(None, description="Performance metrics")
    security: Optional[MetricDetails] = Field(None, description="Security metrics")

    class Config:
        json_schema_extra = {
            "example": {
                "code_quality": {
                    "score": 85,
                    "details": ["Good code organization", "Low complexity"],
                    "recommendations": ["Add more comments"]
                },
                "documentation": {
                    "score": 75,
                    "details": ["Documentation present", "Some missing docstrings"],
                    "recommendations": ["Add more function documentation"]
                },
                "best_practices": {
                    "score": 90,
                    "details": ["Follows style guide", "Good naming conventions"],
                    "recommendations": []
                }
            }
        }
