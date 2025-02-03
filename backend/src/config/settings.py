"""Application settings."""
from typing import Optional
from pydantic_settings import BaseSettings
from functools import lru_cache
import os
from pathlib import Path

class Settings(BaseSettings):
    """Application settings."""
    
    # Application
    app_name: str = "RepoAnalyzer"
    app_version: str = "1.0.0"
    debug: bool = False
    host: str = "0.0.0.0"
    port: int = 3000
    backend_port: Optional[int] = 3000
    
    # API Keys
    openai_api_key: str
    github_token: str
    
    # Database
    database_url: str = "sqlite+aiosqlite:///./data/repoanalyzer.db"
    async_database_url: str = "sqlite+aiosqlite:///./data/repoanalyzer.db"
    
    # Storage
    vector_store_dir: str = "vector_store"
    repos_dir: str = "repos"
    output_dir: str = "outputs"
    
    # Redis (optional)
    redis_url: Optional[str] = "redis://localhost:6379/0"
    
    # Logging
    log_level: str = "INFO"
    log_dir: str = "logs"
    log_format: str = "json"  # Options: json, text
    log_to_file: bool = True
    log_to_console: bool = True
    log_max_size: int = 10 * 1024 * 1024  # 10 MB
    log_backup_count: int = 5
    
    class Config:
        """Pydantic config."""
        env_file = ".env"
        env_file_encoding = "utf-8"
        
    def __init__(self, **kwargs):
        """Initialize settings."""
        super().__init__(**kwargs)
        
        # Ensure directories exist
        for directory in [
            self.vector_store_dir,
            self.repos_dir,
            self.output_dir,
            self.log_dir
        ]:
            Path(directory).mkdir(parents=True, exist_ok=True)

@lru_cache()
def get_settings() -> Settings:
    """Get application settings."""
    return Settings()

settings = get_settings()
