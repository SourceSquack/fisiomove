from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.schemas.historiales import (
    HistorialCreate,
    HistorialResponse,
    TerapiaCreate,
    TerapiaResponse,
)
from app.services.historiales import (
    create_historial,
    create_terapia,
    get_historiales_by_paciente,
    get_terapias_by_paciente,
)

router = APIRouter()


@router.post("/historiales", response_model=HistorialResponse)
def add_historial(historial_in: HistorialCreate, db: Session = Depends(get_db)):
    return create_historial(db, historial_in)


@router.post("/terapias", response_model=TerapiaResponse)
def add_terapia(terapia_in: TerapiaCreate, db: Session = Depends(get_db)):
    return create_terapia(db, terapia_in)


@router.get(
    "/pacientes/{paciente_id}/historiales", response_model=list[HistorialResponse]
)
def list_historiales(paciente_id: int, db: Session = Depends(get_db)):
    historiales = get_historiales_by_paciente(db, paciente_id)
    if not historiales:
        raise HTTPException(
            status_code=404, detail="No se encontraron historiales para este paciente."
        )
    return historiales


@router.get("/pacientes/{paciente_id}/terapias", response_model=list[TerapiaResponse])
def list_terapias(paciente_id: int, db: Session = Depends(get_db)):
    terapias = get_terapias_by_paciente(db, paciente_id)
    if not terapias:
        raise HTTPException(
            status_code=404, detail="No se encontraron terapias para este paciente."
        )
    return terapias
