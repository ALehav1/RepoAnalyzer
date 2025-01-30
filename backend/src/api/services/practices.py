"""Service for managing best practices."""

from sqlalchemy.orm import Session
from typing import List, Optional
from ..models import BestPractice as BestPracticeModel
from ..schemas.practices import BestPracticeCreate

class BestPracticesService:
    """Service for managing best practices operations."""

    def __init__(self, db: Session):
        """Initialize best practices service with database session."""
        self.db = db

    def create_practice(self, practice: BestPracticeCreate) -> BestPracticeModel:
        """Create a new best practice."""
        db_practice = BestPracticeModel(
            repo_id=practice.repo_id,
            file_path=practice.file_path,
            code_snippet=practice.code_snippet,
            explanation=practice.explanation,
            category=practice.category
        )
        self.db.add(db_practice)
        self.db.commit()
        self.db.refresh(db_practice)
        return db_practice

    def get_practices(self, repo_id: Optional[str] = None) -> List[BestPracticeModel]:
        """Get all best practices, optionally filtered by repository."""
        query = self.db.query(BestPracticeModel)
        if repo_id:
            query = query.filter(BestPracticeModel.repo_id == repo_id)
        return query.all()

    def get_practice(self, practice_id: str) -> Optional[BestPracticeModel]:
        """Get a specific best practice by ID."""
        return self.db.query(BestPracticeModel).filter(BestPracticeModel.id == practice_id).first()

    def delete_practice(self, practice_id: str) -> bool:
        """Delete a best practice by ID."""
        practice = self.get_practice(practice_id)
        if practice:
            self.db.delete(practice)
            self.db.commit()
            return True
        return False
