import { Component, Inject, OnInit } from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialogRef,
  MatDialogModule,
} from '@angular/material/dialog';
import { AppointmentsService } from '../../../../core/services/appointments.service';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { CommonModule } from '@angular/common';
import { Observable, firstValueFrom as rxFirstValueFrom } from 'rxjs';

function firstValueFrom<T>(obs: Observable<T>): Promise<T> {
  return rxFirstValueFrom(obs);
}

@Component({
  selector: 'app-appointment-time-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonToggleModule],
  templateUrl: './appointment-time-dialog.component.html',
  styleUrls: ['./appointment-time-dialog.component.css'],
})
export class AppointmentTimeDialogComponent implements OnInit {
  availableSlots: { time: string; disabled: boolean }[] = [];
  loading = true;
  durationOptions = [30, 45, 60];
  selectedDuration = 60;

  constructor(
    @Inject(MAT_DIALOG_DATA)
    public data: { patient_id: string; date: string; duration: number },
    private readonly dialogRef: MatDialogRef<AppointmentTimeDialogComponent>,
    private readonly appointmentsService: AppointmentsService
  ) {
    if (data?.duration) {
      this.selectedDuration = data.duration;
    }
  }

  ngOnInit(): void {
    this.loadSlots();
  }

  async loadSlots() {
    const startHour = 8;
    const endHour = 18;
    const slots: string[] = [];
    for (let hour = startHour; hour < endHour; hour++) {
      for (let min = 0; min < 60; min += this.selectedDuration) {
        const h = hour.toString().padStart(2, '0');
        const m = min.toString().padStart(2, '0');
        slots.push(`${h}:${m}`);
      }
    }
    const results = await Promise.all(
      slots.map(async (time) => {
        // Construir start_time como ISO string usando date y time
        let startDateTime: string;
        if (this.data?.date) {
          // date puede venir como 'yyyy-MM-dd', unir con hora
          startDateTime = `${this.data.date}T${time}:00`;
        } else {
          // fallback: usar solo hora
          startDateTime = time;
        }
        const payload = {
          start_time: startDateTime,
          duration_minutes: this.selectedDuration,
          patient_id: this.data?.patient_id || '',
        };
        const result = await firstValueFrom(
          this.appointmentsService.checkTimeSlotAvailability(payload)
        );
        return { time, disabled: !result.available };
      })
    );
    this.availableSlots = results;
    this.loading = false;
  }

  onDurationChange(duration: number) {
    this.selectedDuration = duration;
    this.loadSlots();
  }

  selectSlot(slot: { time: string; disabled: boolean }) {
    if (slot.disabled) {
      return;
    }
    this.dialogRef.close({ time: slot.time, duration: this.selectedDuration });
  }

  hasEnabledSlots(): boolean {
    return this.availableSlots.some((slot) => !slot.disabled);
  }
}
