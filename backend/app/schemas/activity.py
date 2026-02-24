"""Activity schemas."""
from datetime import date, datetime
from typing import Optional

from pydantic import BaseModel, Field


class ActivityBase(BaseModel):
    """Base activity schema."""

    title: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None
    activity_date: date


class ActivityCreate(ActivityBase):
    """Schema for creating an activity."""

    pass


class ActivityUpdate(BaseModel):
    """Schema for updating an activity (partial)."""

    title: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = None
    activity_date: Optional[date] = None


class ActivityResponse(ActivityBase):
    """Activity response."""

    id: int
    created_by_id: Optional[int] = None
    created_at: datetime

    model_config = {"from_attributes": True}
