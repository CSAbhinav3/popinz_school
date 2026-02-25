"""Attendance: list, manual create (teacher/admin), analytics."""
from datetime import date
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy import select, func, and_
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.user import User, UserRole
from app.models.student import Student
from app.models.attendance import Attendance, AttendanceStatus
from app.schemas.attendance import AttendanceCreate, AttendanceResponse
from app.core.dependencies import get_current_user, RequireAdminOrTeacher


router = APIRouter(prefix="/attendance", tags=["attendance"])


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
