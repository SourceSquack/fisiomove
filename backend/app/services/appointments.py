from __future__ import annotations
from datetime import datetime, timedelta
from typing import List, Optional

from sqlalchemy.orm import Session
from sqlalchemy import or_

from app.models.appointment import Appointment, AppointmentStatus


def has_conflict(
    db: Session,
    *,
    fisio_id: str,
    start: datetime,
    end: datetime,
    exclude_id: Optional[int] = None,
) -> bool:
    day_start = start.replace(hour=0, minute=0, second=0, microsecond=0) - timedelta(
        days=1
    )
    day_end = day_start + timedelta(days=3)
    q = (
        db.query(Appointment)
        .filter(Appointment.fisio_id == fisio_id)
        .filter(Appointment.start_time >= day_start, Appointment.start_time < day_end)
    )
    if exclude_id is not None:
        q = q.filter(Appointment.id != exclude_id)
    candidates = q.all()
    for ap in candidates:
        ap_end = ap.start_time + timedelta(minutes=ap.duration_minutes)
        if start < ap_end and end > ap.start_time:
            return True
    return False


def create_appointment(
    db: Session,
    *,
    start_time: datetime,
    duration_minutes: int,
    patient_id: str,
    fisio_id: str,
) -> Appointment:
    end_time = start_time + timedelta(minutes=duration_minutes)
    if has_conflict(db, fisio_id=fisio_id, start=start_time, end=end_time):
        raise ValueError("Conflicto de horario con otra cita")
    ap = Appointment(
        start_time=start_time,
        duration_minutes=duration_minutes,
        patient_id=patient_id,
        fisio_id=fisio_id,
        status=AppointmentStatus.programada,
    )
    db.add(ap)
    db.commit()
    db.refresh(ap)
    return ap


def list_appointments(
    db: Session, *, date: Optional[datetime] = None, user_id: Optional[str] = None
) -> List[Appointment]:
    q = db.query(Appointment)
    if date:
        day_start = date.replace(hour=0, minute=0, second=0, microsecond=0)
        day_end = day_start + timedelta(days=1)
        q = q.filter(
            Appointment.start_time >= day_start, Appointment.start_time < day_end
        )
    if user_id:
        q = q.filter(
            or_(Appointment.patient_id == user_id, Appointment.fisio_id == user_id)
        )
    return q.order_by(Appointment.start_time.asc()).all()


def update_appointment(
    db: Session,
    ap: Appointment,
    *,
    start_time: Optional[datetime] = None,
    duration_minutes: Optional[int] = None,
    patient_id: Optional[str] = None,
    fisio_id: Optional[str] = None,
    status: Optional[str] = None,
) -> Appointment:
    if start_time is not None:
        ap.start_time = start_time
    if duration_minutes is not None:
        ap.duration_minutes = duration_minutes
    if patient_id is not None:
        ap.patient_id = patient_id
    if fisio_id is not None:
        ap.fisio_id = fisio_id
    if status is not None:
        ap.status = AppointmentStatus(status)

    end_time = ap.start_time + timedelta(minutes=ap.duration_minutes)
    if has_conflict(
        db, fisio_id=ap.fisio_id, start=ap.start_time, end=end_time, exclude_id=ap.id
    ):
        raise ValueError("Conflicto de horario con otra cita")

    db.add(ap)
    db.commit()
    db.refresh(ap)
    return ap


def get_appointment(db: Session, ap_id: int) -> Optional[Appointment]:
    return db.query(Appointment).filter(Appointment.id == ap_id).first()


def cancel_appointment(db: Session, ap: Appointment) -> Appointment:
    ap.status = AppointmentStatus.cancelada
    db.add(ap)
    db.commit()
    db.refresh(ap)
    return ap
