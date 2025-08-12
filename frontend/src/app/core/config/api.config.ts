import { environment } from '../../../environments/environment.development';

export const API_CONFIG = {
  BASE_URL: environment.API_URL,
  
  // Endpoints de autenticación
  AUTH: {
    LOGIN: 'auth/login',
    REGISTER: 'auth/register',
    ME: 'auth/me',
    LOGOUT: 'auth/logout',
    CHANGE_PASSWORD: 'auth/change-password',
    VERIFY_TOKEN: 'auth/verify-token'
  },

  // Endpoints de pacientes
  PATIENTS: {
    LIST: 'patients',
    DETAIL: (id: string) => `patients/${id}`,
    CREATE: 'patients',
    UPDATE: (id: string) => `patients/${id}`,
    DELETE: (id: string) => `patients/${id}`,
    SEARCH: 'patients/search'
  },

  // Endpoints de citas
  APPOINTMENTS: {
    LIST: 'appointments',
    DETAIL: (id: string) => `appointments/${id}`,
    CREATE: 'appointments',
    UPDATE: (id: string) => `appointments/${id}`,
    CANCEL: (id: string) => `appointments/${id}/cancel`,
    CONFIRM: (id: string) => `appointments/${id}/confirm`,
    COMPLETE: (id: string) => `appointments/${id}/complete`,
    TODAY: 'appointments/today',
    WEEK: 'appointments/week',
    UPCOMING: 'appointments/upcoming'
  },

  // Endpoints de usuarios
  USERS: {
    LIST: 'users',
    DETAIL: (id: string) => `users/${id}`,
    CREATE: 'users',
    UPDATE: (id: string) => `users/${id}`,
    DELETE: (id: string) => `users/${id}`
  }
} as const;
