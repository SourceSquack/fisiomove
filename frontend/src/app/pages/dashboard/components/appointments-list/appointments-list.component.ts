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
      id: '1',
      name: 'Maria González',
      type: 'Fisioterapia',
      time: '09:00',
      status: 'confirmada',
    },
    {
      id: '2',
      name: 'Carlos Rodríguez',
      type: 'Consulta',
      time: '10:30',
      status: 'pendiente',
    },
    {
      id: '3',
      name: 'Ana Martínez',
      type: 'Rehabilitación',
      time: '11:15',
      status: 'confirmada',
    },
    {
      id: '4',
      name: 'Luis Fernández',
      type: 'Seguimiento',
      time: '14:00',
      status: 'nueva',
    },
  ];
}
