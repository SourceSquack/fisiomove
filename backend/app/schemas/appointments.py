from __future__ import annotations
from datetime import datetime
from typing import Optional, Literal, Any
from pydantic import BaseModel, Field, ConfigDict, field_serializer


# Definir los tipos de cita disponibles
AppointmentTypeEnum = Literal[
    "evaluacion_inicial",
    "fisioterapia",
    "rehabilitacion",
    "seguimiento",
    "consulta",
    "otro",
]

AppointmentStatusEnum = Literal[
    "programada", "confirmada", "completada", "cancelada", "no_show"
]


class PatientInfo(BaseModel):
    """Información básica del paciente para mostrar en las citas"""

    id: str
    first_name: str
    last_name: str
    email: Optional[str] = None


class FisioInfo(BaseModel):
    """Información básica del fisioterapeuta para mostrar en las citas"""

    id: str
    first_name: str
    last_name: str
    email: Optional[str] = None


class AppointmentBase(BaseModel):
    start_time: datetime
    duration_minutes: int = Field(ge=1, le=24 * 60)
    patient_id: str = Field(min_length=1)
    fisio_id: Optional[str] = Field(default=None, min_length=1)
    appointment_type: AppointmentTypeEnum = Field(default="consulta")


class AppointmentCreate(AppointmentBase):
    fisio_id: Optional[str] = Field(default=None)


class AppointmentUpdate(BaseModel):
    start_time: Optional[datetime] = None
    duration_minutes: Optional[int] = Field(default=None, ge=1, le=24 * 60)
    patient_id: Optional[str] = None
    fisio_id: Optional[str] = None
    appointment_type: Optional[AppointmentTypeEnum] = None
    status: Optional[AppointmentStatusEnum] = None


class AppointmentRead(BaseModel):
    id: int
    start_time: datetime
    duration_minutes: int
    patient_id: str
    fisio_id: Optional[str] = None
    appointment_type: str
    status: str
    created_at: datetime
    updated_at: datetime

    # Información adicional del paciente y fisioterapeuta
    patient: Optional[PatientInfo] = None
    fisio: Optional[FisioInfo] = None

    model_config = ConfigDict(from_attributes=True)
