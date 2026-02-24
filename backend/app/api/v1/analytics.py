"""Analytics dashboard endpoints for teachers and admin."""
from datetime import date
from typing import Annotated

from fastapi import APIRouter, Depends, Query
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.user import User
from app.models.student import Student
from app.models.activity import Activity
from app.models.attendance import Attendance, AttendanceStatus
from app.models.feedback import Feedback
from app.core.dependencies import get_current_user, RequireAdminOrTeacher

router = APIRouter(prefix="/analytics", tags=["analytics"])


@router.get("/dashboard")
async def dashboard(
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: RequireAdminOrTeacher,
    from_date: date | None = Query(None),
    to_date: date | None = Query(None),
) -> dict:
    """Dashboard summary: student count, activity count, attendance summary, feedback count."""
    total_students = await db.scalar(select(func.count(Student.id)))
    total_activities = await db.scalar(select(func.count(Activity.id)))
    total_feedback = await db.scalar(select(func.count(Feedback.id)))

    q_att = select(
        Attendance.status,
        func.count(Attendance.id).label("count"),
    ).group_by(Attendance.status)
    if from_date is not None:
        q_att = q_att.where(Attendance.attendance_date >= from_date)
    if to_date is not None:
        q_att = q_att.where(Attendance.attendance_date <= to_date)
    result = await db.execute(q_att)
    by_status = {row.status.value: row.count for row in result.all()}

    return {
        "total_students": total_students or 0,
        "total_activities": total_activities or 0,
        "total_feedback": total_feedback or 0,
        "attendance_summary": by_status,
        "from_date": str(from_date) if from_date else None,
        "to_date": str(to_date) if to_date else None,
    }


@router.get("/activities/summary")
async def activities_summary(
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: RequireAdminOrTeacher,
    from_date: date | None = Query(None),
    to_date: date | None = Query(None),
) -> list[dict]:
    """Activity list with feedback count and average rating."""
    q = (
        select(
            Activity.id,
            Activity.title,
            Activity.activity_date,
            func.count(Feedback.id).label("feedback_count"),
            func.avg(Feedback.rating).label("avg_rating"),
        )
        .outerjoin(Feedback, Activity.id == Feedback.activity_id)
        .group_by(Activity.id, Activity.title, Activity.activity_date)
        .order_by(Activity.activity_date.desc())
    )
    if from_date is not None:
        q = q.where(Activity.activity_date >= from_date)
    if to_date is not None:
        q = q.where(Activity.activity_date <= to_date)
    result = await db.execute(q)
    rows = result.all()
    return [
        {
            "id": r.id,
            "title": r.title,
            "activity_date": str(r.activity_date),
            "feedback_count": r.feedback_count,
            "avg_rating": float(r.avg_rating) if r.avg_rating is not None else None,
        }
        for r in rows
    ]
