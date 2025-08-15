import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { environment } from '../../../environments/environment';

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
    {
      name: 'Facebook',
      icon: 'fa-facebook',
      route: environment.FOOTER_SOCIAL_FACEBOOK,
    },
    {
      name: 'Instagram',
      icon: 'fa-instagram',
      route: environment.FOOTER_SOCIAL_INSTAGRAM,
    },
    {
      name: 'TikTok',
      icon: 'fa-tiktok',
      route: environment.FOOTER_SOCIAL_TIKTOK,
    },
    {
      name: 'WhatsApp',
      icon: 'fa-whatsapp',
      route: environment.FOOTER_SOCIAL_WHATSAPP,
    },
  ];

  footerOptions: FooterOption[] = [
    { label: 'Servicios', route: '/services' },
    { label: 'Nosotros', route: '/about' },
    { label: 'Ubicación', route: 'https://www.google.com/maps/dir//Cra.+25+%23+82-96+Pereira,+Risaralda/@4.801674,-75.747584,1736m/data=!3m1!1e3!4m8!4m7!1m0!1m5!1m1!1s0x8e387db834f386d1:0x39a9704f655cab3d!2m2!1d-75.747584!2d4.801674?entry=ttu&g_ep=EgoyMDI1MDgxMi4wIKXMDSoASAFQAw%3D%3D' },
    { label: 'Contacto', route: '/contact' },
  ];
}
