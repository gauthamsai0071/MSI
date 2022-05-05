import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { IncidentService } from '../../../../../services/incident/incident.service';
import { SavedFilter, IncidentFilter, SaveNewFilter } from '../../../../../../app/models/incident/savedFilter';


@Component({
  selector: 'app-incident-saved-filters',
  templateUrl: './saved-filters.component.html',
  styleUrls: ['./saved-filters.component.scss']
})
export class IncidentSavedFiltersComponent implements OnInit {
  @Input()
  set newFilter(value) {
    if (value) {
      this.incidentService.saveIncident(value).subscribe(result => {
      });
    }
  }
  @Output()
  clickedSavedFilter: EventEmitter<IncidentFilter>;
  savedIncidentFilters: SavedFilter[] = [];
  saveNewfilter: SaveNewFilter;
  constructor(private incidentService: IncidentService) {
    this.clickedSavedFilter = new EventEmitter();
    this.saveNewfilter = new SaveNewFilter();
  }

  ngOnInit(): void {
    this.getSavedIncidentFilters();
  }
  onSavedSearchClick(filter) {
    this.clickedSavedFilter.emit(filter.filter);
  }
  onDeleteButtonClick(name) {

  }
  getSavedIncidentFilters() {
    this.incidentService.getSavedIncidents().subscribe((result: SavedFilter[]) => {
      this.savedIncidentFilters = result;
    })
  }

}
