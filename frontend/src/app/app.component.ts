import { NavbarComponent } from './components/navbar/navbar.component';
import { Component, inject, OnInit } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { FooterComponent } from './components/footer/footer.component';
import { CommonModule } from '@angular/common';
import { filter } from 'rxjs/operators';
import { LoaderComponent } from './components/loader/loader.component';
import { AuthStore } from './core/stores/auth.store';

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    NavbarComponent,
    FooterComponent,
    CommonModule,
    LoaderComponent,
  ],
  template: `
  @if (isDashboardRoute) {
    <router-outlet />
  }@else{
    <app-navbar />
    <router-outlet />
    <app-footer />
  }
  <!-- Loader Global para operaciones de autenticación -->
  @if (authStore.isLoading()) {
    <app-loader [message]="getLoadingMessage()" [fullscreen]="true"> </app-loader>
  } `,
})
export class AppComponent implements OnInit {
  protected title = 'Fisiomove';
  isDashboardRoute = false;

  private readonly router = inject(Router);
  protected authStore = inject(AuthStore);

  ngOnInit() {
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.isDashboardRoute = event.url.includes('/dashboard');
      });
  }

  protected getLoadingMessage(): string {
    // Puedes personalizar el mensaje según el contexto
    if (this.router.url.includes('/login')) {
      return 'Iniciando sesión...';
    } else if (this.router.url.includes('/register')) {
      return 'Creando cuenta...';
    } else if (this.router.url.includes('/dashboard')) {
      return 'Cargando dashboard...';
    }
    return 'Cargando...';
  }
}
