import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { io, Socket } from 'socket.io-client';
import { SocketService } from '../socket.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  username: string = '';
  password: string = '';
  socket!: Socket;

  constructor(private router: Router, private http: HttpClient) {}

  login() {
    const loginData = {
      username: this.username,
      password: this.password
    };

    this.http.post<any>('http://192.168.1.5:3000/login', loginData)
    .subscribe(
        (response): void => {
          localStorage.setItem('token', response.token);
          localStorage.setItem('username', response.username);
          

        if(this.username.length >= 3 && this.username!="") 
        {
          alert("Login Successful\n Welcome "+this.username);
          this.router.navigate(['/chat-rooms']);
        }
        else
        {
          if(this.username==""||this.password=="")
          {
            alert("Enter Username and Password");
            this.router.navigate(['/login']);
          }
          else
          {
          alert("Login Unsuccessful");
          this.router.navigate(['/login']);
          }
        }
        },
        (error) => {
          console.error('Error logging in:', error);
          alert("Invalid Username or Password");
          this.router.navigate(['/login']);

        }
      );
  }
}
