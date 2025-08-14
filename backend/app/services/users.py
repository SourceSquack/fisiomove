from sqlalchemy.orm import Session
from typing import Optional, Dict, List

from app.models.user import User, UserRole
from app.schemas.auth import UserCreate
from app.services.security import get_password_hash


def get_by_email(db: Session, email: str) -> Optional[User]:
    return db.query(User).filter(User.email == email).first()


def get_by_id(db: Session, user_id: str) -> Optional[User]:
    """Obtener usuario por ID (compatible con Supabase UUID)"""
    return db.query(User).filter(User.id == user_id).first()


def get_users_by_ids(db: Session, user_ids: List[str]) -> Dict[str, User]:
    """Obtener múltiples usuarios por sus IDs y devolver un diccionario para acceso rápido"""
    users = db.query(User).filter(User.id.in_(user_ids)).all()
    return {user.id: user for user in users}


def create_user(db: Session, data: UserCreate) -> User:
    user = User(
        email=data.email,
        full_name=data.full_name,
        first_name=data.first_name,
        last_name=data.last_name,
        role=UserRole(data.role),
        hashed_password=get_password_hash(data.password),
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user
