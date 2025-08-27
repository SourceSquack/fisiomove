import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatCardModule } from '@angular/material/card';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import { MatNativeDateModule } from '@angular/material/core';
import { AppointmentTimeDialogComponent } from '../appointment-time-dialog/appointment-time-dialog.component';

@Component({
  selector: 'app-appointment-calendar',
  templateUrl: './appointment-calendar.component.html',
  styleUrls: ['./appointment-calendar.component.css'],
  standalone: true,
  imports: [
    MatCardModule,
    MatDatepickerModule,
    MatInputModule,
    MatNativeDateModule,
  ],
})
export class AppointmentCalendarComponent {
  selectedDate: Date | null = null;

  constructor(private readonly dialog: MatDialog) {}

  onDateSelected(date: Date) {
    this.selectedDate = date;
    this.dialog.open(AppointmentTimeDialogComponent, {
      data: { date },
    });
  }
}
