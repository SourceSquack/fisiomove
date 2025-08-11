import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface FooterOption {
  label: string;
  route: string;
}

export interface FooterSocialOption {
  name: string;
  icon: string;
  route: string;
}

@Component({
  selector: 'app-footer',
  standalone: true,
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.css'],
  imports: [CommonModule],
})
export class FooterComponent {
  footerOptionsSocial: FooterSocialOption[] = [
    { name: 'Facebook', icon: 'fa-facebook', route: '' },
    { name: 'Instagram', icon: 'fa-instagram', route: '' },
    { name: 'TikTok', icon: 'fa-tiktok', route: '' },
    { name: 'WhatsApp', icon: 'fa-whatsapp', route: '' },
  ];

  footerOptions: FooterOption[] = [
    { label: 'Inicio', route: '/' },
    { label: 'Servicios', route: '/services' },
    { label: 'Nosotros', route: '/about' },
    { label: 'Ubicación', route: '/location' },
    { label: 'Contacto', route: '/contact' },
  ];
}
