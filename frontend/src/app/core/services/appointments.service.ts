import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpParams } from '@angular/common/http';
import { HttpClientService } from './http-client.service';
import { Appointment, ApiResponse, PaginatedResponse } from '../models/api.models';

export interface AppointmentFilters {
  patient_id?: string;
  physiotherapist_id?: string;
  status?: 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'no_show';
  date_from?: string;
  date_to?: string;
  page?: number;
  size?: number;
}

export interface CreateAppointmentRequest {
  patient_id: string;
  physiotherapist_id: string;
  appointment_date: string;
  appointment_time: string;
  type: string;
  notes?: string;
  duration_minutes?: number;
}

@Injectable({
  providedIn: 'root'
})
export class AppointmentsService {
  private readonly httpClient = inject(HttpClientService);

  /**
   * Obtener lista de citas con filtros
   */
  getAppointments(filters?: AppointmentFilters): Observable<ApiResponse<PaginatedResponse<Appointment>>> {
    let params = new HttpParams();
    
    if (filters) {
      if (filters.patient_id) params = params.set('patient_id', filters.patient_id);
      if (filters.physiotherapist_id) params = params.set('physiotherapist_id', filters.physiotherapist_id);
      if (filters.status) params = params.set('status', filters.status);
      if (filters.date_from) params = params.set('date_from', filters.date_from);
      if (filters.date_to) params = params.set('date_to', filters.date_to);
      if (filters.page) params = params.set('page', filters.page.toString());
      if (filters.size) params = params.set('size', filters.size.toString());
    }

    return this.httpClient.get<ApiResponse<PaginatedResponse<Appointment>>>('appointments', params);
  }

  /**
   * Obtener cita por ID
   */
  getAppointment(id: string): Observable<ApiResponse<Appointment>> {
    return this.httpClient.get<ApiResponse<Appointment>>(`appointments/${id}`);
  }

  /**
   * Crear nueva cita
   */
  createAppointment(appointmentData: CreateAppointmentRequest): Observable<ApiResponse<Appointment>> {
    return this.httpClient.post<ApiResponse<Appointment>>('appointments', appointmentData);
  }

  /**
   * Actualizar cita
   */
  updateAppointment(id: string, appointmentData: Partial<CreateAppointmentRequest>): Observable<ApiResponse<Appointment>> {
    return this.httpClient.put<ApiResponse<Appointment>>(`appointments/${id}`, appointmentData);
  }

  /**
   * Cancelar cita
   */
  cancelAppointment(id: string, reason?: string): Observable<ApiResponse<Appointment>> {
    return this.httpClient.patch<ApiResponse<Appointment>>(`appointments/${id}/cancel`, { reason });
  }

  /**
   * Confirmar cita
   */
  confirmAppointment(id: string): Observable<ApiResponse<Appointment>> {
    return this.httpClient.patch<ApiResponse<Appointment>>(`appointments/${id}/confirm`, {});
  }

  /**
   * Marcar cita como completada
   */
  completeAppointment(id: string, notes?: string): Observable<ApiResponse<Appointment>> {
    return this.httpClient.patch<ApiResponse<Appointment>>(`appointments/${id}/complete`, { notes });
  }

  /**
   * Obtener citas del día actual
   */
  getTodayAppointments(): Observable<ApiResponse<Appointment[]>> {
    return this.httpClient.get<ApiResponse<Appointment[]>>('appointments/today');
  }

  /**
   * Obtener citas de la semana
   */
  getWeekAppointments(): Observable<ApiResponse<Appointment[]>> {
    return this.httpClient.get<ApiResponse<Appointment[]>>('appointments/week');
  }

  /**
   * Obtener próximas citas
   */
  getUpcomingAppointments(limit: number = 5): Observable<ApiResponse<Appointment[]>> {
    const params = new HttpParams().set('limit', limit.toString());
    return this.httpClient.get<ApiResponse<Appointment[]>>('appointments/upcoming', params);
  }
}
