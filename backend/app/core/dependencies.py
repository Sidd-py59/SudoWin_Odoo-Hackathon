"""Shared FastAPI dependencies.

Re-exports commonly used dependencies so routers can do:
    ``from app.core.dependencies import get_db, get_current_user``
"""

from app.core.database import get_db
from app.core.security import get_current_user

__all__ = ["get_db", "get_current_user"]
