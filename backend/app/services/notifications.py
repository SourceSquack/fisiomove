from sqlalchemy.orm import Session
from app.models.notification import Notification
from app.schemas.notifications import (
    NotificationCreate,
    NotificationUpdate,
    NotificationType,
)
import datetime
import datetime


def get_notifications_by_cita(db: Session, cita_id: int):
    """
    Devuelve todas las notificaciones relacionadas a una cita específica.
    """
    from app.models.notification import Notification

    return db.query(Notification).filter(Notification.related_cita_id == cita_id).all()


def create_notification(db: Session, notification: NotificationCreate):
    from app.models.notification import Notification

    db_notification = Notification(
        user_id=notification.user_id,
        type=(
            notification.type.value
            if isinstance(notification.type, NotificationType)
            else notification.type
        ),
        message=notification.message,
        related_appointment_id=notification.related_cita_id,
        created_at=datetime.datetime.now(datetime.timezone.utc),
        is_read=False,
    )
    db.add(db_notification)
    db.commit()
    db.refresh(db_notification)
    return db_notification


# --- Servicios de negocio para notificaciones ---


def notify_cita_pendiente_asignacion(
    db: Session,
    cita_id: int,
    admin_ids: list[int],
    fisio_ids: list[int],
):
    message = f"Cita #{cita_id} pendiente de asignación"
    for user_id in admin_ids + fisio_ids:
        notification = NotificationCreate(
            user_id=user_id,
            type=NotificationType.CITA_PENDIENTE_ASIGNACION,
            message=message,
            related_cita_id=cita_id,
        )
        create_notification(db, notification)


def notify_cita_asignada(db: Session, cita_id: int, paciente_id: int, fisio_id: int):
    message = f"Cita #{cita_id} asignada"
    for user_id in [paciente_id, fisio_id]:
        notification = NotificationCreate(
            user_id=user_id,
            type=NotificationType.CITA_ASIGNADA,
            message=message,
            related_cita_id=cita_id,
        )
        create_notification(db, notification)


def notify_cita_tomada(
    db: Session, cita_id: int, paciente_id: int, admin_ids: list[int]
):
    message = f"Cita #{cita_id} tomada por fisioterapeuta"
    for user_id in [paciente_id] + admin_ids:
        notification = NotificationCreate(
            user_id=user_id,
            type=NotificationType.CITA_TOMADA,
            message=message,
            related_cita_id=cita_id,
        )
        create_notification(db, notification)


def notify_cita_modificada(db: Session, cita_id: int, user_ids: list[int]):
    message = f"Cita #{cita_id} modificada"
    for user_id in user_ids:
        notification = NotificationCreate(
            user_id=user_id,
            type=NotificationType.CITA_MODIFICADA,
            message=message,
            related_cita_id=cita_id,
        )
        create_notification(db, notification)


def notify_cita_cancelada(db: Session, cita_id: int, user_ids: list[int]):
    message = f"Cita #{cita_id} cancelada"
    for user_id in user_ids:
        notification = NotificationCreate(
            user_id=user_id,
            type=NotificationType.CITA_CANCELADA,
            message=message,
            related_cita_id=cita_id,
        )
        create_notification(db, notification)


def notify_cita_recordatorio(db: Session, cita_id: int, user_ids: list[int]):
    message = f"Recordatorio: cita #{cita_id} próxima"
    for user_id in user_ids:
        notification = NotificationCreate(
            user_id=user_id,
            type=NotificationType.CITA_RECORDATORIO,
            message=message,
            related_cita_id=cita_id,
        )
        create_notification(db, notification)


def list_notifications(db: Session, user_id: int):
    return db.query(Notification).filter(Notification.usuario_id == user_id).all()


def mark_notification_as_read(db: Session, notification_id: int):
    notification = (
        db.query(Notification).filter(Notification.id == notification_id).first()
    )
    if notification:
        notification.leida = True
        db.commit()
        db.refresh(notification)
    return notification
