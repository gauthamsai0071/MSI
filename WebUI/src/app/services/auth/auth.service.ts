import { Injectable } from '@angular/core';
import { User } from '../../interfaces/login/user';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  constructor(private http: HttpClient, private router: Router) { }

  public getInitPublicSession(): Observable<any> {
    let url = 'api/account/init-public-session';
    return this.http.get(url);
  }

  public getCurrentState(): Observable<any> {
    let url = 'api/state/current?public=false';
    return this.http.get(url);
  }

  public login(userInfo: User): Observable<any> {
    let url = 'api/account/login';
    return this.http.post(url, userInfo);
  }

  public isLoggedIn() {
    if (sessionStorage.getItem('token') !== null) {
      return sessionStorage.getItem('token') !== null;
    }
    else {
      return this.router.navigateByUrl('/login');
    }
  }

  public logout() {
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('username');
  }
}
