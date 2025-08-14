import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../core/services/auth.service';
import { HttpClientService } from '../core/services/http-client.service';

@Component({
  selector: 'app-debug-auth',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="p-6 max-w-4xl mx-auto">
      <h1 class="text-2xl font-bold mb-6">🔍 Debug de Autenticación</h1>

      <div class="space-y-4">
        <!-- Token Status -->
        <div class="bg-blue-50 p-4 rounded">
          <h2 class="font-semibold mb-2">📄 Estado del Token</h2>
          <div class="text-sm space-y-1">
            <p>
              <strong>Existe:</strong> {{ tokenExists ? '✅ Sí' : '❌ No' }}
            </p>
            <p><strong>Longitud:</strong> {{ tokenLength }}</p>
            <p>
              <strong>Expirado:</strong> {{ isExpired ? '⏰ Sí' : '✅ No' }}
            </p>
            <p>
              <strong>Preview:</strong>
              <code class="bg-gray-200 px-1 rounded">{{ tokenPreview }}</code>
            </p>
          </div>
        </div>

        <!-- User Status -->
        <div class="bg-green-50 p-4 rounded">
          <h2 class="font-semibold mb-2">👤 Estado del Usuario</h2>
          <div class="text-sm space-y-1">
            <p>
              <strong>Autenticado:</strong>
              {{ isAuthenticated ? '✅ Sí' : '❌ No' }}
            </p>
            <p>
              <strong>Usuario actual:</strong>
              {{ currentUser ? currentUser.email : 'No hay usuario' }}
            </p>
          </div>
        </div>

        <!-- Test Buttons -->
        <div class="bg-yellow-50 p-4 rounded">
          <h2 class="font-semibold mb-2">🧪 Pruebas</h2>
          <div class="space-x-2">
            <button
              (click)="testMe()"
              class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              [disabled]="loading"
            >
              🔍 Probar /auth/me
            </button>

            <button
              (click)="testAppointments()"
              class="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
              [disabled]="loading"
            >
              📅 Probar /appointments
            </button>

            <button
              (click)="clearAuth()"
              class="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
            >
              🗑️ Limpiar Auth
            </button>
          </div>
        </div>

        <!-- Results -->
        <div class="bg-gray-50 p-4 rounded">
          <h2 class="font-semibold mb-2">📊 Resultados</h2>
          <div class="text-sm space-y-2">
            <div
              *ngFor="let result of results"
              [class]="result.success ? 'text-green-600' : 'text-red-600'"
              class="border-l-4 pl-3"
              [class.border-green-400]="result.success"
              [class.border-red-400]="!result.success"
            >
              <p>
                <strong>{{ result.test }}:</strong>
              </p>
              <p>{{ result.message }}</p>
              <pre
                *ngIf="result.data"
                class="bg-gray-100 p-2 rounded mt-1 text-xs overflow-auto"
                >{{ result.data }}</pre
              >
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class DebugAuthComponent implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly httpClient = inject(HttpClientService);

  tokenExists = false;
  tokenLength = 0;
  isExpired = true;
  tokenPreview = 'NO_TOKEN';
  isAuthenticated = false;
  currentUser: any = null;
  loading = false;

  results: Array<{
    test: string;
    success: boolean;
    message: string;
    data?: string;
  }> = [];

  ngOnInit() {
    this.updateTokenStatus();
  }

  updateTokenStatus() {
    const token = this.authService.getToken();
    this.tokenExists = !!token;
    this.tokenLength = token?.length || 0;
    this.isExpired = token ? this.authService.isTokenExpired(token) : true;
    this.tokenPreview = token ? token.substring(0, 50) + '...' : 'NO_TOKEN';
    this.isAuthenticated = this.authService.isAuthenticated();
    this.currentUser = this.authService.getCurrentUser();
  }

  testMe() {
    this.loading = true;
    this.httpClient.get('auth/me').subscribe({
      next: (response) => {
        this.results.unshift({
          test: 'GET /auth/me',
          success: true,
          message: '✅ Success',
          data: JSON.stringify(response, null, 2),
        });
        this.loading = false;
      },
      error: (error) => {
        this.results.unshift({
          test: 'GET /auth/me',
          success: false,
          message: `❌ Error: ${error.message}`,
          data: JSON.stringify(error, null, 2),
        });
        this.loading = false;
        this.updateTokenStatus();
      },
    });
  }

  testAppointments() {
    this.loading = true;
    this.httpClient.get('appointments/?page=1&size=10').subscribe({
      next: (response: any) => {
        this.results.unshift({
          test: 'GET /appointments',
          success: true,
          message: `✅ Success - ${
            Array.isArray(response) ? response.length : 'Unknown'
          } appointments`,
          data: JSON.stringify(response, null, 2),
        });
        this.loading = false;
      },
      error: (error) => {
        this.results.unshift({
          test: 'GET /appointments',
          success: false,
          message: `❌ Error: ${error.message}`,
          data: JSON.stringify(error, null, 2),
        });
        this.loading = false;
        this.updateTokenStatus();
      },
    });
  }

  clearAuth() {
    this.authService.clearAuthData();
    this.updateTokenStatus();
    this.results.unshift({
      test: 'Clear Auth',
      success: true,
      message: '🗑️ Auth data cleared',
    });
  }
}
