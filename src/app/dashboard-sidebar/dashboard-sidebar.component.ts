import { Component, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import { WebSocketService } from '../services/web-socket-service.service';
import { NotificationService } from '../services/notification.service';
import SimpleBar from 'simplebar';
import 'simplebar/dist/simplebar.css';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-dashboard-sidebar',
  standalone: true,
  imports: [],  // Add necessary imports here
  templateUrl: './dashboard-sidebar.component.html',
  styleUrls: ['./dashboard-sidebar.component.scss']
})
export class DashboardSidebarComponent implements OnInit, AfterViewInit, OnDestroy {
  private webSocketSubscription: Subscription | null = null;

  constructor(
    private notificationService: NotificationService,
    private webSocketService: WebSocketService
  ) {}

  ngOnInit(): void {
    // Subscribe to WebSocket messages and display notifications
    this.webSocketSubscription = this.webSocketService.getMessages().subscribe((message) => {
      // Extract the message details
      const notificationMessage = message.message;
      const timestamp = message.timestamp;

      console.log('Received WebSocket message:', message);  // Log the message to console

      // Trigger a notification using NotificationService
      this.notificationService.notify({
        msg: notificationMessage,
        title: 'New Notification',
        delay: 5000,  // Notification disappears after 5 seconds
        type: 'info',  // Notification type (can be 'info', 'success', 'warning', etc.)
      });
    });
  }

  ngAfterViewInit() {
    // Initialize SimpleBar on the sidebar-nav element
    const sidebarNav = document.querySelector('.sidebar-nav') as HTMLElement;
    if (sidebarNav) {
      new SimpleBar(sidebarNav);
    }

    const metisMenu = document.getElementById('sidenav');
    if (metisMenu && (window as any).metisMenu) {
      new (window as any).metisMenu(metisMenu);
    }
  }

  showNotification(): void {
    console.log('Notification button clicked!');
    this.notificationService.success(
      'This is a success notification!',
      'Success',
      3000,
      'top right' // Explicitly set position
    );
  }

  ngOnDestroy(): void {
    // Unsubscribe from WebSocket service to avoid memory leaks
    if (this.webSocketSubscription) {
      this.webSocketSubscription.unsubscribe();
    }
  }
}
