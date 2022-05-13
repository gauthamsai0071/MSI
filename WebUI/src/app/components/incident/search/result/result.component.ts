import { Component, EventEmitter, Input, Output } from '@angular/core';
import _, { toLower } from 'lodash';
import moment from 'moment';
import { Incident } from '../../../../models/incident/incident';
import { DialogService } from '../../../../services/common/dialog.service';
import { IncidentSearchService } from '../../../../services/incident/search.service';
import { ExportIncidentComponent } from '../../export/export-incident.component';
import { ManageIncidentComponent } from '../../manage/manage-incident.component';
import { shareIncidentComponent } from '../../share/share-incident.component';

@Component({
  selector: 'app-incident-search-result',
  templateUrl: './result.component.html',
  styleUrls: ['./result.component.scss']
})
export class IncidentSearchResultComponent {

  @Input()
  popupParam: { mode: string, id: number, rows: [] };

  @Output()
  popupResult: EventEmitter<any>;

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
    this._filterCriteria = value;
    this.incidentSearchService.search(value.owner, value.text, value.showCurrent, value.showDeleted, value.showShared,
      value.showExternal, value.showActiveExternal, value.searchFilters).subscribe(response => {
        _.each(response, incident => {
          let field = incident.customFields.find(item => toLower(item.name) == toLower("title"));
          incident.title = (field && field.value) !== undefined ? field.value.text : '';

          field = incident.customFields.find(item => toLower(item.name) == toLower("reference-code"));
          incident.referenceCode = (field && field.value) !== undefined ? field.value.text : '';

          field = incident.customFields.find(item => toLower(item.name) == toLower("incident-time"));

          incident.incidentTime = (field && field.value) !== undefined ? moment(field.value.timestamp).toDate() : null;
        });
        this.results = response;
      });
  }

  results: Incident[] = [];

  constructor(private incidentSearchService: IncidentSearchService,
    private dialogService: DialogService) {
  }

  manageIncident(mode: string, id?: number, switchNumber?: number): void {
    let componentName;
    //1===export 2===share 3==delete 0==restAll
    switch (switchNumber) {
      case (1):
        componentName = ExportIncidentComponent
        break
      case (2):
        componentName = shareIncidentComponent
        break
      case (3):
        componentName = IncidentSearchResultComponent
        break
      default:
        componentName = ManageIncidentComponent
    }
    const title = mode.charAt(0).toUpperCase() + mode.slice(1);
    this.dialogService.showDialog(title + ' Incident', componentName, id, { mode: mode, id: id })
      .subscribe(result => {
        this.filterCriteria = {
          owner: this._filterCriteria.owner,
          text: this._filterCriteria.text,
          showCurrent: this._filterCriteria.showCurrent,
          showDeleted: this._filterCriteria.showDeleted,
          showShared: this._filterCriteria.showShared,
          showExternal: this._filterCriteria.showExternal,
          showActiveExternal: this._filterCriteria.showActiveExternal,
          searchFilters: this._filterCriteria.searchFilters
        }
      });
  }

  close(): void {
    if (!this.popupResult.isStopped && this.popupResult.observers !== null) {
      this.popupResult.emit({
        filterCriteria: this._filterCriteria
      });
    }
  }

  cancel(): void {
    this.popupResult.emit(null);
  }
}
