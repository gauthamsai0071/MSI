import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable,Subject,of } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';
import { CustomField } from '../../models/common/custom-field';

@Injectable()
export class MediaFilterService {
  private  systemSelected = new Subject<any>();
  systemSelected$ = this.systemSelected.asObservable();
  private static filteredRespone = new Subject<any>();
  filteredRespone$ = MediaFilterService.filteredRespone.asObservable().pipe(
    shareReplay(1)
  );;
  
  constructor(private http: HttpClient) { }
  
  getCustomFields() {
    return this.http.get('api/videos/customFields').pipe(
      shareReplay(1)
    );
  }

  public  notifysystemSelected(data: string) {
    if (data) {
      this.systemSelected.next(data);
    }
  }
  
  public static notifyfilteredRespone(data: string) {
    if (data) {
      this.filteredRespone.next(data);
    }else{
      this.filteredRespone.next(null);
    }
  }
}
