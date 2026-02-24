"""Feedback CRUD. Parents create/update/delete their own feedback on activities."""
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.user import User, UserRole
from app.models.feedback import Feedback
from app.models.activity import Activity
from app.schemas.feedback import FeedbackCreate, FeedbackUpdate, FeedbackResponse
from app.core.dependencies import get_current_user

router = APIRouter(prefix="/feedback", tags=["feedback"])


async def _get_feedback_or_404(db: AsyncSession, feedback_id: int) -> Feedback:
    result = await db.execute(select(Feedback).where(Feedback.id == feedback_id))
    f = result.scalar_one_or_none()
    if not f:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Feedback not found")
    return f


@router.get("", response_model=list[FeedbackResponse])
async def list_feedback(
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
    activity_id: int | None = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
) -> list[Feedback]:
    """List feedback. Parent: only their own. Admin/Teacher: all (optional activity_id filter)."""
    q = select(Feedback).order_by(Feedback.created_at.desc())
    if current_user.role == UserRole.PARENT:
        q = q.where(Feedback.parent_id == current_user.id)
    if activity_id is not None:
        q = q.where(Feedback.activity_id == activity_id)
    q = q.offset(skip).limit(limit)
    result = await db.execute(q)
    return list(result.scalars().all())


@router.get("/{feedback_id}", response_model=FeedbackResponse)
async def get_feedback(
    feedback_id: int,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
) -> Feedback:
    """Get feedback by ID. Parent: only their own."""
    feedback = await _get_feedback_or_404(db, feedback_id)
    if current_user.role == UserRole.PARENT and feedback.parent_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not your feedback")
    return feedback


@router.post("", response_model=FeedbackResponse, status_code=status.HTTP_201_CREATED)
async def create_feedback(
    body: FeedbackCreate,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
) -> Feedback:
    """Create feedback on an activity. Parents only; one feedback per parent per activity."""
    if current_user.role != UserRole.PARENT:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only parents can submit feedback",
        )
    result = await db.execute(
        select(Feedback).where(
            Feedback.activity_id == body.activity_id,
            Feedback.parent_id == current_user.id,
        )
    )
    if result.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You have already submitted feedback for this activity",
        )
    activity_exists = await db.execute(select(Activity).where(Activity.id == body.activity_id))
    if not activity_exists.scalar_one_or_none():
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Activity not found")
    feedback = Feedback(
        activity_id=body.activity_id,
        parent_id=current_user.id,
        rating=body.rating,
        comment=body.comment,
    )
    db.add(feedback)
    await db.flush()
    await db.refresh(feedback)
    return feedback


@router.patch("/{feedback_id}", response_model=FeedbackResponse)
async def update_feedback(
    feedback_id: int,
    body: FeedbackUpdate,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
) -> Feedback:
    """Update feedback. Parent: only their own."""
    feedback = await _get_feedback_or_404(db, feedback_id)
    if current_user.role == UserRole.PARENT and feedback.parent_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not your feedback")
    if body.rating is not None:
        feedback.rating = body.rating
    if body.comment is not None:
        feedback.comment = body.comment
    await db.flush()
    await db.refresh(feedback)
    return feedback


@router.delete("/{feedback_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_feedback(
    feedback_id: int,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
) -> None:
    """Delete feedback. Parent: only their own."""
    feedback = await _get_feedback_or_404(db, feedback_id)
    if current_user.role == UserRole.PARENT and feedback.parent_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not your feedback")
    await db.delete(feedback)
    await db.flush()
