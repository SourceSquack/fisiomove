import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { ContactComponent } from './pages/contact/contact.component';
import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { ProfileComponent } from './pages/profile/profile.component';
import { PatientsComponent } from './pages/patient/patients.component';
import { PatientNewComponent } from './pages/patient/patient-new/patient-new.component';
import { PatientDetailComponent } from './pages/patient/patient-detail/patient-detail.component';
import { AppointmentsComponent } from './pages/appointment/appointments.component';
import { AppointmentNewComponent } from './pages/appointment/appointment-new/appointment-new.component';
import { AppointmentDetailComponent } from './pages/appointment/appointment-detail/appointment-detail.component';
import { AppointmentEditComponent } from './pages/appointment/appointment-edit/appointment-edit.component';
import { DebugAuthComponent } from './debug-auth/debug-auth.component';
import { authGuard, guestGuard } from './core/guards';
import { CalendarComponent } from './pages/calendar/calendar.component';
import { SettingsComponent } from './pages/settings/settings.component';
import { HistoricComponent } from './pages/historic/historic.component';
import { DashboardViewComponent } from './pages/dashboard-view/dashboard-view.component';

export const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: 'home', component: HomeComponent },
  { path: 'login', component: LoginComponent, canActivate: [guestGuard] },
  { path: 'register', component: RegisterComponent, canActivate: [guestGuard] },
  { path: 'contact', component: ContactComponent },

  // Debug route (temporary)
  { path: 'debug-auth', component: DebugAuthComponent },

  // Rutas protegidas
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [authGuard],
    children: [
      { path: 'dashboard-view', component: DashboardViewComponent },
      { path: 'calendar', component: CalendarComponent },
      { path: 'patients', component: PatientsComponent },
      { path: 'historic', component: HistoricComponent },
      { path: 'appointments', component: AppointmentsComponent },
      { path: 'settings', component: SettingsComponent },
    ],
  },
  {
    path: 'dashboard/profile',
    component: ProfileComponent,
    canActivate: [authGuard],
  },
  // {
  //   path: 'dashboard/patients',
  //   component: PatientsComponent,
  //   canActivate: [authGuard],
  // },
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
  {
    path: 'dashboard/appointments',
    component: AppointmentsComponent,
    canActivate: [authGuard],
  },
  {
    path: 'dashboard/appointments/new',
    component: AppointmentNewComponent,
    canActivate: [authGuard],
  },
  {
    path: 'dashboard/appointments/edit/:id',
    component: AppointmentEditComponent,
    canActivate: [authGuard],
  },
  {
    path: 'dashboard/appointments/:id',
    component: AppointmentDetailComponent,
    canActivate: [authGuard],
  },
];
