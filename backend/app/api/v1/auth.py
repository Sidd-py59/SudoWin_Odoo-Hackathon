"""Authentication router placeholder.

TODO: Implement the following endpoints:
    POST /auth/register   – Create a new user (Firebase + local DB).
    POST /auth/login      – Exchange Firebase ID token for session info.
    POST /auth/logout     – Invalidate session / revoke refresh tokens.
    GET  /auth/me         – Return the currently authenticated user profile.
"""

from fastapi import APIRouter

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.get("/", summary="Auth module health check")
async def auth_health() -> dict[str, str]:
    """Verify the auth router is reachable."""
    return {"module": "auth", "status": "ready"}
