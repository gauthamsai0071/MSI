import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable()
export class MediaFilterService {
  private  systemSelected = new Subject<any>();
  systemSelected$ = this.systemSelected.asObservable();
  
  private static filteredRespone = new Subject<any>();
  filteredRespone$ = MediaFilterService.filteredRespone.asObservable();
  
  constructor(private http: HttpClient) { }
  
  getCustomFields() {
    return this.http.get('api/videos/customFields');
  }

  public  notifysystemSelected(data: any) {
    if (data) {
      this.systemSelected.next(data);
    }
  }
  
  public static notifyfilteredRespone(data: any) {
    if (data) {
      this.filteredRespone.next(data);
    }else{
      this.filteredRespone.next(null);
    }
  }
}
