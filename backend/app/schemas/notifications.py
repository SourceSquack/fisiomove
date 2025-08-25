from datetime import datetime
from enum import Enum
from pydantic import BaseModel


class NotificationType(str, Enum):
    CITA_PENDIENTE_ASIGNACION = "cita_pendiente_asignacion"
    CITA_ASIGNADA = "cita_asignada"
    CITA_TOMADA = "cita_tomada"
    CITA_MODIFICADA = "cita_modificada"
    CITA_CANCELADA = "cita_cancelada"
    CITA_RECORDATORIO = "cita_recordatorio"


class NotificationBase(BaseModel):
    type: NotificationType
    message: str
    user_id: int
    related_cita_id: int | None = None


class NotificationCreate(NotificationBase):
    pass


class NotificationUpdate(BaseModel):
    is_read: bool


class NotificationRead(NotificationBase):
    id: int
    is_read: bool
    date: datetime

    class Config:
        orm_mode = True
