"""Schemas for bulk repository upload functionality."""
from pydantic import BaseModel, Field, HttpUrl
from typing import List, Optional
from datetime import datetime

class CSVUploadResponse(BaseModel):
    """Response model for CSV upload operation."""
    total_repositories: int = Field(..., description="Total number of repositories in the CSV")
    accepted_repositories: int = Field(..., description="Number of repositories accepted for processing")
    rejected_repositories: int = Field(..., description="Number of repositories rejected due to validation")
    task_id: str = Field(..., description="Task ID for tracking the bulk upload progress")
    started_at: datetime = Field(default_factory=datetime.utcnow, description="When the upload processing started")
    
class CSVUploadStatus(BaseModel):
    """Status model for CSV upload operation."""
    task_id: str = Field(..., description="Task ID of the upload operation")
    status: str = Field(..., description="Current status (pending, processing, completed, failed)")
    total_repositories: int = Field(..., description="Total number of repositories")
    processed_repositories: int = Field(..., description="Number of repositories processed so far")
    failed_repositories: List[dict] = Field(default_factory=list, description="List of failed repositories with reasons")
    started_at: datetime = Field(..., description="When the upload processing started")
    completed_at: Optional[datetime] = Field(None, description="When the upload processing completed")
    error: Optional[str] = Field(None, description="Error message if the upload failed")
