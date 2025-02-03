"""Health check schemas."""
from pydantic import BaseModel, Field
from typing import Dict, Literal, Optional

class HealthResponse(BaseModel):
    """Response model for health check endpoint."""
    status: str = Field(description="Overall health status")
    components: str = Field(description="Component status as JSON string")

    model_config = {
        "json_schema_extra": {
            "example": {
                "status": "healthy",
                "components": '{"database": "connected"}'
            }
        }
    }
