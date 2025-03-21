import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { WebSocketSubject } from 'rxjs/webSocket';

@Injectable({
  providedIn: 'root'
})
export class WebSocketService {
  private socket$: WebSocketSubject<any>;

  constructor() {
    this.socket$ = new WebSocketSubject('ws://localhost:8080/ws');

    this.socket$.subscribe({
      next: (message) => {
        console.log('📩 Message brut reçu:', message);
        
        // Ensure that the message is parsed only if it's a string
        if (typeof message === 'string') {
          try {
            const parsedMessage = JSON.parse(message);
            console.log('✅ Message JSON parsé:', parsedMessage);
          } catch (error) {
            console.error('❌ Erreur de parsing JSON:', message, 'Erreur:', error);
          }
        } else {
          // If the message is already an object, no need to parse it
          console.log('✅ Message reçu sous forme d\'objet:', message);
        }
      },
      error: (err) => console.error('❌ WebSocket error:', err),
      complete: () => console.log('🔌 WebSocket connection closed')
    });
  }

  sendMessage(message: any): void {
    const jsonMessage = JSON.stringify(message);
    console.log('📤 Envoi du message WebSocket:', jsonMessage);
    this.socket$.next(jsonMessage);
  }

  getMessages(): Observable<any> {
    return this.socket$.asObservable();
  }

  closeConnection(): void {
    if (this.socket$) {
      this.socket$.unsubscribe(); // Arrêter l'écoute des messages
      this.socket$.complete(); // Fermer le WebSocket
    }
  }
}
