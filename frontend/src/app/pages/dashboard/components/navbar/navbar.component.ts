import { Component, Output, EventEmitter, inject, OnInit } from '@angular/core';
import { TitleService } from '../../../../core/services/title.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { Patient, User } from '../../../../core/models/api.models';
import { PatientsService } from '../../../../core/services/patients.service';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css'],
})
export class NavbarComponent implements OnInit {
  @Output() sidebarToggle = new EventEmitter<void>();

  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  public readonly titleService = inject(TitleService);

  searchQuery: string = '';
  searchResults: Patient[] = [];
  searchLoading = false;
  searchError: string | null = null;
  showSearchDropdown = false;
  private readonly searchInput$ = new Subject<string>();
  private readonly patientsService = inject(PatientsService);
  currentUser: User | null = null;
  isDropdownOpen = false;
  isLoading = true;


  ngOnInit(): void {
    this.loadUserProfile();
  }

  onSearchInput(): void {
    this.searchError = null;
    this.searchLoading = true;
    this.searchInput$.next(this.searchQuery.trim());
    this.showSearchDropdown = true;
  }

  onSearchBlur(): void {
    setTimeout(() => {
      this.showSearchDropdown = false;
    }, 200);
  }

  performPatientSearch(query: string): void {
    if (!query) {
      this.searchResults = [];
      this.searchLoading = false;
      return;
    }
    this.searchLoading = true;
    this.patientsService.searchPatients(query).subscribe({
      next: (patients) => {
        this.searchResults = patients || [];
        this.searchLoading = false;
      },
      error: (err) => {
        this.searchError = err.message || 'Error buscando pacientes';
        this.searchResults = [];
        this.searchLoading = false;
      },
    });
  }

  goToPatientProfile(patient: Patient): void {
    this.showSearchDropdown = false;
    if (patient.id) {
      this.router.navigate(['/dashboard/patients', patient.id]);
    }
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
function distinctUntilChanged(): import("rxjs").OperatorFunction<string, unknown> {
  throw new Error('Function not implemented.');
}

