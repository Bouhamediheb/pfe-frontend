import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AnimationBuilder, animate, style } from '@angular/animations';
import { NotificationService } from '../services/notification.service';
import { Notification } from '../models/Notification';

@Component({
  selector: 'app-notification',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notification.component.html',
  styleUrls: ['./notification.component.scss']
})
export class NotificationComponent implements OnInit {
  notifications: Notification[] = [];
  defaultPosition: 'top left' | 'top right' | 'bottom left' | 'bottom right' | 'center top' = 'top right'; // Fallback position
  showClass = 'fadeInDown';
  hideClass = 'fadeOutDown';

  private builder = inject(AnimationBuilder);

  constructor(private notificationService: NotificationService) {}

  ngOnInit(): void {
    this.notificationService.notifications$.subscribe(notifications => {
      this.notifications = notifications;
    });
  }

  close(id: number): void {
    const element = document.querySelector(`.notification-${id}`);
    if (element && this.hideClass) {
      const factory = this.createAnimationFactory(this.hideClass, '0.5s');
      const player = factory.create(element);
      player.onDone(() => this.notificationService.removeNotification(id));
      player.play();
    } else {
      this.notificationService.removeNotification(id);
    }
  }

  getNotificationClass(type: string): string {
    return `notification-${type}`;
  }

  getPositionStyle(position: string = this.defaultPosition, index: number): { top?: string; bottom?: string; left?: string; right?: string; transform?: string } {
    const style: { top?: string; bottom?: string; left?: string; right?: string; transform?: string } = {};
    const offset = index * 60; // Stack notifications vertically (adjust as needed)

    if (position.includes('top')) {
      style.top = `${20 + offset}px`;
    } else if (position.includes('bottom')) {
      style.bottom = `${20 + offset}px`;
    }

    if (position.includes('left')) {
      style.left = '20px';
    } else if (position.includes('right')) {
      style.right = '20px';
    } else if (position.includes('center')) {
      style.left = '50%';
      style.transform = 'translateX(-50%)';
    }

    return style;
  }

  private createAnimationFactory(animationName: string, duration: string) {
    const animations: { [key: string]: any } = {
      'fadeInDown': [style({ opacity: 0, transform: 'translateY(-30px)' }), animate(duration, style({ opacity: 1, transform: 'translateY(0)' }))],
      'fadeOutDown': [style({ opacity: 1, transform: 'translateY(0)' }), animate(duration, style({ opacity: 0, transform: 'translateY(30px)' }))],
      'bounceIn': [style({ opacity: 0, transform: 'scale(0.3)' }), animate(duration, style({ opacity: 1, transform: 'scale(1)' }))],
      'bounceOut': [style({ opacity: 1, transform: 'scale(1)' }), animate(duration, style({ opacity: 0, transform: 'scale(0.3)' }))],
      'zoomIn': [style({ opacity: 0, transform: 'scale(0.5)' }), animate(duration, style({ opacity: 1, transform: 'scale(1)' }))],
      'zoomOut': [style({ opacity: 1, transform: 'scale(1)' }), animate(duration, style({ opacity: 0, transform: 'scale(0.5)' }))],
      'lightSpeedIn': [style({ opacity: 0, transform: 'translateX(100%) skewX(-30deg)' }), animate(duration, style({ opacity: 1, transform: 'translateX(0) skewX(0)' }))],
      'lightSpeedOut': [style({ opacity: 1, transform: 'translateX(0) skewX(0)' }), animate(duration, style({ opacity: 0, transform: 'translateX(100%) skewX(30deg)' }))],
      'rollIn': [style({ opacity: 0, transform: 'translateX(-100%) rotate(-120deg)' }), animate(duration, style({ opacity: 1, transform: 'translateX(0) rotate(0)' }))],
      'rollOut': [style({ opacity: 1, transform: 'translateX(0) rotate(0)' }), animate(duration, style({ opacity: 0, transform: 'translateX(100%) rotate(120deg)' }))]
    };

    return this.builder.build(animations[animationName] || []);
  }
}