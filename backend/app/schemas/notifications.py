from datetime import datetime
from pydantic import BaseModel


class NotificationBase(BaseModel):
    tipo: str
    mensaje: str
    usuario_id: int


class NotificationCreate(NotificationBase):
    pass


class NotificationUpdate(BaseModel):
    leida: bool


class NotificationRead(NotificationBase):
    id: int
    leida: bool
    fecha: datetime

    class Config:
        orm_mode = True
