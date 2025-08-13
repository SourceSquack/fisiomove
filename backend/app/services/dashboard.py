from sqlalchemy.orm import Session
from sqlalchemy import func, and_, or_
from datetime import date, datetime, timedelta
from typing import Optional, Dict, List, Any
from app.models.appointment import Appointment
from app.models.patient import Patient
from app.models.terapia import Terapia


def get_dashboard_summary(db: Session) -> Dict[str, Any]:
    """Obtener resumen general del dashboard"""
    total_patients = db.query(Patient).count()
    total_appointments = db.query(Appointment).count()
    active_therapies = db.query(Terapia).filter(Terapia.is_active == True).count()

    appointments_by_status = (
        db.query(Appointment.status, func.count(Appointment.id))
        .group_by(Appointment.status)
        .all()
    )

    return {
        "total_patients": total_patients,
        "total_appointments": total_appointments,
        "active_therapies": active_therapies,
        "appointments_by_status": dict(appointments_by_status),
    }


def get_today_appointments(db: Session) -> Dict[str, Any]:
    """Obtener citas del día actual"""
    today = date.today()

    appointments = (
        db.query(Appointment)
        .filter(func.date(Appointment.start_time) == today)
        .order_by(Appointment.start_time)
        .all()
    )

    now = datetime.now()
    next_appointment = (
        db.query(Appointment)
        .filter(
            and_(
                func.date(Appointment.start_time) == today,
                Appointment.start_time > now,
                Appointment.status == "scheduled",
            )
        )
        .order_by(Appointment.start_time)
        .first()
    )

    return {
        "date": today.isoformat(),
        "total_appointments": len(appointments),
        "appointments": [
            {
                "id": str(apt.id),
                "patient_name": apt.patient.name if apt.patient else "Sin paciente",
                "start_time": apt.start_time.isoformat(),
                "duration_minutes": apt.duration_minutes,
                "status": apt.status,
                "fisio_name": apt.fisio.name if apt.fisio else "Sin fisioterapeuta",
            }
            for apt in appointments
        ],
        "next_appointment": (
            {
                "id": str(next_appointment.id),
                "patient_name": (
                    next_appointment.patient.name
                    if next_appointment and next_appointment.patient
                    else None
                ),
                "start_time": (
                    next_appointment.start_time.isoformat()
                    if next_appointment
                    else None
                ),
                "time_until": (
                    str(next_appointment.start_time - now) if next_appointment else None
                ),
            }
            if next_appointment
            else None
        ),
    }


def get_appointments_by_status(
    db: Session,
    status_filter: Optional[str] = None,
    fecha_desde: Optional[date] = None,
    fecha_hasta: Optional[date] = None,
) -> Dict[str, Any]:
    """Obtener citas agrupadas por estado con filtros opcionales"""
    query = db.query(Appointment)

    if fecha_desde:
        query = query.filter(func.date(Appointment.start_time) >= fecha_desde)
    if fecha_hasta:
        query = query.filter(func.date(Appointment.start_time) <= fecha_hasta)

    if status_filter:
        query = query.filter(Appointment.status == status_filter)

    appointments = query.all()

    grouped = {}
    for appointment in appointments:
        status = appointment.status
        if status not in grouped:
            grouped[status] = []

        grouped[status].append(
            {
                "id": str(appointment.id),
                "patient_name": (
                    appointment.patient.name if appointment.patient else "Sin paciente"
                ),
                "start_time": appointment.start_time.isoformat(),
                "duration_minutes": appointment.duration_minutes,
                "fisio_name": (
                    appointment.fisio.name
                    if appointment.fisio
                    else "Sin fisioterapeuta"
                ),
            }
        )

    return {
        "filter_applied": {
            "status": status_filter,
            "fecha_desde": fecha_desde.isoformat() if fecha_desde else None,
            "fecha_hasta": fecha_hasta.isoformat() if fecha_hasta else None,
        },
        "total_appointments": len(appointments),
        "appointments_by_status": grouped,
        "status_counts": {status: len(apps) for status, apps in grouped.items()},
    }


def get_weekly_stats(db: Session, weeks: int = 4) -> Dict[str, Any]:
    """Obtener estadísticas semanales"""
    end_date = date.today()
    start_date = end_date - timedelta(weeks=weeks)

    appointments = (
        db.query(Appointment)
        .filter(func.date(Appointment.start_time) >= start_date)
        .filter(func.date(Appointment.start_time) <= end_date)
        .all()
    )

    weekly_data = {}
    for appointment in appointments:
        week_start = appointment.start_time.date() - timedelta(
            days=appointment.start_time.weekday()
        )
        week_key = week_start.isoformat()

        if week_key not in weekly_data:
            weekly_data[week_key] = {
                "week_start": week_key,
                "total_appointments": 0,
                "completed": 0,
                "cancelled": 0,
                "scheduled": 0,
            }

        weekly_data[week_key]["total_appointments"] += 1
        weekly_data[week_key][appointment.status] += 1

    return {
        "period": {
            "start_date": start_date.isoformat(),
            "end_date": end_date.isoformat(),
            "weeks": weeks,
        },
        "weekly_stats": list(weekly_data.values()),
    }


def get_monthly_stats(db: Session, months: int = 6) -> Dict[str, Any]:
    """Obtener estadísticas mensuales"""
    end_date = date.today()
    start_date = end_date.replace(day=1) - timedelta(days=months * 30)

    appointments = (
        db.query(Appointment)
        .filter(func.date(Appointment.start_time) >= start_date)
        .filter(func.date(Appointment.start_time) <= end_date)
        .all()
    )

    patients = (
        db.query(Patient)
        .filter(Patient.created_at >= start_date)
        .filter(Patient.created_at <= end_date)
        .all()
    )

    monthly_data = {}

    for appointment in appointments:
        month_key = appointment.start_time.strftime("%Y-%m")

        if month_key not in monthly_data:
            monthly_data[month_key] = {
                "month": month_key,
                "appointments": {
                    "total": 0,
                    "completed": 0,
                    "cancelled": 0,
                    "scheduled": 0,
                },
                "new_patients": 0,
            }

        monthly_data[month_key]["appointments"]["total"] += 1
        monthly_data[month_key]["appointments"][appointment.status] += 1

    for patient in patients:
        month_key = patient.created_at.strftime("%Y-%m")
        if month_key in monthly_data:
            monthly_data[month_key]["new_patients"] += 1

    return {
        "period": {
            "start_date": start_date.isoformat(),
            "end_date": end_date.isoformat(),
            "months": months,
        },
        "monthly_stats": list(monthly_data.values()),
    }
