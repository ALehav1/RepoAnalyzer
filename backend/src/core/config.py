"""Configuration settings for the application."""
from pathlib import Path
from typing import Optional

from pydantic import Field
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Application settings.
    
    Attributes:
        OPENAI_API_KEY: OpenAI API key for embeddings
        GITHUB_TOKEN: GitHub personal access token
        HOST: Server host
        PORT: Server port
        DEBUG: Debug mode flag
        LOG_LEVEL: Logging level
        DATABASE_URL: Database connection URL
        OUTPUT_DIR: Directory for outputs
        VECTOR_STORE_DIR: Directory for ChromaDB vector store
        REPOS_DIR: Directory for cloned repositories
    """
    
    # API Keys
    OPENAI_API_KEY: str = Field(..., description="OpenAI API key for embeddings", env="OPENAI_API_KEY")
    GITHUB_TOKEN: str = Field(..., description="GitHub personal access token", env="GITHUB_TOKEN")
    
    # Server Configuration
    HOST: str = Field(default="0.0.0.0", description="Server host", env="HOST")
    PORT: int = Field(default=3000, description="Server port", env="PORT")
    DEBUG: bool = Field(default=False, description="Debug mode flag", env="DEBUG")
    LOG_LEVEL: str = Field(default="INFO", description="Logging level", env="LOG_LEVEL")
    
    # Database
    DATABASE_URL: str = Field(
        default=f"sqlite+aiosqlite:///{Path(__file__).parent}/data/repo_analyzer.db",
        description="Database connection URL",
        env="DATABASE_URL"
    )
    
    # Directories
    OUTPUT_DIR: str = Field(
        default="outputs",
        description="Directory for outputs",
        env="OUTPUT_DIR"
    )
    VECTOR_STORE_DIR: str = Field(
        default="vector_store",
        description="Directory for ChromaDB vector store",
        env="VECTOR_STORE_DIR"
    )
    REPOS_DIR: str = Field(
        default="repos",
        description="Directory for cloned repositories",
        env="REPOS_DIR"
    )

    class Config:
        """Pydantic settings configuration."""
        env_file = ".env"
        case_sensitive = True


# Initialize settings
settings = Settings()
