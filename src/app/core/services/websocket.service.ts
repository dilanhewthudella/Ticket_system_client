import { ApplicationRef, inject, Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { first, Observable } from 'rxjs';
@Injectable({
  providedIn: 'root',
})
export class WebsocketService {
  private socket!: Socket;
  constructor() {
    this.socket = io('http://localhost:3000/', {
      autoConnect: false,
      transports: ['websocket'], // Avoids polling, which can lead to CORS issues
      withCredentials: true,
    });
    inject(ApplicationRef)
      .isStable.pipe(first((isStable) => isStable))
      .subscribe(() => {
        console.log("Angular app is stable. Connecting WebSocket...");
        this.socket.connect();
      });
  }
  getTicketUpdates(event: string): Observable<any[]> {
    return new Observable((subscriber) => {
      this.socket.on(event, (ticketPool) => {
        subscriber.next(ticketPool);
      });
            // Handle cleanup
            // return () => {
            //   this.socket.off(event);
            // };
    });
  }
}
