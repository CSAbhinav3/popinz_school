"""Feedback schemas."""
from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field


class FeedbackBase(BaseModel):
    """Base feedback schema."""

    activity_id: int = Field(..., gt=0)
    rating: int = Field(..., ge=1, le=5)
    comment: Optional[str] = None


class FeedbackCreate(FeedbackBase):
    """Schema for creating feedback (parent_id from token)."""

    pass


class FeedbackUpdate(BaseModel):
    """Schema for updating feedback (partial)."""

    rating: Optional[int] = Field(None, ge=1, le=5)
    comment: Optional[str] = None


class FeedbackResponse(FeedbackBase):
    """Feedback response."""

    id: int
    parent_id: int
    created_at: datetime

    model_config = {"from_attributes": True}
