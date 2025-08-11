import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface SpecializedService {
  id: string;
  title: string;
  description: string;
  icon: string;
}

@Component({
  selector: 'app-home',
  imports: [CommonModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent {
  specializedServices: SpecializedService[] = [
    {
      id: '1',
      title: 'Fisioterapia Deportiva',
      description:
        'Tratamientos especializados para atletas y recuperación de lesiones deportivas.',
      icon: 'fa-running',
    },
    {
      id: '2',
      title: 'Rehabilitación Postquirúrgica',
      description:
        'Programas personalizados para una recuperación segura y efectiva después de cirugías.',
      icon: 'fa-hospital',
    },
    {
      id: '3',
      title: 'Terapia Manual',
      description:
        'Técnicas avanzadas para aliviar el dolor y mejorar la movilidad.',
      icon: 'fa-hand-paper',
    },
    {
      id: '4',
      title: 'Terapia Neurológica',
      description:
        'Atención especializada para pacientes con condiciones neurológicas.',
      icon: 'fa-brain',
    },
  ];

  trackByService(index: number, service: SpecializedService): string {
    return service.id;
  }
}
