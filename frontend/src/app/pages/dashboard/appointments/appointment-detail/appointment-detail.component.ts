import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { AppointmentsService } from '../../../../core/services/appointments.service';
import { Appointment } from '../../../../core/models/api.models';

@Component({
  selector: 'app-appointment-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './appointment-detail.component.html',
  styleUrls: ['./appointment-detail.component.css'],
})
export class AppointmentDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly appointmentsService = inject(AppointmentsService);

  appointment: Appointment | null = null;
  isLoading = false;
  errorMessage = '';

  ngOnInit(): void {
    const appointmentId = this.route.snapshot.paramMap.get('id');
    if (appointmentId) {
      this.loadAppointment(appointmentId);
    } else {
      this.router.navigate(['/dashboard/appointments']);
    }
  }

  loadAppointment(appointmentId: string): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.appointmentsService.getAppointment(appointmentId).subscribe({
      next: (response: any) => {
        this.appointment = response.data || response;
        this.isLoading = false;
      },
      error: (error: any) => {
        console.error('Error al cargar cita:', error);
        this.errorMessage = 'No se pudo cargar la información de la cita.';
        this.isLoading = false;
      },
    });
  }

  goBack(): void {
    this.router.navigate(['/dashboard/appointments']);
  }

  editAppointment(): void {
    if (this.appointment?.id) {
      this.router.navigate([
        '/dashboard/appointments/edit',
        this.appointment.id,
      ]);
    }
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

  getPatientFullName(): string {
    if (this.appointment?.patient) {
      const firstName = this.appointment.patient.first_name || '';
      const lastName = this.appointment.patient.last_name || '';
      const fullName = `${firstName} ${lastName}`.trim();
      return fullName || 'Paciente Sin Nombre';
    }
    return `Paciente ID: ${this.appointment?.patient_id}`;
  }

  getStatusColor(status: string): string {
    const statusColors: { [key: string]: string } = {
      programada: '#fbbf24',
      confirmada: '#10b981',
      completada: '#6b7280',
      cancelada: '#ef4444',
      no_show: '#f97316',
    };
    return statusColors[status] || '#6b7280';
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  formatTime(timeString: string): string {
    if (!timeString) {
      return '--:--';
    }

    if (timeString.includes('T')) {
      const time = timeString.split('T')[1];
      if (time) {
        return time.substring(0, 5);
      }
    }

    return timeString.substring(0, 5);
  }
}
