from __future__ import annotations
from datetime import date, datetime
from typing import Optional
from pydantic import BaseModel, EmailStr, Field


dni_message = "Cédula de Ciudadanía (DNI) debe tener entre 9 y 11 Caracteres"

class PatientBase(BaseModel):
    auth_user_id: Optional[str] = None
    email: Optional[EmailStr] = None
    full_name: Optional[str] = Field(default=None, max_length=255)
    phone: Optional[str] = Field(default=None, max_length=50)
    dni: Optional[str] = Field(
        default=None, max_length=30, description=dni_message
    )
    birth_date: Optional[date] = None
    gender: Optional[str] = Field(default=None, max_length=20)
    medical_history: Optional[str] = None
    allergies: Optional[str] = None
    height_cm: Optional[int] = Field(default=None, ge=0, le=300)
    weight_kg: Optional[float] = Field(default=None, ge=0, le=500)
    blood_type: Optional[str] = Field(default=None, pattern=r"^(A|B|AB|O)[+-]$")


class PatientCreate(PatientBase):
    full_name: str = Field(min_length=1)
    dni: str = Field(
        min_length=5, max_length=30, description=dni_message
    )


class PatientUpdate(PatientBase):
    dni: Optional[str] = Field(
        default=None, max_length=30, description=dni_message
    )


class PatientRead(PatientBase):
    id: int
    dni: Optional[str] = Field(
        default=None, max_length=30, description=dni_message
    )
    is_active: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
