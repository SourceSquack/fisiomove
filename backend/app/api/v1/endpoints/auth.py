from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.schemas.auth import UserCreate, UserRead, Token
from app.services.users import create_user, get_by_email
from app.services.security import verify_password, create_access_token

router = APIRouter()

@router.post("/register", response_model=UserRead, status_code=status.HTTP_201_CREATED)
def register(user_in: UserCreate, db: Session = Depends(get_db)):
    existing = get_by_email(db, user_in.email)
    if existing:
        raise HTTPException(status_code=400, detail="Email ya registrado")
    user = create_user(db, user_in)
    return user

@router.post("/login", response_model=Token)
def login(form: UserCreate | dict, db: Session = Depends(get_db)):
    if isinstance(form, UserCreate):
        email = form.email
        password = form.password
    else:
        email = form.get("email")
        password = form.get("password")

    if not email or not password:
        raise HTTPException(status_code=400, detail="Credenciales inválidas")

    user = get_by_email(db, email)
    if not user or not verify_password(password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Email o contraseña incorrectos")

    token = create_access_token(subject=user.id)
    return {"access_token": token, "token_type": "bearer"}