"""Health check endpoints for monitoring system status."""
from typing import Dict, Literal
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text

from ...infrastructure.database import get_db
from ...core.logging import get_logger

logger = get_logger(__name__)
router = APIRouter(tags=["health"])

class ComponentStatus(BaseModel):
    """Component health status."""
    status: Literal["healthy", "unhealthy", "degraded"]
    message: str = ""

class HealthResponse(BaseModel):
    """Health check response model."""
    status: Literal["healthy", "unhealthy", "degraded"]
    components: Dict[str, ComponentStatus]
    version: str

@router.get("/health", response_model=HealthResponse)
async def health_check(db: AsyncSession = Depends(get_db)) -> HealthResponse:
    """
    Check the health status of the application.
    
    Returns:
        HealthResponse: Health status of various system components
    """
    try:
        # Check database connection
        await db.execute(text("SELECT 1"))
        db_status = ComponentStatus(
            status="healthy",
            message="Database connection successful"
        )
    except Exception as e:
        error_msg = f"Database health check failed: {str(e)}"
        logger.error(
            "database_health_check_failed",
            error=str(e),
            error_type=type(e).__name__,
            exc_info=True
        )
        db_status = ComponentStatus(
            status="unhealthy",
            message=error_msg
        )

    # Construct response
    components = {
        "database": db_status
        # Add more component statuses here as needed
    }
    
    # Overall status is healthy only if all components are healthy
    overall_status = "healthy"
    if any(c.status == "unhealthy" for c in components.values()):
        overall_status = "unhealthy"
    elif any(c.status == "degraded" for c in components.values()):
        overall_status = "degraded"
    
    response = HealthResponse(
        status=overall_status,
        components=components,
        version="1.0.0"  # TODO: Get from settings
    )
    
    if overall_status != "healthy":
        logger.warning(
            "system_health_degraded",
            status=overall_status,
            components={k: v.dict() for k, v in components.items()}
        )
    
    return response
