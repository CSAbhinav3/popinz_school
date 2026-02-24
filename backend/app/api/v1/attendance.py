"""Attendance: QR generation (teacher/admin), mark via QR (parent, own child only), list, analytics."""
from datetime import date, datetime, timezone
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy import select, func, and_
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.user import User, UserRole
from app.models.student import Student
from app.models.attendance import Attendance, AttendanceStatus
from app.models.qr_token import QRToken
from app.schemas.attendance import (
    AttendanceCreate,
    AttendanceMarkRequest,
    AttendanceResponse,
)
from app.schemas.qr import QRGenerateResponse
from app.core.dependencies import get_current_user, RequireAdminOrTeacher
from app.utils.qr_token import generate_qr_token, validate_and_consume_qr_token
from app.config import get_settings
from sqlalchemy import ForeignKey


router = APIRouter(prefix="/attendance", tags=["attendance"])
settings = get_settings()


@router.post("/qr/generate", response_model=QRGenerateResponse)
async def generate_qr(
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: RequireAdminOrTeacher,
) -> dict:
    """Generate a new QR token for attendance marking. Token expires in configured minutes (replay-safe)."""
    raw_token, qr = await generate_qr_token(db, student_id)
    return {
        "qr_token": raw_token,
        "session_id": qr.session_id,
        "expires_at": qr.expires_at,
        "expires_in_seconds": settings.qr_token_expire_minutes * 60,
    }


@router.post("/mark", response_model=AttendanceResponse, status_code=status.HTTP_201_CREATED)
async def mark_attendance(
    body: AttendanceMarkRequest,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
) -> Attendance:
    """Mark attendance using QR token. Parents can only mark for their own child. Token is single-use."""
    if current_user.role != UserRole.PARENT:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only parents can mark attendance via QR",
        )
    qr = await validate_and_consume_qr_token(db, body.qr_token)
    if not qr:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid, expired, or already used QR token",
        )
    result = await db.execute(select(Student).where(Student.id == body.student_id))
    student = result.scalar_one_or_none()
    if not student:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Student not found")
    if student.parent_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only mark attendance for your own child",
        )
    # One attendance per student per date
    existing = await db.execute(
        select(Attendance).where(
            and_(
                Attendance.student_id == body.student_id,
                Attendance.attendance_date == date.today(),
            )
        )
    )
    if existing.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Attendance already marked for this student today",
        )
    attendance = Attendance(
        student_id=body.student_id,
        attendance_date=date.today(),
        status=body.status,
        marked_by_id=current_user.id,
        qr_token_id=qr.id,
    )
    db.add(attendance)
    await db.flush()
    await db.refresh(attendance)
    return attendance


@router.get("", response_model=list[AttendanceResponse])
async def list_attendance(
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
    student_id: int | None = Query(None),
    from_date: date | None = Query(None),
    to_date: date | None = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
) -> list[Attendance]:
    """List attendance. Admin/Teacher: filter by student_id and date. Parent: only their children."""
    q = select(Attendance).order_by(Attendance.attendance_date.desc(), Attendance.id.desc())
    if current_user.role == UserRole.PARENT:
        q = q.join(Student, Attendance.student_id == Student.id).where(
            Student.parent_id == current_user.id
        )
    if student_id is not None:
        q = q.where(Attendance.student_id == student_id)
    if from_date is not None:
        q = q.where(Attendance.attendance_date >= from_date)
    if to_date is not None:
        q = q.where(Attendance.attendance_date <= to_date)
    q = q.offset(skip).limit(limit)
    result = await db.execute(q)
    return list(result.scalars().all())


@router.post("/manual", response_model=AttendanceResponse, status_code=status.HTTP_201_CREATED)
async def create_attendance_manual(
    body: AttendanceCreate,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: RequireAdminOrTeacher,
) -> Attendance:
    """Create attendance record manually (teacher/admin only)."""
    existing = await db.execute(
        select(Attendance).where(
            and_(
                Attendance.student_id == body.student_id,
                Attendance.attendance_date == body.attendance_date,
            )
        )
    )
    if existing.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Attendance already exists for this student on this date",
        )
    attendance = Attendance(
        student_id=body.student_id,
        attendance_date=body.attendance_date,
        status=body.status,
        marked_by_id=current_user.id,
    )
    db.add(attendance)
    await db.flush()
    await db.refresh(attendance)
    return attendance


@router.get("/analytics/summary")
async def attendance_analytics_summary(
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
    from_date: date | None = Query(None),
    to_date: date | None = Query(None),
) -> dict:
    """Attendance summary: total present/absent/late/excused counts. Teacher/Admin: all students; Parent: own children."""
    q = select(
        Attendance.status,
        func.count(Attendance.id).label("count"),
    ).group_by(Attendance.status)
    if current_user.role == UserRole.PARENT:
        q = q.join(Student, Attendance.student_id == Student.id).where(
            Student.parent_id == current_user.id
        )
    if from_date is not None:
        q = q.where(Attendance.attendance_date >= from_date)
    if to_date is not None:
        q = q.where(Attendance.attendance_date <= to_date)
    result = await db.execute(q)
    rows = result.all()
    summary = {status.value: 0 for status in AttendanceStatus}
    for row in rows:
        summary[row.status.value] = row.count
    return {"by_status": summary, "from_date": str(from_date) if from_date else None, "to_date": str(to_date) if to_date else None}


@router.get("/analytics/daily")
async def attendance_analytics_daily(
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
    from_date: date | None = Query(None),
    to_date: date | None = Query(None),
) -> list[dict]:
    """Daily attendance counts (date, present, absent, etc)."""
    q = select(
        Attendance.attendance_date,
        Attendance.status,
        func.count(Attendance.id).label("count"),
    ).group_by(Attendance.attendance_date, Attendance.status)
    if current_user.role == UserRole.PARENT:
        q = q.join(Student, Attendance.student_id == Student.id).where(
            Student.parent_id == current_user.id
        )
    if from_date is not None:
        q = q.where(Attendance.attendance_date >= from_date)
    if to_date is not None:
        q = q.where(Attendance.attendance_date <= to_date)
    q = q.order_by(Attendance.attendance_date.desc())
    result = await db.execute(q)
    rows = result.all()
    by_date: dict[date, dict] = {}
    for row in rows:
        d = row.attendance_date
        if d not in by_date:
            by_date[d] = {"date": str(d), "present": 0, "absent": 0, "late": 0, "excused": 0}
        by_date[d][row.status.value] = row.count
    return list(by_date.values())
