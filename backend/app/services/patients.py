from __future__ import annotations
from typing import List, Optional

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


def update_patient(db: Session, patient: Patient, data: dict) -> Patient:
    for k, v in data.items():
        setattr(patient, k, v)
    db.add(patient)
    db.commit()
    db.refresh(patient)
    return patient


def delete_patient(db: Session, patient: Patient) -> None:
    db.delete(patient)
    db.commit()
