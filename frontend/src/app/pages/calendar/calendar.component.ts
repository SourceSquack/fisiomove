import { Component, OnInit, inject } from '@angular/core';
import { TitleService } from '../../core/services/title.service';

@Component({
  selector: 'app-calendar',
  imports: [],
  templateUrl: './calendar.component.html',
  styleUrl: './calendar.component.css',
})
export class CalendarComponent implements OnInit {
  private readonly titleService = inject(TitleService);
  text: string = 'Calendar works!';

  ngOnInit(): void {
    this.titleService.setTitle('Calendario');
  }

  createNewEvent() {
    alert('xd');
  }
}
