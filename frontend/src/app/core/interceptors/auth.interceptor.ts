import { Injectable, inject } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpErrorResponse,
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);

  intercept(
    request: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    console.log('🔐 Auth Interceptor Processing:', {
      url: request.url,
      method: request.method,
      originalHasAuth: request.headers.has('Authorization'),
    });

    // Agregar el token si existe
    const token = this.authService.getToken();
    console.log('🔑 Token Check:', {
      tokenExists: !!token,
      tokenLength: token?.length || 0,
      isExpired: token ? this.authService.isTokenExpired(token) : 'N/A',
      tokenPreview: token?.substring(0, 30) + '...' || 'NO_TOKEN',
    });

    if (token && !this.authService.isTokenExpired(token)) {
      request = request.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log('✅ Token added to request');
    } else if (token && this.authService.isTokenExpired(token)) {
      console.log('⏰ Token expired, clearing auth data');
      this.authService.clearAuthData();
    }

    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        console.log('🚨 HTTP Error in Interceptor:', {
          status: error.status,
          url: error.url,
          message: error.message,
          isAuthEndpoint: error.url?.includes('/auth/'),
        });

        if (error.status === 401 && !error.url?.includes('/auth/login')) {
          console.log(
            '💀 401 Unauthorized - Clearing auth and redirecting to login'
          );
          // Token expirado o inválido
          this.authService.clearAuthData();
          this.router.navigate(['/auth/login']);
        }

        return throwError(() => error);
      })
    );
  }
}
