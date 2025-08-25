import { Component, inject } from '@angular/core';
import { TitleService } from '../../core/services/title.service';

@Component({
  selector: 'app-operatives',
  imports: [],
  templateUrl: './operatives.component.html',
  styleUrl: './operatives.component.css'
})
export class OperativesComponent {
  private readonly TitleService = inject(TitleService);

  ngOnInit(): void{
    this.TitleService.setTitle('Operativo')
  }

}
