// Services
export * from './services/http-client.service';
export * from './services/auth.service';
export * from './services/patients.service';
export * from './services/appointments.service';

// Models (export types explicitly)
export type { 
  BaseModel, 
  PaginatedResponse, 
  User, 
  Patient, 
  Appointment, 
  LoginRequest, 
  LoginResponse, 
  RegisterRequest,
  ApiResponse
} from './models/api.models';

// Interceptors
export * from './interceptors/auth.interceptor';

// Config
export * from './config/api.config';
