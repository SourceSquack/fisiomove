import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface DashboardSummary {
  total_pacientes: number;
  citas_hoy: number;
  terapias_activas: number;
  citas_por_estado: {
    confirmado: number;
    pendiente: number;
    cancelado: number;
    completado: number;
  };
}

export interface AppointmentsByStatus {
  confirmado: number;
  pendiente: number;
  cancelado: number;
  completado: number;
}

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private readonly apiUrl = 'http://localhost:8000/api/v1/dashboard';
  constructor(private readonly http: HttpClient) { }

  // Obtener resumen general del dashboard
  getDashboardSummary(): Observable<DashboardSummary> {
    return this.http.get<DashboardSummary>(`${this.apiUrl}/resumen`);
  }

  // Obtener citas por estado
  getAppointmentsByStatus(): Observable<AppointmentsByStatus> {
    return this.http.get<AppointmentsByStatus>(`${this.apiUrl}/citas-por-estado`);
  }

  // Obtener citas de hoy
  getTodayAppointments(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/citas-hoy`);
  }

  // Métricas en tiempo real
  getRealTimeMetrics(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/metricas-tiempo-real`);
  }

  // Estadísticas semanales
  getWeeklyStats(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/estadisticas-semanales`);
  }

  // Estadísticas mensuales
  getMonthlyStats(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/estadisticas-mensuales`);
  }
}
