"""QR token generation and validation with expiry and replay protection."""

import hashlib
import secrets
from datetime import datetime, timezone, timedelta

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import get_settings
from app.models.qr_token import QRToken

settings = get_settings()


def _hash_token(token: str) -> str:
    return hashlib.sha256(token.encode()).hexdigest()


async def generate_qr_token(
    db: AsyncSession,
    student_id: int,
) -> tuple[str, QRToken]:
    """
    Generate a new QR token for a specific student.
    Returns (raw_token, qr_token_model).
    Raw token is sent to client; only hash is stored.
    """
    raw_token = secrets.token_urlsafe(32)
    token_hash = _hash_token(raw_token)

    expires_at = datetime.now(timezone.utc) + timedelta(
        minutes=settings.qr_token_expire_minutes
    )

    qr = QRToken(
        token_hash=token_hash,
        student_id=student_id,
        expires_at=expires_at,
    )

    db.add(qr)
    await db.flush()

    return raw_token, qr


async def validate_and_consume_qr_token(
    db: AsyncSession,
    raw_token: str,
) -> QRToken | None:
    """
    Validate QR token: exists, not expired, not already used.
    Marks token as used (replay protection) and returns it.
    """
    token_hash = _hash_token(raw_token)

    result = await db.execute(
        select(QRToken).where(QRToken.token_hash == token_hash)
    )
    qr = result.scalar_one_or_none()

    if not qr:
        return None

    now = datetime.now(timezone.utc)

    if qr.expires_at < now:
        return None

    if qr.used_at is not None:
        return None  # Replay protection

    qr.used_at = now
    await db.flush()

    return qr