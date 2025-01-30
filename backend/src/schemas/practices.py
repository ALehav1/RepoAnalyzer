from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List

class BestPracticeBase(BaseModel):
    title: str
    description: str
    code: Optional[str] = None
    language: Optional[str] = None
    explanation: Optional[str] = None
    tags: List[str] = []
    severity: Optional[str] = None
    impact: Optional[str] = None
    resolution: Optional[str] = None

class BestPracticeCreate(BestPracticeBase):
    pass

class BestPractice(BestPracticeBase):
    id: str
    repository_id: Optional[str] = None
    is_generalizable: bool = False
    created_at: datetime

    class Config:
        from_attributes = True
