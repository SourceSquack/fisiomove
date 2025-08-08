from fastapi import APIRouter, Depends

from app.services.auth import get_current_user, require_roles
from app.models.user import UserRole, User

router = APIRouter()

@router.get("/me", response_model=dict)
def read_me(user: User = Depends(get_current_user)):
    return {"id": user.id, "email": user.email, "role": user.role}

@router.get("/admin-only", dependencies=[Depends(require_roles(UserRole.admin.value))])
def admin_only():
    return {"message": "solo admin"}
