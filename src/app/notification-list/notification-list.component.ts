import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-notification-list',
  standalone: true,
  imports: [],
  templateUrl: './notification-list.component.html',
  styleUrl: './notification-list.component.scss'
})
export class NotificationListComponent {
  @Input() notifications: any[] = [];  // Define the notifications property
}