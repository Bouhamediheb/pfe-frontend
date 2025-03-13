import { Injectable } from '@angular/core';
import { WebSocketSubject } from 'rxjs/webSocket';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class WebSocketService {
  private socket$: WebSocketSubject<any>;

  constructor() {
    this.socket$ = new WebSocketSubject('ws://localhost:8080/ws/notifications');
    this.socket$.subscribe({
      next: (message) => {
        console.log('Message received from WebSocket: ', message);
      },
      error: (err) => {
        console.error('WebSocket error: ', err);
      },
      complete: () => {
        console.log('WebSocket connection closed');
      }
    });
  }

  sendMessage(message: any): void {
    this.socket$.next(message);
  }

  getMessages(): Observable<any> {
    return this.socket$.asObservable();
  }

  closeConnection(): void {
    this.socket$.complete();
  }
}
