import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { PatientsService } from '../../core/services/patients.service';
import { PatientsStore } from '../../core/stores/patients.store';
import { Patient } from '../../core/models/api.models';

@Component({
  selector: 'app-patients',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './patients.component.html',
  styleUrls: ['./patients.component.css'],
})
export class PatientsComponent implements OnInit {
  private readonly patientsService = inject(PatientsService);
  private readonly patientsStore = inject(PatientsStore);
  private readonly router = inject(Router);

  // Signals del store
  private readonly patientsSignal = this.patientsStore.filteredPatients;
  private readonly isLoadingSignal = this.patientsStore.isLoading;
  private readonly errorSignal = this.patientsStore.error;

  // Filtros
  selectedGender: 'M' | 'F' | 'Other' | '' = '';

  // Getters para el template
  get patients(): Patient[] {
    return this.patientsSignal();
  }

  get loading(): boolean {
    return this.isLoadingSignal();
  }

  get error(): string | null {
    return this.errorSignal();
  }

  ngOnInit(): void {
    // Limpiar filtros al inicializar el componente para evitar filtros activos
    this.patientsStore.clearFilters();
    this.selectedGender = ''; // Resetear el select del template
    this.loadPatients();
  }

  loadPatients(): void {
    this.patientsStore.setLoading(true);
    this.patientsStore.clearError();

    this.patientsService.getAllPatients().subscribe({
      next: (patients) => {
        this.patientsStore.setPatients(patients || []);
        this.patientsStore.setLoading(false);
      },
      error: (err) => {
        const errorMessage =
          'Error al cargar pacientes: ' + (err.message || 'Error desconocido');
        this.patientsStore.setError(errorMessage);
        this.patientsStore.setLoading(false);
      },
    });
  }

  onFilterChange(): void {
    // Usar el store para establecer el filtro de género
    this.patientsStore.setFilters({ gender: this.selectedGender || undefined });
  }

  goToDashboard(): void {
    this.router.navigate(['/dashboard']);
  }

  viewPatient(patientId: string): void {
    this.router.navigate(['/dashboard/patients', patientId]);
  }

  createNewPatient(): void {
    this.router.navigate(['/dashboard/patients', 'new']);
  }

  getGenderLabel(gender: string): string {
    const genderMap: { [key: string]: string } = {
      M: 'Masculino',
      F: 'Femenino',
      Other: 'Otro',
    };
    return genderMap[gender] || gender;
  }

  formatDate(dateString: string): string {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return dateString;
    }
  }
}
