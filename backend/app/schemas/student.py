"""Student schemas."""
from datetime import date, datetime
from typing import Optional

from pydantic import BaseModel, Field


class StudentBase(BaseModel):
    """Base student schema."""

    full_name: str = Field(..., min_length=1, max_length=255)
    date_of_birth: Optional[date] = None


class StudentCreate(StudentBase):
    """Schema for creating a student (parent_id set by backend for parent, or passed for teacher/admin)."""

    parent_id: Optional[int] = None  # Required for admin/teacher; ignored for parent (use current user)


class StudentUpdate(BaseModel):
    """Schema for updating a student (partial)."""

    full_name: Optional[str] = Field(None, min_length=1, max_length=255)
    date_of_birth: Optional[date] = None
    parent_id: Optional[int] = None


class StudentResponse(StudentBase):
    """Student response."""

    id: int
    parent_id: int
    created_at: datetime

    model_config = {"from_attributes": True}
