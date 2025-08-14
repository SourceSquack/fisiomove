import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import {
  AppointmentsService,
  AppointmentFilters,
} from '../../core/services/appointments.service';
import { Appointment } from '../../core/models/api.models';

@Component({
  selector: 'app-appointments',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './appointments.component.html',
  styleUrls: ['./appointments.component.css'],
})
export class AppointmentsComponent implements OnInit {
  private readonly appointmentsService = inject(AppointmentsService);
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);

  appointments: Appointment[] = [];
  isLoading = false;
  errorMessage = '';
  currentPage = 1;
  totalPages = 1;
  totalItems = 0;
  pageSize = 10;

  filterForm!: FormGroup;

  // Modal state
  showModal = false;
  selectedAppointmentId: string | null = null;
  selectedAppointment: Appointment | null = null;

  // Estados de citas
  appointmentStatuses = [
    { value: '', label: 'Todos los estados' },
    { value: 'programada', label: 'Programada' },
    { value: 'confirmada', label: 'Confirmada' },
    { value: 'completada', label: 'Completada' },
    { value: 'cancelada', label: 'Cancelada' },
    { value: 'no_show', label: 'No asistió' },
  ];

  ngOnInit(): void {
    // Verificar token de autenticación
    const token = localStorage.getItem('fisiomove_token');
    console.log('🔑 Token en ngOnInit:', {
      exists: !!token,
      length: token?.length || 0,
      preview: token ? token.substring(0, 20) + '...' : 'NO TOKEN',
    });

    if (!token) {
      console.log('❌ No hay token, redirigiendo a login');
      this.router.navigate(['/login']);
      return;
    }

    this.initializeFilters();
    this.loadAppointments();
  }

  private initializeFilters(): void {
    this.filterForm = this.fb.group({
      status: [''],
      date_from: [''],
      date_to: [''],
      patient_search: [''], // Para buscar por nombre de paciente
    });
  }

  loadAppointments(): void {
    this.isLoading = true;
    this.errorMessage = '';
    const filters = this.buildFilters();

    console.log('🔄 Cargando citas con filtros:', filters);

    this.appointmentsService.getAppointments(filters).subscribe({
      next: (appointments) => {
        console.log('✅ Citas cargadas exitosamente:', appointments);
        // El backend devuelve una lista directa, no una respuesta paginada
        this.appointments = appointments || [];
        this.totalItems = this.appointments.length;
        this.totalPages = 1; // Sin paginación por ahora
        this.isLoading = false;
        console.log('📊 Total de citas cargadas:', this.appointments.length);
      },
      error: (error) => {
        console.error('❌ Error al cargar citas:', error);
        this.errorMessage =
          'No se pudieron cargar las citas. Verifique su conexión e intente nuevamente.';
        this.appointments = [];
        this.isLoading = false;
      },
    });
  }

  private buildFilters(): AppointmentFilters {
    const formValue = this.filterForm.value;
    const filters: AppointmentFilters = {
      page: this.currentPage,
      size: this.pageSize,
    };

    if (formValue.status) {
      filters.status = formValue.status;
    }
    if (formValue.date_from) {
      filters.date_from = formValue.date_from;
    }
    if (formValue.date_to) {
      filters.date_to = formValue.date_to;
    }

    return filters;
  }

  onFilterChange(): void {
    this.currentPage = 1; // Reset to first page when filtering
    this.loadAppointments();
  }

  onPageChange(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadAppointments();
    }
  }

  createNewAppointment(): void {
    this.router.navigate(['/dashboard/appointments/new']);
  }

  viewAppointment(appointmentId: string): void {
    this.router.navigate(['/dashboard/appointments', appointmentId]);
  }

  getStatusLabel(status: string): string {
    const statusLabels: { [key: string]: string } = {
      programada: 'Programada',
      confirmada: 'Confirmada',
      completada: 'Completada',
      cancelada: 'Cancelada',
      no_show: 'No asistió',
    };
    return statusLabels[status] || status;
  }

  getAppointmentTypeLabel(type: string): string {
    const typeLabels: { [key: string]: string } = {
      evaluacion_inicial: 'Evaluación Inicial',
      fisioterapia: 'Fisioterapia',
      rehabilitacion: 'Rehabilitación',
      seguimiento: 'Seguimiento',
      consulta: 'Consulta',
      otro: 'Otro',
    };
    return typeLabels[type] || type;
  }

  getPatientFullName(appointment: Appointment): string {
    if (appointment.patient) {
      const firstName = appointment.patient.first_name || '';
      const lastName = appointment.patient.last_name || '';
      const fullName = `${firstName} ${lastName}`.trim();
      return fullName || 'Paciente Sin Nombre';
    }
    return `Paciente ID: ${appointment.patient_id}`;
  }

  getStatusColor(status: string): string {
    const statusColors: { [key: string]: string } = {
      programada: '#fbbf24', // Amarillo
      confirmada: '#10b981', // Verde
      completada: '#6b7280', // Gris
      cancelada: '#ef4444', // Rojo
      no_show: '#f97316', // Naranja
      // Legacy values para compatibilidad
      scheduled: '#fbbf24',
      confirmed: '#10b981',
      completed: '#6b7280',
      cancelled: '#ef4444',
    };
    return statusColors[status] || '#6b7280';
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }

  formatTime(timeString: string): string {
    if (!timeString) {
      return '--:--';
    }

    // Si es un ISO string completo, extraer solo la hora
    if (timeString.includes('T')) {
      const time = timeString.split('T')[1];
      if (time) {
        return time.substring(0, 5); // HH:MM
      }
    }

    // Si ya es solo tiempo, tomar los primeros 5 caracteres
    return timeString.substring(0, 5); // HH:MM
  }

  editAppointment(appointmentId: string): void {
    this.router.navigate(['/dashboard/appointments/edit', appointmentId]);
  }

  cancelAppointment(appointmentId: string): void {
    // Encontrar la cita completa
    const appointment = this.appointments.find((ap) => ap.id === appointmentId);
    if (appointment) {
      this.selectedAppointment = appointment;
      this.selectedAppointmentId = appointmentId;
      this.showModal = true;
    }
  }

  confirmCancelAppointment(): void {
    if (!this.selectedAppointmentId) return;

    this.appointmentsService
      .cancelAppointment(this.selectedAppointmentId)
      .subscribe({
        next: () => {
          this.errorMessage = '';
          this.closeModal();
          this.loadAppointments(); // Recargar la lista
        },
        error: (error) => {
          console.error('Error al cancelar cita:', error);
          this.errorMessage =
            'No se pudo cancelar la cita. Intente nuevamente.';
          this.closeModal();
        },
      });
  }

  confirmDeleteAppointment(): void {
    if (!this.selectedAppointmentId) return;

    this.appointmentsService
      .deleteAppointment(this.selectedAppointmentId)
      .subscribe({
        next: () => {
          this.errorMessage = '';
          this.closeModal();
          this.loadAppointments(); // Recargar la lista
        },
        error: (error) => {
          console.error('Error al eliminar cita:', error);
          this.errorMessage =
            'No se pudo eliminar la cita. Intente nuevamente.';
          this.closeModal();
        },
      });
  }

  closeModal(): void {
    this.showModal = false;
    this.selectedAppointmentId = null;
    this.selectedAppointment = null;
  }

  goBackToDashboard(): void {
    this.router.navigate(['/dashboard']);
  }

  clearError(): void {
    this.errorMessage = '';
  }
}
