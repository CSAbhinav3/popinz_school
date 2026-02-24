"""Activity CRUD. Teachers/Admin create and manage; Parents can list and view."""
from datetime import date
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.user import User, UserRole
from app.models.activity import Activity
from app.schemas.activity import ActivityCreate, ActivityUpdate, ActivityResponse
from app.core.dependencies import get_current_user, RequireAdminOrTeacher

router = APIRouter(prefix="/activities", tags=["activities"])


async def _get_activity_or_404(db: AsyncSession, activity_id: int) -> Activity:
    result = await db.execute(select(Activity).where(Activity.id == activity_id))
    activity = result.scalar_one_or_none()
    if not activity:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Activity not found")
    return activity


@router.get("", response_model=list[ActivityResponse])
async def list_activities(
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
    from_date: date | None = Query(None),
    to_date: date | None = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
) -> list[Activity]:
    """List activities. Optional date range filter."""
    q = select(Activity).order_by(Activity.activity_date.desc(), Activity.id.desc())
    if from_date is not None:
        q = q.where(Activity.activity_date >= from_date)
    if to_date is not None:
        q = q.where(Activity.activity_date <= to_date)
    q = q.offset(skip).limit(limit)
    result = await db.execute(q)
    return list(result.scalars().all())


@router.get("/{activity_id}", response_model=ActivityResponse)
async def get_activity(
    activity_id: int,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
) -> Activity:
    """Get activity by ID."""
    return await _get_activity_or_404(db, activity_id)


@router.post("", response_model=ActivityResponse, status_code=status.HTTP_201_CREATED)
async def create_activity(
    body: ActivityCreate,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: RequireAdminOrTeacher,
) -> Activity:
    """Create activity (teacher/admin only)."""
    activity = Activity(
        title=body.title,
        description=body.description,
        activity_date=body.activity_date,
        created_by_id=current_user.id,
    )
    db.add(activity)
    await db.flush()
    await db.refresh(activity)
    return activity


@router.patch("/{activity_id}", response_model=ActivityResponse)
async def update_activity(
    activity_id: int,
    body: ActivityUpdate,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: RequireAdminOrTeacher,
) -> Activity:
    """Update activity (teacher/admin only)."""
    activity = await _get_activity_or_404(db, activity_id)
    if body.title is not None:
        activity.title = body.title
    if body.description is not None:
        activity.description = body.description
    if body.activity_date is not None:
        activity.activity_date = body.activity_date
    await db.flush()
    await db.refresh(activity)
    return activity


@router.delete("/{activity_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_activity(
    activity_id: int,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: RequireAdminOrTeacher,
) -> None:
    """Delete activity (teacher/admin only)."""
    activity = await _get_activity_or_404(db, activity_id)
    await db.delete(activity)
    await db.flush()
