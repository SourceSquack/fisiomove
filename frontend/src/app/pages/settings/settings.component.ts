import { Component, OnInit, inject } from '@angular/core';
import { TitleService } from '../../core/services/title.service';

@Component({
  selector: 'app-calendar',
  imports: [],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.css',
})
export class SettingsComponent implements OnInit {
  private readonly titleService = inject(TitleService);
  text: string = 'Settings works!';

  ngOnInit(): void {
    this.titleService.setTitle('Configuración');
  }
}
