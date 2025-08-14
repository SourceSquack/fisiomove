import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpParams } from '@angular/common/http';
import { HttpClientService } from './http-client.service';
import {
  Appointment,
  ApiResponse,
  PaginatedResponse,
} from '../models/api.models';

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
  appointment_date: string;
  appointment_time: string;
  type: string;
  notes?: string;
  duration_minutes?: number;
}

export interface UpdateAppointmentRequest {
  patient_id?: string;
  appointment_date?: string;
  appointment_time?: string;
  type?: string;
  appointment_type?: string;
  duration_minutes?: number;
  status?: 'programada' | 'confirmada' | 'completada' | 'cancelada' | 'no_show';
  notes?: string;
}

export interface BackendAppointmentCreate {
  patient_id: string;
  start_time: string; // ISO datetime string
  duration_minutes: number;
  // fisio_id se omite - la cita quedará pendiente de asignación
}

@Injectable({
  providedIn: 'root',
})
export class AppointmentsService {
  private readonly httpClient = inject(HttpClientService);

  /**
   * Obtener lista de citas con filtros
   */
  getAppointments(filters?: AppointmentFilters): Observable<Appointment[]> {
    let params = new HttpParams();

    if (filters) {
      if (filters.patient_id)
        params = params.set('patient_id', filters.patient_id);
      if (filters.physiotherapist_id)
        params = params.set('physiotherapist_id', filters.physiotherapist_id);
      if (filters.status) params = params.set('status', filters.status);
      if (filters.date_from)
        params = params.set('date_from', filters.date_from);
      if (filters.date_to) params = params.set('date_to', filters.date_to);
      if (filters.page) params = params.set('page', filters.page.toString());
      if (filters.size) params = params.set('size', filters.size.toString());
    }

    console.log(
      '🌐 Haciendo petición GET a appointments/ con params:',
      params.toString()
    );

    return this.httpClient.get<Appointment[]>('appointments/', params);
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
  createAppointment(
    appointmentData: CreateAppointmentRequest
  ): Observable<ApiResponse<Appointment>> {
    // Transformar los datos al formato que espera el backend
    const backendData: BackendAppointmentCreate = {
      patient_id: appointmentData.patient_id,
      // No enviar fisio_id para que se autoasigne en el backend
      start_time: `${appointmentData.appointment_date}T${appointmentData.appointment_time}:00`,
      duration_minutes: appointmentData.duration_minutes || 60,
    };

    console.log('Datos enviados al backend:', backendData);

    return this.httpClient.post<ApiResponse<Appointment>>(
      'appointments',
      backendData
    );
  }

  /**
   * Actualizar cita
   */
  updateAppointment(
    id: string,
    appointmentData: UpdateAppointmentRequest
  ): Observable<ApiResponse<Appointment>> {
    // Transformar los datos al formato que espera el backend
    const backendData: any = {};

    // Construir start_time si se proporcionan fecha y hora
    if (appointmentData.appointment_date && appointmentData.appointment_time) {
      backendData.start_time = `${appointmentData.appointment_date}T${appointmentData.appointment_time}:00`;
    }

    // Mapear campos
    if (appointmentData.patient_id) {
      backendData.patient_id = appointmentData.patient_id;
    }
    if (appointmentData.type) {
      backendData.appointment_type = appointmentData.type;
    }
    if (appointmentData.duration_minutes) {
      backendData.duration_minutes = appointmentData.duration_minutes;
    }
    if (appointmentData.status) {
      backendData.status = appointmentData.status;
    }

    console.log('Datos transformados para backend:', backendData);

    return this.httpClient.put<ApiResponse<Appointment>>(
      `appointments/${id}`,
      backendData
    );
  }

  /**
   * Cancelar cita
   */
  cancelAppointment(
    id: string,
    reason?: string
  ): Observable<ApiResponse<Appointment>> {
    return this.httpClient.patch<ApiResponse<Appointment>>(
      `appointments/${id}/cancel`,
      { reason }
    );
  }

  /**
   * Eliminar cita
   */
  deleteAppointment(id: string): Observable<ApiResponse<Appointment>> {
    return this.httpClient.delete<ApiResponse<Appointment>>(
      `appointments/${id}`
    );
  }

  /**
   * Confirmar cita
   */
  confirmAppointment(id: string): Observable<ApiResponse<Appointment>> {
    return this.httpClient.patch<ApiResponse<Appointment>>(
      `appointments/${id}/confirm`,
      {}
    );
  }

  /**
   * Marcar cita como completada
   */
  completeAppointment(
    id: string,
    notes?: string
  ): Observable<ApiResponse<Appointment>> {
    return this.httpClient.patch<ApiResponse<Appointment>>(
      `appointments/${id}/complete`,
      { notes }
    );
  }

  /**
   * Obtener citas del día actual
   */
  getTodayAppointments(): Observable<ApiResponse<Appointment[]>> {
    return this.httpClient.get<ApiResponse<Appointment[]>>(
      'appointments/today'
    );
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
  getUpcomingAppointments(
    limit: number = 5
  ): Observable<ApiResponse<Appointment[]>> {
    const params = new HttpParams().set('limit', limit.toString());
    return this.httpClient.get<ApiResponse<Appointment[]>>(
      'appointments/upcoming',
      params
    );
  }

  /**
   * Obtener citas por fecha específica
   */
  getAppointmentsByDate(date: string): Observable<Appointment[]> {
    const params = new HttpParams().set('date', date);
    return this.httpClient.get<Appointment[]>('appointments/', params);
  }

  /**
   * Obtener todas las citas del mes para marcar días en calendario
   */
  getAppointmentsByMonth(year: number, month: number): Observable<Appointment[]> {
    // Formato: YYYY-MM (mes es 1-indexado)
    const monthStr = month.toString().padStart(2, '0');
    const startDate = `${year}-${monthStr}-01`;
    
    // Último día del mes
    const lastDay = new Date(year, month, 0).getDate();
    const endDate = `${year}-${monthStr}-${lastDay.toString().padStart(2, '0')}`;
    
    const params = new HttpParams()
      .set('date_from', startDate)
      .set('date_to', endDate);
    
    return this.httpClient.get<Appointment[]>('appointments/', params);
  }
}
