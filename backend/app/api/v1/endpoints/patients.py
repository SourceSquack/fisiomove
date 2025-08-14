from __future__ import annotations
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.schemas.patients import PatientCreate, PatientUpdate, PatientRead
from app.services.patients import (
    create_patient,
    list_patients,
    get_patient,
    update_patient,
    delete_patient,
    search_patients,
)
from app.services.auth import get_current_user

router = APIRouter()


@router.post("/", response_model=PatientRead, status_code=status.HTTP_201_CREATED)
def create_paciente(
    payload: PatientCreate,
    db: Session = Depends(get_db),
    user: dict = Depends(get_current_user),
):
    obj = create_patient(db, data=payload.model_dump(exclude_unset=True))
    return obj


@router.get("/", response_model=list[PatientRead])
def list_pacientes(
    db: Session = Depends(get_db), user: dict = Depends(get_current_user)
):
    return list_patients(db)


@router.get("/search", response_model=list[PatientRead])
def search_pacientes(
    search: str = Query(
        ..., min_length=2, description="Término de búsqueda (nombre, email o DNI)"
    ),
    db: Session = Depends(get_db),
    user: dict = Depends(get_current_user),
):
    """Buscar pacientes por nombre, email o DNI"""
    return search_patients(db, search)


@router.get("/{patient_id}", response_model=PatientRead)
def get_paciente(
    patient_id: int,
    db: Session = Depends(get_db),
    user: dict = Depends(get_current_user),
):
    obj = get_patient(db, patient_id)
    if not obj:
        raise HTTPException(
            status_code=404, detail={"message": "Paciente no encontrado"}
        )
    return obj


@router.put("/{patient_id}", response_model=PatientRead)
def update_paciente(
    patient_id: int,
    payload: PatientUpdate,
    db: Session = Depends(get_db),
    user: dict = Depends(get_current_user),
):
    obj = get_patient(db, patient_id)
    if not obj:
        raise HTTPException(
            status_code=404, detail={"message": "Paciente no encontrado"}
        )
    obj = update_patient(db, obj, data=payload.model_dump(exclude_unset=True))
    return obj


@router.delete("/{patient_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_paciente(
    patient_id: int,
    db: Session = Depends(get_db),
    user: dict = Depends(get_current_user),
):
    obj = get_patient(db, patient_id)
    if not obj:
        raise HTTPException(
            status_code=404, detail={"message": "Paciente no encontrado"}
        )
    delete_patient(db, obj)
    return None
