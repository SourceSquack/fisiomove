from sqlalchemy.orm import Session
from app.models.notification import Notification
from app.schemas.notifications import NotificationCreate, NotificationUpdate


def create_notification(db: Session, notification: NotificationCreate):
    db_notification = Notification(**notification.dict())
    db.add(db_notification)
    db.commit()
    db.refresh(db_notification)
    return db_notification


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
