from fastapi import APIRouter, HTTPException, status, Depends
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.schemas.auth import UserCreate, UserRead, Token
from app.services.users import get_by_email
from app.services.security import verify_password, create_access_token
from supabase.gotrue import sign_up_user, sign_in_user, refresh_session, logout

router = APIRouter()

@router.post("/register", response_model=dict, status_code=status.HTTP_201_CREATED)
def register(user_in: UserCreate):
    try:
        result = sign_up_user(
            email=user_in.email,
            password=user_in.password,
            full_name=user_in.full_name,
            role=user_in.role,
        )
        return result
    except ValueError as e:
        detail = e.args[0] if e.args else {"message": "Error en registro"}
        code = detail.get("status", 400) if isinstance(detail, dict) else 400
        raise HTTPException(status_code=code, detail=detail)

@router.post("/login", response_model=dict)
def login(form: dict):
    email = form.get("email")
    password = form.get("password")
    if not email or not password:
        raise HTTPException(status_code=400, detail={"message": "Credenciales inválidas"})
    try:
        result = sign_in_user(email, password)
        return result
    except ValueError as e:
        detail = e.args[0] if e.args else {"message": "Error de autenticación"}
        code = detail.get("status", 401) if isinstance(detail, dict) else 401
        raise HTTPException(status_code=code, detail=detail)

@router.post("/refresh", response_model=dict)
def refresh(form: dict):
    token = form.get("refresh_token")
    if not token:
        raise HTTPException(status_code=400, detail={"message": "refresh_token requerido"})
    try:
        return refresh_session(token)
    except ValueError as e:
        detail = e.args[0] if e.args else {"message": "No se pudo refrescar"}
        code = detail.get("status", 401) if isinstance(detail, dict) else 401
        raise HTTPException(status_code=code, detail=detail)

@router.post("/logout")
def do_logout(form: dict):
    access_token = form.get("access_token")
    if not access_token:
        raise HTTPException(status_code=400, detail={"message": "access_token requerido"})
    try:
        logout(access_token)
        return {"ok": True}
    except ValueError as e:
        detail = e.args[0] if e.args else {"message": "No se pudo cerrar sesión"}
        code = detail.get("status", 401) if isinstance(detail, dict) else 401
        raise HTTPException(status_code=code, detail=detail)