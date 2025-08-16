import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import {
  ReactiveFormsModule,
  FormGroup,
  FormBuilder,
  Validators,
} from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';

import { PatientsService } from '../../../core/services/patients.service';
import { Patient } from '../../../core/models/api.models';

@Component({
  selector: 'app-patient-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './patient-detail.component.html',
  styleUrls: ['./patient-detail.component.css'],
})
export class PatientDetailComponent implements OnInit, OnDestroy {
  private readonly destroy$ = new Subject<void>();

  patient: Patient | null = null;
  patientForm: FormGroup;
  isLoading = true;
  isEditing = false;
  isSaving = false;
  error: string | null = null;
  patientId: string;

  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly patientsService = inject(PatientsService);
  private readonly fb = inject(FormBuilder);

  constructor() {
    this.patientId = this.route.snapshot.params['id'];
    this.patientForm = this.createForm();
  }

  ngOnInit(): void {
    this.loadPatient();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private createForm(): FormGroup {
    return this.fb.group({
      full_name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      dni: ['', [Validators.pattern(/^\d{8,12}$/)]],
      birth_date: [''],
      gender: [''],
      address: [''],
      emergency_contact: [''],
      medical_history: [''],
      notes: [''],
    });
  }

  private loadPatient(): void {
    this.isLoading = true;
    this.error = null;

    this.patientsService
      .getPatient(this.patientId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          this.patient = response.data || response; // Handle both ApiResponse and direct Patient
          if (this.patient) {
            this.populateForm(this.patient);
          }
          this.isLoading = false;
        },
        error: (error: any) => {
          console.error('Error loading patient:', error);
          this.error = 'Error al cargar los datos del paciente';
          this.isLoading = false;
        },
      });
  }

  private populateForm(patient: Patient): void {
    this.patientForm.patchValue({
      full_name: patient.full_name,
      email: patient.email,
      dni: patient.dni || '',
      birth_date: patient.birth_date
        ? new Date(patient.birth_date).toISOString().split('T')[0]
        : '',
      gender: patient.gender || '',
      address: patient.address || '',
      emergency_contact: patient.emergency_contact || '',
      medical_history: patient.medical_history || '',
      notes: patient.notes || '',
    });
  }

  toggleEdit(): void {
    this.isEditing = !this.isEditing;
    if (!this.isEditing && this.patient) {
      // Si cancela la edición, restaura los valores originales
      this.populateForm(this.patient);
    }
  }

  onSubmit(): void {
    if (this.patientForm.valid && this.patient?.id) {
      this.isSaving = true;
      this.error = null;

      const updatedPatient = {
        ...this.patientForm.value,
        birth_date: this.patientForm.value.birth_date
          ? new Date(this.patientForm.value.birth_date).toISOString()
          : null,
      };

      this.patientsService
        .updatePatient(this.patient.id, updatedPatient)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (response: any) => {
            this.patient = response.data || response;
            this.isEditing = false;
            this.isSaving = false;
            // Mostrar mensaje de éxito (opcional)
          },
          error: (error: any) => {
            console.error('Error updating patient:', error);
            this.error = 'Error al actualizar los datos del paciente';
            this.isSaving = false;
          },
        });
    }
  }

  goBack(): void {
    this.router.navigate(['/dashboard/patients']);
  }

  // Helpers para el template
  getAge(birthDate: string | Date | null): number | null {
    if (!birthDate) return null;
    const birth = new Date(birthDate);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birth.getDate())
    ) {
      age--;
    }
    return age;
  }

  formatDate(date: string | Date | null): string {
    if (!date) return 'No especificado';
    return new Date(date).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  getGenderLabel(gender: string | null): string {
    switch (gender) {
      case 'M':
        return 'Masculino';
      case 'F':
        return 'Femenino';
      case 'O':
        return 'Otro';
      default:
        return 'No especificado';
    }
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.patientForm.get(fieldName);
    return !!(field?.invalid && (field?.dirty || field?.touched));
  }

  getFieldError(fieldName: string): string {
    const field = this.patientForm.get(fieldName);
    if (!field?.errors) return '';

    const errors = field.errors;
    if (errors['required']) return 'Este campo es obligatorio';
    if (errors['email']) return 'Ingrese un email válido';
    if (errors['minlength'])
      return `Mínimo ${errors['minlength'].requiredLength} caracteres`;
    if (errors['pattern']) {
      if (fieldName === 'dni') return 'DNI debe tener entre 8 y 12 dígitos';
      if (fieldName === 'phone') return 'Formato de teléfono inválido';
    }
    return 'Campo inválido';
  }
}
