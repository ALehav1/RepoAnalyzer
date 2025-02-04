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
        extra='ignore'
    )

    # API Keys
    OPENAI_API_KEY: str = ""
    GITHUB_TOKEN: str = ""

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

# Create a global settings instance
settings = Settings()


def get_settings() -> Settings:
    """Return the global settings instance."""
    return settings
