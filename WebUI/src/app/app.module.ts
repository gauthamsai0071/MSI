import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { MsiCommonModule } from '@msi/cobalt';
import { FormsModule, ReactiveFormsModule} from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginComponent } from './components/login/login.component';
import { HomeComponent } from './components/home/home.component';
import { HttpClientModule, HttpClientXsrfModule, HttpXsrfTokenExtractor, HTTP_INTERCEPTORS } from '@angular/common/http';
import { AuthService } from './services/auth/auth.service';
import { TokenService } from './services/token/token.service';
import { MessageService } from './services/common/message.service';
import { SharedModule } from '../app/shared/input-control/shared.module';
import { HeaderComponent } from './components/header/header.component';
import { SearchComponent } from './components/search/search.component';
import { FilterTabComponent } from './components/search/filter-tab/filter-tab.component';
import { DatePickerComponent } from './components/common/date-picker/date-picker.component';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    HomeComponent,
    HeaderComponent,
    SearchComponent,
    FilterTabComponent,
    DatePickerComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    MsiCommonModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientXsrfModule,
    SharedModule,
    BrowserAnimationsModule,
    HttpClientModule,
    NgMultiSelectDropDownModule.forRoot()
  ],
  providers: [AuthService,MessageService,{
    provide : HTTP_INTERCEPTORS,
    useClass :TokenService,
    multi:true
  }],
  bootstrap: [AppComponent]
})
export class AppModule { }
