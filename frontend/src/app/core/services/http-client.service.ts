import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment.development';
import { StorageService } from './storage.service';

export interface ApiResponse<T> {
  data?: T;
  message?: string;
  success: boolean;
  errors?: string[];
}

@Injectable({
  providedIn: 'root',
})
export class HttpClientService {
  private readonly http = inject(HttpClient);
  private readonly storageService = inject(StorageService);
  private readonly baseUrl = environment.API_URL;

  private readonly TOKEN_KEY = 'fisiomove_token';

  /**
   * GET request
   */
  get<T>(endpoint: string, params?: HttpParams): Observable<T> {
    const headers = this.getHeaders();
    console.log('🔍 HTTP GET Request:', {
      url: `${this.baseUrl}${endpoint}`,
      headers: this.logHeaders(headers),
    });

    return this.http
      .get<T>(`${this.baseUrl}${endpoint}`, {
        params,
        headers,
      })
      .pipe(catchError(this.handleError));
  }

  /**
   * POST request
   */
  post<T>(endpoint: string, body: any): Observable<T> {
    return this.http
      .post<T>(`${this.baseUrl}${endpoint}`, body, {
        headers: this.getHeaders(),
      })
      .pipe(catchError(this.handleError));
  }

  /**
   * PUT request
   */
  put<T>(endpoint: string, body: any): Observable<T> {
    const headers = this.getHeaders();
    console.log('🔍 HTTP PUT Request:', {
      url: `${this.baseUrl}${endpoint}`,
      headers: this.logHeaders(headers),
      body,
    });

    return this.http
      .put<T>(`${this.baseUrl}${endpoint}`, body, {
        headers,
      })
      .pipe(catchError(this.handleError));
  }

  /**
   * DELETE request
   */
  delete<T>(endpoint: string): Observable<T> {
    return this.http
      .delete<T>(`${this.baseUrl}${endpoint}`, {
        headers: this.getHeaders(),
      })
      .pipe(catchError(this.handleError));
  }

  /**
   * PATCH request
   */
  patch<T>(endpoint: string, body: any): Observable<T> {
    return this.http
      .patch<T>(`${this.baseUrl}${endpoint}`, body, {
        headers: this.getHeaders(),
      })
      .pipe(catchError(this.handleError));
  }

  /**
   * Get headers
   */
  private getHeaders(): HttpHeaders {
    const headers: { [key: string]: string } = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    };

    // Add Authorization header if token exists
    const token = this.storageService.getItem(this.TOKEN_KEY);
    console.log('🔑 Token status:', {
      tokenExists: !!token,
      tokenLength: token?.length || 0,
      tokenPreview: token?.substring(0, 20) + '...' || 'NO TOKEN',
    });

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return new HttpHeaders(headers);
  }

  /**
   * Log headers for debugging (without exposing sensitive data)
   */
  private logHeaders(headers: HttpHeaders): any {
    const result: any = {};
    headers.keys().forEach((key) => {
      if (key.toLowerCase() === 'authorization') {
        result[key] = headers.get(key)?.substring(0, 20) + '...';
      } else {
        result[key] = headers.get(key);
      }
    });
    return result;
  }

  /**
   * Handle HTTP errors
   */
  private handleError(error: any): Observable<never> {
    console.error('HTTP Error:', error);

    let errorMessage = 'Ha ocurrido un error';

    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Server-side error
      errorMessage =
        error.error?.message || error.message || `Error ${error.status}`;
    }

    return throwError(() => new Error(errorMessage));
  }
}
