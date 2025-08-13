from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.schemas.notifications import NotificationRead, NotificationUpdate
from app.services.notifications import (
    create_notification,
    list_notifications,
    mark_notification_as_read,
)
from app.services.auth import get_current_user

router = APIRouter()


@router.get("/notificaciones", response_model=list[NotificationRead])
def get_notifications(
    db: Session = Depends(get_db), user: dict = Depends(get_current_user)
):
    return list_notifications(db, user_id=user["id"])


@router.patch("/notificaciones/{id}", response_model=NotificationRead)
def update_notification(
    id: int,
    payload: NotificationUpdate,
    db: Session = Depends(get_db),
    user: dict = Depends(get_current_user),
):
    notification = mark_notification_as_read(db, id)
    if not notification:
        raise HTTPException(status_code=404, detail="Notificación no encontrada")
    return notification
