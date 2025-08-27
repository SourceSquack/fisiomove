import { TitleService } from '../../core/services/title.service';
import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { PatientsService } from '../../core/services/patients.service';
import { PatientsStore } from '../../core/stores/patients.store';
import { Patient } from '../../core/models/api.models';
import { AgGridAngular } from 'ag-grid-angular';
import type { ColDef } from 'ag-grid-community';

@Component({
  selector: 'app-patients',
  standalone: true,
  imports: [CommonModule, FormsModule, AgGridAngular],
  templateUrl: './patients.component.html',
  styleUrls: ['./patients.component.css'],
})
export class PatientsComponent implements OnInit {
  selectedGender: 'M' | 'F' | 'Other' | '' = '';
  rowsData: PatientRow[] = [];
  colsData: ColDef[] = [
    { field: 'is_active', headerName: 'Activo', maxWidth: 100 },
    { field: 'full_name', headerName: 'Nombre' },
    {
      field: 'age',
      headerName: 'Edad',
      maxWidth: 75,
      cellStyle: { textAlign: 'center' },
    },
    { field: 'email', headerName: 'Correo' },
    { field: 'phone', headerName: 'Teléfono' },
    {
      field: 'gender',
      headerName: 'Género',
      cellStyle: { textAlign: 'center' },
    },
    { field: 'allergies', headerName: 'Alérgias' },
  ];

  constructor(
    private readonly patientsService: PatientsService,
    @Inject(PatientsStore) private readonly patientsStore: any,
    private readonly router: Router,
    @Inject(TitleService) private readonly titleService: TitleService
  ) {}

  get patients(): Patient[] {
    return this.patientsStore.filteredPatients();
  }

  get loading(): boolean {
    return this.patientsStore.isLoading();
  }

  get error(): string | null {
    return this.patientsStore.error();
  }

  ngOnInit(): void {
    this.titleService.setTitle('Gestión de pacientes');
    this.patientsStore.clearFilters();
    this.selectedGender = '';
    this.loadPatients();
  }

  loadPatients(): void {
    this.patientsStore.setLoading(true);
    this.patientsStore.clearError();

    this.patientsService.getAllPatients().subscribe({
      next: (patients) => {
        const list = patients || [];
        this.patientsStore.setPatients(list);
        this.patientsStore.setLoading(false);
        // Build rowsData from the store's filteredPatients so filters apply
        this.updateRowsFromStore();
        console.log(`➡️ ~ loadPatients ~ patients:`, list);
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
    // Rebuild rows from the store after changing filters
    this.updateRowsFromStore();
  }

  // Recompute rowsData from the store's filtered patients
  updateRowsFromStore(): void {
    const list = this.patients || [];
    this.rowsData = list.map((p) => ({
      ...p,
      age: this.getAge(p.birth_date ?? null),
      birth_date_display: this.formatDate(p.birth_date ?? ''),
    }));
  }

  goToDashboard(): void {
    this.router.navigate(['/dashboard']);
  }

  // Navegar a la vista del paciente (rowData tipado)
  viewPatient(rowData: Patient) {
    this.router.navigate(['/dashboard/patients', String(rowData?.id)]);
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
  getAge(birthDate: string | Date | null): string {
    if (!birthDate) return '';
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
    return String(age);
  }
}

// Interfaz local para filas con campos derivados (edad y fecha formateada)
interface PatientRow extends Patient {
  age: string;
  birth_date_display: string;
}
