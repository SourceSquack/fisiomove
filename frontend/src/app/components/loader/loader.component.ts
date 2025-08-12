import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-loader',
  standalone: true,
  imports: [CommonModule],
  template: './loader.component.html',
  styleUrls: ['./loader.component.css'],
})
export class LoaderComponent {
  @Input() message: string = 'Cargando...';
  @Input() fullscreen: boolean = true;
  @Input() size: 'small' | 'medium' | 'large' = 'medium';
}
