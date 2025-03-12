// notification.service.ts
import { Injectable, ApplicationRef, createComponent, EnvironmentInjector, inject, EventEmitter } from '@angular/core';
import { NotificationComponent } from '../notification/notification.component';

export interface NotificationOptions {
  type?: 'default' | 'info' | 'success' | 'warning' | 'error';
  msg: string;
  title?: string;
  icon?: string;
  img?: string;
  size?: 'default' | 'mini';
  rounded?: boolean;
  delayIndicator?: boolean;
  pauseDelayOnHover?: boolean;
  continueDelayOnInactiveTab?: boolean;
  position?: 'top left' | 'top right' | 'bottom left' | 'bottom right' | 'center top';
  delay?: number;
  showClass?: string;
  hideClass?: string;
  width?: number;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private appRef = inject(ApplicationRef);
  private injector = inject(EnvironmentInjector);
  private notificationContainer: HTMLElement;

  constructor() {
    this.notificationContainer = document.createElement('div');
    this.notificationContainer.id = 'notification-container';
    document.body.appendChild(this.notificationContainer);
  }

  notify(options: NotificationOptions): void {
    const componentRef = createComponent(NotificationComponent, {
      environmentInjector: this.injector,
      hostElement: this.notificationContainer
    });
  
    // Assign options to the instance
    Object.assign(componentRef.instance, options);
  
    // Attach to the application
    this.appRef.attachView(componentRef.hostView);
  
    // Cleanup when notification is closed
    const hostElement = componentRef.location.nativeElement;
  
    if ('visibleChange' in componentRef.instance && componentRef.instance.visibleChange instanceof EventEmitter) {
      const subscription = (componentRef.instance as any).visibleChange.subscribe((visible: boolean) => {
        if (!visible) {
          subscription.unsubscribe();
          this.appRef.detachView(componentRef.hostView);
          hostElement.remove();
        }
      });
    }
  
    // Auto cleanup after delay
    if (options.delay !== undefined && options.delay > 0) {
      setTimeout(() => {
        this.appRef.detachView(componentRef.hostView);
        hostElement.remove();
      }, options.delay + 500);
    }
  }
  

  // Convenience methods for common notification types
  default(msg: string, options: Partial<NotificationOptions> = {}): void {
    this.notify({ type: 'default', msg, ...options });
  }

  info(msg: string, options: Partial<NotificationOptions> = {}): void {
    this.notify({ type: 'info', msg, ...options });
  }

  success(msg: string, options: Partial<NotificationOptions> = {}): void {
    this.notify({ type: 'success', msg, ...options });
  }

  warning(msg: string, options: Partial<NotificationOptions> = {}): void {
    this.notify({ type: 'warning', msg, ...options });
  }

  error(msg: string, options: Partial<NotificationOptions> = {}): void {
    this.notify({ type: 'error', msg, ...options });
  }
}