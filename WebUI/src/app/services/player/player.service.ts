import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, Subject,ReplaySubject } from 'rxjs';
import { shareReplay } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class PlayerService {

  private dataSubject = new ReplaySubject<any>(1);
  
  data$: Observable<any> = this.dataSubject.asObservable();
  static dataSubject: any;

  constructor(private http: HttpClient) { }

  getPlayableDetails(url,body):Observable<any>{
      return this.http.post(url,body); 
  }

  downloadVideo(url):Observable<any>{
    return this.http.get(url,
      {responseType:'blob'}); 
  }
  public static getMediaResponse(data: any) {
    if (data) {
      this.dataSubject.next(data)
    }else{
      this.dataSubject.next(null)
    }
  }

}
