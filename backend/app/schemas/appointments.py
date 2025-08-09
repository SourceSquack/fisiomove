from __future__ import annotations
from datetime import datetime
from typing import Optional, Literal
from pydantic import BaseModel, Field


class AppointmentBase(BaseModel):
    start_time: datetime
    duration_minutes: int = Field(ge=1, le=24 * 60)
    patient_id: str = Field(min_length=1)
    fisio_id: str = Field(min_length=1)


class AppointmentCreate(AppointmentBase):
    pass


class AppointmentUpdate(BaseModel):
    start_time: Optional[datetime] = None
    duration_minutes: Optional[int] = Field(default=None, ge=1, le=24 * 60)
    patient_id: Optional[str] = None
    fisio_id: Optional[str] = None
    status: Optional[Literal["programada", "cancelada", "completada"]] = None


class AppointmentRead(AppointmentBase):
    id: int
    status: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
