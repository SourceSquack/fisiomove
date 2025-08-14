import { Component, Input, HostBinding } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css'],
})
export class SidebarComponent {
  @Input() isOpen: boolean = false;

  @HostBinding('class.open')
  get open() {
    return this.isOpen;
  }

  sidebarOptions = [
    { name: 'Dashboard', icon: "fas fa-tachometer-alt", route: '/dashboard/dashboard-view' },
    { name: 'Pacientes', icon: "fas fa-users", route: '/dashboard/patients' },
    { name: 'Citas', icon: "fas fa-calendar-check", route: '/dashboard/appointments' },
    { name: 'Calendario', icon: "fas fa-calendar-alt", route: '/dashboard/calendar' },
    { name: 'Historial', icon: "fas fa-file-medical", route: '/dashboard/historic' },
    { name: 'Operativos', icon: "fas fa-box", route: '/dashboard/operatives' },
    { name: 'Configuración', icon: "fas fa-cog", route: '/dashboard/settings' },
  ]
}
