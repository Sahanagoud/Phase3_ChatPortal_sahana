import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { io, Socket } from 'socket.io-client';
import { Router } from '@angular/router';
import { SocketService } from '../socket.service';


@Component({
  selector: 'app-chat-room',
  templateUrl: './chat-room.component.html',
  styleUrls: ['./chat-room.component.css']
})
export class ChatRoomComponent implements OnInit {
  chatRooms: string[] = [];
  socket!: Socket;
  username: string = 'John';
  chatRoom: string = 'your_chat_room_name';

  constructor(private http: HttpClient,
    private router: Router
    ) {}

  ngOnInit() {
   
    this.fetchChatRooms();
  }

  fetchChatRooms() {
    alert("fetching chat rooms")
    this.http.get<any>('http://192.168.1.5:3000/chat-rooms')
      .subscribe(
        (response) => {
          this.chatRooms = response.chatRooms;
        },
        (error) => {
          console.error('Error fetching chat rooms:', error);
          
        }
      );
  }

  connectToChatRoom(chatRoomName: string): void {
    localStorage.setItem('chatroom', chatRoomName);          
      
  }

}
