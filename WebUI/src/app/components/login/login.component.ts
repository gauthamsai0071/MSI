import { Component,OnInit,OnDestroy, ViewEncapsulation, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from  '@angular/forms';
import { ActivatedRoute, Router } from  '@angular/router';
import { AuthService } from  '../../services/auth/auth.service';
import { DOCUMENT } from "@angular/common";

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class LoginComponent implements OnInit, OnDestroy {
  loginForm: FormGroup;
  isSubmitted  =  false;
  returnUrl: string;
  csrfToken = '';
  isAuthFailure:boolean = false;
  formResetting: boolean = true;
  constructor(@Inject(DOCUMENT) private document: any, private authService: AuthService, 
              private router: Router, private route: ActivatedRoute,
              private formBuilder: FormBuilder) { }

  ngOnInit(): void {
    this.document.body.classList.add('bodybg-color');
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/home';

    this.loginForm  =  this.formBuilder.group({
      userName: ['', Validators.required],
      password: ['', [Validators.required, Validators.minLength(5)]]
    }); 
  }

  get formControls() { return this.loginForm.controls; }

  login(){
    this.formResetting = false;
    sessionStorage.setItem('token','');
    this.isSubmitted = true;
    if(this.loginForm.invalid){
      return;
    }
    this.authService.getInitPublicSession().subscribe(res =>{
      let resut:any = res;
      this.csrfToken = resut.csrfToken;
      sessionStorage.setItem('token',this.csrfToken);
      this.authService.login(this.loginForm.value.userName, this.loginForm.value.password).subscribe(res =>{
        let response:any = res;
        if(response.success===true) {
          this.formResetting = true;
          this.loginForm.reset({});
          this.router.navigate([this.returnUrl]);
        }
        else{
          this.isAuthFailure = true;
        }
      });
    });
  }

  ngOnDestroy() {
    this.document.body.classList.remove('bodybg-color');
  }
}
