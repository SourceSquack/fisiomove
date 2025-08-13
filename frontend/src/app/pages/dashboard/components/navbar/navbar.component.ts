import { Component, Output, EventEmitter, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { User } from '../../../../core/models/api.models';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css'],
})
export class NavbarComponent implements OnInit {
  @Output() sidebarToggle = new EventEmitter<void>();

  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  currentUser: User | null = null;
  isDropdownOpen = false;
  isLoading = true;

  ngOnInit(): void {
    this.loadUserProfile();
  }

  toggleSidebar(): void {
    this.sidebarToggle.emit();
  }

  toggleDropdown(): void {
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  closeDropdown(): void {
    this.isDropdownOpen = false;
  }

  goToProfile(): void {
    this.closeDropdown();
    this.router.navigate(['/dashboard/profile']);
  }

  async logout(): Promise<void> {
    try {
      // Intentar logout en el servidor
      this.authService.logout().subscribe({
        next: () => {
          this.performLogout();
        },
        error: () => {
          // Si falla el logout del servidor, hacer logout local
          this.performLogout();
        },
      });
    } catch {
      this.performLogout();
    }
  }

  private performLogout(): void {
    this.authService.logoutLocal();
    this.router.navigate(['/home']);
  }

  private loadUserProfile(): void {
    this.authService.getProfile().subscribe({
      next: (user) => {
        this.currentUser = user;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error cargando perfil:', error);
        this.isLoading = false;
        // Si falla cargar el perfil, usar datos del storage
        this.currentUser = this.authService.getCurrentUser();
      },
    });
  }

  getUserDisplayName(): string {
    if (!this.currentUser) return 'Usuario';

    if (this.currentUser.first_name && this.currentUser.last_name) {
      return `${this.currentUser.first_name} ${this.currentUser.last_name}`.trim();
    } else if (this.currentUser.first_name) {
      return this.currentUser.first_name;
    } else if (this.currentUser.full_name) {
      return this.currentUser.full_name;
    } else if (this.currentUser.email) {
      return this.currentUser.email.split('@')[0];
    }

    return 'Usuario';
  }

  getUserInitials(): string {
    if (!this.currentUser) return 'U';

    // Prioridad: first_name + last_name, luego full_name
    if (this.currentUser.first_name && this.currentUser.last_name) {
      return (
        this.currentUser.first_name[0].toUpperCase() +
        this.currentUser.last_name[0].toUpperCase()
      );
    } else if (this.currentUser.first_name) {
      return this.currentUser.first_name[0].toUpperCase();
    } else if (this.currentUser.full_name) {
      const names = this.currentUser.full_name.split(' ');
      if (names.length >= 2) {
        return names[0][0] + names[1][0];
      }
      return names[0][0];
    }

    return 'U';
  }
}
