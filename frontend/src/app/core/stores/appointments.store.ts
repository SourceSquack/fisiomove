import { computed } from '@angular/core';
import {
  patchState,
  signalStore,
  withComputed,
  withMethods,
  withState,
} from '@ngrx/signals';
import { Appointment } from '../models/api.models';

export interface AppointmentsState {
  appointments: Appointment[];
  selectedAppointment: Appointment | null;
  isLoading: boolean;
  error: string | null;
  filters: {
    status?: string;
    patientId?: string;
    dateFrom?: string;
    dateTo?: string;
  };
}

const initialState: AppointmentsState = {
  appointments: [],
  selectedAppointment: null,
  isLoading: false,
  error: null,
  filters: {},
};

export const AppointmentsStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withComputed((store) => ({
    filteredAppointments: computed(() => {
      const appointments = store.appointments();
      const filters = store.filters();

      return appointments.filter((appointment) => {
        if (filters.status && appointment.status !== filters.status) {
          return false;
        }
        if (filters.patientId && appointment.patient_id !== filters.patientId) {
          return false;
        }
        if (
          filters.dateFrom &&
          appointment.appointment_date < filters.dateFrom
        ) {
          return false;
        }
        if (filters.dateTo && appointment.appointment_date > filters.dateTo) {
          return false;
        }
        return true;
      });
    }),

    todayAppointments: computed(() => {
      const appointments = store.appointments();
      const today = new Date().toISOString().split('T')[0];

      return appointments.filter(
        (appointment) => appointment.appointment_date === today
      );
    }),

    upcomingAppointments: computed(() => {
      const appointments = store.appointments();
      const today = new Date().toISOString().split('T')[0];

      return appointments.filter(
        (appointment) =>
          appointment.appointment_date >= today &&
          appointment.status === 'scheduled'
      );
    }),

    appointmentsByStatus: computed(() => {
      const appointments = store.appointments();

      return appointments.reduce((acc, appointment) => {
        const status = appointment.status;
        if (!acc[status]) {
          acc[status] = [];
        }
        acc[status].push(appointment);
        return acc;
      }, {} as Record<string, Appointment[]>);
    }),
  })),
  withMethods((store) => ({
    setAppointments(appointments: Appointment[]): void {
      patchState(store, { appointments });
    },

    addAppointment(appointment: Appointment): void {
      const currentAppointments = store.appointments();
      patchState(store, {
        appointments: [...currentAppointments, appointment],
      });
    },

    updateAppointment(updatedAppointment: Appointment): void {
      const currentAppointments = store.appointments();
      const updatedAppointments = currentAppointments.map((appointment) =>
        appointment.id === updatedAppointment.id
          ? updatedAppointment
          : appointment
      );
      patchState(store, { appointments: updatedAppointments });
    },

    removeAppointment(appointmentId: string): void {
      const currentAppointments = store.appointments();
      const filteredAppointments = currentAppointments.filter(
        (appointment) => appointment.id !== appointmentId
      );
      patchState(store, { appointments: filteredAppointments });
    },

    setSelectedAppointment(appointment: Appointment | null): void {
      patchState(store, { selectedAppointment: appointment });
    },

    setFilters(filters: Partial<AppointmentsState['filters']>): void {
      const currentFilters = store.filters();
      patchState(store, {
        filters: { ...currentFilters, ...filters },
      });
    },

    clearFilters(): void {
      patchState(store, { filters: {} });
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
