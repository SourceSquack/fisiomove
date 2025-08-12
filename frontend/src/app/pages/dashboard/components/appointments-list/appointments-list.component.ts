import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-appointments-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './appointments-list.component.html',
  styleUrls: ['./appointments-list.component.css'],
})
export class AppointmentsListComponent {
  appointments = [
    {
      name: 'Maria González',
      type: 'Fisioterapia',
      time: '09:00',
      status: 'confirmada',
    },
    {
      name: 'Carlos Rodríguez',
      type: 'Consulta',
      time: '10:30',
      status: 'pendiente',
    },
    {
      name: 'Ana Martínez',
      type: 'Rehabilitación',
      time: '11:15',
      status: 'confirmada',
    },
    {
      name: 'Luis Fernández',
      type: 'Seguimiento',
      time: '14:00',
      status: 'nueva',
    },
  ];
}
