from fastapi import APIRouter, Depends

from app.services.auth import get_current_user, require_roles

router = APIRouter()

@router.get("/me", response_model=dict)
def read_me(user: dict = Depends(get_current_user)):
    return {"id": user.get("id"), "email": user.get("email"), "role": (user.get("user_metadata") or {}).get("role")}

@router.get("/admin-only", dependencies=[Depends(require_roles("admin"))])
def admin_only():
    return {"message": "solo admin"}
