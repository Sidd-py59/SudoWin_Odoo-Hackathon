"""Security helpers and authentication dependency.

TODO – Implementation steps
─────────────────────────────
1. Extract the Bearer token from the ``Authorization`` header.
2. Call ``verify_firebase_token`` from ``core/firebase.py``.
3. Map the Firebase UID to a local user record if needed.
4. Raise ``HTTPException(401)`` on failure.
"""

from typing import Any

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from app.core.firebase import verify_firebase_token

# Reusable HTTP Bearer scheme – used as a FastAPI dependency.
_bearer_scheme = HTTPBearer(auto_error=False)


async def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(_bearer_scheme),
) -> dict[str, Any]:
    """Dependency that resolves the current authenticated user.

    TODO: Replace the stub below with real token verification.

    Returns:
        A dict representing the authenticated user (e.g. Firebase decoded token).

    Raises:
        HTTPException: 401 if the token is missing or invalid.
    """
    if credentials is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication credentials were not provided.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # TODO: Uncomment when Firebase is configured.
    # decoded = verify_firebase_token(credentials.credentials)
    # if decoded is None:
    #     raise HTTPException(
    #         status_code=status.HTTP_401_UNAUTHORIZED,
    #         detail="Invalid or expired token.",
    #         headers={"WWW-Authenticate": "Bearer"},
    #     )
    # return decoded

    # ── Stub: accept any token during development ───────────────
    return {"uid": "dev-user", "email": "dev@transitops.local"}
