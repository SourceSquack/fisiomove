import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Notification } from '../models/notification.model';

@Injectable({ providedIn: 'root' })
export class NotificationsService {
  private readonly apiUrl = '/api/v1/notifications';

  constructor(private readonly http: HttpClient) {}

  getUserNotifications(): Observable<Notification[]> {
    return this.http.get<Notification[]>(this.apiUrl);
  }

  getUnreadCount(): Observable<number> {
    return this.getUserNotifications().pipe(
      map((notifications) => notifications.filter((n) => !n.is_read).length)
    );
  }
}
