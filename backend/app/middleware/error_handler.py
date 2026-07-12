"""Error-handling middleware placeholder.

TODO: Implement a middleware that catches unhandled exceptions, logs the
traceback, and returns a consistent JSON error envelope.  This can be a
Starlette ``BaseHTTPMiddleware`` or a raw ASGI middleware.

For now, error handling is done via FastAPI exception handlers registered
in ``main.py``.
"""
