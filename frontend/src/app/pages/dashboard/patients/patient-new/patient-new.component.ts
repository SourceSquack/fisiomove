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
  PatientsService,
  CreatePatientRequest,
} from '../../../../core/services/patients.service';

@Component({
  selector: 'app-patient-new',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './patient-new.component.html',
  styleUrls: ['./patient-new.component.css'],
})
export class PatientNewComponent implements OnInit {
  private readonly patientsService = inject(PatientsService);
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);

  patientForm!: FormGroup;
  isLoading = false;
  isSubmitting = false;

  ngOnInit(): void {
    this.initializeForm();
  }

  private initializeForm(): void {
    this.patientForm = this.fb.group({
      // Datos del usuario
      first_name: ['', [Validators.required, Validators.minLength(2)]],
      last_name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.email]], // Email opcional
      phone: ['', [Validators.pattern(/^\+?[1-9]\d{1,14}$/)]],

      // Datos del paciente
      dni: ['', [Validators.required, Validators.pattern(/^\d{10}$/)]],
      birth_date: [''],
      gender: [''],
      address: [''],
      emergency_contact: [''],
      medical_history: [''],
      notes: [''],
    });
  }

  onSubmit(): void {
    if (this.patientForm.valid && !this.isSubmitting) {
      this.isSubmitting = true;

      const formValue = this.patientForm.value;

      // Combinar first_name y last_name en full_name
      const fullName = `${formValue.first_name} ${formValue.last_name}`.trim();

      // Preparar datos del paciente según el esquema del backend
      const patientData: CreatePatientRequest = {
        full_name: fullName,
        dni: formValue.dni,
        email: formValue.email || undefined,
        phone: formValue.phone || undefined,
        birth_date: formValue.birth_date || undefined,
        gender: formValue.gender || undefined,
        medical_history: formValue.medical_history || undefined,
        // auth_user_id se puede omitir, el backend lo manejará
      };

      this.patientsService.createPatient(patientData).subscribe({
        next: (response) => {
          console.log('Paciente creado exitosamente:', response);
          alert('Paciente creado exitosamente');
          this.router.navigate(['/dashboard/patients']);
        },
        error: (error) => {
          console.error('Error al crear paciente:', error);
          alert('Error al crear el paciente: ' + (error.message || 'Ha ocurrido un error inesperado.'));
          this.isSubmitting = false;
        },
      });
    } else {
      this.markFormGroupTouched(this.patientForm);
    }
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach((key) => {
      const control = formGroup.get(key);
      control?.markAsTouched();
    });
  }

  goBack(): void {
    this.router.navigate(['/dashboard/patients']);
  }

  // Getters para validación en template
  get first_name() {
    return this.patientForm.get('first_name');
  }
  get last_name() {
    return this.patientForm.get('last_name');
  }
  get email() {
    return this.patientForm.get('email');
  }
  get phone() {
    return this.patientForm.get('phone');
  }
  get dni() {
    return this.patientForm.get('dni');
  }
  get birth_date() {
    return this.patientForm.get('birth_date');
  }
  get gender() {
    return this.patientForm.get('gender');
  }
  get address() {
    return this.patientForm.get('address');
  }
  get emergency_contact() {
    return this.patientForm.get('emergency_contact');
  }
  get medical_history() {
    return this.patientForm.get('medical_history');
  }
  get notes() {
    return this.patientForm.get('notes');
  }
}
