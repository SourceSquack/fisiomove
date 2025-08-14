import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { AuthStore } from '../../core/stores/auth.store';
import { User } from '../../core/models/api.models';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css',
})
export class ProfileComponent implements OnInit {
  private authService = inject(AuthService);
  private authStore = inject(AuthStore);
  private fb = inject(FormBuilder);
  private router = inject(Router);

  currentUser = this.authStore.user;
  userDisplayName = this.authStore.userDisplayName;
  userInitials = this.authStore.userInitials;
  userRole = this.authStore.userRole;
  userRoleDisplayName = this.authStore.roleDisplayName;

  isAdmin = computed(() => this.userRole() === 'admin');

  isLoading = signal(false);
  activeTab = signal<'profile' | 'email' | 'password' | 'role'>('profile');
  availableRoles = signal<string[]>(['paciente', 'fisioterapeuta', 'admin']);

  profileForm!: FormGroup;
  emailForm!: FormGroup;
  passwordForm!: FormGroup;
  roleForm!: FormGroup;

  profileMessage = signal<{ type: 'success' | 'error'; text: string } | null>(
    null
  );
  emailMessage = signal<{ type: 'success' | 'error'; text: string } | null>(
    null
  );
  passwordMessage = signal<{ type: 'success' | 'error'; text: string } | null>(
    null
  );
  roleMessage = signal<{ type: 'success' | 'error'; text: string } | null>(
    null
  );

  ngOnInit() {
    this.initializeForms();
    this.loadUserProfile();
  }

  private initializeForms() {
    this.profileForm = this.fb.group({
      first_name: ['', [Validators.required, Validators.minLength(2)]],
      last_name: ['', [Validators.required, Validators.minLength(2)]],
      phone: ['', [Validators.pattern(/^\+?[\d\s\-\(\)]+$/)]],
    });

    this.emailForm = this.fb.group({
      new_email: ['', [Validators.required, Validators.email]],
      current_password: ['', [Validators.required]],
    });

    this.passwordForm = this.fb.group(
      {
        current_password: ['', [Validators.required]],
        new_password: ['', [Validators.required, Validators.minLength(6)]],
        confirm_password: ['', [Validators.required]],
      },
      { validators: this.passwordMatchValidator }
    );

    this.roleForm = this.fb.group({
      new_role: ['', [Validators.required]],
    });
  }

  private passwordMatchValidator(form: FormGroup) {
    const newPassword = form.get('new_password')?.value;
    const confirmPassword = form.get('confirm_password')?.value;
    return newPassword === confirmPassword ? null : { passwordMismatch: true };
  }

  private async loadUserProfile() {
    this.isLoading.set(true);
    try {
      this.authService.getProfile().subscribe({
        next: (user) => {
          console.log('👤 Datos del usuario recibidos del backend:', user);
          console.log('🏪 Estado actual del AuthStore antes:', {
            user: this.authStore.user(),
            userDisplayName: this.authStore.userDisplayName(),
            userRole: this.authStore.userRole(),
            roleDisplayName: this.authStore.roleDisplayName(),
          });

          this.authStore.setUser(user);

          console.log('🏪 Estado del AuthStore después:', {
            user: this.authStore.user(),
            userDisplayName: this.authStore.userDisplayName(),
            userRole: this.authStore.userRole(),
            roleDisplayName: this.authStore.roleDisplayName(),
          });

          this.profileForm.patchValue({
            first_name: user.first_name || '',
            last_name: user.last_name || '',
            phone: user.phone || '',
          });

          this.roleForm.patchValue({
            new_role: user.role || 'paciente',
          });
        },
        error: (error: any) => {
          this.profileMessage.set({
            type: 'error',
            text:
              'Error al cargar el perfil: ' +
              (error.message || 'Error desconocido'),
          });
        },
        complete: () => {
          this.isLoading.set(false);
        },
      });
    } catch (error: any) {
      this.profileMessage.set({
        type: 'error',
        text:
          'Error al cargar el perfil: ' +
          (error.message || 'Error desconocido'),
      });
      this.isLoading.set(false);
    }
  }

  setActiveTab(tab: 'profile' | 'email' | 'password' | 'role') {
    this.activeTab.set(tab);
    this.clearMessages();
  }

  private clearMessages() {
    this.profileMessage.set(null);
    this.emailMessage.set(null);
    this.passwordMessage.set(null);
    this.roleMessage.set(null);
  }

  async updateProfile() {
    if (this.profileForm.invalid) return;

    this.isLoading.set(true);
    this.profileMessage.set(null);

    try {
      const formData = this.profileForm.value;
      this.authService.updateProfile(formData).subscribe({
        next: (updatedUser) => {
          this.authStore.setUser(updatedUser);
          this.profileMessage.set({
            type: 'success',
            text: 'Perfil actualizado correctamente',
          });
        },
        error: (error: any) => {
          this.profileMessage.set({
            type: 'error',
            text:
              'Error al actualizar perfil: ' +
              (error.message || 'Error desconocido'),
          });
        },
        complete: () => {
          this.isLoading.set(false);
        },
      });
    } catch (error: any) {
      this.profileMessage.set({
        type: 'error',
        text:
          'Error al actualizar perfil: ' +
          (error.message || 'Error desconocido'),
      });
      this.isLoading.set(false);
    }
  }

  async updateEmail() {
    if (this.emailForm.invalid) return;

    this.isLoading.set(true);
    this.emailMessage.set(null);

    try {
      const formData = this.emailForm.value;
      this.authService
        .updateEmail({ new_email: formData.new_email })
        .subscribe({
          next: () => {
            this.emailMessage.set({
              type: 'success',
              text: 'Email actualizado correctamente. Verifique su nuevo email.',
            });
            this.emailForm.reset();
            this.loadUserProfile();
          },
          error: (error: any) => {
            this.emailMessage.set({
              type: 'error',
              text:
                'Error al actualizar email: ' +
                (error.message || 'Error desconocido'),
            });
          },
          complete: () => {
            this.isLoading.set(false);
          },
        });
    } catch (error: any) {
      this.emailMessage.set({
        type: 'error',
        text:
          'Error al actualizar email: ' +
          (error.message || 'Error desconocido'),
      });
      this.isLoading.set(false);
    }
  }

  async changePassword() {
    if (this.passwordForm.invalid) return;

    this.isLoading.set(true);
    this.passwordMessage.set(null);

    try {
      const formData = this.passwordForm.value;
      this.authService
        .changePassword({
          current_password: formData.current_password,
          new_password: formData.new_password,
        })
        .subscribe({
          next: () => {
            this.passwordMessage.set({
              type: 'success',
              text: 'Contraseña actualizada correctamente',
            });
            this.passwordForm.reset();
          },
          error: (error: any) => {
            this.passwordMessage.set({
              type: 'error',
              text:
                'Error al cambiar contraseña: ' +
                (error.message || 'Error desconocido'),
            });
          },
          complete: () => {
            this.isLoading.set(false);
          },
        });
    } catch (error: any) {
      this.passwordMessage.set({
        type: 'error',
        text:
          'Error al cambiar contraseña: ' +
          (error.message || 'Error desconocido'),
      });
      this.isLoading.set(false);
    }
  }

  async updateRole() {
    if (this.roleForm.invalid) return;

    this.isLoading.set(true);
    this.roleMessage.set(null);

    try {
      const newRole = this.roleForm.value.new_role;
      this.authService.updateRole(newRole).subscribe({
        next: (updatedUser: User) => {
          this.authStore.setUser(updatedUser);
          this.roleMessage.set({
            type: 'success',
            text: 'Rol actualizado correctamente',
          });
        },
        error: (error: any) => {
          this.roleMessage.set({
            type: 'error',
            text:
              'Error al actualizar rol: ' +
              (error.message || 'Error desconocido'),
          });
        },
        complete: () => {
          this.isLoading.set(false);
        },
      });
    } catch (error: any) {
      this.roleMessage.set({
        type: 'error',
        text:
          'Error al actualizar rol: ' + (error.message || 'Error desconocido'),
      });
    } finally {
      this.isLoading.set(false);
    }
  }

  goBack() {
    this.router.navigate(['/dashboard']);
  }

  canUpgradeToRole(role: string): boolean {
    const currentRole = this.currentUser()?.role || 'paciente';

    // Logic for role upgrades
    switch (currentRole) {
      case 'paciente':
        return role === 'fisioterapeuta';
      case 'fisioterapeuta':
        return role === 'admin';
      case 'admin':
        return false;
      default:
        return false;
    }
  }

  getRoleDisplayName(role: string): string {
    const roleNames: Record<string, string> = {
      paciente: 'Paciente',
      fisioterapeuta: 'Fisioterapeuta',
      admin: 'Administrador',
    };
    return roleNames[role] || 'Paciente';
  }
}
