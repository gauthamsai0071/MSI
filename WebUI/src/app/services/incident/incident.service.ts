import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { Incident } from '../../../app/models/incident/incident';
import { Export } from '../../../app/models/incident/export';
import { CommonService } from '../common/common.service';

@Injectable()
export class IncidentService {

  constructor(private http: HttpClient, private commonSrv: CommonService, private router: Router) { }

  public getTemplate(id: string): Observable<Incident> {
    let url = 'api/incidents/template?mgroupid=' + id;
    return this.http.get<Incident>(url);
  }

  public createIncident(id: string, incidents: Incident): Observable<Incident> {
    let url = 'api/incidents?mgroupid=' + id;
    return this.http.post<Incident>(url, incidents);
  }

  public updateIncident(id: number, mGroupId: string, incidents: Incident): Observable<Incident> {
    let url = 'api/incidents/' + id + '?mgroupid=' + mGroupId;
    return this.http.put<Incident>(url, incidents);
  }

  public deleteMediaGroup(id: string) {
    let url = 'api/mediaGroups/' + id;
    return this.http.delete(url);
  }

  public getIncident(id: number): Observable<Incident> {
    let mGroupId = this.commonSrv.createGroupId();
    let url = 'api/incidents/' + id + '?mgroupid=' + mGroupId;
    return this.http.get<Incident>(url);
  }

  public getCustomFields() {
    return this.http.get('api/incidents/customFields')
  }

  public getAllIncidents(search: string): Observable<Incident[]> {
    let url = 'api/incidents';
    return this.http.get<Incident[]>(url);
  }

  public createExport(id: string, exports: Export): Observable<Export> {
    let url = 'api/exports/create/' + id;
    return this.http.post<Export>(url, exports);
  }

  public getAllExports(): Observable<Export[]> {
    let url = 'api/exports';
    return this.http.get<Export[]>(url);
  }

  public getExportById(id: string): Observable<Export> {
    let url = 'api/exports/' + id;
    return this.http.get<Export>(url);
  }

  public deleteExportById(id: string) {
    let url = 'api/exports/' + id + '/delete';
    return this.http.post(url, '');
  }
}
