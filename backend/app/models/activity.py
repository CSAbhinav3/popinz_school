"""Activity model."""
from datetime import date, datetime
from typing import TYPE_CHECKING

from sqlalchemy import Date, DateTime, ForeignKey, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base

if TYPE_CHECKING:
    from app.models.user import User
    from app.models.feedback import Feedback


class Activity(Base):
    """School activity (event, class activity, etc.)."""

    __tablename__ = "activities"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    activity_date: Mapped[date] = mapped_column(Date, nullable=False)
    created_by_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
    )

    created_by: Mapped["User | None"] = relationship(
        "User",
        back_populates="activities_created",
    )
    feedbacks: Mapped[list["Feedback"]] = relationship(
        "Feedback",
        back_populates="activity",
        cascade="all, delete-orphan",
    )

    def __repr__(self) -> str:
        return f"<Activity id={self.id} title={self.title}>"
