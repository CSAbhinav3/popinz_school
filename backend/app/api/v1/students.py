"""Student CRUD. Teachers/Admin manage all; Parents manage only their children."""
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.database import get_db
from app.models.user import User, UserRole
from app.models.student import Student
from app.schemas.student import StudentCreate, StudentUpdate, StudentResponse
from app.core.dependencies import get_current_user, RequireAdminOrTeacher

router = APIRouter(prefix="/students", tags=["students"])


async def _get_student_or_404(db: AsyncSession, student_id: int) -> Student:
    result = await db.execute(
        select(Student).where(Student.id == student_id)
    )
    student = result.scalar_one_or_none()
    if not student:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Student not found")
    return student


def _parent_can_access(current_user: User, student: Student) -> bool:
    return current_user.role == UserRole.PARENT and student.parent_id == current_user.id


@router.get("", response_model=list[StudentResponse])
async def list_students(
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
) -> list[Student]:
    """List students. Admin/Teacher: all. Parent: only their children."""
    if current_user.role in (UserRole.ADMIN, UserRole.TEACHER):
        result = await db.execute(
            select(Student).offset(skip).limit(limit).order_by(Student.id)
        )
        return list(result.scalars().all())
    result = await db.execute(
        select(Student).where(Student.parent_id == current_user.id).offset(skip).limit(limit)
    )
    return list(result.scalars().all())


@router.get("/{student_id}", response_model=StudentResponse)
async def get_student(
    student_id: int,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
) -> Student:
    """Get student by ID. Parent can only get their own child."""
    student = await _get_student_or_404(db, student_id)
    if current_user.role == UserRole.PARENT and student.parent_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not your child")
    return student


@router.post("", response_model=StudentResponse, status_code=status.HTTP_201_CREATED)
async def create_student(
    body: StudentCreate,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
) -> Student:
    """Create student. Admin/Teacher: can set parent_id. Parent: parent_id = current user."""
    parent_id = body.parent_id
    if current_user.role == UserRole.PARENT:
        parent_id = current_user.id
    elif parent_id is None and current_user.role in (UserRole.ADMIN, UserRole.TEACHER):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="parent_id required for admin/teacher",
        )
    student = Student(
        full_name=body.full_name,
        date_of_birth=body.date_of_birth,
        parent_id=parent_id,
    )
    db.add(student)
    await db.flush()
    await db.refresh(student)
    return student


@router.patch("/{student_id}", response_model=StudentResponse)
async def update_student(
    student_id: int,
    body: StudentUpdate,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
) -> Student:
    """Update student. Parent can only update their own child; cannot change parent_id."""
    student = await _get_student_or_404(db, student_id)
    if not _parent_can_access(current_user, student) and current_user.role not in (
        UserRole.ADMIN,
        UserRole.TEACHER,
    ):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not allowed")
    if body.full_name is not None:
        student.full_name = body.full_name
    if body.date_of_birth is not None:
        student.date_of_birth = body.date_of_birth
    if body.parent_id is not None and current_user.role in (UserRole.ADMIN, UserRole.TEACHER):
        student.parent_id = body.parent_id
    await db.flush()
    await db.refresh(student)
    return student


@router.delete("/{student_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_student(
    student_id: int,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
) -> None:
    """Delete student. Admin/Teacher: any. Parent: only their child."""
    student = await _get_student_or_404(db, student_id)
    if current_user.role == UserRole.PARENT and student.parent_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not your child")
    await db.delete(student)
    await db.flush()
