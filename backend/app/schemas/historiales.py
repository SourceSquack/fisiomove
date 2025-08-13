from pydantic import BaseModel
from datetime import date
from typing import List, Optional


class TerapiaBase(BaseModel):
    tipo: str
    observaciones: Optional[str]
    duracion: int


class TerapiaCreate(TerapiaBase):
    historial_id: int


class TerapiaResponse(TerapiaBase):
    id: int

    class Config:
        orm_mode = True


class HistorialBase(BaseModel):
    diagnostico: str
    notas: Optional[str]
    fecha: date


class HistorialCreate(HistorialBase):
    paciente_id: int


class HistorialResponse(HistorialBase):
    id: int
    terapias: List[TerapiaResponse] = []

    class Config:
        orm_mode = True
