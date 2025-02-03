"""CRUD operations for repositories."""

from sqlalchemy.orm import Session
from typing import Optional
from datetime import datetime

from ..models.base import Repository
from ..schemas.repository import RepositoryCreate

def get_repository_by_url(db: Session, url: str) -> Optional[Repository]:
    """Get repository by URL."""
    return db.query(Repository).filter(Repository.url == url).first()

def create_repository(db: Session, repo_data: RepositoryCreate) -> Repository:
    """Create a new repository."""
    now = datetime.utcnow()
    repo = Repository(
        url=repo_data.url,
        created_at=now,
        updated_at=now,
        is_valid=True,
        analysis_status="pending",
        analysis_progress=0.0
    )
    db.add(repo)
    db.commit()
    db.refresh(repo)
    return repo
