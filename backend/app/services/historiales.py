from sqlalchemy.orm import Session
from app.models.historial import Historial, Terapia
from app.schemas.historiales import HistorialCreate, TerapiaCreate


def create_historial(db: Session, historial_in: HistorialCreate):
    historial = Historial(**historial_in.dict())
    db.add(historial)
    db.commit()
    db.refresh(historial)
    return historial


def create_terapia(db: Session, terapia_in: TerapiaCreate):
    terapia = Terapia(**terapia_in.dict())
    db.add(terapia)
    db.commit()
    db.refresh(terapia)
    return terapia


def get_historiales_by_paciente(db: Session, paciente_id: int):
    return db.query(Historial).filter(Historial.paciente_id == paciente_id).all()


def get_terapias_by_paciente(db: Session, paciente_id: int):
    historiales = db.query(Historial).filter(Historial.paciente_id == paciente_id).all()
    terapias = []
    for historial in historiales:
        terapias.extend(historial.terapias)
    return terapias
