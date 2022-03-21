import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, CanActivateChild, Router, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate, CanActivateChild {
  constructor(private router: Router,
              private authService: AuthService){}
  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {

      if (this.authService.isLoggedIn()) {
        return true;
      }

      this.router.navigate(['/login'], { queryParams: { returnUrl: state.url }});
      return false;      
  }
  
  canActivateChild(childRoute: ActivatedRouteSnapshot, state: RouterStateSnapshot): any {
    return this.canActivate(childRoute, state);
  }
}
