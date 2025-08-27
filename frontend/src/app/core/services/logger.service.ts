import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class LoggerService {
  // Habilitar/deshabilitar logging globalmente
  private enabled = true;

  setEnabled(value: boolean) {
    this.enabled = !!value;
  }

  private timestamp(): string {
    return new Date().toISOString();
  }

  debug(message?: any, ...optionalParams: any[]): void {
    if (!this.enabled) return;
    // eslint-disable-next-line no-console
    console.debug('[DEBUG]', this.timestamp(), message, ...optionalParams);
  }

  info(message?: any, ...optionalParams: any[]): void {
    if (!this.enabled) return;
    // eslint-disable-next-line no-console
    console.info('[INFO]', this.timestamp(), message, ...optionalParams);
  }

  warn(message?: any, ...optionalParams: any[]): void {
    if (!this.enabled) return;
    // eslint-disable-next-line no-console
    console.warn('[WARN]', this.timestamp(), message, ...optionalParams);
  }

  error(message?: any, ...optionalParams: any[]): void {
    if (!this.enabled) return;
    // eslint-disable-next-line no-console
    console.error('[ERROR]', this.timestamp(), message, ...optionalParams);
  }
}
