"""Feedback model (parent feedback on activities)."""
from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import DateTime, ForeignKey, Integer, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base

if TYPE_CHECKING:
    from app.models.user import User
    from app.models.activity import Activity


class Feedback(Base):
    """Parent feedback on an activity."""

    __tablename__ = "feedback"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    activity_id: Mapped[int] = mapped_column(
        ForeignKey("activities.id", ondelete="CASCADE"),
        nullable=False,
    )
    parent_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
    )
    rating: Mapped[int] = mapped_column(Integer, nullable=False)  # e.g. 1-5
    comment: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
    )

    activity: Mapped["Activity"] = relationship("Activity", back_populates="feedbacks")
    parent: Mapped["User"] = relationship("User", back_populates="feedbacks")

    def __repr__(self) -> str:
        return f"<Feedback id={self.id} activity_id={self.activity_id} rating={self.rating}>"
