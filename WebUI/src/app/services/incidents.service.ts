import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { Incidents } from '../models/incidents.model';
import { CommonService } from './common/common.service';

@Injectable({
  providedIn: 'root'
})
export class IncidentsService {

  constructor(private http: HttpClient, private commonSrv: CommonService, private router: Router) { }

  public getTemplate(id: string): Observable<Incidents> {
    let url = 'api/incidents/template?mgroupid=' + id;
    return this.http.get<Incidents>(url);
  }

  public createIncident(id: string, incidents: Incidents): Observable<Incidents> {
    let url = 'api/incidents?mgroupid=' + id;
    return this.http.post<Incidents>(url, incidents);
  }

  public updateIncident(id: number, mGroupId: string, incidents: Incidents): Observable<Incidents> {
    let url = 'api/incidents/' + id + '?mgroupid=' + mGroupId;
    return this.http.put<Incidents>(url, incidents);
  }

  public deleteMediaGroup(id: string) {
    let url = 'api/mediaGroups/' + id;
    return this.http.delete(url);
  }

  public getCustomFields() {
    return this.http.get('api/incidents/customFields')
  }

  public getAllIncidents(search: string): Observable<Incidents[]> {
    let url = 'api/incidents';
    return this.http.get<Incidents[]>(url);
  }

  public getIncident(id: number) {
    let mGroupId = this.commonSrv.createGroupId();
    let url = 'api/incidents/' + id + '?mgroupid=' + mGroupId;
    return this.http.get<Incidents>(url);
  }
}
