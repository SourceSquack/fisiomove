import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { forkJoin } from 'rxjs';
import { map } from 'rxjs/operators';
import { Router } from '@angular/router';
import {
  AppointmentsService,
  CreateAppointmentRequest,
} from '../../../core/services/appointments.service';
import { PatientsService } from '../../../core/services/patients.service';
import { AuthService } from '../../../core/services/auth.service';
import { LoggerService } from '../../../core/services/logger.service';
import { Patient } from '../../../core/models/api.models';
import { MatDialog } from '@angular/material/dialog';
import { AppointmentTimeDialogComponent } from '../components/appointment-time-dialog/appointment-time-dialog.component';
import { MatChipsModule } from '@angular/material/chips';

interface TimeSlot {
  time: string;
  available: boolean;
}

@Component({
  selector: 'app-appointment-new',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatChipsModule],
  templateUrl: './appointment-new.component.html',
  styleUrls: ['./appointment-new.component.css'],
})
export class AppointmentNewComponent implements OnInit {
  private readonly appointmentsService = inject(AppointmentsService);
  private readonly patientsService = inject(PatientsService);
  private readonly authService = inject(AuthService);
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly dialog = inject(MatDialog);
  private readonly logger = inject(LoggerService);

  appointmentForm!: FormGroup;
  patients: Patient[] = [];
  isLoading = false;
  isSubmitting = false;
  isLoadingPatients = false;
  errorMessage = '';
  successMessage = '';

  // Tipos de cita disponibles
  appointmentTypes: { value: string; label: string }[] = [
    { value: 'evaluacion_inicial', label: 'Evaluación inicial' },
    { value: 'fisioterapia', label: 'Fisioterapia' },
    { value: 'rehabilitacion', label: 'Rehabilitación' },
    { value: 'seguimiento', label: 'Seguimiento' },
    { value: 'consulta', label: 'Consulta' },
    { value: 'otro', label: 'Otro' },
  ];

  durationOptions = [30, 45, 60];
  selectedDuration = 60;
  selectedTime: { time: string; duration: number } | null = null;
  selectedSlot: string | null = null;
  // Define the availableSlots array
  availableSlots: TimeSlot[] = [];

  ngOnInit(): void {
    this.initializeForm();
    this.logger.info('AppointmentNewComponent ngOnInit', {
      date: this.appointmentForm?.get('appointment_date')?.value,
    });
    this.loadPatients();

    this.appointmentForm?.valueChanges?.subscribe((vals) => {
      const { appointment_date } = vals;
      this.logger.debug('appointmentForm valueChanges', { appointment_date });
      if (appointment_date) {
        this.loadAvailableSlots(appointment_date);
      }
    });

    // initial load for default date
    const initDate = this.appointmentForm?.get('appointment_date')?.value;
    if (initDate) {
      this.loadAvailableSlots(initDate);
    }
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
        this.logger.info('Pacientes cargados', { count: patients?.length });
        this.isLoadingPatients = false;
      },
      error: (error) => {
        this.logger.error('Error al cargar pacientes', error);
        this.errorMessage =
          'Error al cargar la lista de pacientes. Intente nuevamente.';
        this.isLoadingPatients = false;
      },
    });
  }

  onSubmit(): void {
    this.logger.info('onSubmit invoked', {
      selectedSlot: this.selectedSlot,
      selectedTime: this.selectedTime,
    });
    let selTime = this.selectedTime;
    if (!selTime && this.selectedSlot) {
      selTime = {
        time: this.selectedSlot,
        duration: this.appointmentForm.value.duration_minutes,
      };
    }

    if (!selTime?.time || !selTime?.duration) {
      this.errorMessage =
        'Selecciona un horario disponible antes de crear la cita.';
      return;
    }

    let startTimeValue = selTime.time;
    if (!startTimeValue.includes('T')) {
      const date = this.appointmentForm.value.appointment_date;
      // Append clinic timezone offset (-05:00) to keep times consistent with backend
      startTimeValue = `${date}T${startTimeValue}:00-05:00`;
    }

    const payload = {
      start_time: startTimeValue,
      duration_minutes: selTime.duration,
      patient_id: this.appointmentForm.value.patient_id,
      physiotherapist_id: this.authService.getCurrentUser()?.id || '',
    };
    this.logger.debug('Checking availability payload', payload);
    this.appointmentsService.checkTimeSlotAvailability(payload).subscribe({
      next: (result) => {
        this.logger.debug('Availability check result', result);
        if (result.available) {
          this.crearCita();
        } else {
          this.errorMessage = 'El horario seleccionado ya no está disponible.';
        }
      },
      error: (err) => {
        this.logger.error('Error checking availability', err);
        this.errorMessage = 'Error al validar disponibilidad.';
      },
    });
  }

  /** Returns an array of human-friendly missing required fields for UI hints */
  getMissingFields(): string[] {
    const missing: string[] = [];
    const fv = this.appointmentForm.value;
    if (!fv.patient_id) missing.push('Paciente');
    if (!fv.appointment_date) missing.push('Fecha');
    // appointment_time might be set via selectedSlot
    if (!fv.appointment_time && !this.selectedSlot) missing.push('Hora');
    if (!fv.type) missing.push('Tipo de cita');
    if (!fv.duration_minutes) missing.push('Duración');
    return missing;
  }

  /**
   * Toggle selection of a slot from the template
   */
  toggleSelectSlot(slotTime: string, available: boolean): void {
    if (!available) return;
    this.selectedSlot = this.selectedSlot === slotTime ? null : slotTime;
    this.logger.debug('toggleSelectSlot', {
      slotTime,
      available,
      selectedSlot: this.selectedSlot,
    });
    // Also keep the form value in sync
    this.appointmentForm
      .get('appointment_time')
      ?.setValue(this.selectedSlot || '');
  }

  private crearCita(): void {
    this.logger.info('crearCita invoked');
    if (this.appointmentForm.valid && !this.isSubmitting) {
      this.isSubmitting = true;
      const formValue = this.appointmentForm.value;
      const currentUser = this.authService.getCurrentUser();
      if (!currentUser?.id) {
        this.errorMessage = 'Error: Usuario no autenticado o ID no disponible';
        this.isSubmitting = false;
        return;
      }
      const appointmentData: CreateAppointmentRequest = {
        patient_id: formValue.patient_id,
        appointment_date: formValue.appointment_date,
        appointment_time: formValue.appointment_time,
        type: formValue.type,
        duration_minutes: formValue.duration_minutes,
        notes: formValue.notes || undefined,
      };
      this.logger.debug('Crear cita payload', appointmentData);
      this.appointmentsService.createAppointment(appointmentData).subscribe({
        next: (response) => {
          this.logger.info('Cita creada exitosamente', response);
          this.successMessage = 'Cita creada exitosamente';
          this.errorMessage = '';
          setTimeout(() => {
            this.router.navigate(['/dashboard/appointments']);
          }, 1500);
        },
        error: (error) => {
          this.logger.error('Error al crear cita', error);
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

  openTimeDialog() {
    // Obtener datos actuales del formulario
    const selectedPatientId = this.appointmentForm.value.patient_id;
    const selectedDate = this.appointmentForm.value.appointment_date;
    if (!selectedPatientId || !selectedDate) {
      this.errorMessage =
        'Selecciona paciente y fecha antes de elegir horario.';
      return;
    }
    const dialogRef = this.dialog.open(AppointmentTimeDialogComponent, {
      data: {
        patient_id: selectedPatientId,
        date: selectedDate,
        duration: this.selectedDuration,
      },
    });
    dialogRef
      .afterClosed()
      .subscribe((result: { time: string; duration: number } | undefined) => {
        if (result) {
          this.logger.info('Time dialog result', result);
          this.selectedTime = result;
          // Sincronizar valores en el formulario
          this.appointmentForm.patchValue({
            appointment_time: result.time,
            duration_minutes: result.duration,
          });
        }
      });
  }

  // Obtener fecha mínima (hoy)
  getMinDate(): string {
    const today = new Date();
    return today.toISOString().split('T')[0];
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

  clearError(): void {
    this.errorMessage = '';
  }

  clearSuccess(): void {
    this.successMessage = '';
  }

  goBackToAppointments(): void {
    this.router.navigate(['/dashboard/appointments']);
  }

  /**
   * Cargar franjas horarias candidatas para la fecha y validar cada una contra el backend
   */
  private loadAvailableSlots(date: string): void {
    const patientId = this.appointmentForm.value.patient_id;
    const duration =
      this.appointmentForm.value.duration_minutes || this.selectedDuration;

    if (!date) {
      this.availableSlots = [];
      return;
    }

    // Prefer using the consolidated availability endpoint (GET /appointments/availability)
    this.isLoading = true;
    this.appointmentsService
      .getAvailability({
        date,
        duration_minutes: duration,
        patient_id: patientId || '',
        start_hour: 8,
        end_hour: 18,
        step_minutes: 30,
      })
      .subscribe({
        next: (res) => {
          this.logger.debug('Availability response', res);
          const slotsIso: string[] = res?.available_slots || [];
          this.availableSlots = slotsIso.map((iso) => {
            try {
              const regex = /T(\d{2}:\d{2})/;
              const match = regex.exec(iso);
              const time = match ? match[1] : iso;
              return { time, available: true } as TimeSlot;
            } catch (e) {
              this.logger.error('Error parsing slot ISO datetime', iso, e);
              return { time: iso, available: false } as TimeSlot;
            }
          });
          this.isLoading = false;
        },
        error: (error) => {
          this.logger.error(
            'Error al obtener disponibilidad consolidada',
            error
          );
          this.errorMessage =
            'Error al verificar disponibilidad. Intentando método alternativo...';
          const candidates = this.generateCandidateTimes(date, 8, 18, 30);
          const checks = candidates.map((time) =>
            this.appointmentsService
              .checkTimeSlotAvailability({
                // include clinic timezone offset
                start_time: `${date}T${time}:00-05:00`,
                duration_minutes: duration,
                patient_id: patientId || '',
              })
              .pipe(map((res) => ({ time, available: !!res?.available })))
          );
          this.logger.debug('Fallback availability candidates created', {
            count: checks.length,
          });
          forkJoin(checks).subscribe({
            next: (results: { time: string; available: boolean }[]) => {
              this.logger.debug('Fallback availability results', results);
              this.availableSlots = results;
              this.isLoading = false;
            },
            error: (err) => {
              this.logger.error('Fallback error', err);
              this.errorMessage =
                'Error al verificar disponibilidad. Intente nuevamente.';
              this.availableSlots = [];
              this.isLoading = false;
            },
          });
        },
      });
  }

  /**
   * Genera una lista de tiempos candidatas (HH:MM) para un día determinado
   */
  private generateCandidateTimes(
    date: string,
    startHour = 8,
    endHour = 18,
    stepMinutes = 30
  ): string[] {
    const times: string[] = [];
    for (let h = startHour; h < endHour; h++) {
      for (let m = 0; m < 60; m += stepMinutes) {
        times.push(
          `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
        );
      }
    }
    return times;
  }

  /**
   * Manejar cambios en la fecha o paciente
   */
  onPatientOrDateChange(): void {
    const date = this.appointmentForm.value.appointment_date;
    if (date) {
      this.loadAvailableSlots(date);
    }
  }

  /**
   * Seleccionar un horario disponible
   */
  selectTimeSlot(slot: TimeSlot): void {
    if (slot.available) {
      this.appointmentForm.get('appointment_time')?.setValue(slot.time);
    }
  }
}
