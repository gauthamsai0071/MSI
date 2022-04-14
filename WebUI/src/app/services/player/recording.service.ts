import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { CreateSubscriptionResponseAdto } from 'src/app/interfaces/adto';

@Injectable({
  providedIn: 'root'
})
export class RecordingService {

  constructor(private http: HttpClient) { }

  
  getRecordings(url: string): Observable<any> {
    return this.http.get(url).pipe(map((response: any) => response));
  }
 /*  videoSubscribe(url: string,body: any):Observable<any>{
    return this.http.post(url,body)
    .pipe(map(
      (response: CreateSubscriptionResponseAdto) => 
              response));
  } */

}
