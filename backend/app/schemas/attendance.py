"""Attendance schemas."""
from datetime import date, datetime
from typing import Optional

from pydantic import BaseModel, Field

from app.models.attendance import AttendanceStatus


class AttendanceBase(BaseModel):
    """Base attendance schema."""

    student_id: int
    attendance_date: date
    status: AttendanceStatus = AttendanceStatus.PRESENT


class AttendanceCreate(AttendanceBase):
    """Schema for creating attendance (teacher/admin manual)."""

    pass


class AttendanceMarkRequest(BaseModel):
    """Request to mark attendance via QR (parent)."""

    qr_token: str = Field(..., min_length=1)
    student_id: int = Field(..., gt=0)
    status: AttendanceStatus = AttendanceStatus.PRESENT


class AttendanceResponse(AttendanceBase):
    """Attendance response."""

    id: int
    marked_by_id: Optional[int] = None
    marked_at: datetime

    model_config = {"from_attributes": True}
