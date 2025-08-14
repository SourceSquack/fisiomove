import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Patient } from '../../core/models/api.models';

@Component({
  selector: 'app-patient-search-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './patient-search-modal.component.html',
  styleUrls: ['./patient-search-modal.component.css'],
})
export class PatientSearchModalComponent {
  @Input() loading: boolean = false;
  @Input() error: string | null = null;
  @Input() results: Patient[] = [];
  @Output() close = new EventEmitter<void>();
  @Output() selectPatient = new EventEmitter<Patient>();

  onSelect(patient: Patient) {
    this.selectPatient.emit(patient);
  }

  onClose() {
    this.close.emit();
  }

  // Métodos helper para el template
  trackByPatientId(index: number, patient: Patient): any {
    return patient.id || index;
  }

  hasPatientDetails(patient: Patient): boolean {
    return !!(patient.dni || patient.birth_date || patient.gender);
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

  getGenderLabel(gender: string): string {
    const genderMap: { [key: string]: string } = {
      M: 'Masculino',
      F: 'Femenino',
      Other: 'Otro',
    };
    return genderMap[gender] || gender;
  }
}
