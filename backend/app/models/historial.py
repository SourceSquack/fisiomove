from sqlalchemy import Column, Integer, String, Date, ForeignKey
from sqlalchemy.orm import relationship
from app.db.base import Base


class Historial(Base):
    __tablename__ = "historiales"

    id = Column(Integer, primary_key=True, index=True)
    diagnostico = Column(String, nullable=False)
    notas = Column(String, nullable=True)
    fecha = Column(Date, nullable=False)
    paciente_id = Column(Integer, ForeignKey("pacientes.id"), nullable=False)

    paciente = relationship("Paciente", back_populates="historiales")
    terapias = relationship("TerapiaHistorial", back_populates="historial")


class TerapiaHistorial(Base):
    __tablename__ = "terapias_historial"

    id = Column(Integer, primary_key=True, index=True)
    tipo = Column(String, nullable=False)
    observaciones = Column(String, nullable=True)
    duracion = Column(Integer, nullable=False)
    historial_id = Column(Integer, ForeignKey("historiales.id"), nullable=False)

    historial = relationship("Historial", back_populates="terapias")
