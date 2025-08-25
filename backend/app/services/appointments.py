from __future__ import annotations
from datetime import datetime, timedelta, timezone
from typing import List, Optional

from sqlalchemy.orm import Session
from sqlalchemy import or_

from app.models.user import User
from app.models.appointment import Appointment, AppointmentStatus, AppointmentType
from app.services.notifications import (
    create_notification,
    notify_cita_asignada,
    notify_cita_pendiente_asignacion,
    notify_cita_modificada,
    notify_cita_cancelada,
)
from app.services.users import get_users_by_ids
from app.services.patients import get_patients_by_ids
from app.schemas.notifications import NotificationCreate
from app.schemas.appointments import AppointmentRead, PatientInfo, FisioInfo


def _naive_utc(dt: datetime) -> datetime:
    if dt.tzinfo is None:
        return dt
    return dt.astimezone(timezone.utc).replace(tzinfo=None)


def _split_full_name(full_name: str) -> tuple[str, str]:
    """Divide un nombre completo en first_name y last_name"""
    if not full_name:
        return "", ""

    parts = full_name.strip().split()
    if len(parts) == 0:
        return "", ""
    elif len(parts) == 1:
        return parts[0], ""
    else:
        # Primera palabra es first_name, el resto es last_name
        first_name = parts[0]
        last_name = " ".join(parts[1:])
        return first_name, last_name


def has_conflict(
    db: Session,
    *,
    fisio_id: str,
    start: datetime,
    end: datetime,
    exclude_id: Optional[int] = None,
) -> bool:
    # Ensure consistent timezone handling by normalizing to naive UTC
    start_n = _naive_utc(start)
    end_n = _naive_utc(end)

    day_start = start_n.replace(hour=0, minute=0, second=0, microsecond=0) - timedelta(
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
        ap_start = _naive_utc(ap.start_time)
        ap_end = ap_start + timedelta(minutes=ap.duration_minutes)
        if start_n < ap_end and end_n > ap_start:
            return True
    return False


def create_appointment(
    db: Session,
    *,
    start_time: datetime,
    duration_minutes: int,
    patient_id: str,
    fisio_id: Optional[str] = None,
    appointment_type: AppointmentType = AppointmentType.consulta,
) -> Appointment:
    # Solo verificar conflictos si hay un fisioterapeuta asignado
    if fisio_id:
        end_time = start_time + timedelta(minutes=duration_minutes)
        if has_conflict(db, fisio_id=fisio_id, start=start_time, end=end_time):
            raise ValueError("Conflicto de horario con otra cita")

    ap = Appointment(
        start_time=start_time,
        duration_minutes=duration_minutes,
        patient_id=patient_id,
        fisio_id=fisio_id,
        appointment_type=appointment_type,
        status=AppointmentStatus.programada,
    )
    db.add(ap)
    db.commit()
    db.refresh(ap)

    if fisio_id:
        # Notificar cita asignada (paciente y fisioterapeuta)
        notify_cita_asignada(db, ap.id, int(patient_id), int(fisio_id))
    else:
        # Notificar cita pendiente de asignación (paciente, admins y fisios)
        admins = db.query(User).filter(User.role == "admin").all()
        fisios = db.query(User).filter(User.role == "fisioterapeuta").all()
        admin_ids = [u.id for u in admins]
        fisio_ids = [u.id for u in fisios]
        notify_cita_pendiente_asignacion(db, ap.id, admin_ids, fisio_ids)

    return ap


def _build_appointments_query(
    db: Session, date: Optional[datetime] = None, user_id: Optional[str] = None
) -> List[Appointment]:
    """Build and execute the appointments query with optional filters."""
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


def _extract_ids_from_appointments(
    appointments: List[Appointment],
) -> tuple[List[int], List[str]]:
    """Extract patient IDs and fisio IDs from appointments list."""
    patient_ids = []
    fisio_ids = []
    for ap in appointments:
        if ap.patient_id:
            try:
                patient_ids.append(int(ap.patient_id))
            except (ValueError, TypeError):
                print(f"Warning: patient_id {ap.patient_id} no es un entero válido")
        if ap.fisio_id:
            fisio_ids.append(ap.fisio_id)
    return patient_ids, fisio_ids


def _create_patient_info(ap: Appointment, patients_info: dict) -> Optional[PatientInfo]:
    """Create PatientInfo object from appointment and patients data."""
    try:
        patient_id_int = int(ap.patient_id)
        if patient_id_int in patients_info:
            patient = patients_info[patient_id_int]
            first_name, last_name = _split_full_name(patient.full_name or "")
            return PatientInfo(
                id=str(patient.id),
                first_name=first_name,
                last_name=last_name,
                email=patient.email or "",
            )
    except (ValueError, TypeError):
        print(f"Warning: No se pudo procesar patient_id {ap.patient_id}")
    return None


def _create_fisio_info(ap: Appointment, fisios_info: dict) -> Optional[FisioInfo]:
    """Create FisioInfo object from appointment and fisios data."""
    if ap.fisio_id and ap.fisio_id in fisios_info:
        fisio = fisios_info[ap.fisio_id]
        return FisioInfo(
            id=fisio.id,
            first_name=fisio.first_name or "",
            last_name=fisio.last_name or "",
            email=fisio.email,
        )
    return None


def _create_appointment_read(
    ap: Appointment,
    patient_info: Optional[PatientInfo],
    fisio_info: Optional[FisioInfo],
) -> AppointmentRead:
    """Create AppointmentRead object from appointment and related info."""
    return AppointmentRead(
        id=ap.id,
        start_time=ap.start_time,
        duration_minutes=ap.duration_minutes,
        patient_id=ap.patient_id,
        fisio_id=ap.fisio_id,
        appointment_type=ap.appointment_type.value,
        status=ap.status.value,
        created_at=ap.created_at,
        updated_at=ap.updated_at,
        patient=patient_info,
        fisio=fisio_info,
    )


def list_appointments(
    db: Session, *, date: Optional[datetime] = None, user_id: Optional[str] = None
) -> List[AppointmentRead]:
    appointments = _build_appointments_query(db, date, user_id)
    patient_ids, fisio_ids = _extract_ids_from_appointments(appointments)

    # Obtener información de pacientes y fisioterapeutas por separado
    patients_info = get_patients_by_ids(db, patient_ids) if patient_ids else {}
    fisios_info = get_users_by_ids(db, fisio_ids) if fisio_ids else {}

    result = []
    for ap in appointments:
        patient_info = _create_patient_info(ap, patients_info)
        fisio_info = _create_fisio_info(ap, fisios_info)
        appointment_read = _create_appointment_read(ap, patient_info, fisio_info)
        result.append(appointment_read)

    return result


def update_appointment(
    db: Session,
    ap: Appointment,
    *,
    start_time: Optional[datetime] = None,
    duration_minutes: Optional[int] = None,
    patient_id: Optional[str] = None,
    fisio_id: Optional[str] = None,
    appointment_type: Optional[str] = None,
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
    if appointment_type is not None:
        ap.appointment_type = AppointmentType(appointment_type)
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
    # Notificar modificación a todos los involucrados
    user_ids = []
    if ap.patient_id:
        user_ids.append(int(ap.patient_id))
    if ap.fisio_id:
        user_ids.append(int(ap.fisio_id))
    notify_cita_modificada(db, ap.id, user_ids)
    return ap


def get_appointment(db: Session, ap_id: int) -> Optional[Appointment]:
    return db.query(Appointment).filter(Appointment.id == ap_id).first()


def cancel_appointment(db: Session, ap: Appointment) -> AppointmentRead:
    ap.status = AppointmentStatus.cancelada
    db.add(ap)
    db.commit()
    db.refresh(ap)
    # Notificar cancelación a todos los involucrados
    user_ids = []
    if ap.patient_id:
        user_ids.append(int(ap.patient_id))
    if ap.fisio_id:
        user_ids.append(int(ap.fisio_id))
    notify_cita_cancelada(db, ap.id, user_ids)

    # Obtener información del paciente y fisioterapeuta para la respuesta
    users_info = get_users_by_ids(
        db, [ap.patient_id, ap.fisio_id] if ap.fisio_id else [ap.patient_id]
    )

    # Información del paciente
    patient_info = None
    if ap.patient_id in users_info:
        patient = users_info[ap.patient_id]
        patient_info = PatientInfo(
            id=patient.id,
            first_name=patient.first_name or "",
            last_name=patient.last_name or "",
            email=patient.email,
        )

    # Información del fisioterapeuta
    fisio_info = None
    if ap.fisio_id and ap.fisio_id in users_info:
        fisio = users_info[ap.fisio_id]
        fisio_info = FisioInfo(
            id=fisio.id,
            first_name=fisio.first_name or "",
            last_name=fisio.last_name or "",
            email=fisio.email,
        )

    # Crear el objeto AppointmentRead con toda la información
    return AppointmentRead(
        id=ap.id,
        start_time=ap.start_time,
        duration_minutes=ap.duration_minutes,
        patient_id=ap.patient_id,
        fisio_id=ap.fisio_id,
        appointment_type=ap.appointment_type.value,  # Convertir enum a string
        status=ap.status.value,  # Convertir enum a string
        created_at=ap.created_at,
        updated_at=ap.updated_at,
        patient=patient_info,
        fisio=fisio_info,
    )


def delete_appointment(db: Session, ap: Appointment) -> AppointmentRead:
    # Obtener información del paciente y fisioterapeuta antes de eliminar
    users_info = get_users_by_ids(
        db, [ap.patient_id, ap.fisio_id] if ap.fisio_id else [ap.patient_id]
    )

    # Información del paciente
    patient_info = None
    if ap.patient_id in users_info:
        patient = users_info[ap.patient_id]
        patient_info = PatientInfo(
            id=patient.id,
            first_name=patient.first_name or "",
            last_name=patient.last_name or "",
            email=patient.email,
        )

    # Información del fisioterapeuta
    fisio_info = None
    if ap.fisio_id and ap.fisio_id in users_info:
        fisio = users_info[ap.fisio_id]
        fisio_info = FisioInfo(
            id=fisio.id,
            first_name=fisio.first_name or "",
            last_name=fisio.last_name or "",
            email=fisio.email,
        )

    # Crear el objeto de respuesta antes de eliminar
    appointment_read = AppointmentRead(
        id=ap.id,
        start_time=ap.start_time,
        duration_minutes=ap.duration_minutes,
        patient_id=ap.patient_id,
        fisio_id=ap.fisio_id,
        appointment_type=ap.appointment_type.value,  # Convertir enum a string
        status=ap.status.value,  # Convertir enum a string
        created_at=ap.created_at,
        updated_at=ap.updated_at,
        patient=patient_info,
        fisio=fisio_info,
    )

    # Notificar antes de eliminar
    user_ids = []
    if ap.patient_id:
        user_ids.append(int(ap.patient_id))
    if ap.fisio_id:
        user_ids.append(int(ap.fisio_id))
    notify_cita_cancelada(db, ap.id, user_ids)

    # Eliminar la cita de la base de datos
    db.delete(ap)
    db.commit()

    return appointment_read

    # ...existing code...
