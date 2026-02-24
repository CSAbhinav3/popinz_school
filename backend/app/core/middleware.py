"""Custom middleware (e.g. request logging, role logging, CORS)."""
import time
from typing import Callable

from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware


class RequestTimingMiddleware(BaseHTTPMiddleware):
    """Add X-Process-Time header for debugging."""

    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        start = time.perf_counter()
        response = await call_next(request)
        elapsed = time.perf_counter() - start
        response.headers["X-Process-Time"] = f"{elapsed:.3f}"
        return response


class LocalhostCORSMiddleware(BaseHTTPMiddleware):
    """Allow any localhost / 127.0.0.1 origin (any port) so frontend works regardless of Vite port."""

    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        response = await call_next(request)
        origin = request.headers.get("origin")
        if origin and (
            origin.startswith("http://localhost:") or origin.startswith("http://127.0.0.1:")
        ):
            response.headers["Access-Control-Allow-Origin"] = origin
            response.headers["Access-Control-Allow-Credentials"] = "true"
            if request.method == "OPTIONS":
                response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, PATCH, OPTIONS"
                response.headers["Access-Control-Allow-Headers"] = "*"
        return response
