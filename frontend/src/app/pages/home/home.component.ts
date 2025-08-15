import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface SpecializedService {
  id: string;
  title: string;
  description: string;
  icon: string;
  detailedDescription: string;
  benefits: string[];
  imageUrl: string;
}

export interface TeamMember {
  id: string;
  name: string;
  title: string;
  specialty: string;
  experience: string;
  imageUrl: string;
}

export interface CompanyStats {
  patients: string;
  experience: string;
}

export interface ContactInfo {
  address: string;
  city: string;
  state: string;
  phone: string;
  email: string;
  schedule: {
    weekdays: string;
    saturday: string;
    sunday: string;
  };
}

@Component({
  selector: 'app-home',
  imports: [CommonModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent implements OnInit {
  selectedService: SpecializedService | null = null;

  // Estadísticas de la empresa
  companyStats: CompanyStats = {
    patients: '500+',
    experience: '10+',
  };

  // Información de contacto y ubicación
  contactInfo: ContactInfo = {
    address: 'Cra 26 # 83-58',
    city: 'Corales, Pereira',
    state: 'Risaralda',
    phone: '+57 310 505 5633',
    email: 'info@fisiomove.com',
    schedule: {
      weekdays: 'Lunes - Viernes: 8:00 AM - 7:00 PM',
      saturday: 'Sábados: 9:00 AM - 2:00 PM',
      sunday: 'Domingos: Cerrado',
    },
  };

  // Equipo profesional
  teamMembers: TeamMember[] = [
    {
      id: '1',
      name: 'Andrés Felipe Osorio López',
      title: 'Fisioterapeuta Senior',
      specialty: 'Fisioterapeuta',
      experience: '15 años de experiencia',
      imageUrl: '/images/team-member-1.jpg',
    },
    {
      id: '2',
      name: 'Dr. Carlos Rodríguez',
      title: 'Especialista Deportivo',
      specialty: 'Especialista Deportivo',
      experience: '12 años de experiencia',
      imageUrl: '/images/team-member-2.jpg',
    },
    {
      id: '3',
      name: 'Dra. Ana Martínez',
      title: 'Rehabilitación Neurológica',
      specialty: 'Rehabilitación Neurológica',
      experience: '10 años de experiencia',
      imageUrl: '/images/team-member-3.jpg',
    },
  ];

  specializedServices: SpecializedService[] = [
    {
      id: '1',
      title: 'Fisioterapia deportiva',
      description:
        'Especializada en lesiones deportivas y recuperación atlética',
      icon: 'fa-running',
      detailedDescription:
        'Nuestro enfoque en fisioterapia deportiva combina técnicas avanzadas con un trato personalizado. Utilizamos equipos de última generación y métodos probados científicamente para garantizar los mejores resultados en tu proceso de recuperación.',
      benefits: [
        'Evaluación inicial completa',
        'Plan de tratamiento personalizado',
        'Seguimiento continuo del progreso',
      ],
      imageUrl: '/images/referencia2.jpg',
    },
    {
      id: '2',
      title: 'Rehabilitación ortopédica',
      description: 'Tratamiento integral para lesiones musculoesqueléticas',
      icon: 'fa-bone',
      detailedDescription:
        'Nuestro enfoque en rehabilitación ortopédica combina técnicas avanzadas con un trato personalizado. Utilizamos equipos de última generación y métodos probados científicamente para garantizar los mejores resultados en tu proceso de recuperación.',
      benefits: [
        'Evaluación inicial completa',
        'Plan de tratamiento personalizado',
        'Seguimiento continuo del progreso',
      ],
      imageUrl: '/images/referencia2.jpg',
    },
    {
      id: '3',
      title: 'Terapia manual',
      description: 'Técnicas manuales avanzadas para el alivio del dolor',
      icon: 'fa-hand-paper',
      detailedDescription:
        'Nuestro enfoque en terapia manual combina técnicas avanzadas con un trato personalizado. Utilizamos equipos de última generación y métodos probados científicamente para garantizar los mejores resultados en tu proceso de recuperación.',
      benefits: [
        'Evaluación inicial completa',
        'Plan de tratamiento personalizado',
        'Seguimiento continuo del progreso',
      ],
      imageUrl: '/images/referencia2.jpg',
    },
    {
      id: '4',
      title: 'Fisioterapia neurológica',
      description: 'Especializada en trastornos del sistema nervioso',
      icon: 'fa-brain',
      detailedDescription:
        'Nuestro enfoque en fisioterapia neurológica combina técnicas avanzadas con un trato personalizado. Utilizamos equipos de última generación y métodos probados científicamente para garantizar los mejores resultados en tu proceso de recuperación.',
      benefits: [
        'Evaluación inicial completa',
        'Plan de tratamiento personalizado',
        'Seguimiento continuo del progreso',
      ],
      imageUrl: '/images/referencia2.jpg',
    },
  ];

  ngOnInit(): void {
    // Inicializar con el primer servicio seleccionado
    if (this.specializedServices.length > 0) {
      this.selectedService = this.specializedServices[0];
    }
  }

  selectService(service: SpecializedService): void {
    this.selectedService = service;
  }

  closeServiceDetail(): void {
    this.selectedService = null;
  }

  trackByService(index: number, service: SpecializedService): string {
    return service.id;
  }

  trackByTeamMember(index: number, member: TeamMember): string {
    return member.id;
  }

  scrollToSection(sectionId: string): void {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }
}
