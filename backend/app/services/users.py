from sqlalchemy.orm import Session
from typing import Optional

from app.models.user import User, UserRole
from app.schemas.auth import UserCreate
from app.services.security import get_password_hash

def get_by_email(db: Session, email: str) -> Optional[User]:
    return db.query(User).filter(User.email == email).first()

def create_user(db: Session, data: UserCreate) -> User:
    user = User(
        email=data.email,
        full_name=data.full_name,
        role=UserRole(data.role),
        hashed_password=get_password_hash(data.password),
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user