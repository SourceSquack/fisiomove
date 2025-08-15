import { Component, Input, OnChanges, SimpleChanges, OnInit, inject, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartType } from 'chart.js';
import { AppointmentsStore } from '../../../../core/stores/appointments.store';
import { AppointmentsService } from '../../../../core/services/appointments.service';

interface AppointmentStatus {
  // Backend format
  programada?: number;
  confirmada?: number;
  completada?: number;
  cancelada?: number;
  no_show?: number;
  // Frontend format
  confirmado?: number;
  pendiente?: number;
  cancelado?: number;
  completado?: number;
}

@Component({
  selector: 'app-appointments-chart',
  imports: [CommonModule, BaseChartDirective],
  templateUrl: './appointments-chart.component.html',
  styleUrl: './appointments-chart.component.css',
})
export class AppointmentsChartComponent implements OnInit, OnChanges {
  @Input() appointmentData: AppointmentStatus | null = null;
  public appointmentsChartType: ChartType = 'doughnut';

  public appointmentsChartData: ChartConfiguration<'doughnut'>['data'] = {
    labels: ['Confirmadas', 'Pendientes', 'Canceladas', 'Completadas', 'No asistidas'],
    datasets: [
      {
        data: [0, 0, 0, 0, 0],
        backgroundColor: [
          '#10b981', // Verde - Confirmadas
          '#f59e0b', // Amarillo - Pendientes
          '#ef4444', // Rojo - Canceladas
          '#3b82f6', // Azul - Completadas
          '#ab47bc', // Morado - No asistidas
        ],
        borderWidth: 0,
      },
    ],
  };

  public appointmentsChartOptions: ChartConfiguration<'doughnut'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '60%',
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          padding: 20,
          usePointStyle: true,
          font: {
            size: 12,
          },
        },
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const total = context.dataset.data.reduce(
              (a: number, b: number | [number, number] | object | null) => {
                return a + (typeof b === 'number' ? b : 0);
              },
              0
            );
            const percentage = ((context.parsed / total) * 100).toFixed(1);
            return `${context.label}: ${context.parsed} (${percentage}%)`;
          },
        },
      },
    },
  };

  readonly appointmentsStore = inject(AppointmentsStore);
  readonly appointmentsService = inject(AppointmentsService);

  constructor() {
    effect(() => {
      this.updateChartFromStore();
    });
  }

  ngOnInit() {
    this.loadAppointments();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['appointmentData'] && this.appointmentData) {
      this.updateChartData();
    }
  }

  private loadAppointments() {
    this.appointmentsService.getAppointments().subscribe({
      next: (appointments) => {
        this.appointmentsStore.setAppointments(appointments);
      },
      error: (error) => {
        console.error('Error loading appointments:', error);
      }
    });
  }

  private updateChartFromStore() {
    const appointmentsByStatus = this.appointmentsStore.appointmentsByStatus();

    const statusCounts = {
      confirmada: appointmentsByStatus['confirmada']?.length || 0,
      programada: appointmentsByStatus['programada']?.length || 0,
      cancelada: appointmentsByStatus['cancelada']?.length || 0,
      completada: appointmentsByStatus['completada']?.length || 0,
      no_show: appointmentsByStatus['no_show']?.length || 0,
    };

    this.appointmentData = statusCounts;
    this.updateChartData();
  }

  private updateChartData() {
    if (this.appointmentData) {
      const confirmadas = (this.appointmentData.confirmada || this.appointmentData.confirmado || 0);
      const pendientes = (this.appointmentData.programada || this.appointmentData.pendiente || 0);
      const canceladas = (this.appointmentData.cancelada || this.appointmentData.cancelado || 0);
      const completadas = (this.appointmentData.completada || this.appointmentData.completado || 0);
      const noShow = this.appointmentData.no_show || 0;

      const data = [confirmadas, pendientes, canceladas, completadas, noShow];

      this.appointmentsChartData = {
        ...this.appointmentsChartData,
        datasets: [
          {
            ...this.appointmentsChartData.datasets[0],
            data: data,
          },
        ],
      };
    }
  }

  get totalAppointments(): number {
    if (!this.appointmentData) return 0;

    const confirmadas = (this.appointmentData.confirmada || this.appointmentData.confirmado || 0);
    const pendientes = (this.appointmentData.programada || this.appointmentData.pendiente || 0);
    const canceladas = (this.appointmentData.cancelada || this.appointmentData.cancelado || 0);
    const completadas = (this.appointmentData.completada || this.appointmentData.completado || 0);
    const noShow = this.appointmentData.no_show || 0;

    return confirmadas + pendientes + canceladas + completadas + noShow;
  }

  get completionRate(): string {
    if (!this.appointmentData) return '0%';
    const total = this.totalAppointments;
    const completed = (this.appointmentData.completada || this.appointmentData.completado || 0);
    return total > 0 ? ((completed / total) * 100).toFixed(1) + '%' : '0%';
  }
}
