import { Component, OnInit, Output, EventEmitter} from '@angular/core';
import { IncidentService } from '../../../../../services/incident/incident.service';
import { SavedFilter, IncidentFilter } from '../../../../../../app/models/incident/savedFilter';


@Component({
  selector: 'app-incident-saved-filters',
  templateUrl: './saved-filters.component.html',
  styleUrls: ['./saved-filters.component.scss']
})
export class IncidentSavedFiltersComponent implements OnInit {
  @Output()
  clickedSavedFilter: EventEmitter<IncidentFilter>;
  savedIncidentFilters : SavedFilter[] = [];
  constructor(private incidentSearvice : IncidentService) {
    this.clickedSavedFilter = new EventEmitter();
  }

  ngOnInit(): void {
    this.getSavedIncidentFilters();
  }
  onSavedSearchClick(filter){
    this.clickedSavedFilter.emit(filter.filter);
  }
  onDeleteButtonClick(name){
  
  }
  getSavedIncidentFilters(){
    this.incidentSearvice.getSavedIncidents().subscribe((result : SavedFilter[])  => {
      this.savedIncidentFilters = result;
    })
  }

}
