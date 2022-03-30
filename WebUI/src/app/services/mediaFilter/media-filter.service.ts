import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MediaFilterService {

  constructor() { }
  private  systemSelected = new Subject<any>();
  systemSelected$ = this.systemSelected.asObservable();
  public  notifysystemSelected(data: any) {
    if (data) {
      this.systemSelected.next(data);
    }
  }

  private static filteredRespone = new Subject<any>();
  filteredRespone$ = MediaFilterService.filteredRespone.asObservable();
  public static notifyfilteredRespone(data: any) {
    if (data) {
      this.filteredRespone.next(data);
    }
  }
}
