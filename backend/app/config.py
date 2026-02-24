"""Application configuration using Pydantic Settings."""
from functools import lru_cache
from typing import Optional

from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings loaded from environment."""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    # App
    app_name: str = "Play School Management API"
    debug: bool = False

    # Database: default SQLite (no MySQL needed). For MySQL set in .env:
    # DATABASE_URL=mysql+aiomysql://root:password@localhost:3306/playschool
    # For Render Postgres, use the URL Render provides (postgres://) — it is converted to postgresql+asyncpg://
    database_url: str = "sqlite+aiosqlite:///./playschool.db"

    # JWT
    secret_key: str = "change-me-in-production-use-openssl-rand-hex-32"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 60
    refresh_token_expire_days: int = 7

    # QR attendance
    qr_token_expire_minutes: int = 15
    qr_secret_key: str = "qr-secret-change-in-production"

    # CORS — allow common Vite dev ports so login works from any port
    cors_origins: list[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5174",
        "http://localhost:5175",
        "http://127.0.0.1:5175",
        "http://localhost:5176",
        "http://127.0.0.1:5176",
        "http://localhost:5177",
        "http://127.0.0.1:5177",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ]

    @field_validator("database_url", mode="before")
    @classmethod
    def normalize_postgres_url(cls, v: str) -> str:
        """Render and others give postgres://; SQLAlchemy async needs postgresql+asyncpg://."""
        if v and v.startswith("postgres://"):
            return v.replace("postgres://", "postgresql+asyncpg://", 1)
        if v and v.startswith("postgresql://"):
            return v.replace("postgresql://", "postgresql+asyncpg://", 1)
        return v


@lru_cache
def get_settings() -> Settings:
    return Settings()
