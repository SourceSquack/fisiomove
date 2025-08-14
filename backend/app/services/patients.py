from __future__ import annotations
from typing import List, Optional, Dict

from sqlalchemy.orm import Session

from app.models.patient import Patient


def create_patient(db: Session, data: dict) -> Patient:
    obj = Patient(**data)
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return obj


def list_patients(db: Session) -> List[Patient]:
    return db.query(Patient).order_by(Patient.created_at.desc()).all()


def get_patient(db: Session, patient_id: int) -> Optional[Patient]:
    return db.query(Patient).filter(Patient.id == patient_id).first()


def get_patients_by_ids(db: Session, patient_ids: List[int]) -> Dict[int, Patient]:
    """Obtener múltiples pacientes por sus IDs y devolver un diccionario para acceso rápido"""
    patients = db.query(Patient).filter(Patient.id.in_(patient_ids)).all()
    return {patient.id: patient for patient in patients}


def update_patient(db: Session, patient: Patient, data: dict) -> Patient:
    for k, v in data.items():
        setattr(patient, k, v)
    db.add(patient)
    db.commit()
    db.refresh(patient)
    return patient


def search_patients(db: Session, search_term: str) -> List[Patient]:
    """Buscar pacientes por nombre, email o DNI"""
    if not search_term or len(search_term.strip()) < 2:
        return []

    search_term = f"%{search_term.strip()}%"
    return (
        db.query(Patient)
        .filter(
            Patient.full_name.ilike(search_term)
            | Patient.email.ilike(search_term)
            | Patient.dni.ilike(search_term)
        )
        .order_by(Patient.full_name)
        .limit(10)
        .all()
    )


def delete_patient(db: Session, patient: Patient) -> None:
    db.delete(patient)
    db.commit()
