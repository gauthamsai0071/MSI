import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss']
})
export class IncidentSearchComponent {
  filterCriteria: { owner: string, text: string, showCurrent: boolean, showDeleted: boolean,
                    showShared: boolean, showExternal: boolean, showActiveExternal: boolean,
                    searchFilters: {[key: string]: string} } = null;

  constructor(private router: Router) { }

  navigateTab(url: string): void {
    this.router.navigateByUrl(url);
  }

  tabChanged(event): void {
    const x = event;
  }

  searchIncidents(criteria: { owner: string, text: string, showCurrent: boolean, showDeleted: boolean,
    showShared: boolean, showExternal: boolean, showActiveExternal: boolean,
    searchFilters: {[key: string]: string}}) {
    this.filterCriteria = criteria;
  }
}