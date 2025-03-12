import { Component } from '@angular/core';
import { NotificationService } from '../services/notification.service';
@Component({
  selector: 'app-dashboard-sidebar',
  standalone: true,
  imports: [],
  templateUrl: './dashboard-sidebar.component.html',
  styleUrl: './dashboard-sidebar.component.scss'
})
export class DashboardSidebarComponent {
  constructor(private notificationService: NotificationService) {}

  showNotification() {
    this.notificationService.success('This is a success notification!', {
      icon: 'bi bi-check2-circle',
      rounded: true
    });
}
}
