import { Component } from '@angular/core';
import { StatCardComponent } from '../dashboard/components/stat-card/stat-card.component';
import { DashboardService, DashboardSummary } from '../../core/services/dashboard.service';
import { AppointmentsListComponent } from '../dashboard/components/appointments-list/appointments-list.component';
import { AppointmentsChartComponent } from '../dashboard/components/appointments-chart/appointments-chart.component';
import { CalendarComponent } from '../calendar/calendar.component';
import { RemindersComponent } from '../dashboard/components/reminders/reminders.component';

@Component({
  selector: 'app-dashboard-view',
  imports: [
    StatCardComponent,
    AppointmentsListComponent,
    AppointmentsChartComponent,
    CalendarComponent,
    RemindersComponent
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

  constructor(private readonly dashboardService: DashboardService) { }

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
}
