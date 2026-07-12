"""Firebase Admin SDK initialization placeholder.

TODO – Implementation steps
─────────────────────────────
1. Install `firebase-admin` (already in pyproject.toml).
2. Place a Firebase service-account JSON in a secure location OR
   provide credentials via the FIREBASE_* env vars.
3. Uncomment the initialisation block below and adjust as needed.
"""

from app.core.config import get_settings

settings = get_settings()


def init_firebase() -> None:
    """Initialise the Firebase Admin SDK.

    TODO: Implement Firebase initialization using one of:
        - A service-account JSON file, or
        - Environment variables (FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL,
          FIREBASE_PRIVATE_KEY).

    Example (uncomment when ready):

        import firebase_admin
        from firebase_admin import credentials

        cred = credentials.Certificate({
            "type": "service_account",
            "project_id": settings.FIREBASE_PROJECT_ID,
            "client_email": settings.FIREBASE_CLIENT_EMAIL,
            "private_key": settings.FIREBASE_PRIVATE_KEY.replace("\\\\n", "\\n"),
        })
        firebase_admin.initialize_app(cred)
    """
    # No-op until Firebase credentials are configured.
    pass


def verify_firebase_token(token: str) -> dict | None:
    """Verify a Firebase ID token and return decoded claims.

    TODO: Implement token verification.

    Example (uncomment when ready):

        from firebase_admin import auth
        try:
            decoded = auth.verify_id_token(token)
            return decoded
        except Exception:
            return None

    Returns:
        Decoded token dict on success, ``None`` on failure.
    """
    # Placeholder – always returns None (unauthenticated).
    return None
