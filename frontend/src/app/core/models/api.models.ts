// Interfaces base para la API
export interface BaseModel {
  id?: string;
  created_at?: string;
  updated_at?: string;
}

// Respuesta estándar de la API
export interface ApiResponse<T> {
  data?: T;
  message?: string;
  success: boolean;
  errors?: string[];
}

// Paginación
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  size: number;
  pages: number;
}

// Usuario
export interface User extends BaseModel {
  email: string;
  full_name?: string;
  first_name?: string;
  last_name?: string;
  role: 'admin' | 'fisioterapeuta' | 'paciente';
  is_active: boolean;
  phone?: string;
  avatar?: string;
}

// Paciente
export interface Patient extends BaseModel {
  user_id: string;
  full_name?: string;
  first_name?: string; // Agregado para compatibilidad con backend
  last_name?: string; // Agregado para compatibilidad con backend
  dni?: string;
  email: string;
  user?: User;
  birth_date?: string;
  gender?: 'M' | 'F' | 'Other';
  address?: string;
  emergency_contact?: string;
  medical_history?: string;
  notes?: string;
}

// Cita
export interface Appointment extends BaseModel {
  patient_id: string;
  patient?: Patient;
  fisio_id: string | null;
  physiotherapist?: User;
  start_time: string;
  status: 'programada' | 'confirmada' | 'completada' | 'cancelada' | 'no_show';
  duration_minutes: number;
  appointment_type:
    | 'evaluacion_inicial'
    | 'fisioterapia'
    | 'rehabilitacion'
    | 'seguimiento'
    | 'consulta'
    | 'otro';
  notes?: string;
  physiotherapist_id?: string;
  appointment_date?: string;
  appointment_time?: string;
}

// Autenticación
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  expires_at: number;
  refresh_token: string;
  user: User;
}

export interface RegisterRequest {
  email: string;
  password: string;
  full_name?: string; // Para compatibilidad
  first_name?: string;
  last_name?: string;
  role?: 'paciente';
  phone?: string;
}
