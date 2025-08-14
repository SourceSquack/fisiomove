from __future__ import annotations
from datetime import datetime
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
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
)
from app.services.auth import get_current_user

router = APIRouter()


@router.post("/", response_model=AppointmentRead, status_code=status.HTTP_201_CREATED)
def create_cita(
    payload: AppointmentCreate,
    db: Session = Depends(get_db),
    user: dict = Depends(get_current_user),
):
    try:
        # Permitir citas sin fisioterapeuta asignado (pendientes de asignación)
        fisio_id = payload.fisio_id

        # Si se proporciona un fisio_id válido, usarlo; si no, dejar como None para asignación posterior
        if fisio_id and fisio_id not in ["current_user", "string", ""]:
            # Fisioterapeuta específico asignado
            pass
        else:
            # Cita pendiente de asignación
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


@router.put("/{cita_id}", response_model=AppointmentRead)
def update_cita(
    cita_id: int,
    payload: AppointmentUpdate,
    db: Session = Depends(get_db),
    user: dict = Depends(get_current_user),
):
    ap = get_appointment(db, cita_id)
    if not ap:
        raise HTTPException(status_code=404, detail={"message": "Cita no encontrada"})
    try:
        ap = update_appointment(
            db,
            ap,
            start_time=payload.start_time,
            duration_minutes=payload.duration_minutes,
            patient_id=payload.patient_id,
            fisio_id=payload.fisio_id,
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
        raise HTTPException(status_code=404, detail={"message": "Cita no encontrada"})
    ap = cancel_appointment(db, ap)
    return ap


@router.delete("/{cita_id}", response_model=AppointmentRead)
def delete_cita(
    cita_id: int, db: Session = Depends(get_db), user: dict = Depends(get_current_user)
):
    ap = get_appointment(db, cita_id)
    if not ap:
        raise HTTPException(status_code=404, detail={"message": "Cita no encontrada"})
    ap = delete_appointment(db, ap)
    return ap
