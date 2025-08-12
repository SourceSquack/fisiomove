import { computed } from '@angular/core';
import {
  patchState,
  signalStore,
  withComputed,
  withMethods,
  withState,
} from '@ngrx/signals';

export interface UIState {
  isSidebarOpen: boolean;
  isLoading: boolean;
  theme: 'light' | 'dark' | 'auto';
  notifications: Notification[];
  breadcrumbs: Breadcrumb[];
  activeModule: string;
  isOnline: boolean;
}

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  autoClose?: boolean;
  duration?: number;
}

export interface Breadcrumb {
  label: string;
  url: string;
  isActive: boolean;
}

const initialState: UIState = {
  isSidebarOpen: true,
  isLoading: false,
  theme: 'light',
  notifications: [],
  breadcrumbs: [],
  activeModule: 'dashboard',
  isOnline: navigator.onLine,
};

export const UIStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withComputed((store) => ({
    // Computed values
    unreadNotifications: computed(() => {
      return store
        .notifications()
        .filter((notification) => !notification.isRead);
    }),

    unreadNotificationsCount: computed(() => {
      return store
        .notifications()
        .filter((notification) => !notification.isRead).length;
    }),

    recentNotifications: computed(() => {
      return store
        .notifications()
        .sort(
          (a, b) =>
            new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        )
        .slice(0, 5);
    }),

    currentBreadcrumb: computed(() => {
      const breadcrumbs = store.breadcrumbs();
      return (
        breadcrumbs.find((b) => b.isActive) ||
        breadcrumbs[breadcrumbs.length - 1]
      );
    }),

    isDarkMode: computed(() => {
      const theme = store.theme();
      if (theme === 'auto') {
        return window.matchMedia('(prefers-color-scheme: dark)').matches;
      }
      return theme === 'dark';
    }),
  })),
  withMethods((store) => ({
    toggleSidebar(): void {
      patchState(store, { isSidebarOpen: !store.isSidebarOpen() });
    },

    setSidebarOpen(isOpen: boolean): void {
      patchState(store, { isSidebarOpen: isOpen });
    },

    setLoading(isLoading: boolean): void {
      patchState(store, { isLoading });
    },

    setTheme(theme: 'light' | 'dark' | 'auto'): void {
      patchState(store, { theme });

      if (
        theme === 'dark' ||
        (theme === 'auto' &&
          window.matchMedia('(prefers-color-scheme: dark)').matches)
      ) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    },

    addNotification(
      notification: Omit<Notification, 'id' | 'timestamp' | 'isRead'>
    ): void {
      const newNotification: Notification = {
        ...notification,
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        isRead: false,
      };

      const currentNotifications = store.notifications();
      patchState(store, {
        notifications: [newNotification, ...currentNotifications],
      });

      if (notification.autoClose !== false) {
        const duration = notification.duration || 5000;
        setTimeout(() => {
          const currentNotifications = store.notifications();
          const filteredNotifications = currentNotifications.filter(
            (n) => n.id !== newNotification.id
          );
          patchState(store, { notifications: filteredNotifications });
        }, duration);
      }
    },

    removeNotification(notificationId: string): void {
      const currentNotifications = store.notifications();
      const filteredNotifications = currentNotifications.filter(
        (notification) => notification.id !== notificationId
      );
      patchState(store, { notifications: filteredNotifications });
    },

    markNotificationAsRead(notificationId: string): void {
      const currentNotifications = store.notifications();
      const updatedNotifications = currentNotifications.map((notification) =>
        notification.id === notificationId
          ? { ...notification, isRead: true }
          : notification
      );
      patchState(store, { notifications: updatedNotifications });
    },

    markAllNotificationsAsRead(): void {
      const currentNotifications = store.notifications();
      const updatedNotifications = currentNotifications.map((notification) => ({
        ...notification,
        isRead: true,
      }));
      patchState(store, { notifications: updatedNotifications });
    },

    setBreadcrumbs(breadcrumbs: Breadcrumb[]): void {
      patchState(store, { breadcrumbs });
    },

    setActiveModule(module: string): void {
      patchState(store, { activeModule: module });
    },

    setOnlineStatus(isOnline: boolean): void {
      patchState(store, { isOnline });
    },

    clearNotifications(): void {
      patchState(store, { notifications: [] });
    },
  }))
);
