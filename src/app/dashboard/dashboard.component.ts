import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { DashboardHeaderComponent } from '../dashboard-header/dashboard-header.component';
import { DashboardMainComponent } from '../dashboard-main/dashboard-main.component';
import { DashboardSidebarComponent } from '../dashboard-sidebar/dashboard-sidebar.component';
import { DashboardFooterComponent } from '../dashboard-footer/dashboard-footer.component';
import { NotificationComponent } from '../notification/notification.component';
@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    HttpClientModule,
    DashboardHeaderComponent,
    DashboardMainComponent,
    DashboardSidebarComponent,
    DashboardFooterComponent,
    NotificationComponent
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent {}