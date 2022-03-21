import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class MessageService {
    unExpectedErrorMessage = 'Unexpected Error encountered while processing the Request';

    commonErrorMessages: {[key: string]: string} = {};

    constructor() {
        this.commonErrorMessages['required'] = '{label} is required';
        this.commonErrorMessages['minlength'] = '{label} must be at least {length} characters long';
        this.commonErrorMessages['maxlength'] = '{label} must only have max. of {length} characters';
        this.commonErrorMessages['email'] = '{label} format is not valid';
        this.commonErrorMessages['pattern'] = '{label} is not valid';
        this.commonErrorMessages['match'] = '{inputs} do not match';
        this.commonErrorMessages['validateRange'] = '{label} is invalid';
        this.commonErrorMessages['url'] = '{label} Url entered is not a valid Url';
        this.commonErrorMessages['date'] = '{label} entered is not a valid Date';
        this.commonErrorMessages['future-date'] = '{label} should be a future Date';
    }
}
