from fastapi import APIRouter

from app.api.v1.endpoints import auth
from app.api.v1.endpoints import appointments
from app.api.v1.endpoints import patients
from app.api.v1.endpoints import historiales
from app.api.v1.endpoints.notifications import router as notifications_router
from app.api.v1.endpoints import dashboard


api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(appointments.router, prefix="/appointments", tags=["citas"])
api_router.include_router(patients.router, prefix="/patients", tags=["pacientes"])
api_router.include_router(
    historiales.router, prefix="/historiales", tags=["historiales", "terapias"]
)
api_router.include_router(
    notifications_router, prefix="/notificaciones", tags=["notificaciones"]
)
api_router.include_router(dashboard.router, prefix="/dashboard", tags=["Dashboard"])
