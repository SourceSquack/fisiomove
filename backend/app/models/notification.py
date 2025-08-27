from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime

from app.db.base import Base


class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    type = Column(String, nullable=False)
    message = Column(String, nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    related_appointment_id = Column(
        Integer, ForeignKey("appointments.id"), nullable=True
    )

    user = relationship("User", back_populates="notifications")
    appointment = relationship("Appointment", back_populates="notifications")
