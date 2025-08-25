import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.models.notification import Notification
from app.models.appointment import Appointment
from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()
from app.schemas.notifications import NotificationCreate, NotificationType
from app.services.notifications import create_notification
import datetime

# Configuración de base de datos en memoria para pruebas

DATABASE_URL = "sqlite:///:memory:"
engine = create_engine(DATABASE_URL)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


@pytest.fixture(scope="module")
def db():
    # Crear las tablas necesarias para ForeignKey
    Notification.__table__.create(bind=engine, checkfirst=True)
    Appointment.__table__.create(bind=engine, checkfirst=True)
    db = TestingSessionLocal()
    yield db
    db.close()


def test_notification_table_exists(db):
    # Verifica que la tabla de notificaciones existe
    from sqlalchemy import inspect

    inspector = inspect(engine)
    tables = inspector.get_table_names()
    assert "notifications" in tables


def test_create_notification(db):
    # Crear una notificación y verificar que se persiste
    notif = NotificationCreate(
        user_id=1,
        type=NotificationType.CITA_ASIGNADA,
        message="Test message",
        related_cita_id=123,
    )
    result = create_notification(db, notif)
    assert result is not None
    assert result.user_id == 1
    assert (
        result.type == NotificationType.CITA_ASIGNADA.value
        or result.type == NotificationType.CITA_ASIGNADA
    )
    assert result.message == "Test message"
    assert result.related_appointment_id == 123
    assert isinstance(result.created_at, datetime.datetime)
    assert result.is_read is False


def test_notification_persistence(db):
    # Verifica que la notificación está en la base
    notifs = db.query(Notification).all()
    assert len(notifs) > 0
    notif = notifs[0]
    assert notif.user_id == 1
    assert notif.message == "Test message"
    assert notif.related_appointment_id == 123
