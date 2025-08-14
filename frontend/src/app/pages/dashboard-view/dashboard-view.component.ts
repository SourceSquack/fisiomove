import { Component } from '@angular/core';
import { StatCardComponent } from '../dashboard/components/stat-card/stat-card.component';
import { AppointmentsListComponent } from '../dashboard/components/appointments-list/appointments-list.component';
import { CalendarComponent } from '../calendar/calendar.component';
import { AppointmentsChartComponent } from '../dashboard/components/appointments-chart/appointments-chart.component';
import { RemindersComponent } from '../dashboard/components/reminders/reminders.component';
import { RouterLink, RouterOutlet } from '@angular/router';
import { DashboardService, DashboardSummary } from '../../services/dashboard.service';

@Component({
  selector: 'app-dashboard-view',
  imports: [
    StatCardComponent,
    AppointmentsListComponent,
    CalendarComponent,
    RemindersComponent,
    AppointmentsChartComponent,

    RouterOutlet,
    RouterLink
  ],
  templateUrl: './dashboard-view.component.html',
  styleUrl: './dashboard-view.component.css'
})
export class DashboardViewComponent {
  text: string = 'Dashboard view works!';
  sidebarOpen = false;
  dashboardData: DashboardSummary | null = null;
  loading = false;
  selectedDate: Date = new Date();

  constructor(private dashboardService: DashboardService) { }

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

}
