import { Component, Input, OnChanges, SimpleChanges, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AppointmentsService } from '../../../../core/services/appointments.service';
import { Appointment } from '../../../../core/models/api.models';

@Component({
  selector: 'app-appointments-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './appointments-list.component.html',
  styleUrls: ['./appointments-list.component.css'],
})
export class AppointmentsListComponent implements OnChanges {
  private readonly appointmentsService = inject(AppointmentsService);
  private readonly router = inject(Router);

  @Input() selectedDate: Date | null = null;

  appointments: Appointment[] = [];
  isLoading = false;
  errorMessage = '';

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['selectedDate'] && this.selectedDate) {
      this.loadAppointmentsForDate(this.selectedDate);
    }
  }

  loadAppointmentsForDate(date: Date): void {
    this.isLoading = true;
    this.errorMessage = '';
    
    // Formatear fecha para el API (YYYY-MM-DD)
    const dateStr = date.toISOString().split('T')[0];
    
    this.appointmentsService.getAppointmentsByDate(dateStr).subscribe({
      next: (appointments) => {
        this.appointments = appointments.sort((a, b) => {
          // Ordenar por hora
          return new Date(a.start_time).getTime() - new Date(b.start_time).getTime();
        });
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading appointments for date:', error);
        this.errorMessage = 'Error al cargar las citas del día seleccionado';
        this.appointments = [];
        this.isLoading = false;
      }
    });
  }

  getFormattedDate(): string {
    if (!this.selectedDate) return '';
    
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    };
    
    return this.selectedDate.toLocaleDateString('es-ES', options);
  }

  formatTime(dateTime: string): string {
    return new Date(dateTime).toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getPatientFullName(appointment: Appointment): string {
    if (appointment.patient) {
      return appointment.patient.full_name || 
             `${appointment.patient.first_name || ''} ${appointment.patient.last_name || ''}`.trim() ||
             'Paciente sin nombre';
    }
    return 'Paciente no encontrado';
  }

  getAppointmentTypeLabel(type: string): string {
    const typeLabels: { [key: string]: string } = {
      'consulta': 'Consulta',
      'fisioterapia': 'Fisioterapia',
      'rehabilitacion': 'Rehabilitación',
      'seguimiento': 'Seguimiento',
      'evaluacion': 'Evaluación'
    };
    return typeLabels[type] || type;
  }

  getStatusLabel(status: string): string {
    const statusLabels: { [key: string]: string } = {
      'programada': 'Programada',
      'confirmada': 'Confirmada',
      'completada': 'Completada',
      'cancelada': 'Cancelada',
      'no_show': 'No presentó'
    };
    return statusLabels[status] || status;
  }

  getStatusColor(status: string): string {
    const statusColors: { [key: string]: string } = {
      'programada': '#ffa726',
      'confirmada': '#66bb6a',
      'completada': '#42a5f5',
      'cancelada': '#ef5350',
      'no_show': '#ab47bc'
    };
    return statusColors[status] || '#757575';
  }

  viewAppointment(appointmentId: string): void {
    this.router.navigate(['/dashboard/appointments/detail', appointmentId]);
  }

  editAppointment(appointmentId: string): void {
    this.router.navigate(['/dashboard/appointments/edit', appointmentId]);
  }

  createNewAppointment(): void {
    this.router.navigate(['/dashboard/appointments/new']);
  }

  trackByAppointmentId(index: number, appointment: Appointment): string {
    return appointment.id || index.toString();
  }

  getConfirmedAppointmentsCount(): number {
    return this.appointments.filter(app => app.status === 'confirmada').length;
  }

  getPendingAppointmentsCount(): number {
    return this.appointments.filter(app => app.status === 'programada').length;
  }
}
