import { Component, AfterViewInit } from '@angular/core';
import { NotificationService } from '../services/notification.service';
import SimpleBar from 'simplebar';
import 'simplebar/dist/simplebar.css'; // Don't forget the CSS

@Component({
  selector: 'app-dashboard-sidebar',
  standalone: true,
  imports: [],
  templateUrl: './dashboard-sidebar.component.html',
  styleUrl: './dashboard-sidebar.component.scss'
})
export class DashboardSidebarComponent implements AfterViewInit {
  constructor(private notificationService: NotificationService) {}
  ngAfterViewInit() {
    // Initialize SimpleBar on the sidebar-nav element
    const sidebarNav = document.querySelector('.sidebar-nav') as HTMLElement;
    if (sidebarNav) {
      new SimpleBar(sidebarNav);
    }
    
    // Initialize MetisMenu if you're using it
    const metisMenu = document.getElementById('sidenav');
    if (metisMenu && (window as any).metisMenu) {
      new (window as any).metisMenu(metisMenu);
    }
  }
  showNotification() {
    this.notificationService.success('This is a success notification!', {
      icon: 'bi bi-check2-circle',
      rounded: true
    });
  }
}