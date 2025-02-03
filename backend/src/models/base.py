"""Database models."""
from sqlalchemy import Column, String, Float, DateTime, JSON, ForeignKey, Enum as SQLEnum, Text, Integer
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid
import enum

from ..database import Base

def generate_uuid() -> str:
    """Generate a UUID."""
    return str(uuid.uuid4())

class AnalysisStatus(str, enum.Enum):
    """Analysis status enum."""
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"

class Repository(Base):
    """Repository model."""
    __tablename__ = "repositories"

    id = Column(Integer, primary_key=True, index=True)
    url = Column(String, unique=True, index=True, nullable=False)
    name = Column(String, nullable=False)
    description = Column(String, nullable=True)
    analysis_status = Column(SQLEnum(AnalysisStatus), default=AnalysisStatus.PENDING)
    analysis_progress = Column(Float, default=0.0)
    analysis_result = Column(JSON, nullable=True)
    job_id = Column(String, nullable=True)
    last_error = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    files = relationship("File", back_populates="repository", cascade="all, delete-orphan")
    analysis_runs = relationship("AnalysisRun", back_populates="repository", cascade="all, delete-orphan")
    chat_messages = relationship("ChatMessage", back_populates="repository", cascade="all, delete-orphan")

class File(Base):
    """File model."""
    __tablename__ = "files"

    id = Column(String, primary_key=True, default=generate_uuid)
    repository_id = Column(String, ForeignKey("repositories.id", ondelete="CASCADE"), nullable=False)
    path = Column(String, nullable=False)
    content = Column(String, nullable=True)
    embedding = Column(JSON, nullable=True)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now(), server_default=func.now())
    
    # Relationships
    repository = relationship("Repository", back_populates="files")
    metrics = relationship("FileMetric", back_populates="file", cascade="all, delete-orphan")

class FileMetric(Base):
    """File metric model."""
    __tablename__ = "file_metrics"

    id = Column(String, primary_key=True, default=generate_uuid)
    file_id = Column(String, ForeignKey("files.id", ondelete="CASCADE"), nullable=False)
    category = Column(String, nullable=False)
    name = Column(String, nullable=False)
    value = Column(JSON, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    file = relationship("File", back_populates="metrics")

class AnalysisRun(Base):
    """Analysis run model."""
    __tablename__ = "analysis_runs"

    id = Column(String, primary_key=True, default=generate_uuid)
    repository_id = Column(String, ForeignKey("repositories.id", ondelete="CASCADE"), nullable=False)
    status = Column(SQLEnum(AnalysisStatus), nullable=False, default=AnalysisStatus.PENDING)
    started_at = Column(DateTime(timezone=True), server_default=func.now())
    completed_at = Column(DateTime(timezone=True), nullable=True)
    error = Column(String, nullable=True)
    result = Column(JSON, nullable=True)
    version = Column(String, nullable=False)
    
    # Relationships
    repository = relationship("Repository", back_populates="analysis_runs")

class ChatMessage(Base):
    """Chat message model."""
    __tablename__ = "chat_messages"

    id = Column(String, primary_key=True, default=generate_uuid)
    repository_id = Column(String, ForeignKey("repositories.id", ondelete="CASCADE"), nullable=False)
    role = Column(String, nullable=False)  # 'user' or 'assistant'
    content = Column(Text, nullable=False)
    message_metadata = Column(JSON, nullable=True)  # Changed from 'metadata' to avoid SQLAlchemy conflict
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    repository = relationship("Repository", back_populates="chat_messages")

class BestPractice(Base):
    """Best practice model."""
    __tablename__ = "best_practices"

    id = Column(String, primary_key=True, default=generate_uuid)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    category = Column(String, nullable=False)
    language = Column(String, nullable=True)
    severity = Column(String, nullable=False)  # 'low', 'medium', 'high'
    impact = Column(String, nullable=False)
    references = Column(JSON, nullable=True)  # List of reference URLs
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now(), server_default=func.now())
