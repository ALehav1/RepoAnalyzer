"""Schemas for best practices analysis."""
from typing import Dict, List
from pydantic import BaseModel, Field

class CodePattern(BaseModel):
    """Schema for a code pattern found in the repository."""
    name: str = Field(..., description="Name of the pattern")
    description: str = Field(..., description="Description of the pattern")
    examples: List[str] = Field(..., description="Example code snippets")
    file_paths: List[str] = Field(..., description="Files where pattern was found")
    frequency: int = Field(..., description="How many times pattern was found")
    impact: str = Field(
        ...,
        description="Impact level of the pattern",
        pattern="^(high|medium|low)$"
    )
    category: str = Field(
        ...,
        description="Category of the pattern",
        pattern="^(design|performance|security|maintainability)$"
    )

class BestPracticesReport(BaseModel):
    """Schema for repository-wide best practices analysis."""
    patterns: List[CodePattern] = Field(
        ...,
        description="List of patterns found in the repository"
    )
    recommendations: List[str] = Field(
        ...,
        description="List of recommendations for improvement"
    )
    design_score: float = Field(
        ...,
        description="Design patterns implementation score (0-100)",
        ge=0,
        le=100
    )
    performance_score: float = Field(
        ...,
        description="Performance patterns implementation score (0-100)",
        ge=0,
        le=100
    )
    security_score: float = Field(
        ...,
        description="Security patterns implementation score (0-100)",
        ge=0,
        le=100
    )
    maintainability_score: float = Field(
        ...,
        description="Maintainability patterns implementation score (0-100)",
        ge=0,
        le=100
    )
    analyzed_at: str = Field(
        ...,
        description="ISO format timestamp of when the analysis was performed"
    )
