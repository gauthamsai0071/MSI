import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { InputControlComponent } from './shared/input-control/input-control.component';
import { IconModule, ItemModule, ModalHeaderDirective, ModalModule, ModalService, MsiCommonModule, MsiSharedModule, ToastService } from '@msi/cobalt';
import { HttpClientModule, HttpClientXsrfModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { environment } from '../environments/environment';
import { AuthInterceptor } from './_interceptor/auth-interceptor';
import { CalendarComponent } from './shared/calendar/calendar.component';
import { CommonModule } from '@angular/common';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { HeaderComponent } from './components/common/header/header.component';
import { RouterModule } from '@angular/router';
import { AppTabGroupComponent } from './shared/tab-group/tab-group.component';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { PortalModule } from '@angular/cdk/portal';

@NgModule({
  imports: [
    RouterModule,
    CommonModule,
    PortalModule,    
    MsiCommonModule,
    IconModule,    
    ItemModule,
    MsiSharedModule,
    DragDropModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,    
    HttpClientXsrfModule,
    NgMultiSelectDropDownModule.forRoot()
  ],
  declarations: [ 
    HeaderComponent,
    CalendarComponent,
    AppTabGroupComponent,
    InputControlComponent
  ],
  exports : [
    RouterModule,
    CommonModule,
    PortalModule,
    MsiCommonModule,
    ModalModule,  
    IconModule,    
    ItemModule,
    MsiSharedModule,
    DragDropModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    HttpClientXsrfModule,
    NgMultiSelectDropDownModule,
    AppTabGroupComponent,
    HeaderComponent,
    CalendarComponent,
    InputControlComponent
  ],
  providers: [
    { provide: 'Api_BaseURL', useValue: environment.Api_BaseURL },
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
    ToastService,
    ModalService
  ]
})
export class SharedModule { }
