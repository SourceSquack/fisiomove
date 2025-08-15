from fastapi import APIRouter, HTTPException, status, Depends
from pydantic import BaseModel, EmailStr, Field
from typing import Literal, Optional

from app.schemas.auth import UserCreate
from app.services.auth import get_current_user, require_roles, reuseable_oauth
from app.core.config import settings
from supabase_utils.gotrue import (
    sign_up_user,
    sign_in_user,
    refresh_session,
    logout,
    admin_get_user_by_email,
    admin_confirm_user_by_email,
    admin_create_user,
    update_user_self,
    admin_update_user_by_email,
)

router = APIRouter()


class UpdateEmailPayload(BaseModel):
    new_email: EmailStr


class UpdatePasswordPayload(BaseModel):
    current_password: str = Field(min_length=8)
    new_password: str = Field(min_length=8)


class UpdateProfilePayload(BaseModel):
    first_name: str = Field(min_length=1)
    last_name: str = Field(min_length=1)
    phone: str = Field(default="")


class UpdateRolePayload(BaseModel):
    email: EmailStr
    role: Literal["admin", "fisioterapeuta", "paciente"]


class LoginPayload(BaseModel):
    email: EmailStr
    password: str = Field(min_length=1)


def _extract_names_from_user(user: dict, user_metadata: dict) -> tuple[str, str]:
    """Extract first_name and last_name from user data."""
    first_name = user_metadata.get("first_name") or user.get("first_name") or ""
    last_name = user_metadata.get("last_name") or user.get("last_name") or ""

    if not first_name and not last_name:
        full_name = (
            user_metadata.get("full_name")
            or user.get("full_name")
            or user_metadata.get("name")
            or ""
        )
        if full_name:
            name_parts = full_name.split(" ", 1)
            first_name = name_parts[0] if len(name_parts) > 0 else ""
            last_name = name_parts[1] if len(name_parts) > 1 else ""

    return first_name, last_name


def _build_user_response(
    user: dict, user_metadata: dict, first_name: str, last_name: str
) -> dict:
    """Build the user response dictionary."""
    role = user_metadata.get("role") or "paciente"

    return {
        "id": user.get("id"),
        "email": user.get("email"),
        "first_name": first_name,
        "last_name": last_name,
        "full_name": f"{first_name} {last_name}".strip(),
        "role": role,
        "is_active": True,
        "phone": user_metadata.get("phone") or user.get("phone"),
    }


@router.get("/me", response_model=dict)
def read_me(user: dict = Depends(get_current_user)):
    user_metadata = user.get("user_metadata") or {}
    first_name, last_name = _extract_names_from_user(user, user_metadata)
    return _build_user_response(user, user_metadata, first_name, last_name)


def _handle_dev_bypass_registration(user_in: UserCreate, normalized_email: str) -> dict:
    """Handle registration with development bypass enabled."""
    if not settings.SUPABASE_SERVICE_ROLE_KEY:
        raise HTTPException(
            status_code=400,
            detail={"message": "Falta SUPABASE_SERVICE_ROLE_KEY para bypass"},
        )

    existing = admin_get_user_by_email(normalized_email)
    if existing:
        admin_confirm_user_by_email(normalized_email)
        return {"message": "Usuario existente confirmado", "user": existing}

    created = _create_admin_user(user_in, normalized_email)
    if not created:
        raise HTTPException(
            status_code=400,
            detail={"message": "No se pudo crear usuario vía Admin API"},
        )
    return created


def _create_admin_user(user_in: UserCreate, normalized_email: str) -> dict:
    """Create user via admin API with proper name handling."""
    if user_in.first_name and user_in.last_name:
        return admin_create_user(
            normalized_email,
            user_in.password,
            first_name=user_in.first_name.strip(),
            last_name=user_in.last_name.strip(),
            role=user_in.role,
            email_confirm=True,
        )
    else:
        return admin_create_user(
            normalized_email,
            user_in.password,
            full_name=(user_in.full_name or "").strip(),
            role=user_in.role,
            email_confirm=True,
        )


def _create_regular_user(user_in: UserCreate, normalized_email: str) -> dict:
    """Create user via regular signup with proper name handling."""
    if user_in.first_name and user_in.last_name:
        return sign_up_user(
            email=normalized_email,
            password=user_in.password,
            first_name=user_in.first_name.strip(),
            last_name=user_in.last_name.strip(),
            role=user_in.role,
        )
    else:
        return sign_up_user(
            email=normalized_email,
            password=user_in.password,
            full_name=(user_in.full_name or "").strip(),
            role=user_in.role,
        )


@router.post("/register", response_model=dict, status_code=status.HTTP_201_CREATED)
def register(user_in: UserCreate):
    try:
        normalized_email = user_in.email.strip().lower()

        if settings.ENV != "production" and settings.DEV_BYPASS_EMAIL_CONFIRM:
            return _handle_dev_bypass_registration(user_in, normalized_email)

        return _create_regular_user(user_in, normalized_email)

    except ValueError as e:
        detail = e.args[0] if e.args else {"message": "Error en registro"}
        code = detail.get("status", 400) if isinstance(detail, dict) else 400
        raise HTTPException(status_code=code, detail=detail)


def _handle_email_confirmation_bypass(
    email: str, password: str, detail: dict
) -> Optional[dict]:
    """Handle email confirmation bypass for development environment."""
    if not (
        isinstance(detail, dict)
        and (detail.get("detail") or {}).get("error_code") == "email_not_confirmed"
        and settings.ENV != "production"
        and settings.DEV_BYPASS_EMAIL_CONFIRM
    ):
        return None

    bypass_list = [
        x.strip().lower()
        for x in (settings.DEV_BYPASS_EMAILS or "").split(",")
        if x.strip()
    ]

    if email in set(bypass_list):
        try:
            admin_confirm_user_by_email(email)
            return sign_in_user(email, password)
        except Exception:
            pass

    return None


@router.post("/login", response_model=dict)
def login(form: LoginPayload):
    email = form.email.strip().lower()
    password = form.password

    if not email or not password:
        raise HTTPException(
            status_code=400, detail={"message": "Credenciales inválidas"}
        )

    try:
        return sign_in_user(email, password)
    except ValueError as e:
        detail = e.args[0] if e.args else {"message": "Error de autenticación"}

        # Try bypass if applicable
        bypass_result = _handle_email_confirmation_bypass(email, password, detail)
        if bypass_result:
            return bypass_result

        code = detail.get("status", 401) if isinstance(detail, dict) else 401
        raise HTTPException(status_code=code, detail=detail)


@router.post("/refresh", response_model=dict)
def refresh(form: dict):
    token = form.get("refresh_token")
    if not token:
        raise HTTPException(
            status_code=400, detail={"message": "refresh_token requerido"}
        )
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
        raise HTTPException(
            status_code=400, detail={"message": "access_token requerido"}
        )
    try:
        logout(access_token)
        return {"ok": True}
    except ValueError as e:
        detail = e.args[0] if e.args else {"message": "No se pudo cerrar sesión"}
        code = detail.get("status", 401) if isinstance(detail, dict) else 401
        raise HTTPException(status_code=code, detail=detail)


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
def update_password(
    payload: UpdatePasswordPayload,
    token: str = Depends(reuseable_oauth),
    user: dict = Depends(get_current_user),
):
    try:
        # Validar current_password intentando login
        sign_in_user((user or {}).get("email") or "", payload.current_password)
    except Exception:
        raise HTTPException(
            status_code=400, detail={"message": "Contraseña actual incorrecta"}
        )
    try:
        result = update_user_self(token, new_password=payload.new_password)
        return {"ok": True, "user": result}
    except ValueError as e:
        detail = (
            e.args[0] if e.args else {"message": "No se pudo actualizar contraseña"}
        )
        code = detail.get("status", 400) if isinstance(detail, dict) else 400
        raise HTTPException(status_code=code, detail=detail)


@router.put("/profile", response_model=dict)
def update_profile(
    payload: UpdateProfilePayload, token: str = Depends(reuseable_oauth)
):
    try:
        result = update_user_self(
            token,
            first_name=payload.first_name,
            last_name=payload.last_name,
            phone=payload.phone,
        )
        return {"ok": True, "user": result}
    except ValueError as e:
        detail = e.args[0] if e.args else {"message": "No se pudo actualizar perfil"}
        code = detail.get("status", 400) if isinstance(detail, dict) else 400
        raise HTTPException(status_code=code, detail=detail)


# ====== Admin: actualizar rol ======
@router.put(
    "/role", dependencies=[Depends(require_roles("admin"))], response_model=dict
)
def admin_update_role(payload: UpdateRolePayload):
    updated = admin_update_user_by_email(
        payload.email.strip().lower(), role=payload.role
    )
    if not updated:
        raise HTTPException(
            status_code=400,
            detail={"message": "No se pudo actualizar rol (¿service_role válido?)"},
        )
    return {"ok": True, "user": updated}
