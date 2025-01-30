"""Best practices-related Pydantic schemas."""

from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from enum import Enum

class CodeDimension(str, Enum):
    """Enum for code analysis dimensions."""
    ARCHITECTURE_DESIGN = "architecture_design"
    CODE_QUALITY = "code_quality"
    DOCUMENTATION = "documentation"
    TESTING = "testing"
    SECURITY = "security"
    PERFORMANCE = "performance"

class BestPracticeBase(BaseModel):
    """Base schema for best practices."""
    file_path: str
    code_snippet: str
    explanation: str
    category: CodeDimension

class BestPracticeCreate(BestPracticeBase):
    """Schema for creating best practices."""
    repo_id: str

class BestPractice(BestPracticeBase):
    """Schema for best practice responses."""
    id: str
    repo_id: str
    created_at: datetime

    class Config:
        from_attributes = True
