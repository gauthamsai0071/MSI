import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Incident } from '../../../app/models/incident/incident';
import { Export } from '../../models/incident/export/export';
import { ExportShare } from '../../models/incident/export/share';
import { CommonService } from '../common/common.service';
import { SavedFilter } from '../../models/incident/savedFilter';
import { ExportProfile } from '../../models/incident/export/exportProfile';
import { PermissionGroup } from '../../models/incident/permissionGroup';
import { shareReplay } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class IncidentService {

  constructor(private http: HttpClient, private commonSrv: CommonService) { }

  public getTemplate(id: string, videoIds: string): Observable<Incident> {
    let url = 'api/incidents/template?mgroupid=' + id + videoIds;
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

  public shareIncident(id: number, sharedUsers: {name: string}[], removedUsers: {name: string}[]) {
    let url = 'api/incidents/' + id + '/security'

    const data: { addSharedWith?: { name: string; }[]; removeSharedWith?: { name: string; }[]; } = {};

    if (sharedUsers.length > 0) {
      data.addSharedWith = sharedUsers;
    }

    if (removedUsers.length > 0) {
      data.removeSharedWith = removedUsers;
    }

    return this.http.post(url, data);
  }
  public getShareIncident(id: number):any {
    let mGroupId = this.commonSrv.createGroupId();
    let url = 'api/incidents/' + id + '?mgroupid=' + mGroupId;
    return this.http.get(url);
  }

  public deleteIncident(id: number) {
    let url = 'api/incidents/' + id + '/delete';
    return this.http.post(url, { "deleteFieldValues": [] });
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

  public getExportTemplate(id: number, mGroupId: string): Observable<Export> {
    let url = 'api/exports/template?incidentId=' + id + '&mgroupId=' + mGroupId;
    return this.http.get<Export>(url);
  }

  public createExport(id: number, exportProfile: ExportProfile): Observable<ExportProfile> {
    let url = 'api/exports/create/' + id;
    return this.http.post<ExportProfile>(url, exportProfile);
  }

  public getExportByTemplateId(id: string): Observable<Export> {
    let mGroupId = this.commonSrv.createGroupId();
    let url = 'api/exports/template?incidentId=' + id + '&mgroupId=' + mGroupId;
    return this.http.get<Export>(url);
  }

  public getAllExports(): Observable<Export[]> {
    let url = 'api/exports';
    return this.http.get<Export[]>(url);
  }

  public getExportById(id: number): Observable<Export> {
    let url = 'api/exports/' + id;
    return this.http.get<Export>(url);
  }

  public getExportShareUrlById(id: string, title: string): Observable<ExportShare> {
    let url = 'api/exports/' + id + '/accessUrls/template?title=' + title;
    return this.http.get<ExportShare>(url);
  }

  public createExportShareUrlById(id: string, exportShare: ExportShare): Observable<ExportShare> {
    let url = 'api/exports/' + id + '/accessUrls';
    return this.http.post<ExportShare>(url, exportShare);
  }

  public deleteExportById(id: number) {
    let url = 'api/exports/' + id + '/delete';
    return this.http.post(url, null);
  }

  public downloadExportById(id: number) {
    let url = 'api/exports/' + id + '/download';
    return this.http.get(url, {responseType:'blob'});
  }

  public saveIncident(data: any): Observable<any> {
    let url = 'api/incidents/savedSearch';
    return this.http.post(url, data);
  }

  public getSavedIncidents(): Observable<SavedFilter[]> {
    let url = 'api/incidents/savedSearch/categorised';
    return this.http.get<SavedFilter[]>(url);
  }

  public getAllPermissionGroups(): Observable<PermissionGroup[]>{
    let url = 'api/incidents/savedSearch/permissionGroups';
    return this.http.get<PermissionGroup[]>(url).pipe(shareReplay(1));
  }
}
