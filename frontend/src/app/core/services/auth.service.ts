import { Injectable, inject } from '@angular/core';
import { Observable, BehaviorSubject, tap } from 'rxjs';
import { HttpClientService } from './http-client.service';
import { StorageService } from './storage.service';
import { LoginRequest, LoginResponse, RegisterRequest, User, ApiResponse } from '../models/api.models';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly httpClient = inject(HttpClientService);
  private readonly storageService = inject(StorageService);
  
  // Estado del usuario autenticado
  private readonly currentUserSubject = new BehaviorSubject<User | null>(null);
  public readonly currentUser$ = this.currentUserSubject.asObservable();
  
  // Claves para localStorage
  private readonly TOKEN_KEY = 'fisiomove_token';
  private readonly USER_KEY = 'fisiomove_user';

  constructor() {
    // Cargar usuario y token del localStorage al inicializar
    this.loadUserFromStorage();
  }

  /**
   * Login de usuario
   */
  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.httpClient.post<LoginResponse>('auth/login', credentials)
      .pipe(
        tap(response => {
          if (response.access_token && response.user) {
            this.setAuthData(response.access_token, response.user);
          }
        })
      );
  }

  /**
   * Registro de usuario
   */
  register(userData: RegisterRequest): Observable<ApiResponse<User>> {
    return this.httpClient.post<ApiResponse<User>>('auth/register', userData);
  }

  /**
   * Obtener perfil del usuario actual
   */
  getProfile(): Observable<User> {
    return this.httpClient.get<User>('auth/me');
  }

  /**
   * Actualizar perfil
   */
  updateProfile(userData: { full_name: string }): Observable<any> {
    return this.httpClient.put<any>('auth/profile', userData);
  }

  /**
   * Cambiar email
   */
  updateEmail(data: { new_email: string }): Observable<any> {
    return this.httpClient.put<any>('auth/email', data);
  }

  /**
   * Cambiar contraseña
   */
  changePassword(data: { current_password: string; new_password: string }): Observable<any> {
    return this.httpClient.put<any>('auth/password', data);
  }

  /**
   * Actualizar rol
   */
  updateRole(data: { email: string; role: string }): Observable<any> {
    return this.httpClient.put<any>('auth/role', data);
  }

  /**
   * Logout (invalidar token en el servidor)
   */
  logout(): Observable<any> {
    return this.httpClient.post<any>('auth/logout', {});
  }

  /**
   * Verificar si el token es válido
   */
  verifyToken(): Observable<ApiResponse<User>> {
    return this.httpClient.get<ApiResponse<User>>('auth/verify-token');
  }

  // === MÉTODOS DE GESTIÓN DE JWT Y AUTENTICACIÓN ===

  /**
   * Verificar si el usuario está autenticado
   */
  isAuthenticated(): boolean {
    const token = this.getToken();
    if (!token) return false;
    
    // Verificar si el token no ha expirado
    return !this.isTokenExpiredPrivate(token);
  }

  /**
   * Obtener el token del localStorage
   */
  getToken(): string | null {
    return this.storageService.getItem(this.TOKEN_KEY);
  }

  /**
   * Obtener el usuario actual
   */
  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  /**
   * Verificar si el token ha expirado (método público)
   */
  isTokenExpired(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Math.floor(Date.now() / 1000);
      return payload.exp < currentTime;
    } catch {
      return true; // Si no se puede decodificar, considerarlo expirado
    }
  }

  /**
   * Verificar si el token ha expirado (método privado)
   */
  private isTokenExpiredPrivate(token: string): boolean {
    return this.isTokenExpired(token);
  }

  /**
   * Establecer datos de autenticación
   */
  private setAuthData(token: string, user: User): void {
    this.storageService.setItem(this.TOKEN_KEY, token);
    this.storageService.setItem(this.USER_KEY, JSON.stringify(user));
    this.currentUserSubject.next(user);
  }

  /**
   * Cargar usuario desde localStorage
   */
  private loadUserFromStorage(): void {
    // Solo cargar si estamos en el browser
    if (!this.storageService.isInBrowser) {
      return;
    }

    const token = this.getToken();
    const userStr = this.storageService.getItem(this.USER_KEY);
    
    if (token && userStr && !this.isTokenExpiredPrivate(token)) {
      try {
        const user = JSON.parse(userStr);
        this.currentUserSubject.next(user);
      } catch {
        this.clearAuthData();
      }
    } else {
      this.clearAuthData();
    }
  }

  /**
   * Limpiar datos de autenticación
   */
  clearAuthData(): void {
    this.storageService.removeItem(this.TOKEN_KEY);
    this.storageService.removeItem(this.USER_KEY);
    this.currentUserSubject.next(null);
  }

  /**
   * Logout local (limpiar datos)
   */
  logoutLocal(): void {
    this.clearAuthData();
  }
}
