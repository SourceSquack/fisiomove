from fastapi import APIRouter, HTTPException, status
from pydantic import EmailStr
from supabase_config import supabase

router = APIRouter()


@router.post("/users")
def create_user_route(email: EmailStr, password: str):
    """Crear usuario vía Supabase auth.

    Riesgos y recomendaciones:
    - Esta ruta no valida fuerza de contraseña ni aplica rate limiting.
    - Recomendado: validar password strength, aplicar rate limit y usar challenge (captcha)
        para mitigar bots.
    - No exponga errores detallados de autenticación al cliente (evitar enumeración de usuarios).
    """
    # Input validated por EmailStr. Se recomienda validar password y longitud mínima.
    try:
        return supabase.auth.sign_up(email=email, password=password)
    except Exception:
        # No devolver error detallado que pueda ayudar a un atacante en producción
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error creating user",
        )


@router.get("/users/{email}")
def get_user_route(email: EmailStr):
    """Obtener usuario por email.

    Recomendación: Este endpoint puede permitir enumeración de usuarios. En producción
    considere autenticar/autorizar quien puede consultar y devolver respuestas genéricas
    (p. ej. 404 sin indicar si existe o no).
    """
    try:
        user = supabase.auth.get_user_by_email(email=email)
        if user:
            return user
        # Evitar dar pistas sobre existencia de usuario
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="User not found"
        )
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error fetching user",
        )
