"""Pydantic schemas for pattern detection API."""
from pydantic import BaseModel, Field, validator, constr
from typing import List, Dict, Any, Optional
from pathlib import Path
import os

class PatternAnalysisRequest(BaseModel):
    """Request schema for pattern analysis."""
    file_path: Path = Field(
        ...,
        description="Path to the Python file to analyze",
        examples=["/path/to/file.py"]
    )

    @validator('file_path')
    def validate_file_path(cls, v):
        """Validate the file path."""
        # Convert to string for validation
        path_str = str(v)
            
        # Check absolute path
        if not os.path.isabs(path_str):
            raise ValueError("File path must be absolute")
            
        return v

class PatternMatch(BaseModel):
    """Schema for a detected pattern."""
    name: constr(min_length=1) = Field(
        ...,
        description="Name of the detected pattern",
        examples=["factory", "singleton", "observer"]
    )
    confidence: float = Field(
        ...,
        description="Confidence score for the pattern match",
        ge=0.0,
        le=1.0,
        examples=[0.85, 0.92, 0.76]
    )
    line_number: int = Field(
        ...,
        description="Line number where pattern was found",
        ge=1,
        examples=[10, 25, 42]
    )
    context: Dict[str, Any] = Field(
        ...,
        description="Additional context about the pattern",
        examples=[{
            "complexity": 3,
            "dependencies": ["module1", "module2"],
            "methods": ["create", "build"],
            "attributes": ["_instance"],
            "related_patterns": ["singleton"]
        }]
    )
    
    @validator('context')
    def validate_context(cls, v):
        """Validate the context dictionary."""
        required_keys = {'complexity', 'dependencies', 'methods'}
        missing_keys = required_keys - set(v.keys())
        if missing_keys:
            raise ValueError(f"Missing required context keys: {missing_keys}")
            
        if not isinstance(v.get('complexity'), (int, float)):
            raise ValueError("Complexity must be a number")
            
        if not isinstance(v.get('dependencies'), list):
            raise ValueError("Dependencies must be a list")
            
        if not isinstance(v.get('methods'), list):
            raise ValueError("Methods must be a list")
            
        return v

class PatternAnalysisResponse(BaseModel):
    """Response schema for pattern analysis."""
    patterns: List[PatternMatch] = Field(
        ...,
        description="List of detected patterns",
        min_items=0
    )
    
    class Config:
        """Pydantic model configuration."""
        schema_extra = {
            "example": {
                "patterns": [
                    {
                        "name": "factory",
                        "confidence": 0.85,
                        "line_number": 10,
                        "context": {
                            "complexity": 3,
                            "dependencies": ["module1", "module2"],
                            "methods": ["create", "build"],
                            "attributes": ["_instance"],
                            "related_patterns": ["singleton"]
                        }
                    }
                ]
            }
        }
