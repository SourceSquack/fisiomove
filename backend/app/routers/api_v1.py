from fastapi import APIRouter

from app.api.v1.endpoints import auth
from app.api.v1.endpoints import appointments
from app.api.v1.endpoints import patients
from app.api.v1.endpoints import historiales
from app.api.v1.endpoints.notifications import router as notifications_router

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(appointments.router, tags=["citas"])
api_router.include_router(patients.router, tags=["pacientes"])
api_router.include_router(historiales.router, tags=["historiales", "terapias"])
api_router.include_router(notifications_router, prefix="/notificaciones", tags=["notificaciones"])
