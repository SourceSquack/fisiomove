import { Component, Input, HostBinding } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css'],
})
export class SidebarComponent {
  @Input() isOpen: boolean = false;

  @HostBinding('class.open')
  get open() {
    return this.isOpen;
  }
}
