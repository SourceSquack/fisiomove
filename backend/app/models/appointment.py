from __future__ import annotations

from datetime import datetime, timedelta
from enum import Enum

from sqlalchemy import Column, DateTime, Enum as SAEnum, Integer, String, Index
from sqlalchemy.sql import func

from app.db.base import Base


class AppointmentStatus(str, Enum):
    programada = "programada"
    cancelada = "cancelada"
    completada = "completada"


class Appointment(Base):
    __tablename__ = "appointments"

    id = Column(Integer, primary_key=True, index=True)
    start_time = Column(DateTime(timezone=True), nullable=False, index=True)
    duration_minutes = Column(Integer, nullable=False)

    patient_id = Column(String(64), nullable=False, index=True)
    fisio_id = Column(String(64), nullable=False, index=True)

    status = Column(
        SAEnum(AppointmentStatus, name="appointment_status"),
        nullable=False,
        default=AppointmentStatus.programada,
    )

    created_at = Column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )

    __table_args__ = (
        Index("ix_appointments_fisio_start", "fisio_id", "start_time"),
        Index("ix_appointments_patient_start", "patient_id", "start_time"),
    )

    @property
    def end_time(self) -> datetime:
        return self.start_time + timedelta(minutes=self.duration_minutes)
