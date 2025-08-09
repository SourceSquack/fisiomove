from fastapi import APIRouter

from app.api.v1.endpoints import auth
from app.api.v1.endpoints import appointments
from app.api.v1.endpoints import patients

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(appointments.router, tags=["citas"])
api_router.include_router(patients.router, tags=["pacientes"])
