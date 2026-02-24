"""QR token schemas."""
from datetime import datetime

from pydantic import BaseModel, Field


class QRGenerateResponse(BaseModel):
    """Response containing QR token for attendance session."""

    qr_token: str
    session_id: str
    expires_at: datetime
    expires_in_seconds: int


class QRValidateRequest(BaseModel):
    """Request to validate and consume QR token (mark attendance)."""

    qr_token: str = Field(..., min_length=1)
    student_id: int = Field(..., gt=0)
