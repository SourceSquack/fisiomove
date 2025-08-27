import { Component, OnInit, inject } from '@angular/core';
import { TitleService } from '../../core/services/title.service';
import { StatCardComponent } from '../dashboard/components/stat-card/stat-card.component';
import {
  DashboardService,
  DashboardSummary,
} from '../../core/services/dashboard.service';
import { AppointmentsListComponent } from '../appointment/components/appointments-list/appointments-list.component';
import { RemindersComponent } from '../dashboard/components/reminders/reminders.component';
import { AppointmentsChartComponent } from '../appointment/components/appointments-chart/appointments-chart.component';

@Component({
  selector: 'app-dashboard-view',
  imports: [
    StatCardComponent,
    AppointmentsListComponent,
    AppointmentsChartComponent,
    // CalendarComponent,
    RemindersComponent,
  ],
  templateUrl: './dashboard-view.component.html',
  styleUrl: './dashboard-view.component.css',
})
export class DashboardViewComponent implements OnInit {
  private readonly titleService = inject(TitleService);
  text: string = 'Dashboard view works!';
  sidebarOpen = false;
  dashboardData: DashboardSummary | null = null;
  loading = false;
  selectedDate: Date = new Date();

  constructor(private readonly dashboardService: DashboardService) {}

  ngOnInit() {
    this.titleService.setTitle('Dashboard');
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
