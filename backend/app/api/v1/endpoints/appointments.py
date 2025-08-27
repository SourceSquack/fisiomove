from __future__ import annotations
from datetime import datetime, timezone
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel
from sqlalchemy.orm import Session
import logging

from app.db.session import get_db
from app.schemas.appointments import (
    AppointmentCreate,
    AppointmentUpdate,
    AppointmentRead,
)
from app.services.appointments import (
    create_appointment,
    list_appointments,
    update_appointment,
    get_appointment,
    cancel_appointment,
    delete_appointment,
    is_time_slot_available,
)
from app.services.auth import get_current_user

router = APIRouter()
logger = logging.getLogger(__name__)


class CheckAvailabilityRequest(BaseModel):
    start_time: datetime
    duration_minutes: int
    patient_id: str
    fisio_id: Optional[str] = None
    exclude_id: Optional[int] = None


@router.post("/check-availability")
def check_availability(
    payload: CheckAvailabilityRequest,
    db: Session = Depends(get_db),
    user: dict = Depends(get_current_user),
):
    try:
        payload_dump = payload.model_dump()
    except Exception:
        payload_dump = str(payload)
    logger.debug(f"check_availability called payload={payload_dump}")
    # Interpretar datetimes naive como zona de la clínica (Bogotá, -05:00)
    from datetime import timedelta

    bogota = timezone(timedelta(hours=-5))
    start_time = payload.start_time
    if start_time.tzinfo is None:
        start_time = start_time.replace(tzinfo=bogota)
        logger.debug(f"Interpreted naive start_time as Bogotá {start_time.isoformat()}")

    available = is_time_slot_available(
        db,
        start_time=start_time,
        duration_minutes=payload.duration_minutes,
        patient_id=payload.patient_id,
        fisio_id=payload.fisio_id,
        exclude_id=payload.exclude_id,
    )
    return {"available": available}


@router.get("/availability")
def availability(
    date: Optional[datetime] = Query(
        None,
        description="Fecha a consultar (usa la parte de fecha, formato YYYY-MM-DD)",
    ),
    duration_minutes: int = Query(60, description="Duración en minutos de la cita"),
    patient_id: str = Query(
        ..., description="ID del paciente para verificar solapamientos"
    ),
    fisio_id: Optional[str] = Query(
        None, description="ID del fisioterapeuta (opcional)"
    ),
    start_hour: int = Query(8, description="Hora inicial del rango (0-23)"),
    end_hour: int = Query(18, description="Hora final del rango (0-23, exclusivo)"),
    step_minutes: int = Query(30, description="Paso entre franjas en minutos"),
    db: Session = Depends(get_db),
    user: dict = Depends(get_current_user),
):
    """
    Devuelve una lista consolidada de franjas disponibles para una fecha dada.
    Las franjas se devuelven como datetime ISO en UTC (ej: 2025-08-27T09:00:00Z).
    """
    if date is None:
        raise HTTPException(
            status_code=400, detail={"message": "Parámetro 'date' requerido"}
        )

    # Normalizar a la parte de fecha (ignoramos hora del parámetro si la trae)
    target_date = date.date() if hasattr(date, "date") else date

    from datetime import datetime, timezone, timedelta

    candidates: list[datetime] = []
    # Use Bogotá timezone (UTC-5)
    bogota_tz = timezone(timedelta(hours=-5))
    for hour in range(start_hour, end_hour):
        # crear slots por step dentro de la hora
        minute = 0
        while minute < 60:
            slot_dt = datetime(
                target_date.year,
                target_date.month,
                target_date.day,
                hour,
                minute,
                0,
                tzinfo=bogota_tz,
            )
            candidates.append(slot_dt)
            minute += step_minutes
            # si el siguiente minuto cruza la hora y supera end_hour, se parará por range

    available_slots: list[str] = []
    logger.debug(
        f"availability requested date={target_date} duration={duration_minutes} patient_id={patient_id}"
    )
    for cand in candidates:
        try:
            ok = is_time_slot_available(
                db,
                start_time=cand,
                duration_minutes=duration_minutes,
                patient_id=patient_id,
                fisio_id=fisio_id,
            )
        except Exception:
            ok = False
        if ok:
            # devolver en ISO con offset -05:00 (Bogotá) para que el cliente pueda parsearlo en zona local
            available_slots.append(cand.isoformat())

    return {"available_slots": available_slots}


quote_not_found_message = "Cita no encontrada"


@router.post("/", response_model=AppointmentRead, status_code=status.HTTP_201_CREATED)
def create_cita(
    payload: AppointmentCreate,
    db: Session = Depends(get_db),
    user: dict = Depends(get_current_user),
):
    try:
        payload_dump = payload.model_dump()
    except Exception:
        payload_dump = str(payload)
    logger.debug(f"create_cita payload={payload_dump}")
    try:
        # 1. Validar fecha (no en el pasado, formato correcto)
        now = datetime.now(timezone.utc)
        # Forzar timezone: si el cliente envía un datetime naive, lo interpretamos
        # como en la zona de la clínica (Bogotá, -05:00) para mantener consistencia
        from datetime import timedelta

        bogota = timezone(timedelta(hours=-5))

        if payload.start_time.tzinfo is None:
            # Interpretar naive como hora local de la clínica
            payload_start_time = payload.start_time.replace(tzinfo=bogota)
        else:
            payload_start_time = payload.start_time

        logger.debug(f"Interpreted start_time {payload_start_time.isoformat()}")

        if payload_start_time < now:
            raise HTTPException(
                status_code=400,
                detail={
                    "message": "La fecha/hora de la cita no puede ser en el pasado."
                },
            )

        # 2. Validar disponibilidad de horario (no hay otra cita en ese rango para el paciente/fisio)
        from app.services.appointments import is_time_slot_available

        slot_available = is_time_slot_available(
            db,
            start_time=payload_start_time,
            duration_minutes=payload.duration_minutes,
            patient_id=payload.patient_id,
            fisio_id=(
                payload.fisio_id
                if payload.fisio_id not in ["current_user", "string", ""]
                else None
            ),
        )
        if not slot_available:
            raise HTTPException(
                status_code=409,
                detail={"message": "El horario solicitado no está disponible."},
            )

        # 3. Validar tipo de proceso
        tipos_validos = {
            "rehabilitacion",
            "consulta",
            "evaluacion",
            "fisioterapia",
            "seguimiento",
        }
        if payload.appointment_type not in tipos_validos:
            raise HTTPException(
                status_code=400,
                detail={
                    "message": f"Tipo de cita inválido: {payload.appointment_type}"
                },
            )

        # Permitir citas sin fisioterapeuta asignado (pendientes de asignación)
        fisio_id = payload.fisio_id
        if not (fisio_id and fisio_id not in ["current_user", "string", ""]):
            fisio_id = None

        ap = create_appointment(
            db,
            start_time=payload_start_time,
            duration_minutes=payload.duration_minutes,
            patient_id=payload.patient_id,
            fisio_id=fisio_id,
            appointment_type=payload.appointment_type,
        )
        return ap
    except ValueError as e:
        logger.error(f"ValueError creating appointment: {str(e)}")
        raise HTTPException(status_code=400, detail={"message": str(e)})


@router.get("/", response_model=list[AppointmentRead])
def list_citas(
    date: Optional[datetime] = Query(
        None, description="Filtrar por día (usa cualquier hora de ese día)"
    ),
    user_id: Optional[str] = Query(
        None, description="Filtrar por usuario (paciente o fisio)"
    ),
    db: Session = Depends(get_db),
    user: dict = Depends(get_current_user),
):
    items = list_appointments(db, date=date, user_id=user_id)
    return items


@router.get("/{cita_id}", response_model=AppointmentRead)
def get_cita(
    cita_id: int,
    db: Session = Depends(get_db),
    user: dict = Depends(get_current_user),
):
    ap = get_appointment(db, cita_id)
    if not ap:
        raise HTTPException(
            status_code=404, detail={"message": quote_not_found_message}
        )
    return ap


@router.put("/{cita_id}", response_model=AppointmentRead)
def update_cita(
    cita_id: int,
    payload: AppointmentUpdate,
    db: Session = Depends(get_db),
    user: dict = Depends(get_current_user),
):
    ap = get_appointment(db, cita_id)
    if not ap:
        raise HTTPException(
            status_code=404, detail={"message": quote_not_found_message}
        )
    try:
        ap = update_appointment(
            db,
            ap,
            start_time=payload.start_time,
            duration_minutes=payload.duration_minutes,
            patient_id=payload.patient_id,
            fisio_id=payload.fisio_id,
            appointment_type=payload.appointment_type,
            status=payload.status,
        )
        return ap
    except ValueError as e:
        raise HTTPException(status_code=400, detail={"message": str(e)})


@router.patch("/{cita_id}/cancel", response_model=AppointmentRead)
def cancel_cita(
    cita_id: int, db: Session = Depends(get_db), user: dict = Depends(get_current_user)
):
    ap = get_appointment(db, cita_id)
    if not ap:
        raise HTTPException(
            status_code=404, detail={"message": quote_not_found_message}
        )
    ap = cancel_appointment(db, ap)
    return ap


@router.delete("/{cita_id}", response_model=AppointmentRead)
def delete_cita(
    cita_id: int, db: Session = Depends(get_db), user: dict = Depends(get_current_user)
):
    ap = get_appointment(db, cita_id)
    if not ap:
        raise HTTPException(
            status_code=404, detail={"message": quote_not_found_message}
        )
    ap = delete_appointment(db, ap)
    return ap
