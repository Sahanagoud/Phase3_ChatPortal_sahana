import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  username: string = '';
  password: string = '';

  constructor(private router: Router, private http: HttpClient) {}

  register() {
    const registerData = {
      username: this.username,
      password: this.password
    };
   
    if(this.username==""||this.password=="")
          {
            alert("Enter Username and Password");
            this.router.navigate(['/register']);
          }
          else if(this.username.length<3||this.password.length<3)
          {
          alert("Username and password min 3 digit");
          this.router.navigate(['/register']);
          }
          else
          {
    this.http.post<any>('http://192.168.1.5:3000/register', registerData)
      .subscribe(
        () => {
            alert("Registration Successful");
           this.router.navigate(['/login']);
        },
        (error) => {
          console.error('Error registering:', error);
          alert("Error registering");
        }
      
      );
  }}
}
