from sqlalchemy import Column, String, DateTime, ForeignKey, Boolean, JSON, Text, Enum as SQLAEnum
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid
from .database import Base
from enum import Enum

class CodeDimension(str, Enum):
    """Enum for code analysis dimensions."""
    ARCHITECTURE_DESIGN = "architecture_design"
    CODE_QUALITY = "code_quality"
    DOCUMENTATION = "documentation"
    TESTING = "testing"
    SECURITY = "security"
    PERFORMANCE = "performance"

class Repository(Base):
    """Model for code repositories."""
    __tablename__ = "repositories"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    url = Column(String, nullable=False)
    name = Column(String, nullable=False)
    is_valid = Column(Boolean, default=True)
    local_path = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    last_analyzed_at = Column(DateTime, nullable=True)
    analysis_cache = Column(JSON, nullable=True)

    # Relationships
    files = relationship("FileAnalysis", back_populates="repository", cascade="all, delete-orphan")
    best_practices = relationship("BestPractice", back_populates="repository", cascade="all, delete-orphan")
    chat_messages = relationship("ChatMessage", back_populates="repository", cascade="all, delete-orphan")

class FileAnalysis(Base):
    """Model for file analysis results."""
    __tablename__ = "file_analyses"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    repo_id = Column(String, ForeignKey("repositories.id"), nullable=False)
    path = Column(String, nullable=False)
    content_hash = Column(String, nullable=False)
    short_analysis = Column(Text, nullable=True)
    detailed_analysis = Column(Text, nullable=True)
    analysis_timestamp = Column(DateTime, nullable=True)

    # Relationships
    repository = relationship("Repository", back_populates="files")

class BestPractice(Base):
    """Model for best practices found in code."""
    __tablename__ = "best_practices"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    repo_id = Column(String, ForeignKey("repositories.id"), nullable=False)
    file_path = Column(String, nullable=False)
    code_snippet = Column(Text, nullable=False)
    explanation = Column(Text, nullable=False)
    category = Column(SQLAEnum(CodeDimension), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    repository = relationship("Repository", back_populates="best_practices")

class ChatMessage(Base):
    """Model for chat messages."""
    __tablename__ = "chat_messages"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    content = Column(Text, nullable=False)
    repository_id = Column(String, ForeignKey("repositories.id"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    repository = relationship("Repository", back_populates="chat_messages")
