# 🏗️ Estructura de Servicios para Conexión con Backend

Esta carpeta contiene toda la infraestructura para conectar el frontend Angular con tu API de FastAPI.

## 📁 Estructura

```
core/
├── config/
│   └── api.config.ts          # Configuración centralizada de endpoints
├── interceptors/
│   └── auth.interceptor.ts    # Interceptor para manejo de autenticación
├── models/
│   └── api.models.ts          # Interfaces y tipos TypeScript
├── services/
│   ├── http-client.service.ts # Servicio base para HTTP requests
│   ├── auth.service.ts        # Servicio de autenticación
│   ├── patients.service.ts    # Servicio de pacientes
│   └── appointments.service.ts # Servicio de citas
└── index.ts                   # Archivo de exportación
```

## 🔧 Configuración

### 1. Environment Variables

Tu `environment.development.ts` ya tiene configurado:

```typescript
API_URL: "http://localhost:8000/api/v1/";
```

### 2. Uso en Componentes

#### Autenticación

```typescript
import { AuthService } from '../core';

constructor(private authService: AuthService) {}

login() {
  this.authService.login({ email: 'user@example.com', password: 'password' })
    .subscribe({
      next: (response) => {
        if (response.success) {
          // Login exitoso
          localStorage.setItem('access_token', response.data!.access_token);
        }
      },
      error: (error) => console.error('Login error:', error)
    });
}
```

#### Obtener Pacientes

```typescript
import { PatientsService } from '../core';

constructor(private patientsService: PatientsService) {}

loadPatients() {
  this.patientsService.getPatients({ page: 1, size: 10 })
    .subscribe({
      next: (response) => {
        if (response.success) {
          this.patients = response.data!.data;
        }
      },
      error: (error) => console.error('Error loading patients:', error)
    });
}
```

#### Crear Cita

```typescript
import { AppointmentsService } from '../core';

constructor(private appointmentsService: AppointmentsService) {}

createAppointment() {
  const appointmentData = {
    patient_id: 'patient-uuid',
    physiotherapist_id: 'physio-uuid',
    appointment_date: '2025-08-15',
    appointment_time: '10:00',
    type: 'Consulta'
  };

  this.appointmentsService.createAppointment(appointmentData)
    .subscribe({
      next: (response) => {
        if (response.success) {
          // Cita creada exitosamente
        }
      },
      error: (error) => console.error('Error creating appointment:', error)
    });
}
```

## 🔐 Características de Seguridad

- **Token JWT**: Automáticamente incluido en headers de autorización
- **Interceptor de Auth**: Maneja automáticamente tokens expirados (redirige a login)
- **Manejo de Errores**: Centralizado con mensajes de error consistentes

## 📊 Endpoints Disponibles

### Auth

- `POST /auth/login` - Login
- `POST /auth/register` - Registro
- `GET /auth/me` - Perfil actual
- `PUT /auth/me` - Actualizar perfil
- `POST /auth/change-password` - Cambiar contraseña
- `POST /auth/logout` - Logout

### Patients

- `GET /patients` - Lista de pacientes (con filtros)
- `GET /patients/{id}` - Paciente específico
- `POST /patients` - Crear paciente
- `PUT /patients/{id}` - Actualizar paciente
- `DELETE /patients/{id}` - Eliminar paciente
- `GET /patients/search` - Búsqueda de pacientes

### Appointments

- `GET /appointments` - Lista de citas (con filtros)
- `GET /appointments/{id}` - Cita específica
- `POST /appointments` - Crear cita
- `PUT /appointments/{id}` - Actualizar cita
- `PATCH /appointments/{id}/cancel` - Cancelar cita
- `PATCH /appointments/{id}/confirm` - Confirmar cita
- `PATCH /appointments/{id}/complete` - Completar cita
- `GET /appointments/today` - Citas de hoy
- `GET /appointments/week` - Citas de la semana
- `GET /appointments/upcoming` - Próximas citas

## 🚀 Próximos Pasos

1. **Configurar interceptor en app.config.ts**:

```typescript
import { HTTP_INTERCEPTORS } from "@angular/common/http";
import { AuthInterceptor } from "./core";

providers: [
  {
    provide: HTTP_INTERCEPTORS,
    useClass: AuthInterceptor,
    multi: true,
  },
];
```

2. **Implementar guards de autenticación**
3. **Crear componentes para consumir estos servicios**
4. **Añadir manejo de loading states**
5. **Implementar notificaciones de éxito/error**
