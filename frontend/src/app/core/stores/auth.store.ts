import { computed } from '@angular/core';
import {
  patchState,
  signalStore,
  withComputed,
  withMethods,
  withState,
} from '@ngrx/signals';
import { User } from '../models/api.models';

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  rol: string;
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  token: null,
  isLoading: false,
  error: null,
  rol: '',
};

export const AuthStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withComputed((store) => ({
    userDisplayName: computed(() => {
      const user = store.user();
      if (!user) return 'Usuario';
      if (user.first_name && user.last_name) {
        return `${user.first_name} ${user.last_name}`.trim();
      } else if (user.first_name) {
        return user.first_name;
      } else if (user.full_name?.trim()) {
        return user.full_name.trim();
      } else if (user.email) {
        return user.email.split('@')[0];
      }

      return 'Usuario';
    }),

    userInitials: computed(() => {
      const user = store.user();
      if (!user) return 'U';

      if (user.first_name && user.last_name) {
        return (
          user.first_name[0].toUpperCase() + user.last_name[0].toUpperCase()
        );
      } else if (user.first_name) {
        return user.first_name[0].toUpperCase();
      } else if (user.full_name?.trim()) {
        const fullName = user.full_name.trim();
        const names = fullName.split(' ');
        if (names.length >= 2) {
          return (
            names[0].charAt(0) + names[names.length - 1].charAt(0)
          ).toUpperCase();
        }
        return fullName.substring(0, 2).toUpperCase();
      } else if (user.email) {
        return user.email.substring(0, 2).toUpperCase();
      }

      return 'U';
    }),

    userRole: computed(() => {
      const user = store.user();
      return user?.role || 'paciente';
    }),

    roleDisplayName: computed(() => {
      const role = store.user()?.role;
      const roleMap = {
        admin: 'Administrador',
        fisioterapeuta: 'Fisioterapeuta',
        paciente: 'Paciente',
      };
      return roleMap[role as keyof typeof roleMap] || 'Paciente';
    }),

    canUpgradeToFisio: computed(() => {
      const user = store.user();
      const currentRole = user?.role || 'paciente';

      switch (currentRole) {
        case 'paciente':
          return true;
        case 'fisioterapeuta':
          return false;
        case 'admin':
          return true;
        default:
          return false;
      }
    }),
  })),
  withMethods((store) => ({
    setUser(user: User): void {
      patchState(store, { user, isAuthenticated: !!user });
    },

    setToken(token: string | null): void {
      patchState(store, { token, isAuthenticated: !!token });
    },

    setAuthData(token: string, user: User): void {
      patchState(store, {
        token,
        user,
        isAuthenticated: true,
        error: null,
      });
    },

    updateUser(userData: Partial<User>): void {
      const currentUser = store.user();
      if (currentUser) {
        const updatedUser = { ...currentUser, ...userData };
        patchState(store, { user: updatedUser });
      }
    },

    setLoading(isLoading: boolean): void {
      patchState(store, { isLoading });
    },

    setError(error: string | null): void {
      patchState(store, { error });
    },

    clearAuth(): void {
      patchState(store, initialState);
    },

    clearError(): void {
      patchState(store, { error: null });
    },
  }))
);
