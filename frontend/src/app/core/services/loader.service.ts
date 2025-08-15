import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface LoaderState {
  isVisible: boolean;
  message: string;
  type: 'default' | 'success' | 'error';
  size: 'small' | 'medium' | 'large';
}

@Injectable({
  providedIn: 'root',
})
export class LoaderService {
  private readonly loaderState = new BehaviorSubject<LoaderState>({
    isVisible: false,
    message: 'Cargando...',
    type: 'default',
    size: 'medium',
  });

  public loaderState$ = this.loaderState.asObservable();

  show(
    message: string = 'Cargando...',
    type: 'default' | 'success' | 'error' = 'default',
    size: 'small' | 'medium' | 'large' = 'medium'
  ) {
    this.loaderState.next({
      isVisible: true,
      message,
      type,
      size,
    });
  }

  hide() {
    this.loaderState.next({
      ...this.loaderState.value,
      isVisible: false,
    });
  }

  // Métodos de conveniencia
  showLogin() {
    this.show('Iniciando sesión...', 'default', 'medium');
  }

  showRegister() {
    this.show('Creando cuenta...', 'default', 'medium');
  }

  showSaving() {
    this.show('Guardando...', 'default', 'small');
  }

  showSuccess(message: string = 'Operación exitosa') {
    this.show(message, 'success', 'medium');
    // Auto-hide después de 2 segundos
    setTimeout(() => this.hide(), 2000);
  }

  showError(message: string = 'Error en la operación') {
    this.show(message, 'error', 'medium');
    // Auto-hide después de 3 segundos
    setTimeout(() => this.hide(), 3000);
  }
}
