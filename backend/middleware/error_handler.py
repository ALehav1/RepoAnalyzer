from fastapi import Request, status
from fastapi.responses import JSONResponse
from typing import Union
from sqlalchemy.exc import SQLAlchemyError

class AppError(Exception):
    def __init__(
        self,
        message: str,
        status_code: int = status.HTTP_500_INTERNAL_SERVER_ERROR,
        details: Union[dict, list, None] = None
    ):
        self.message = message
        self.status_code = status_code
        self.details = details
        super().__init__(self.message)

async def error_handler_middleware(request: Request, call_next):
    try:
        return await call_next(request)
    except AppError as e:
        return JSONResponse(
            status_code=e.status_code,
            content={
                "error": e.message,
                "details": e.details,
                "path": request.url.path
            }
        )
    except SQLAlchemyError as e:
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={
                "error": "Database error occurred",
                "details": str(e),
                "path": request.url.path
            }
        )
    except Exception as e:
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={
                "error": "An unexpected error occurred",
                "details": str(e),
                "path": request.url.path
            }
        )
