from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from supabase.gotrue import get_user_from_token

from app.core.config import settings
from app.db.session import get_db

reuseable_oauth = OAuth2PasswordBearer(
    tokenUrl=f"{settings.API_V1_STR}/auth/login",
    scheme_name="JWT",
)

def get_current_user(token: str = Depends(reuseable_oauth), db: Session = Depends(get_db)):
    try:
        data = get_user_from_token(token)
        return data
    except Exception:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token inválido o expirado")

def require_roles(*roles: str):
    def _checker(user = Depends(get_current_user)):
        # si guardas role en user_metadata.role lo validamos aquí
        meta = (user or {}).get("user_metadata", {})
        role = meta.get("role")
        if roles and role not in roles:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Permisos insuficientes")
        return user

    return _checker
