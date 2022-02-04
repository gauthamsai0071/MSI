import { Component, Input, AfterContentChecked, ViewEncapsulation, AfterViewChecked, OnInit } from '@angular/core';
import { AbstractControl, FormGroupDirective, ControlContainer, FormArray } from '@angular/forms';
import { MessageService } from '../../services/common/message.service';

@Component({
  selector: 'app-input-control',
  templateUrl: './input-control.component.html',
  viewProviders: [{ provide: ControlContainer, useExisting: FormGroupDirective }],
  encapsulation: ViewEncapsulation.None
})
export class InputControlComponent implements AfterContentChecked {
  @Input()
  LabelText: string;

  @Input()
  ValidationMessages: { [key: string]: string };

  @Input()
  controlName: string;

  @Input()
  errorLabelClassName: string;

  @Input()
  arrayName: string;

  @Input()
  arrayIndex: number;

  @Input()
  parentForm: FormGroupDirective;

  @Input()
  formResetting: boolean;

  formControl: AbstractControl | null;

  constructor(private messageService: MessageService,
              private formGroup: FormGroupDirective) {
      this.ValidationMessages = {};
  }

  ngAfterContentChecked(): void {
    if (this.arrayName === undefined) {
      this.formControl = this.formGroup.form.get(this.controlName);
    } else {
      if (this.controlName !== undefined && this.controlName !== null && this.controlName !== '') {
        this.formControl = (this.formGroup.control.get(this.arrayName) as FormArray).controls[this.arrayIndex].get(this.controlName);
      } else {
        this.formControl = (this.formGroup.control.get(this.arrayName) as FormArray).controls[this.arrayIndex];
      }
    }    
  }

  get errorMessage(): any {
    if (this.formResetting || this.formControl === undefined) {
      return '';
    }

    if (this.parentForm !== undefined) {
      if ((!this.parentForm.submitted) &&
          (this.formControl?.pristine || this.formControl?.untouched || this.formControl?.valid)) {
        return '';
      }
    } else if ((!this.formGroup.submitted) &&
          (this.formControl?.pristine || this.formControl?.untouched || this.formControl?.valid)) {
      return '';
    }

    if (this.formControl?.errors === undefined || this.formControl?.errors === null) {
      return '';
    }

    // tslint:disable-next-line:forin
    for (const error in this.formControl.errors) {
      if (this.ValidationMessages != null && this.ValidationMessages[error] !== undefined && this.ValidationMessages[error] !== '') {
        return this.ValidationMessages[error];
      }

      if (this.messageService.commonErrorMessages[error] !== '') {
        let errorMessage = this.messageService.commonErrorMessages[error].replace('{label}', this.LabelText);

        if ((error.toLowerCase() === 'minlength' || error.toLowerCase() === 'maxlength') && errorMessage.indexOf('length') !== -1) {
            errorMessage = errorMessage.replace('{length}', this.formControl.errors[error.toLowerCase()].requiredLength);
        }

        if (error.toLowerCase() === 'match') {
          errorMessage = errorMessage.replace('{inputs}', this.formControl.errors[error.toLowerCase()]);
        }
        return errorMessage;
      }
    }
  }
}
