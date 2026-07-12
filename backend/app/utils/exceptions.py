"""Custom exception classes for TransitOps.

Raising these instead of raw ``HTTPException`` lets the global handler
produce a uniform JSON error envelope.
"""

from typing import Any


class TransitOpsError(Exception):
    """Base exception for all application-level errors."""

    def __init__(self, message: str = "An unexpected error occurred.", status_code: int = 500) -> None:
        self.message = message
        self.status_code = status_code
        super().__init__(self.message)


class NotFoundError(TransitOpsError):
    """Resource not found (404)."""

    def __init__(self, resource: str = "Resource", identifier: Any = None) -> None:
        detail = f"{resource} not found" + (f": {identifier}" if identifier else "")
        super().__init__(message=detail, status_code=404)


class ConflictError(TransitOpsError):
    """Business-rule conflict (409)."""

    def __init__(self, message: str = "Conflict with current resource state.") -> None:
        super().__init__(message=message, status_code=409)


class ForbiddenError(TransitOpsError):
    """Insufficient permissions (403)."""

    def __init__(self, message: str = "You do not have permission to perform this action.") -> None:
        super().__init__(message=message, status_code=403)


class ValidationError(TransitOpsError):
    """Domain-level validation failure (422)."""

    def __init__(self, message: str = "Validation failed.") -> None:
        super().__init__(message=message, status_code=422)
