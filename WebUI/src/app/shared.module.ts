import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { InputControlComponent } from './shared/input-control/input-control.component';
import { IconModule, ItemModule, MsiCommonModule, MsiSharedModule, ToastService } from '@msi/cobalt';
import { HttpClientModule, HttpClientXsrfModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { environment } from '../environments/environment';
import { AuthInterceptor } from './_interceptor/auth-interceptor';
import { DatePickerComponent } from './shared/date-picker/date-picker.component';
import { CommonModule } from '@angular/common';


@NgModule({
  imports: [
    CommonModule,
    MsiCommonModule,
    IconModule,    
    ItemModule,
    MsiSharedModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,    
    HttpClientXsrfModule
  ],
  declarations: [ 
    DatePickerComponent,
    InputControlComponent 
  ],
  exports : [
    CommonModule,
    MsiCommonModule,         
    IconModule,    
    ItemModule,
    MsiSharedModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    HttpClientXsrfModule,
    DatePickerComponent,
    InputControlComponent
  ],
  providers: [
    { provide: 'Api_BaseURL', useValue: environment.Api_BaseURL },
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
    ToastService
  ]
})
export class SharedModule { }
