from sqlalchemy import Column, Integer, String, Boolean
from app.db.base import Base

class Terapia(Base):
    __tablename__ = "terapias"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    description = Column(String, nullable=True)
    is_active = Column(Boolean, default=True)
