import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { NavbarComponent } from './components/navbar/navbar.component';
import { StatCardComponent } from './components/stat-card/stat-card.component';
import { AppointmentsListComponent } from './components/appointments-list/appointments-list.component';
import { CalendarComponent } from './components/calendar/calendar.component';
import { RemindersComponent } from './components/reminders/reminders.component';
import { AppointmentsChartComponent } from './components/appointments-chart/appointments-chart.component';
import {
  DashboardService,
  DashboardSummary,
} from '../../core/services/dashboard.service';

@Component({
  selector: 'app-dashboard',
  imports: [
    CommonModule,
    SidebarComponent,
    NavbarComponent,
    StatCardComponent,
    AppointmentsListComponent,
    CalendarComponent,
    RemindersComponent,
    AppointmentsChartComponent,
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
})
export class DashboardComponent implements OnInit {
  sidebarOpen = false;
  dashboardData: DashboardSummary | null = null;
  loading = false;
  selectedDate: Date = new Date();

  constructor(private dashboardService: DashboardService) {}

  ngOnInit() {
    this.loadDashboardData();
  }

  loadDashboardData() {
    this.loading = true;
    this.dashboardService.getDashboardSummary().subscribe({
      next: (data) => {
        this.dashboardData = data;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading dashboard data:', error);
        this.loading = false;
      },
    });
  }

  onDateSelected(date: Date): void {
    console.log('📅 Fecha seleccionada en el calendario:', date);
    this.selectedDate = date;
  }

  toggleSidebar() {
    this.sidebarOpen = !this.sidebarOpen;
  }

  closeSidebar() {
    this.sidebarOpen = false;
  }
}
