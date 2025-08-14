import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import {
  AppointmentsService,
  CreateAppointmentRequest,
} from '../../../core/services/appointments.service';
import { PatientsService } from '../../../core/services/patients.service';
import { AuthService } from '../../../core/services/auth.service';
import { Patient } from '../../../core/models/api.models';

@Component({
  selector: 'app-appointment-new',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './appointment-new.component.html',
  styleUrls: ['./appointment-new.component.css'],
})
export class AppointmentNewComponent implements OnInit {
  private readonly appointmentsService = inject(AppointmentsService);
  private readonly patientsService = inject(PatientsService);
  private readonly authService = inject(AuthService);
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);

  appointmentForm!: FormGroup;
  patients: Patient[] = [];
  isLoading = false;
  isSubmitting = false;
  isLoadingPatients = false;
  errorMessage = '';
  successMessage = '';

  // Tipos de cita disponibles
  appointmentTypes = [
    'Evaluación inicial',
    'Fisioterapia',
    'Rehabilitación',
    'Seguimiento',
    'Consulta',
    'Otro',
  ];

  // Horarios disponibles (esto podría venir del backend)
  availableHours = [
    '08:00',
    '08:30',
    '09:00',
    '09:30',
    '10:00',
    '10:30',
    '11:00',
    '11:30',
    '12:00',
    '12:30',
    '14:00',
    '14:30',
    '15:00',
    '15:30',
    '16:00',
    '16:30',
    '17:00',
    '17:30',
    '18:00',
    '18:30',
  ];

  ngOnInit(): void {
    this.initializeForm();
    this.loadPatients();
  }

  private initializeForm(): void {
    // Fecha mínima: hoy
    const today = new Date();
    const minDate = today.toISOString().split('T')[0];

    this.appointmentForm = this.fb.group({
      patient_id: ['', [Validators.required]],
      appointment_date: [minDate, [Validators.required]],
      appointment_time: ['', [Validators.required]],
      type: ['', [Validators.required]],
      duration_minutes: [
        60,
        [Validators.required, Validators.min(15), Validators.max(180)],
      ],
      notes: [''],
    });
  }

  private loadPatients(): void {
    this.isLoadingPatients = true;
    this.patientsService.getAllPatients().subscribe({
      next: (patients) => {
        this.patients = patients;
        this.isLoadingPatients = false;
      },
      error: (error) => {
        console.error('Error al cargar pacientes:', error);
        this.errorMessage =
          'Error al cargar la lista de pacientes. Intente nuevamente.';
        this.isLoadingPatients = false;
      },
    });
  }

  onSubmit(): void {
    if (this.appointmentForm.valid && !this.isSubmitting) {
      this.isSubmitting = true;

      const formValue = this.appointmentForm.value;
      const currentUser = this.authService.getCurrentUser();

      if (!currentUser || !currentUser.id) {
        this.errorMessage = 'Error: Usuario no autenticado o ID no disponible';
        this.isSubmitting = false;
        return;
      }

      // Preparar datos de la cita
      const appointmentData: CreateAppointmentRequest = {
        patient_id: formValue.patient_id,
        // physiotherapist_id: currentUser.id,
        appointment_date: formValue.appointment_date,
        appointment_time: formValue.appointment_time,
        type: formValue.type,
        duration_minutes: formValue.duration_minutes,
        notes: formValue.notes || undefined,
      };

      this.appointmentsService.createAppointment(appointmentData).subscribe({
        next: (response) => {
          console.log('Cita creada exitosamente:', response);
          this.successMessage = 'Cita creada exitosamente';
          this.errorMessage = '';
          // Redirigir después de un breve delay para que se vea el mensaje
          setTimeout(() => {
            this.router.navigate(['/dashboard/appointments']);
          }, 1500);
        },
        error: (error) => {
          console.error('Error al crear cita:', error);
          this.errorMessage =
            'Error al crear la cita: ' +
            (error.message || 'Ha ocurrido un error inesperado.');
          this.successMessage = '';
          this.isSubmitting = false;
        },
      });
    } else {
      this.markFormGroupTouched(this.appointmentForm);
    }
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach((key) => {
      const control = formGroup.get(key);
      control?.markAsTouched();
    });
  }

  goBack(): void {
    this.router.navigate(['/dashboard/appointments']);
  }

  // Getters para validación en template
  get patient_id() {
    return this.appointmentForm.get('patient_id');
  }
  get appointment_date() {
    return this.appointmentForm.get('appointment_date');
  }
  get appointment_time() {
    return this.appointmentForm.get('appointment_time');
  }
  get type() {
    return this.appointmentForm.get('type');
  }
  get duration_minutes() {
    return this.appointmentForm.get('duration_minutes');
  }
  get notes() {
    return this.appointmentForm.get('notes');
  }

  // Obtener nombre del paciente seleccionado
  getPatientName(patientId: string): string {
    const patient = this.patients.find((p) => p.id === patientId);
    return patient?.full_name || 'Paciente';
  }

  // Validar si la fecha seleccionada es válida
  isDateValid(): boolean {
    const selectedDate = this.appointmentForm.get('appointment_date')?.value;
    if (!selectedDate) return false;

    const selected = new Date(selectedDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return selected >= today;
  }

  // Generar horarios disponibles para la fecha seleccionada
  getAvailableTimesForDate(): string[] {
    // Aquí podrías hacer una llamada al backend para obtener horarios disponibles
    // Por ahora devuelvo todos los horarios
    return this.availableHours;
  }

  // Obtener fecha mínima (hoy)
  getMinDate(): string {
    const today = new Date();
    return today.toISOString().split('T')[0];
  }

  clearError(): void {
    this.errorMessage = '';
  }

  clearSuccess(): void {
    this.successMessage = '';
  }

  goBackToAppointments(): void {
    this.router.navigate(['/dashboard/appointments']);
  }
}
