"""Request logging middleware.

Logs every incoming request with method, path, status code, and execution
time.  Uses the standard library ``logging`` module so output integrates
with any log aggregator.
"""

import logging
import time

from starlette.middleware.base import BaseHTTPMiddleware, RequestResponseEndpoint
from starlette.requests import Request
from starlette.responses import Response

logger = logging.getLogger("transitops.access")


class LoggingMiddleware(BaseHTTPMiddleware):
    """Log request method, path, status, and duration."""

    async def dispatch(self, request: Request, call_next: RequestResponseEndpoint) -> Response:
        start = time.perf_counter()
        response: Response = await call_next(request)
        duration_ms = (time.perf_counter() - start) * 1000

        logger.info(
            "%s %s → %s  (%.1f ms)",
            request.method,
            request.url.path,
            response.status_code,
            duration_ms,
        )
        # Inject a custom header so callers can inspect server-side timing.
        response.headers["X-Process-Time-Ms"] = f"{duration_ms:.1f}"
        return response
