import { Component, OnInit, ChangeDetectorRef  } from '@angular/core';
import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { io, Socket } from 'socket.io-client';
import { SocketService } from '../socket.service';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent implements OnInit {
  loggedIn: boolean = false;
  username: string | null= '';
  room: string | null = '';
  messageContent: string = '';
  chatMessages: any[] = [];
  socket!: Socket;
  notification!: string;
  joinedUsers: string[] = [];
  newJoinedUser!:string;
  userleft!:string;

  constructor(private route: ActivatedRoute, 
    private http: HttpClient,   
    private changeDetectorRef: ChangeDetectorRef,
    private router: Router
    ) {
      this.socket = io('http://192.168.1.5:3000', {
        query: { username: localStorage.getItem('username'),chatRoom: localStorage.getItem('chatroom')}
      });
    }



  ngOnInit() {
    
    

  

  // Place your socket connection code here
  this.socket.on('connect', () => {
    console.log('Connected to Socket.io server');

     // Listen for the 'userJoined' event
  this.socket.on('joinedUsers', (message) => {
    console.log(message);
     this.joinedUsers= message;
     console.log(message);       
     // Trigger change detection manually
     this.changeDetectorRef.markForCheck();
   });

   this.socket.on('userJoined', (username: string) => {
    this.newJoinedUser = username;
     console.log('User joined:', username);
     this.changeDetectorRef.detectChanges();
 });
 this.socket.on('newMessage', (newMessage: string) => {
  console.log(newMessage);
  this.chatMessages.push(newMessage);
   this.changeDetectorRef.detectChanges();
});
 

  });    
  
    this.username = localStorage.getItem('username');
    
    if(this.username!=null){
      this.loggedIn = true;
    }
    

  this.room = this.route.snapshot.paramMap.get('room');
    this.fetchChatMessages();
}

  

  fetchChatMessages() {    
    this.http.get<any>('http://192.168.1.5:3000/chat-rooms/' + this.room, {
      headers: new HttpHeaders().set('Authorization', 'Bearer ' + localStorage.getItem('token'))
    })
      .subscribe(
        (response) => {
          console.log(response.chatMessages)
          this.chatMessages = response.chatMessages;
        },
        (error) => {
          console.error('Error fetching chat messages:', error);
        }
      );
  }

  sendMessage() {
    const messageData = {
      user: this.username,
      content: this.messageContent
    };

    this.socket.emit('newMessage', messageData);
    this.messageContent = '';

    this.http.post<any>('http://192.168.1.5:3000/chat-rooms/' + this.room + '/messages', messageData, {
      headers: new HttpHeaders().set('Authorization', 'Bearer ' + localStorage.getItem('token'))
    })
      .subscribe(
        (response) => {
          console.log(this.chatMessages);
          this.messageContent = '';
        },
        (error) => {
          console.error('Error sending message:', error);
        }
      );
  }

  leaveChatRoom(): void {    
    // Emit socket event to notify the server
    this.socket.emit('leaveChatRoom');
   
    this.socket.on('userLeft', (username:string) =>{     
     console.log("user left " + username)
      this.userleft = username;    

    });
    this.router.navigate(['/chat-rooms']);
  }

  logout(): void {
    alert("logout")
    this.socket.disconnect();
    
    localStorage.removeItem('username');
    localStorage.removeItem('chatroom');
    localStorage.removeItem('token');
    
    this.router.navigate(['/login']);
  }
}
