import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class TokenService implements HttpInterceptor {
  

  constructor() { }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    let tokenizedReq = req.clone({
      setHeaders :{
        'X-Pss-Csrf-Token': `${sessionStorage.getItem('token')}`,
        'X-Requested-With' : 'XMLHttpRequest'
      },
        withCredentials : true,
    })

    return next.handle(tokenizedReq);
}
}
