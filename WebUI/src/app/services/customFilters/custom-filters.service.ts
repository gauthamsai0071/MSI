import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable()
export class CustomFiltersService {
  constructor(private http: HttpClient) { }

  getCustomFields(){
   return this.http.get('api/videos/customFields')
  }
}
