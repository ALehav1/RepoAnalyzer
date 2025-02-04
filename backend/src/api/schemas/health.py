"""Health check schemas."""
from pydantic import BaseModel, Field
from typing import Dict, Literal, Optional

class ComponentStatus(BaseModel):
    """Status of a system component."""
    status: Literal["healthy", "unhealthy"] = Field(description="Component health status")
    details: Optional[str] = Field(default=None, description="Additional status details")

class HealthResponse(BaseModel):
    """Response model for health check endpoint."""
    status: Literal["healthy", "unhealthy"] = Field(description="Overall health status")
    components: Dict[str, ComponentStatus] = Field(description="Status of each system component")

    model_config = {
        "json_schema_extra": {
            "example": {
                "status": "healthy",
                "components": {
                    "database": {
                        "status": "healthy",
                        "details": "Connected successfully"
                    }
                }
            }
        }
    }
