import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { NavbarComponent } from './components/navbar/navbar.component';
import {
  DashboardService,
  DashboardSummary,
} from '../../core/services/dashboard.service';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  imports: [
    CommonModule,
    SidebarComponent,
    NavbarComponent,
    RouterOutlet,
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
})
export class DashboardComponent {
  sidebarOpen = false;
  dashboardData: DashboardSummary | null = null;
  loading = false;
  selectedDate: Date = new Date();

  constructor(private readonly dashboardService: DashboardService) { }


  toggleSidebar() {
    this.sidebarOpen = !this.sidebarOpen;
  }
}
