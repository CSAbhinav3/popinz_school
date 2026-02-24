"""User model and role enum."""
import enum
from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import DateTime, Enum, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base

if TYPE_CHECKING:
    from app.models.student import Student
    from app.models.activity import Activity
    from app.models.attendance import Attendance
    from app.models.feedback import Feedback


class UserRole(str, enum.Enum):
    """User role enumeration."""

    ADMIN = "admin"
    TEACHER = "teacher"
    PARENT = "parent"


class User(Base):
    """User account (Admin, Teacher, Parent)."""

    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)
    full_name: Mapped[str] = mapped_column(String(255), nullable=False)
    role: Mapped[UserRole] = mapped_column(
        Enum(UserRole),
        nullable=False,
        default=UserRole.PARENT,
    )
    is_active: Mapped[bool] = mapped_column(default=True, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
    )

    # Parent: children
    children: Mapped[list["Student"]] = relationship(
        "Student",
        back_populates="parent",
        foreign_keys="Student.parent_id",
    )
    # Teacher/Admin: created activities
    activities_created: Mapped[list["Activity"]] = relationship(
        "Activity",
        back_populates="created_by",
        foreign_keys="Activity.created_by_id",
    )
    # Attendance records marked by this user
    attendance_marked: Mapped[list["Attendance"]] = relationship(
        "Attendance",
        back_populates="marked_by",
        foreign_keys="Attendance.marked_by_id",
    )
    # Feedback by parent
    feedbacks: Mapped[list["Feedback"]] = relationship(
        "Feedback",
        back_populates="parent",
    )

    def __repr__(self) -> str:
        return f"<User id={self.id} email={self.email} role={self.role}>"
