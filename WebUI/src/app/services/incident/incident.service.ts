import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { CommonService } from '../common/common.service';

@Injectable()
export class IncidentService {

  constructor(private http: HttpClient, private commonSrv: CommonService, private router: Router) { }

  public getTemplate(id: string): Observable<any> {
    let url = 'api/incidents/template?mgroupid=' + id;
    return this.http.get(url);
  }

  public createIncident(id: string, data: any): Observable<any> {
    let url = 'api/incidents?mgroupid=' + id;
    return this.http.post(url, data);
  }

  public updateIncident(id: number, mGroupId: string, data: any): Observable<any> {
    let url = 'api/incidents/' + id + '?mgroupid=' + mGroupId;
    return this.http.put(url, data);
  }

  public deleteIncident(id: number, data: any): Observable<any> {
    let url = 'api/incidents/' + id + '/delete';
    return this.http.post(url, data);
  }

  public deleteMediaGroup(id: string) {
    let url = 'api/mediaGroups/' + id;
    return this.http.delete(url);
  }

  public getCustomFields() {
    return this.http.get('api/incidents/customFields')
  }

  public getAllIncidents(search: string): Observable<any> {
    let url = 'api/incidents';
    return this.http.get(url);
  }

  public getIncident(id: number): Observable<any> {
    let mGroupId = this.commonSrv.createGroupId();
    let url = 'api/incidents/' + id + '?mgroupid=' + mGroupId;
    return this.http.get(url);
  }
}
