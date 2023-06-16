import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SocketService {
  socket: Socket;
  public username$: BehaviorSubject<string> = new BehaviorSubject('');
 

  constructor() {
    this.socket = io('http://192.168.1.5:3000', {
      query: { username: this.getUsername(),chatRoom: this.getChatRoomName()}
    });
  }

  private getUsername(): string {
    return localStorage.getItem('username') ?? ''; 
  }

  private getChatRoomName():string{
    return localStorage.getItem('chatroom') ?? ''; 

  }

  public getnewUser = () => {
   
    this.socket.on('userJoined', (username) =>{     
      this.username$.next(username);
    });
    
    return this.username$.asObservable();
  };
}
