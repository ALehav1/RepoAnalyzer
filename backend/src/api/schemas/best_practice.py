"""Best practice-related Pydantic schemas."""

from pydantic import BaseModel
from datetime import datetime

class BestPracticeBase(BaseModel):
    """Base schema for best practice data."""
    file_path: str
    code_snippet: str
    explanation: str
    category: str

class BestPracticeCreate(BestPracticeBase):
    """Schema for creating a new best practice."""
    repo_id: str

class BestPractice(BestPracticeBase):
    """Full best practice schema with all fields."""
    id: str
    repo_id: str
    created_at: datetime

    class Config:
        from_attributes = True
