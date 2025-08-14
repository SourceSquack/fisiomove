import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { ContactComponent } from './pages/contact/contact.component';
import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { ProfileComponent } from './pages/dashboard/profile/profile.component';
import { PatientsComponent } from './pages/dashboard/patients/patients.component';
import { PatientDetailComponent } from './pages/dashboard/patients/patient-detail/patient-detail.component';
import { PatientNewComponent } from './pages/dashboard/patients/patient-new/patient-new.component';
import { authGuard, guestGuard } from './core/guards';

export const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: 'home', component: HomeComponent },
  { path: 'login', component: LoginComponent, canActivate: [guestGuard] },
  { path: 'register', component: RegisterComponent, canActivate: [guestGuard] },
  { path: 'contact', component: ContactComponent },

  // Rutas protegidas
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [authGuard],
  },
  {
    path: 'dashboard/profile',
    component: ProfileComponent,
    canActivate: [authGuard],
  },
  {
    path: 'dashboard/patients',
    component: PatientsComponent,
    canActivate: [authGuard],
  },
  {
    path: 'dashboard/patients/new',
    component: PatientNewComponent,
    canActivate: [authGuard],
  },
  {
    path: 'dashboard/patients/:id',
    component: PatientDetailComponent,
    canActivate: [authGuard],
  },
];
