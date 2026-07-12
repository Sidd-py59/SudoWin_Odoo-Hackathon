"""Standardised JSON response helpers.

Every API response passes through one of these helpers to ensure a
consistent envelope.
"""

from datetime import datetime, timezone
from typing import Any

from fastapi.responses import JSONResponse


def success_response(
    data: Any = None,
    message: str = "Success",
    status_code: int = 200,
) -> JSONResponse:
    """Return a successful JSON response with a standard envelope."""
    return JSONResponse(
        status_code=status_code,
        content={
            "status": "success",
            "message": message,
            "data": data,
            "timestamp": datetime.now(timezone.utc).isoformat(),
        },
    )


def error_response(
    message: str = "An error occurred",
    status_code: int = 500,
    errors: list[dict[str, Any]] | None = None,
) -> JSONResponse:
    """Return an error JSON response with a standard envelope."""
    return JSONResponse(
        status_code=status_code,
        content={
            "status": "error",
            "message": message,
            "errors": errors or [],
            "timestamp": datetime.now(timezone.utc).isoformat(),
        },
    )
