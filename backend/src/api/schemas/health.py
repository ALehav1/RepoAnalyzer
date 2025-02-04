"""Health check schemas."""
from pydantic import BaseModel, Field
from typing import Dict, Literal, Optional

class ComponentStatus(BaseModel):
    """Status of a system component."""
    status: Literal["healthy", "unhealthy"] = Field(description="Component health status")
    details: Optional[str] = Field(default=None, description="Additional status details")

class HealthResponse(BaseModel):
    """Response model for health check endpoint."""
    status: str
    version: str

    model_config = {
        "json_schema_extra": {
            "example": {
                "status": "healthy",
                "version": "1.0.0"
            }
        }
    }
