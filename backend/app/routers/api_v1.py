from fastapi import APIRouter

from app.api.v1.endpoints import auth, protected_example

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(protected_example.router, prefix="/protected", tags=["protected"])
