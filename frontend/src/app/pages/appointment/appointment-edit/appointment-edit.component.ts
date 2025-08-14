import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import {
  AppointmentsService,
  UpdateAppointmentRequest,
} from '../../../core/services/appointments.service';
import { PatientsService } from '../../../core/services/patients.service';
import { Appointment, Patient } from '../../../core/models/api.models';

@Component({
  selector: 'app-appointment-edit',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './appointment-edit.component.html',
  styleUrls: ['./appointment-edit.component.css'],
})
export class AppointmentEditComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);
  private readonly appointmentsService = inject(AppointmentsService);
  private readonly patientsService = inject(PatientsService);

  appointmentForm!: FormGroup;
  appointment: Appointment | null = null;
  patients: Patient[] = [];
  isLoading = false;
  isSubmitting = false;
  errorMessage = '';

  appointmentTypes = [
    { value: 'evaluacion_inicial', label: 'Evaluación Inicial' },
    { value: 'fisioterapia', label: 'Fisioterapia' },
    { value: 'rehabilitacion', label: 'Rehabilitación' },
    { value: 'seguimiento', label: 'Seguimiento' },
    { value: 'consulta', label: 'Consulta' },
    { value: 'otro', label: 'Otro' },
  ];

  appointmentStatuses = [
    { value: 'programada', label: 'Programada' },
    { value: 'confirmada', label: 'Confirmada' },
    { value: 'completada', label: 'Completada' },
    { value: 'cancelada', label: 'Cancelada' },
    { value: 'no_show', label: 'No asistió' },
  ];

  ngOnInit(): void {
    const appointmentId = this.route.snapshot.paramMap.get('id');
    if (appointmentId) {
      this.initializeForm();
      this.loadPatients();
      this.loadAppointment(appointmentId);
    } else {
      this.router.navigate(['/dashboard/appointments']);
    }
  }

  private initializeForm(): void {
    this.appointmentForm = this.fb.group({
      patient_id: ['', [Validators.required]],
      appointment_date: ['', [Validators.required]],
      appointment_time: ['', [Validators.required]],
      appointment_type: ['', [Validators.required]],
      status: ['', [Validators.required]],
      duration_minutes: [
        60,
        [Validators.required, Validators.min(15), Validators.max(240)],
      ],
      notes: [''],
    });
  }

  loadPatients(): void {
    this.patientsService.getAllPatients().subscribe({
      next: (patients: any) => {
        this.patients = patients || [];
      },
      error: (error: any) => {
        console.error('Error al cargar pacientes:', error);
      },
    });
  }

  loadAppointment(appointmentId: string): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.appointmentsService.getAppointment(appointmentId).subscribe({
      next: (response: any) => {
        this.appointment = response.data || response;
        this.populateForm();
        this.isLoading = false;
      },
      error: (error: any) => {
        console.error('Error al cargar cita:', error);
        this.errorMessage = 'No se pudo cargar la información de la cita.';
        this.isLoading = false;
      },
    });
  }

  private populateForm(): void {
    if (!this.appointment) return;

    // Extraer fecha y hora del start_time
    const startTime = new Date(this.appointment.start_time);
    const date = startTime.toISOString().split('T')[0];
    const time = startTime.toTimeString().split(' ')[0].substring(0, 5);

    this.appointmentForm.patchValue({
      patient_id: this.appointment.patient_id,
      appointment_date: date,
      appointment_time: time,
      appointment_type: this.appointment.appointment_type,
      status: this.appointment.status,
      duration_minutes: this.appointment.duration_minutes || 60,
      notes: this.appointment.notes || '',
    });
  }

  onSubmit(): void {
    if (this.appointmentForm.valid && !this.isSubmitting && this.appointment) {
      this.isSubmitting = true;
      this.errorMessage = '';

      const formValue = this.appointmentForm.value;

      // Preparar datos para el backend
      const updateData: UpdateAppointmentRequest = {
        patient_id: formValue.patient_id,
        appointment_date: formValue.appointment_date,
        appointment_time: formValue.appointment_time,
        type: formValue.appointment_type,
        duration_minutes: formValue.duration_minutes,
        status: formValue.status,
        notes: formValue.notes,
      };

      this.appointmentsService
        .updateAppointment(this.appointment.id!, updateData)
        .subscribe({
          next: (response: any) => {
            console.log('Cita actualizada exitosamente:', response);
            this.router.navigate([
              '/dashboard/appointments',
              this.appointment!.id,
            ]);
          },
          error: (error: any) => {
            console.error('Error al actualizar cita:', error);
            this.errorMessage =
              'Error al actualizar la cita: ' +
              (error.message || 'Error desconocido');
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
    if (this.appointment?.id) {
      this.router.navigate(['/dashboard/appointments', this.appointment.id]);
    } else {
      this.router.navigate(['/dashboard/appointments']);
    }
  }

  getPatientFullName(patient: Patient): string {
    const firstName = patient.first_name || '';
    const lastName = patient.last_name || '';
    const fullName = `${firstName} ${lastName}`.trim();
    return fullName || patient.full_name || 'Sin nombre';
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
  get appointment_type() {
    return this.appointmentForm.get('appointment_type');
  }
  get status() {
    return this.appointmentForm.get('status');
  }
  get duration_minutes() {
    return this.appointmentForm.get('duration_minutes');
  }
  get notes() {
    return this.appointmentForm.get('notes');
  }
}
