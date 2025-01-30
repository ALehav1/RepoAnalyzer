from fastapi import APIRouter, HTTPException, Depends
from typing import List, Optional
from ..schemas.practices import BestPractice, BestPracticeCreate
from ..services.practices import BestPracticesService
from ..database import get_db
from sqlalchemy.orm import Session

router = APIRouter()

@router.get("/practices", response_model=List[BestPractice])
async def get_global_practices(
    category: Optional[str] = None,
    db: Session = Depends(get_db),
):
    """Get all global best practices, optionally filtered by category"""
    try:
        practices_service = BestPracticesService(db)
        return await practices_service.get_practices(category=category)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/repos/{repo_id}/practices", response_model=List[BestPractice])
async def get_repo_practices(repo_id: str, db: Session = Depends(get_db)):
    """Get all best practices for a specific repository"""
    try:
        practices_service = BestPracticesService(db)
        return await practices_service.get_practices(repo_id=repo_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/practices/{practice_id}/generalize", response_model=BestPractice)
async def mark_practice_as_generalizable(
    practice_id: str,
    db: Session = Depends(get_db),
):
    """Mark a best practice as generalizable"""
    try:
        practices_service = BestPracticesService(db)
        return await practices_service.mark_generalizable(practice_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/repos/{repo_id}/practices", response_model=BestPractice)
async def create_repo_practice(
    repo_id: str,
    practice: BestPracticeCreate,
    db: Session = Depends(get_db),
):
    """Create a new best practice for a specific repository"""
    try:
        practices_service = BestPracticesService(db)
        return await practices_service.create_practice(repo_id, practice)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
