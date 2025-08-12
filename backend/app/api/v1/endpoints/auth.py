from fastapi import APIRouter, HTTPException, status, Depends
from pydantic import BaseModel, EmailStr, Field
from typing import Literal

from app.schemas.auth import UserCreate
from app.services.auth import get_current_user, require_roles, reuseable_oauth
from app.core.config import settings
from supabase_utils.gotrue import (
    sign_up_user, sign_in_user, refresh_session, logout,
    admin_get_user_by_email, admin_confirm_user_by_email, admin_create_user,
    update_user_self, admin_update_user_by_email,
)

router = APIRouter()

class UpdateEmailPayload(BaseModel):
    new_email: EmailStr

class UpdatePasswordPayload(BaseModel):
    current_password: str = Field(min_length=8)
    new_password: str = Field(min_length=8)

class UpdateProfilePayload(BaseModel):
    full_name: str = Field(min_length=1)

class UpdateRolePayload(BaseModel):
    email: EmailStr
    role: Literal["admin", "fisioterapeuta", "paciente"]

class LoginPayload(BaseModel):
    email: EmailStr
    password: str = Field(min_length=1)

@router.get("/me", response_model=dict)
def read_me(user: dict = Depends(get_current_user)):
    return {
        "id": user.get("id"),
        "email": user.get("email"),
        "full_name": (user.get("user_metadata") or {}).get("full_name"),
        "role": (user.get("user_metadata") or {}).get("role"),
    }

@router.post("/register", response_model=dict, status_code=status.HTTP_201_CREATED)
def register(user_in: UserCreate):
    try:
        normalized_email = user_in.email.strip().lower()

        # En dev, si está habilitado el bypass, crear/confirmar por Admin API (sin pedir confirmación de correo)
        if settings.ENV != "production" and settings.DEV_BYPASS_EMAIL_CONFIRM:
            if not settings.SUPABASE_SERVICE_ROLE_KEY:
                raise HTTPException(status_code=400, detail={"message": "Falta SUPABASE_SERVICE_ROLE_KEY para bypass"})

            existing = admin_get_user_by_email(normalized_email)
            if existing:
                # Confirmar si existe y devolverlo
                admin_confirm_user_by_email(normalized_email)
                return {"message": "Usuario existente confirmado", "user": existing}

            created = admin_create_user(
                normalized_email,
                user_in.password,
                full_name=(user_in.full_name or "").strip(),
                role=user_in.role,
                email_confirm=True,
            )
            if not created:
                raise HTTPException(status_code=400, detail={"message": "No se pudo crear usuario vía Admin API"})
            return created

        # Flujo normal (producción): signup público que requiere confirmación de email
        result = sign_up_user(
            email=normalized_email,
            password=user_in.password,
            full_name=(user_in.full_name or "").strip(),
            role=user_in.role,
        )
        return result
    except ValueError as e:
        detail = e.args[0] if e.args else {"message": "Error en registro"}
        code = detail.get("status", 400) if isinstance(detail, dict) else 400
        raise HTTPException(status_code=code, detail=detail)

@router.post("/login", response_model=dict)
def login(form: LoginPayload):
    email = form.email.strip().lower()
    password = form.password
    if not email or not password:
        raise HTTPException(status_code=400, detail={"message": "Credenciales inválidas"})
    try:
        result = sign_in_user(email, password)
        return result
    except ValueError as e:
        detail = e.args[0] if e.args else {"message": "Error de autenticación"}
        # Si el motivo es email_not_confirmed y está permitido el bypass, intentamos confirmar y reintentar
        if (
            isinstance(detail, dict)
            and (detail.get("detail") or {}).get("error_code") == "email_not_confirmed"
            and settings.ENV != "production"
            and settings.DEV_BYPASS_EMAIL_CONFIRM
        ):
            bypass_list = [x.strip().lower() for x in (settings.DEV_BYPASS_EMAILS or "").split(",") if x.strip()]
            if email in set(bypass_list):
                try:
                    admin_confirm_user_by_email(email)
                    # Reintentar login una vez
                    return sign_in_user(email, password)
                except Exception:
                    pass
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

# ====== Updates (self) ======
@router.put("/email", response_model=dict)
def update_email(payload: UpdateEmailPayload, token: str = Depends(reuseable_oauth)):
    try:
        result = update_user_self(token, new_email=payload.new_email)
        return {"ok": True, "user": result}
    except ValueError as e:
        detail = e.args[0] if e.args else {"message": "No se pudo actualizar email"}
        code = detail.get("status", 400) if isinstance(detail, dict) else 400
        raise HTTPException(status_code=code, detail=detail)

@router.put("/password", response_model=dict)
def update_password(payload: UpdatePasswordPayload, token: str = Depends(reuseable_oauth), user: dict = Depends(get_current_user)):
    try:
        # Validar current_password intentando login
        sign_in_user((user or {}).get("email") or "", payload.current_password)
    except Exception:
        raise HTTPException(status_code=400, detail={"message": "Contraseña actual incorrecta"})
    try:
        result = update_user_self(token, new_password=payload.new_password)
        return {"ok": True, "user": result}
    except ValueError as e:
        detail = e.args[0] if e.args else {"message": "No se pudo actualizar contraseña"}
        code = detail.get("status", 400) if isinstance(detail, dict) else 400
        raise HTTPException(status_code=code, detail=detail)

@router.put("/profile", response_model=dict)
def update_profile(payload: UpdateProfilePayload, token: str = Depends(reuseable_oauth)):
    try:
        result = update_user_self(token, full_name=payload.full_name)
        return {"ok": True, "user": result}
    except ValueError as e:
        detail = e.args[0] if e.args else {"message": "No se pudo actualizar perfil"}
        code = detail.get("status", 400) if isinstance(detail, dict) else 400
        raise HTTPException(status_code=code, detail=detail)

# ====== Admin: actualizar rol ======
@router.put("/role", dependencies=[Depends(require_roles("admin"))], response_model=dict)
def admin_update_role(payload: UpdateRolePayload):
    updated = admin_update_user_by_email(payload.email.strip().lower(), role=payload.role)
    if not updated:
        raise HTTPException(status_code=400, detail={"message": "No se pudo actualizar rol (¿service_role válido?)"})
    return {"ok": True, "user": updated}

@router.post("/seed-dev-users", tags=["auth"])  # temporal para develop
def seed_dev_users():
    if settings.ENV == "production":
        raise HTTPException(status_code=403, detail={"message": "No permitido en producción"})
    if not settings.SUPABASE_SERVICE_ROLE_KEY:
        raise HTTPException(status_code=400, detail={"message": "Falta SUPABASE_SERVICE_ROLE_KEY"})

    users = [
        {"email": "admin@fisiomove.com", "password": "Admin123", "full_name": "Admin", "role": "admin"},
        {"email": "fisio@fisiomove.com", "password": "Fisio123", "full_name": "Fisio", "role": "fisioterapeuta"},
        {"email": "user@fisiomove.com", "password": "User1234", "full_name": "User", "role": "paciente"},
    ]

    results = []
    for u in users:
        email = u["email"].strip().lower()
        existing = admin_get_user_by_email(email)
        if existing:
            confirmed = admin_confirm_user_by_email(email)
            results.append({"email": email, "created": False, "confirmed": bool(confirmed)})
        else:
            created = admin_create_user(email, u["password"], full_name=u["full_name"], role=u["role"], email_confirm=True)
            results.append({"email": email, "created": bool(created), "confirmed": bool(created)})

    return {"ok": True, "results": results}