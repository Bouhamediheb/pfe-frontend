import { Component, Input, OnInit } from '@angular/core';
import { WebSocketService } from '../services/web-socket-service.service';
import { CommonModule } from '@angular/common';
//import PerfectScrollbar from 'perfect-scrollbar';

@Component({
  selector: 'app-notification-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notification-list.component.html',
  styleUrl: './notification-list.component.scss'
})
export class NotificationListComponent implements OnInit {
  messages: string[] = [];

  constructor(private webSocketService: WebSocketService) {}

  ngOnInit() {
    this.webSocketService.getMessages().subscribe((message: any) => {
      console.log('📥 Nouveau message reçu:', message);
  
      if (typeof message === 'string') {
        try {
          message = JSON.parse(message);
        } catch (error) {
          console.error('❌ Impossible de parser le message:', message);
        }
      }
  
      this.messages.push(message.message || JSON.stringify(message));
  
      // Mise à jour du scroll
      setTimeout(() => {
        const container = document.querySelector('.message-container');
        if (container) {
        //  new PerfectScrollbar(container);
        } else {
          console.error('PerfectScrollbar: Element non trouvé');
        }
      }, 100);
    });
  }
  ngOnDestroy() {
    this.webSocketService.closeConnection();
  }
  
}  