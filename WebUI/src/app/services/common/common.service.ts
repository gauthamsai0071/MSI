import { Injectable } from "@angular/core";

@Injectable({
    providedIn: 'root'
})
export class CommonService {

    /**
     * To get random 6 digit number
     * 
     * @returns 
     */

    public createGroupId(): string {
        return '' + Math.floor(Math.random() * 100000000);
    }
}   