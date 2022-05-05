import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { IncidentFilter, SavedFilter } from '../../../models/incident/savedFilter';

@Component({
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss']
})
export class IncidentSearchComponent {
  filterCriteria: {
    owner: string, text: string, showCurrent: boolean, showDeleted: boolean,
    showShared: boolean, showExternal: boolean, showActiveExternal: boolean,
    searchFilters: { [key: string]: string }
  } = null;

  clickedSavedFilterCriteria: IncidentFilter = null;
  newFilterSaved : SavedFilter = null;;
  myExports: boolean = false;
  constructor(private router: Router) { }

  navigateTab(url: string): void {
    this.router.navigateByUrl(url);
  }

  tabChanged(event): void {
    const x = event;
  }

  searchIncidents(criteria: {
    owner: string, text: string, showCurrent: boolean, showDeleted: boolean,
    showShared: boolean, showExternal: boolean, showActiveExternal: boolean,
    searchFilters: { [key: string]: string }
  }) {
    this.filterCriteria = criteria;
  }

  clickedSavedFilter(filter: IncidentFilter) {
    this.clickedSavedFilterCriteria = filter;
  }

  saveNewFilter(savedFilter :SavedFilter ){
    this.newFilterSaved = savedFilter;
  }

  exportResults($event) {
    if ($event.target.className.includes("msi-tab-label-2 active")) {
      this.myExports = true;
    }
    else {
      this.myExports = false;
    }
  }
}