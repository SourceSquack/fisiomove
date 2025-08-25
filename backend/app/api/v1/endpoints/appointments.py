from __future__ import annotations
from datetime import datetime,timezone
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel
from sqlalchemy.orm import Session

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
    available = is_time_slot_available(
        db,
        start_time=payload.start_time,
        duration_minutes=payload.duration_minutes,
        patient_id=payload.patient_id,
        fisio_id=payload.fisio_id,
        exclude_id=payload.exclude_id,
    )
    return {"available": available}

quote_not_found_message = "Cita no encontrada"


@router.post("/", response_model=AppointmentRead, status_code=status.HTTP_201_CREATED)
def create_cita(
    payload: AppointmentCreate,
    db: Session = Depends(get_db),
    user: dict = Depends(get_current_user),
):
    try:
        # 1. Validar fecha (no en el pasado, formato correcto)
        now = datetime.now(timezone.utc)
        if payload.start_time < now:
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
            start_time=payload.start_time,
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
            start_time=payload.start_time,
            duration_minutes=payload.duration_minutes,
            patient_id=payload.patient_id,
            fisio_id=fisio_id,
            appointment_type=payload.appointment_type,
        )
        return ap
    except ValueError as e:
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
