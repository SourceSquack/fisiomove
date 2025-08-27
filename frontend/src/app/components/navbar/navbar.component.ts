import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { NotificationsService } from '../../core/services/notifications.service';
import { NotificationBellComponent } from '../../pages/dashboard/components/notification-bell/notification-bell.component';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule, NotificationBellComponent],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css',
})
export class NavbarComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly notificationsService = inject(NotificationsService);

  currentUser$ = this.authService.currentUser$;
  unreadCount$ = this.notificationsService.getUnreadCount();

  navOptions = [
    { name: 'Home', route: '/' },
    { name: 'Login', route: '/login' },
    { name: 'Dashboard', route: '/dashboard' },
    { name: 'Contact', route: '/contact' },
  ];

  logout(): void {
    this.authService.logoutLocal();
    this.router.navigate(['/home']);
  }

  isAuthenticated(): boolean {
    return this.authService.isAuthenticated();
  }
}
