"""Repository model."""
from datetime import datetime
from typing import Optional
from sqlalchemy import String, DateTime, Boolean, Float, JSON
from sqlalchemy.orm import Mapped, mapped_column
from uuid import uuid4

from ..infrastructure.database import Base

class Repository(Base):
    """Repository model for storing repository information and analysis results."""
    __tablename__ = "repositories"
    __table_args__ = {'extend_existing': True}

    # Primary fields
    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid4()))
    url: Mapped[str] = mapped_column(String, nullable=False, unique=True, index=True)
    name: Mapped[str] = mapped_column(String, nullable=False)
    description: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    
    # Status fields
    is_valid: Mapped[bool] = mapped_column(Boolean, default=True)
    local_path: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    
    # Analysis fields
    analysis_status: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    analysis_progress: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    analysis_error: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    analysis_metrics: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True)
    
    # Timestamps
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, 
        default=datetime.utcnow,
        onupdate=datetime.utcnow
    )
    last_analyzed_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)

    def __repr__(self) -> str:
        """String representation of the repository."""
        return f"<Repository(id={self.id}, url={self.url}, name={self.name})>"
