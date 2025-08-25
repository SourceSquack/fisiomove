from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.schemas.notifications import NotificationRead
from app.services.notifications import (
    list_notifications,
    mark_notification_as_read,
    get_notifications_by_cita,
)
from app.services.auth import get_current_user

router = APIRouter()


@router.get("/notifications", response_model=list[NotificationRead])
def get_notifications(
    db: Session = Depends(get_db), user: dict = Depends(get_current_user)
):
    return list_notifications(db, user_id=user["id"])


@router.get("/notifications/by-cita/{cita_id}", response_model=list[NotificationRead])
def get_notifications_by_cita_id(
    cita_id: int,
    db: Session = Depends(get_db),
    user: dict = Depends(get_current_user),
):
    # Opcional: podrías validar que el usuario tenga acceso a la cita
    return get_notifications_by_cita(db, cita_id)


@router.patch("/notifications/{id}", response_model=NotificationRead)
def update_notification(
    id: int,
    db: Session = Depends(get_db),
):
    notification = mark_notification_as_read(db, id)
    if not notification:
        raise HTTPException(status_code=404, detail="Notificación no encontrada")
    return notification
