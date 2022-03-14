import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CustomFiltersService {
  URL = 'localhost:9080'

  constructor(
    private http: HttpClient,
  ) { }
  getCustomFields(){
   return this.http.get('api/videos/customFields')
  }
}
