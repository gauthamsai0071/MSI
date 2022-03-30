import { Injectable } from '@angular/core';
import { User } from '../../models/common/user';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  constructor(private http:HttpClient,private router: Router) { }

  public getInitPublicSession():Observable<any>{
    return this.http.get('api/account/init-public-session');
  }

  public getLoggedInUser(): Observable<User> {
    return this.http.get<User>('api/users/names/operators?type=USER');
  } 

  public login(userName: string, password: string):Observable<any>{
    let url = 'api/account/login';
    return this.http.post(url, { userName: userName, password: password });    
  }

  public isLoggedIn() {
    if(sessionStorage.getItem('token') !== null){
      return sessionStorage.getItem('token') !== null;
    }
    
    return false;
  }

  public logout() {
    sessionStorage.removeItem('token');
  }
}
