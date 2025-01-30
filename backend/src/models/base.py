"""Base models for the application."""
from datetime import datetime
from typing import Dict, Any
from sqlalchemy import Column, String, Boolean, DateTime, Integer, ForeignKey, JSON, Float, Text
from sqlalchemy.orm import relationship, declarative_base

Base = declarative_base()

class Repository(Base):
    """Repository model."""
    __tablename__ = "repositories"

    id = Column(String, primary_key=True)
    url = Column(String, nullable=False)
    name = Column(String, nullable=True)
    description = Column(String, nullable=True)
    is_valid = Column(Boolean, default=False)
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    updated_at = Column(DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)
    last_analyzed = Column(DateTime, nullable=True)
    analysis_status = Column(String, default="pending")
    analysis_progress = Column(Float, default=0.0)
    cached_until = Column(DateTime, nullable=True)
    local_path = Column(String, nullable=True)
    stats = Column(JSON, nullable=True)
    analysis = Column(JSON, nullable=True)
    structure = Column(JSON, nullable=True)
    readme = Column(Text, nullable=True)

    files = relationship("File", back_populates="repository", cascade="all, delete-orphan")
    chat_messages = relationship("ChatMessage", back_populates="repository", cascade="all, delete-orphan")
    best_practices = relationship("BestPractice", back_populates="repository", cascade="all, delete-orphan")

    def to_dict(self) -> Dict[str, Any]:
        """Convert repository to dictionary.
        
        Returns:
            Dict[str, Any]: Repository data
        """
        return {
            "id": self.id,
            "url": self.url,
            "name": self.name,
            "description": self.description,
            "is_valid": self.is_valid,
            "created_at": self.created_at,
            "updated_at": self.updated_at,
            "last_analyzed": self.last_analyzed,
            "analysis_status": self.analysis_status,
            "analysis_progress": self.analysis_progress,
            "cached_until": self.cached_until,
            "local_path": self.local_path,
            "stats": self.stats,
            "analysis": self.analysis,
            "structure": self.structure,
            "readme": self.readme
        }

class File(Base):
    """File model."""
    __tablename__ = "files"

    id = Column(String, primary_key=True)
    repository_id = Column(String, ForeignKey("repositories.id"), nullable=False)
    path = Column(String, nullable=False)
    content = Column(Text, nullable=True)
    language = Column(String, nullable=True)
    size = Column(Integer, nullable=True)
    last_modified = Column(DateTime, nullable=True)
    short_analysis = Column(JSON, nullable=True)
    detailed_analysis = Column(JSON, nullable=True)
    analysis_timestamp = Column(DateTime, nullable=True)

    repository = relationship("Repository", back_populates="files")

    def to_dict(self) -> Dict[str, Any]:
        """Convert file to dictionary.
        
        Returns:
            Dict[str, Any]: File data
        """
        return {
            "id": self.id,
            "repository_id": self.repository_id,
            "path": self.path,
            "content": self.content,
            "language": self.language,
            "size": self.size,
            "last_modified": self.last_modified,
            "short_analysis": self.short_analysis,
            "detailed_analysis": self.detailed_analysis,
            "analysis_timestamp": self.analysis_timestamp
        }

class ChatMessage(Base):
    """Chat message model."""
    __tablename__ = "chat_messages"

    id = Column(String, primary_key=True)
    repository_id = Column(String, ForeignKey("repositories.id", ondelete="CASCADE"), nullable=False)
    user_message = Column(String, nullable=False)
    assistant_message = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    context = Column(JSON)

    repository = relationship("Repository", back_populates="chat_messages")

    def to_dict(self) -> Dict[str, Any]:
        """Convert chat message to dictionary.
        
        Returns:
            Dict[str, Any]: Chat message data
        """
        return {
            "id": self.id,
            "repository_id": self.repository_id,
            "user_message": self.user_message,
            "assistant_message": self.assistant_message,
            "created_at": self.created_at,
            "context": self.context
        }

class BestPractice(Base):
    """Best practice model."""
    __tablename__ = "best_practices"

    id = Column(String, primary_key=True)
    repository_id = Column(String, ForeignKey("repositories.id"), nullable=True)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    code_snippet = Column(Text, nullable=True)
    file_path = Column(String, nullable=True)
    category = Column(String, nullable=False)
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    is_generalizable = Column(Boolean, default=False)
    extra_data = Column(JSON)

    repository = relationship("Repository", back_populates="best_practices")

    def to_dict(self) -> Dict[str, Any]:
        """Convert best practice to dictionary.
        
        Returns:
            Dict[str, Any]: Best practice data
        """
        return {
            "id": self.id,
            "repository_id": self.repository_id,
            "title": self.title,
            "description": self.description,
            "code_snippet": self.code_snippet,
            "file_path": self.file_path,
            "category": self.category,
            "created_at": self.created_at,
            "is_generalizable": self.is_generalizable,
            "extra_data": self.extra_data
        }
