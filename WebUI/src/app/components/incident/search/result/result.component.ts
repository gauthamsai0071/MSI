import { Component, Input } from '@angular/core';
import _, { result, toLower } from 'lodash';
import moment from 'moment';
import { Incident } from '../../../../models/incident/incident';
import { DialogService } from '../../../../services/common/dialog.service';
import { IncidentSearchService } from '../../../../services/incident/search.service';
import { AddIncidentComponent } from '../../add/add-incident.component';
import { ManageIncidentComponent } from '../../manage/manage-incident.component';

@Component({
  selector: 'app-incident-search-result',
  templateUrl: './result.component.html',
  styleUrls: ['./result.component.scss']
})
export class IncidentSearchResultComponent {
  newIncidentId: number;

  private _filterCriteria: {
    owner: string, text: string, showCurrent: boolean, showDeleted: boolean,
    showShared: boolean, showExternal: boolean, showActiveExternal: boolean,
    searchFilters: { [key: string]: string }
  };

  @Input()
  set filterCriteria(value: {
    owner: string, text: string, showCurrent: boolean, showDeleted: boolean,
    showShared: boolean, showExternal: boolean, showActiveExternal: boolean,
    searchFilters: { [key: string]: string }
  }) {
    this.incidentSearchService.search(value.owner, value.text, value.showCurrent, value.showDeleted, value.showShared,
      value.showExternal, value.showActiveExternal, value.searchFilters).subscribe(response => {
        _.each(response, incident => {
          let field = incident.customFields.find(item => toLower(item.name) == toLower("title"));
          incident.title = (field && field.value) !== undefined ? field.value.text : '';

          field = incident.customFields.find(item => toLower(item.name) == toLower("referencecode"));
          incident.referenceCode = field !== undefined ? field.value.text : '';

          field = incident.customFields.find(item => toLower(item.name) == toLower("incidentTime"));
          incident.incidentTime = field !== undefined ? moment(field.value.timestamp).toDate() : null;
      });

        this.results = response;
      });
  }

  results: Incident[] = [];

  constructor(private incidentSearchService: IncidentSearchService,
              private dialogService: DialogService) {
  }
  
  addIncident(): void {
    this.dialogService.showDialog('Create Incident', AddIncidentComponent, 100, { id: 100 })
      .subscribe((result?: { incidentId?: number }) => {        
          this.newIncidentId = result ? result.incidentId : null;
      });
  }
}
