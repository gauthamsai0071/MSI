import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import _ from 'lodash';
import { Observable } from 'rxjs';
import { CustomField } from '../../models/common/custom-field';
import { User } from '../../models/common/user';
import { Incident } from '../../models/incident/incident';

@Injectable({
  providedIn: 'root'
})
export class IncidentSearchService {
  constructor(private http: HttpClient) { }

  getCustomFields(): Observable<CustomField[]> {
    return this.http.get<CustomField[]>('api/incidents/customFields');
  }

  getOwners(): Observable<User[]> {
    return this.http.get<User[]>('/api/users/names/all');
  }

  search(owner: string, text: string, showCurrent: boolean, showDeleted: boolean,
         showShared: boolean, showExternal: boolean, showActiveExternal: boolean,
         searchFilters: {[key: string]: string}): Observable<Incident[]> {
    let customFilters = '';

    for(const key in searchFilters) {
      if (customFilters !== '') {
        customFilters += '&';
      }

      customFilters += `custom.${key}=${searchFilters[key]}`
    };

    return this.http.get<Incident[]>(`/api/incidents?` + (owner !== undefined &&  owner !== null && owner !== '' ? `owner=${owner}` : '') +
          (text !== undefined &&  text !== null && text !== '' ? `text=${text}` : '') +
          `&onlySharedIncidents=${showShared}&onlyExternalLinks=${showExternal}` +
          `&onlyActiveExternalLinks=${showActiveExternal}&includeLive=${showCurrent}&includeDeleted=${showDeleted}` +
          `&siteIncidents=true&limit=2001&${customFilters}`)
  }
}