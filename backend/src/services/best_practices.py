from sqlalchemy.orm import Session
from typing import List, Optional
from ..models.base import BestPractice, Repository
from ..schemas.practices import BestPracticeCreate
import logging
import uuid
from datetime import datetime

logger = logging.getLogger(__name__)

class BestPracticesService:
    """Service for managing best practices."""

    def __init__(self, db: Session):
        """Initialize best practices service with database session."""
        self.db = db

    def create_best_practice(
        self,
        title: str,
        description: str,
        repository_id: Optional[str] = None,
        code_snippet: Optional[str] = None,
        file_path: Optional[str] = None,
        category: str = "general",
        is_generalizable: bool = False
    ) -> BestPractice:
        """Create a new best practice."""
        try:
            practice = BestPractice(
                id=str(uuid.uuid4()),
                repository_id=repository_id,
                title=title,
                description=description,
                code_snippet=code_snippet,
                file_path=file_path,
                category=category,
                is_generalizable=is_generalizable,
                created_at=datetime.utcnow()
            )
            self.db.add(practice)
            self.db.commit()
            self.db.refresh(practice)
            logger.info(f"Created best practice {practice.id}")
            return practice
        except Exception as e:
            self.db.rollback()
            logger.error(f"Failed to create best practice: {str(e)}")
            raise

    def get_repository_practices(self, repository_id: str) -> List[BestPractice]:
        """Get best practices for a specific repository."""
        try:
            query = self.db.query(BestPractice).filter(BestPractice.repository_id == repository_id).order_by(BestPractice.created_at.desc())
            practices = query.all()
            logger.info(f"Retrieved {len(practices)} best practices")
            return practices
        except Exception as e:
            logger.error(f"Failed to get best practices: {str(e)}")
            raise

    def get_global_practices(self) -> List[BestPractice]:
        """Get generalizable best practices across all repositories."""
        try:
            query = self.db.query(BestPractice).filter(BestPractice.is_generalizable == True).order_by(BestPractice.created_at.desc())
            practices = query.all()
            logger.info(f"Retrieved {len(practices)} best practices")
            return practices
        except Exception as e:
            logger.error(f"Failed to get best practices: {str(e)}")
            raise

    def mark_as_generalizable(self, practice_id: str) -> BestPractice:
        """Mark a best practice as generalizable."""
        try:
            practice = self.db.query(BestPractice).filter(BestPractice.id == practice_id).first()
            if practice:
                practice.is_generalizable = True
                self.db.commit()
                self.db.refresh(practice)
                logger.info(f"Marked best practice {practice_id} as generalizable")
                return practice
            else:
                logger.warning(f"Best practice {practice_id} not found")
                raise ValueError("Best practice not found")
        except Exception as e:
            self.db.rollback()
            logger.error(f"Failed to mark best practice as generalizable: {str(e)}")
            raise

    def get_practices_by_category(self, category: str) -> List[BestPractice]:
        """Get best practices by category."""
        try:
            query = self.db.query(BestPractice).filter(BestPractice.category == category).order_by(BestPractice.created_at.desc())
            practices = query.all()
            logger.info(f"Retrieved {len(practices)} best practices")
            return practices
        except Exception as e:
            logger.error(f"Failed to get best practices: {str(e)}")
            raise
