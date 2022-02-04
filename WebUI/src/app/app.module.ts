import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { MsiCommonModule } from '@msi/cobalt';
import { FormsModule, ReactiveFormsModule} from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginComponent } from './components/login/login.component';
import { HomeComponent } from './components/home/home.component';
import { HttpClientXsrfModule, HttpXsrfTokenExtractor, HTTP_INTERCEPTORS } from '@angular/common/http';
import { AuthService } from './services/auth/auth.service';
import { TokenService } from './services/token/token.service';
import { MessageService } from './services/common/message.service';
import { SharedModule } from '../app/shared/input-control/shared.module';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    HomeComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    MsiCommonModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientXsrfModule,
    SharedModule
  ],
  providers: [AuthService,MessageService,{
    provide : HTTP_INTERCEPTORS,
    useClass :TokenService,
    multi:true
  }],
  bootstrap: [AppComponent]
})
export class AppModule { }
