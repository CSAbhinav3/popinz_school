"""FastAPI application entry point."""
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import get_settings
from app.database import init_db, ensure_mysql_database
from app.api.v1.router import api_router
from app.core.middleware import RequestTimingMiddleware, LocalhostCORSMiddleware

import app.models  # noqa: F401 - register models for create_all


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup: ensure MySQL DB exists (if MySQL), then create tables."""
    settings = get_settings()
    if settings.database_url.startswith("mysql"):
        await ensure_mysql_database(settings.database_url)
    await init_db()
    yield


def create_application() -> FastAPI:
    settings = get_settings()
    app = FastAPI(
        title=settings.app_name,
        description="Play School Management System - JWT auth, roles, QR attendance, analytics",
        version="1.0.0",
        lifespan=lifespan,
        docs_url="/docs",
        redoc_url="/redoc",
    )
    app.add_middleware(RequestTimingMiddleware)
    # Allow any localhost/127.0.0.1 origin (any port) — added last so it runs first on response
    app.add_middleware(LocalhostCORSMiddleware)
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    app.include_router(api_router)

    @app.get("/")
    def root():
        return {
            "message": "Play School Management API",
            "docs": "/docs",
            "redoc": "/redoc",
            "health": "/health",
        }

    @app.get("/health")
    async def health():
        """Minimal health check (no DB). Use this to confirm server responds."""
        return {"status": "ok"}

    return app


app = create_application()
