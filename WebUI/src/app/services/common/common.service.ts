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

    public convertStringToTimesamp(dateStr: string): any {
        let dateString = dateStr,
            dateTimeParts = dateString.split(' '),
            dateParts = dateTimeParts[0].split('/'),
            date;

        date = dateParts[1] + "/" + dateParts[0] + "/" + dateParts[2] + " " + dateTimeParts[1];
        return new Date(date);
    }
}   