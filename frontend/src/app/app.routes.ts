import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { ContactComponent } from './pages/contact/contact.component';
import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { ProfileComponent } from './pages/profile/profile.component';
import { PatientsComponent } from './pages/patients/patients.component';
import { PatientNewComponent } from './pages/patients/patient-new/patient-new.component';
import { PatientDetailComponent } from './pages/patients/patient-detail/patient-detail.component';
import { AppointmentsComponent } from './pages/appointment/appointments.component';
import { AppointmentNewComponent } from './pages/appointment/appointment-new/appointment-new.component';
import { AppointmentDetailComponent } from './pages/appointment/appointment-detail/appointment-detail.component';
import { AppointmentEditComponent } from './pages/appointment/appointment-edit/appointment-edit.component';
import { authGuard, guestGuard } from './core/guards';
import { CalendarComponent } from './pages/calendar/calendar.component';
import { SettingsComponent } from './pages/settings/settings.component';
import { HistoricComponent } from './pages/historic/historic.component';
import { DashboardViewComponent } from './pages/dashboard-view/dashboard-view.component';
import { OperativesComponent } from './pages/operatives/operatives.component';

export const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: 'home', component: HomeComponent },
  { path: 'login', component: LoginComponent, canActivate: [guestGuard] },
  { path: 'register', component: RegisterComponent, canActivate: [guestGuard] },
  { path: 'contact', component: ContactComponent },

  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'dashboard-view', pathMatch: 'full' },
      { path: 'dashboard-view', component: DashboardViewComponent },
      { path: 'patients', component: PatientsComponent },
      { path: 'patients/new', component: PatientNewComponent },
      { path: 'patients/:id', component: PatientDetailComponent },
      { path: 'appointments', component: AppointmentsComponent },
      { path: 'appointments/new', component: AppointmentNewComponent },
      { path: 'appointments/:id', component: AppointmentDetailComponent },
      { path: 'appointments/edit/:id', component: AppointmentEditComponent },
      { path: 'calendar', component: CalendarComponent },
      { path: 'historic', component: HistoricComponent },
      { path: 'operatives', component: OperativesComponent },
      { path: 'settings', component: SettingsComponent },
      { path: 'profile', component: ProfileComponent },
    ],
  },
];
