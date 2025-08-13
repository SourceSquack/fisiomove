from pydantic import BaseModel
from typing import Dict, List, Optional, Any
from datetime import date


class DashboardSummary(BaseModel):
    total_patients: int
    total_appointments: int
    active_therapies: int
    appointments_by_status: Dict[str, int]


class AppointmentDetail(BaseModel):
    id: str
    patient_name: str
    start_time: str
    duration_minutes: int
    status: str
    fisio_name: str


class NextAppointment(BaseModel):
    id: str
    patient_name: Optional[str]
    start_time: Optional[str]
    time_until: Optional[str]


class TodayAppointments(BaseModel):
    date: str
    total_appointments: int
    appointments: List[AppointmentDetail]
    next_appointment: Optional[NextAppointment]


class FilterApplied(BaseModel):
    status: Optional[str]
    fecha_desde: Optional[str]
    fecha_hasta: Optional[str]


class AppointmentsByStatus(BaseModel):
    filter_applied: FilterApplied
    total_appointments: int
    appointments_by_status: Dict[str, List[AppointmentDetail]]
    status_counts: Dict[str, int]


class WeeklyData(BaseModel):
    week_start: str
    total_appointments: int
    completed: int
    cancelled: int
    scheduled: int


class WeeklyStats(BaseModel):
    period: Dict[str, Any]
    weekly_stats: List[WeeklyData]


class MonthlyAppointments(BaseModel):
    total: int
    completed: int
    cancelled: int
    scheduled: int


class MonthlyData(BaseModel):
    month: str
    appointments: MonthlyAppointments
    new_patients: int


class MonthlyStats(BaseModel):
    period: Dict[str, Any]
    monthly_stats: List[MonthlyData]
