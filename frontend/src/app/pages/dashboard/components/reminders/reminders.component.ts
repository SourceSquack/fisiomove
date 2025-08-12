import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-reminders',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './reminders.component.html',
  styleUrls: ['./reminders.component.css'],
})
export class RemindersComponent {
  reminders = [
    {
      text: 'Actualizar historial',
      patient: 'Maria González',
      priority: 'high',
    },
    { text: 'Confirmar cita', patient: 'Carlos Rodríguez', priority: 'medium' },
  ];
}
