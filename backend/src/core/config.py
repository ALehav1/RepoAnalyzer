"""Configuration settings for the application."""
from typing import List
from pydantic_settings import BaseSettings, SettingsConfigDict
import logging

# Set up logging
logger = logging.getLogger(__name__)

class Settings(BaseSettings):
    """Application settings."""
    model_config = SettingsConfigDict(
        env_file='.env',
        env_file_encoding='utf-8',
        extra='ignore',
        case_sensitive=True
    )

    # API Keys
    OPENAI_API_KEY: str = ""
    GITHUB_TOKEN: str = ""

    # API settings
    API_V1_STR: str = "/api/v1"
    PROJECT_NAME: str = "Repository Analyzer"

    # CORS settings
    CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://localhost:5173",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5173",
    ]

    # Server Configuration
    HOST: str = "0.0.0.0"
    PORT: int = 8888
    DEBUG: bool = False
    LOG_LEVEL: str = "INFO"

    # Database
    DATABASE_URL: str = "sqlite+aiosqlite:///data/repo_analyzer.db"

    # Directories
    OUTPUT_DIR: str = "outputs"
    VECTOR_STORE_DIR: str = "vector_store"
    REPOS_DIR: str = "repos"
    CHROMADB_PATH: str = "chromadb"

    def get_cors_origins(self) -> List[str]:
        """Get the list of allowed CORS origins."""
        return self.CORS_ORIGINS

# Create a global settings instance
settings = Settings()

def get_settings() -> Settings:
    """Get the application settings.
    
    Returns:
        Settings: The application settings.
    """
    return settings
