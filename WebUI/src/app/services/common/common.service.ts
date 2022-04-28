import { Injectable } from "@angular/core";
import * as fileSaver from 'file-saver';

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


    public downloadFile(data: Blob, title: string, fileType?: string) {
        let file = new Blob([data], { type: (fileType !== '') ? fileType : 'application/octet-stream;' });
        fileSaver.saveAs(file, title);
    }
}   