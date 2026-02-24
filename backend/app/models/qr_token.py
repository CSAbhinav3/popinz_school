"""QR token for secure attendance marking with expiry and replay protection."""
from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import DateTime, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base
from sqlalchemy import ForeignKey

student_id: Mapped[int] = mapped_column(
    ForeignKey("students.id", ondelete="CASCADE"),
    nullable=False,
    index=True
)

if TYPE_CHECKING:
    from app.models.attendance import Attendance


class QRToken(Base):
    __tablename__ = "qr_tokens"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)

    token_hash: Mapped[str] = mapped_column(
        String(255), unique=True, index=True, nullable=False
    )

    student_id: Mapped[int] = mapped_column(
        ForeignKey("students.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )

    expires_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        index=True
    )

    used_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
    )

    attendance: Mapped["Attendance | None"] = relationship(
        "Attendance",
        back_populates="qr_token",
        uselist=False,
    )

    @property
    def is_used(self) -> bool:
        return self.used_at is not None
