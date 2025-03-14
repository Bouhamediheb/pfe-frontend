import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Notification } from '../models/Notification';


@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private notifications = new BehaviorSubject<Notification[]>([]);
  notifications$: Observable<Notification[]> = this.notifications.asObservable();
  private idCounter = 0;

  showNotification(
    type: 'default' | 'info' | 'success' | 'warning' | 'error' = 'default',
    msg: string,
    title?: string,
    icon?: string,
    delay: number = 5000,
    position: 'top left' | 'top right' | 'bottom left' | 'bottom right' | 'center top' = 'top right'
  ): void {
    const notification: Notification = {
      id: this.idCounter++,
      type,
      msg,
      title,
      icon,
      delay,
      position
    };
    const currentNotifications = this.notifications.value;
    this.notifications.next([...currentNotifications, notification]);

    setTimeout(() => this.removeNotification(notification.id), delay);
  }

  success(msg: string, title?: string, delay: number = 5000, position: 'top left' | 'top right' | 'bottom left' | 'bottom right' | 'center top' = 'top right'): void {
    this.showNotification('success', msg, title, 'bi bi-check-circle', delay, position);
  }

  notify(config: {
    type?: 'default' | 'info' | 'success' | 'warning' | 'error';
    msg: string;
    title?: string;
    icon?: string;
    delay?: number;
    position?: 'top left' | 'top right' | 'bottom left' | 'bottom right' | 'center top';
  }): void {
    this.showNotification(
      config.type || 'default',
      config.msg,
      config.title,
      config.icon,
      config.delay || 5000,
      config.position || 'top right'
    );
  }

  removeNotification(id: number): void {
    const updatedNotifications = this.notifications.value.filter(n => n.id !== id);
    this.notifications.next(updatedNotifications);
  }
}