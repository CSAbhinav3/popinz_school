"""Aggregate all v1 API routes."""
from fastapi import APIRouter

from app.api.v1 import auth, users, students, activities, attendance, feedback, analytics

api_router = APIRouter(prefix="/api/v1")

api_router.include_router(auth.router)
api_router.include_router(users.router)
api_router.include_router(students.router)
api_router.include_router(activities.router)
api_router.include_router(attendance.router)
api_router.include_router(feedback.router)
api_router.include_router(analytics.router)
