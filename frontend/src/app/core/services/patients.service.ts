import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpParams } from '@angular/common/http';
import { HttpClientService } from './http-client.service';
import { Patient, ApiResponse, PaginatedResponse } from '../models/api.models';

export interface PatientFilters {
  search?: string;
  gender?: 'M' | 'F' | 'Other';
  page?: number;
  size?: number;
}

export interface CreatePatientRequest {
  user_id: string;
  dni?: string;
  birth_date?: string;
  gender?: 'M' | 'F' | 'Other';
  address?: string;
  emergency_contact?: string;
  medical_history?: string;
  notes?: string;
}

@Injectable({
  providedIn: 'root',
})
export class PatientsService {
  private readonly httpClient = inject(HttpClientService);

  /**
   * Obtener lista de pacientes con filtros
   */
  getPatients(
    filters?: PatientFilters
  ): Observable<ApiResponse<PaginatedResponse<Patient>>> {
    let params = new HttpParams();

    if (filters) {
      if (filters.search) params = params.set('search', filters.search);
      if (filters.gender) params = params.set('gender', filters.gender);
      if (filters.page) params = params.set('page', filters.page.toString());
      if (filters.size) params = params.set('size', filters.size.toString());
    }

    return this.httpClient.get<ApiResponse<PaginatedResponse<Patient>>>(
      'patients',
      params
    );
  }

  /**
   * Obtener paciente por ID
   */
  getPatient(id: string): Observable<ApiResponse<Patient>> {
    return this.httpClient.get<ApiResponse<Patient>>(`patients/${id}`);
  }

  /**
   * Crear nuevo paciente
   */
  createPatient(
    patientData: CreatePatientRequest
  ): Observable<ApiResponse<Patient>> {
    return this.httpClient.post<ApiResponse<Patient>>('patients', patientData);
  }

  /**
   * Actualizar paciente
   */
  updatePatient(
    id: string,
    patientData: Partial<CreatePatientRequest>
  ): Observable<ApiResponse<Patient>> {
    return this.httpClient.put<ApiResponse<Patient>>(
      `patients/${id}`,
      patientData
    );
  }

  /**
   * Eliminar paciente
   */
  deletePatient(id: string): Observable<ApiResponse<any>> {
    return this.httpClient.delete<ApiResponse<any>>(`patients/${id}`);
  }

  /**
   * Buscar pacientes por nombre o email
   */
  searchPatients(query: string): Observable<Patient[]> {
    const params = new HttpParams().set('search', query);
    return this.httpClient.get<Patient[]>('patients/search', params);
  }
}
