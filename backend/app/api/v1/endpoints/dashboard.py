from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from datetime import date, datetime, timedelta
from typing import Optional

from app.db.session import get_db
from app.services.dashboard import (
    get_dashboard_summary,
    get_today_appointments,
    get_appointments_by_status,
    get_weekly_stats,
    get_monthly_stats,
)
from app.schemas.dashboard import (
    DashboardSummary,
    TodayAppointments,
    AppointmentsByStatus,
    WeeklyStats,
    MonthlyStats,
)
from app.services.auth import get_current_user

router = APIRouter()


@router.get(
    "/resumen",
    response_model=DashboardSummary,
    status_code=status.HTTP_200_OK,
)
def get_dashboard_resumen(
    db: Session = Depends(get_db),
    user: dict = Depends(get_current_user),
):
    """Obtener resumen general del dashboard"""
    try:
        summary = get_dashboard_summary(db)
        return summary
    except Exception as e:
        raise HTTPException(status_code=500, detail={"message": str(e)})


@router.get(
    "/citas-hoy",
    response_model=TodayAppointments,
    status_code=status.HTTP_200_OK,
)
def get_citas_hoy(
    db: Session = Depends(get_db),
    user: dict = Depends(get_current_user),
):
    """Obtener todas las citas del día actual"""
    try:
        today_appointments = get_today_appointments(db)
        return today_appointments
    except Exception as e:
        raise HTTPException(status_code=500, detail={"message": str(e)})


@router.get(
    "/citas-por-estado",
    response_model=AppointmentsByStatus,
    status_code=status.HTTP_200_OK,
)
def get_citas_por_estado(
    status_filter: Optional[str] = Query(
        None, description="Filtrar por estado específico"
    ),
    fecha_desde: Optional[date] = Query(None, description="Fecha desde"),
    fecha_hasta: Optional[date] = Query(None, description="Fecha hasta"),
    db: Session = Depends(get_db),
    user: dict = Depends(get_current_user),
):
    """Obtener citas agrupadas por estado"""
    try:
        appointments_by_status = get_appointments_by_status(
            db, status_filter, fecha_desde, fecha_hasta
        )
        return appointments_by_status
    except Exception as e:
        raise HTTPException(status_code=500, detail={"message": str(e)})


@router.get(
    "/estadisticas-semanales",
    response_model=WeeklyStats,
    status_code=status.HTTP_200_OK,
)
def get_estadisticas_semanales(
    semanas: int = Query(4, description="Número de semanas atrás", ge=1, le=12),
    db: Session = Depends(get_db),
    user: dict = Depends(get_current_user),
):
    """Obtener estadísticas de las últimas semanas"""
    try:
        weekly_stats = get_weekly_stats(db, semanas)
        return weekly_stats
    except Exception as e:
        raise HTTPException(status_code=500, detail={"message": str(e)})


@router.get(
    "/estadisticas-mensuales",
    response_model=MonthlyStats,
    status_code=status.HTTP_200_OK,
)
def get_estadisticas_mensuales(
    meses: int = Query(6, description="Número de meses atrás", ge=1, le=12),
    db: Session = Depends(get_db),
    user: dict = Depends(get_current_user),
):
    """Obtener estadísticas de los últimos meses"""
    try:
        monthly_stats = get_monthly_stats(db, meses)
        return monthly_stats
    except Exception as e:
        raise HTTPException(status_code=500, detail={"message": str(e)})


@router.get(
    "/metricas-tiempo-real",
    response_model=dict,
    status_code=status.HTTP_200_OK,
)
def get_metricas_tiempo_real(
    db: Session = Depends(get_db),
    user: dict = Depends(get_current_user),
):
    """Obtener métricas en tiempo real para el dashboard"""
    try:
        now = datetime.now()

        summary = get_dashboard_summary(db)
        today_appointments = get_today_appointments(db)

        return {
            "timestamp": now.isoformat(),
            "total_pacientes": summary["total_patients"],
            "total_citas": summary["total_appointments"],
            "terapias_activas": summary["active_therapies"],
            "citas_hoy": {
                "total": len(today_appointments.get("appointments", [])),
                "completadas": len(
                    [
                        a
                        for a in today_appointments.get("appointments", [])
                        if a.get("status") == "completed"
                    ]
                ),
                "pendientes": len(
                    [
                        a
                        for a in today_appointments.get("appointments", [])
                        if a.get("status") == "scheduled"
                    ]
                ),
                "canceladas": len(
                    [
                        a
                        for a in today_appointments.get("appointments", [])
                        if a.get("status") == "cancelled"
                    ]
                ),
            },
            "proxima_cita": today_appointments.get("next_appointment"),
            "citas_por_estado": summary["appointments_by_status"],
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail={"message": str(e)})
