import { computed } from '@angular/core';
import {
  patchState,
  signalStore,
  withComputed,
  withMethods,
  withState,
} from '@ngrx/signals';
import { Patient } from '../models/api.models';

export interface PatientsState {
  patients: Patient[];
  selectedPatient: Patient | null;
  isLoading: boolean;
  error: string | null;
  searchTerm: string;
  filters: {
    gender?: 'M' | 'F' | 'Other';
    ageRange?: { min: number; max: number };
    hasActiveAppointments?: boolean;
  };
}

const initialState: PatientsState = {
  patients: [],
  selectedPatient: null,
  isLoading: false,
  error: null,
  searchTerm: '',
  filters: {},
};

export const PatientsStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withComputed((store) => ({
    filteredPatients: computed(() => {
      const patients = store.patients();
      const searchTerm = store.searchTerm().toLowerCase();
      const filters = store.filters();

      return patients.filter((patient) => {
        if (searchTerm) {
          const searchableText = [
            patient.user?.full_name,
            patient.user?.email,
            patient.emergency_contact,
          ]
            .join(' ')
            .toLowerCase();

          if (!searchableText.includes(searchTerm)) {
            return false;
          }
        }

        if (filters.gender && patient.gender !== filters.gender) {
          return false;
        }

        if (filters.ageRange && patient.birth_date) {
          const birthYear = new Date(patient.birth_date).getFullYear();
          const currentYear = new Date().getFullYear();
          const age = currentYear - birthYear;

          if (age < filters.ageRange.min || age > filters.ageRange.max) {
            return false;
          }
        }

        return true;
      });
    }),

    patientsByGender: computed(() => {
      const patients = store.patients();

      return patients.reduce((acc, patient) => {
        const gender = patient.gender || 'Other';
        if (!acc[gender]) {
          acc[gender] = [];
        }
        acc[gender].push(patient);
        return acc;
      }, {} as Record<string, Patient[]>);
    }),

    totalPatients: computed(() => {
      return store.patients().length;
    }),

    patientsWithMedicalHistory: computed(() => {
      const patients = store.patients();
      return patients.filter(
        (patient) =>
          patient.medical_history && patient.medical_history.trim() !== ''
      );
    }),
  })),
  withMethods((store) => ({
    setPatients(patients: Patient[]): void {
      patchState(store, { patients });
    },

    addPatient(patient: Patient): void {
      const currentPatients = store.patients();
      patchState(store, {
        patients: [...currentPatients, patient],
      });
    },

    updatePatient(updatedPatient: Patient): void {
      const currentPatients = store.patients();
      const updatedPatients = currentPatients.map((patient) =>
        patient.id === updatedPatient.id ? updatedPatient : patient
      );
      patchState(store, { patients: updatedPatients });
    },

    removePatient(patientId: string): void {
      const currentPatients = store.patients();
      const filteredPatients = currentPatients.filter(
        (patient) => patient.id !== patientId
      );
      patchState(store, { patients: filteredPatients });
    },

    setSelectedPatient(patient: Patient | null): void {
      patchState(store, { selectedPatient: patient });
    },

    setSearchTerm(searchTerm: string): void {
      patchState(store, { searchTerm });
    },

    setFilters(filters: Partial<PatientsState['filters']>): void {
      const currentFilters = store.filters();
      patchState(store, {
        filters: { ...currentFilters, ...filters },
      });
    },

    clearFilters(): void {
      patchState(store, { filters: {}, searchTerm: '' });
    },

    setLoading(isLoading: boolean): void {
      patchState(store, { isLoading });
    },

    setError(error: string | null): void {
      patchState(store, { error });
    },

    clearError(): void {
      patchState(store, { error: null });
    },
  }))
);
