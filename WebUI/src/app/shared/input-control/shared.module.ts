import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { InputControlComponent } from './input-control.component';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule
  ],
  declarations: [ InputControlComponent],
  exports : [
    FormsModule,
    ReactiveFormsModule,
    InputControlComponent,
  ]
})
export class SharedModule { }
