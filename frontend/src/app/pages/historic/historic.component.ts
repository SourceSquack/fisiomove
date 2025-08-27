import { Component, OnInit, inject } from '@angular/core';
import { TitleService } from '../../core/services/title.service';

@Component({
  selector: 'app-calendar',
  imports: [],
  templateUrl: './historic.component.html',
  styleUrl: './historic.component.css',
})
export class HistoricComponent implements OnInit {
  private readonly titleService = inject(TitleService);
  text: string = 'Historic works!';

  ngOnInit(): void {
    this.titleService.setTitle('Historial de citas');
  }
}
