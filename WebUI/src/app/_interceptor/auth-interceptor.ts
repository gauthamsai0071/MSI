import { Injectable, Inject } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor
} from '@angular/common/http';
import {ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth/auth.service';
import { catchError } from 'rxjs/operators';
import { ToastService } from "@msi/cobalt";

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private router: Router,
              private route: ActivatedRoute,
              private toastService: ToastService,
              private authService: AuthService) {
  }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    let interceptedRequest: HttpRequest<any>;
    let url = request.url;
                                           
    if (this.authService.isLoggedIn()){
        url = `${request.url}`;
        interceptedRequest = request.clone({
          url: url,
          setHeaders :{
            'X-Pss-Csrf-Token': `${sessionStorage.getItem('token')}`,
            'X-Requested-With' : 'XMLHttpRequest'
          },
          withCredentials : true
        });
    }    
      else {
        return next.handle(request);
    }     
    
    if (interceptedRequest !== undefined) {
      return next.handle(interceptedRequest).pipe(catchError(this.handleError()));
    } else {
      return next.handle(request).pipe(catchError(this.handleError()));
    }
  }

  private handleError () {
    return (error: any): Observable<any> => {
      if (error.status === 401)
          // (error.status === 403 && error.error === null)) 
      {

        this.authService.logout();
        if (this.router.url.indexOf('login') !== -1) {
          return new Observable();
        }

        if (this.router.url.toString().trim() !== '/home') {
          this.router.navigate(['login'], { queryParams: { returnUrl: this.router.url.toString().trim() } });
        } else {
          this.authService.logout();
          this.router.navigate(['login']);
        }

        return new Observable();
      } else {
        if(error.status === 0 || error.status === 504){
          this.toastService.error("Unable to connect Unified Recorder API. please contact your administrator.", undefined, {autoDismiss: 5000, closeButton: true });
          let returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
          this.router.navigate([returnUrl]);          
          return new Observable();
        } else {       
          console.error(error);
          throw error;
        }
      }
    };
  }
}