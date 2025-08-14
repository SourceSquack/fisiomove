import { Component, OnInit, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppointmentsService } from '../../../../core/services/appointments.service';
import { Appointment } from '../../../../core/models/api.models';

interface CalendarDay {
  date: number;
  fullDate: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  isSelected: boolean;
  hasAppointments: boolean;
  appointmentsCount: number;
}

@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.css'],
})
export class CalendarComponent implements OnInit {
  private readonly appointmentsService = inject(AppointmentsService);

  @Output() dateSelected = new EventEmitter<Date>();

  currentDate = new Date();
  selectedDate = new Date();
  displayDate = new Date();
  calendarDays: CalendarDay[] = [];
  appointments: Appointment[] = [];
  isLoading = false;

  // Nombres de días y meses
  dayNames = ['D', 'L', 'M', 'M', 'J', 'V', 'S'];
  monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  ngOnInit() {
    // Establecer fecha actual como seleccionada por defecto
    this.selectedDate = new Date();
    this.displayDate = new Date();
    this.generateCalendarDays();
    this.loadAppointmentsForMonth();
    
    // Emitir fecha actual al inicializar
    this.dateSelected.emit(this.selectedDate);
  }

  get currentMonth(): string {
    const month = this.monthNames[this.displayDate.getMonth()];
    const year = this.displayDate.getFullYear();
    return `${month} ${year}`;
  }

  generateCalendarDays(): void {
    const year = this.displayDate.getFullYear();
    const month = this.displayDate.getMonth();
    
    // Primer día del mes
    const firstDay = new Date(year, month, 1);
    // Último día del mes
    const lastDay = new Date(year, month + 1, 0);
    
    // Primer día a mostrar (puede ser del mes anterior)
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    // Último día a mostrar (puede ser del mes siguiente)
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 41); // 6 semanas * 7 días - 1
    
    this.calendarDays = [];
    const currentDate = new Date(startDate);
    
    while (currentDate <= endDate) {
      const day: CalendarDay = {
        date: currentDate.getDate(),
        fullDate: new Date(currentDate),
        isCurrentMonth: currentDate.getMonth() === month,
        isToday: this.isSameDay(currentDate, new Date()),
        isSelected: this.isSameDay(currentDate, this.selectedDate),
        hasAppointments: false,
        appointmentsCount: 0
      };
      
      this.calendarDays.push(day);
      currentDate.setDate(currentDate.getDate() + 1);
    }
  }

  loadAppointmentsForMonth(): void {
    this.isLoading = true;
    const year = this.displayDate.getFullYear();
    const month = this.displayDate.getMonth() + 1; // +1 porque el servicio espera 1-indexado
    
    this.appointmentsService.getAppointmentsByMonth(year, month).subscribe({
      next: (appointments) => {
        this.appointments = appointments;
        this.updateCalendarWithAppointments();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading appointments for month:', error);
        this.isLoading = false;
      }
    });
  }

  updateCalendarWithAppointments(): void {
    // Contar citas por día
    const appointmentsByDate = new Map<string, number>();
    
    this.appointments.forEach(appointment => {
      const appointmentDate = new Date(appointment.start_time);
      const dateKey = this.getDateKey(appointmentDate);
      const count = appointmentsByDate.get(dateKey) || 0;
      appointmentsByDate.set(dateKey, count + 1);
    });
    
    // Actualizar días del calendario
    this.calendarDays.forEach(day => {
      const dateKey = this.getDateKey(day.fullDate);
      const count = appointmentsByDate.get(dateKey) || 0;
      day.hasAppointments = count > 0;
      day.appointmentsCount = count;
    });
  }

  onDayClick(day: CalendarDay): void {
    if (!day.isCurrentMonth) {
      // Si hacen clic en un día de otro mes, cambiar de mes
      this.displayDate = new Date(day.fullDate);
      this.generateCalendarDays();
      this.loadAppointmentsForMonth();
    }
    
    // Actualizar selección
    this.calendarDays.forEach(d => d.isSelected = false);
    day.isSelected = true;
    this.selectedDate = new Date(day.fullDate);
    
    // Emitir fecha seleccionada
    this.dateSelected.emit(this.selectedDate);
  }

  navigateMonth(direction: number): void {
    this.displayDate.setMonth(this.displayDate.getMonth() + direction);
    this.generateCalendarDays();
    this.loadAppointmentsForMonth();
    
    // Si el día seleccionado ya no está en el mes visible, 
    // seleccionar el primer día del nuevo mes
    const selectedInCurrentMonth = this.calendarDays.find(day => 
      day.isSelected && day.isCurrentMonth
    );
    
    if (!selectedInCurrentMonth) {
      const firstDayOfMonth = this.calendarDays.find(day => 
        day.isCurrentMonth && day.date === 1
      );
      if (firstDayOfMonth) {
        this.onDayClick(firstDayOfMonth);
      }
    }
  }

  previousMonth(): void {
    this.navigateMonth(-1);
  }

  nextMonth(): void {
    this.navigateMonth(1);
  }

  private isSameDay(date1: Date, date2: Date): boolean {
    return date1.getFullYear() === date2.getFullYear() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getDate() === date2.getDate();
  }

  private getDateKey(date: Date): string {
    return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
  }
}
