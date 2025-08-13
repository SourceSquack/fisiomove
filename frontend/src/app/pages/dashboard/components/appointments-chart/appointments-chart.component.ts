import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartType } from 'chart.js';

interface AppointmentStatus {
  confirmado: number;
  pendiente: number;
  cancelado: number;
  completado: number;
}

@Component({
  selector: 'app-appointments-chart',
  imports: [CommonModule, BaseChartDirective],
  templateUrl: './appointments-chart.component.html',
  styleUrl: './appointments-chart.component.css',
})
export class AppointmentsChartComponent implements OnChanges {
  @Input() appointmentData: AppointmentStatus | null = null;
  public appointmentsChartType: ChartType = 'doughnut';

  public appointmentsChartData: ChartConfiguration<'doughnut'>['data'] = {
    labels: ['Confirmadas', 'Pendientes', 'Canceladas', 'Completadas'],
    datasets: [
      {
        data: [8, 4, 2, 12],
        backgroundColor: [
          '#10b981', // Verde - Confirmadas
          '#f59e0b', // Amarillo - Pendientes
          '#ef4444', // Rojo - Canceladas
          '#3b82f6', // Azul - Completadas
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

  ngOnChanges(changes: SimpleChanges) {
    if (changes['appointmentData'] && this.appointmentData) {
      this.updateChartData();
    }
  }

  private updateChartData() {
    if (this.appointmentData) {
      const data = [
        this.appointmentData.confirmado,
        this.appointmentData.pendiente,
        this.appointmentData.cancelado,
        this.appointmentData.completado,
      ];

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
    if (!this.appointmentData) return 26;
    return Object.values(this.appointmentData).reduce(
      (sum, count) => sum + count,
      0
    );
  }

  get completionRate(): string {
    if (!this.appointmentData) return '46.2%';
    const total = this.totalAppointments;
    const completed = this.appointmentData.completado;
    return total > 0 ? ((completed / total) * 100).toFixed(1) + '%' : '0%';
  }
}
