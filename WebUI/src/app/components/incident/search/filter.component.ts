import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { DateTimeRange } from '@msi/cobalt';
import { IncidentSearchService } from '../../../services/incident/search.service';
import { IDropdownSettings } from 'ng-multiselect-dropdown';
import { CustomField } from '../../../models/common/custom-field';
import { forkJoin } from 'rxjs';
import { AuthService } from '../../../services/auth/auth.service';
import { User } from '../../../models/common/user';
import _ from 'lodash';
import { Incident } from '../../../models/incident/incident';

@Component({
  selector: 'app-incident-filter',
  templateUrl: './filter.component.html',
  styleUrls: ['./filter.component.scss']
})
export class IncidentFilterComponent implements OnInit {
    filterCriteria : FormGroup = null;
    searchFields: CustomField[] = [];
    dropdownSettings:IDropdownSettings = {};
    dateModel: DateTimeRange= new DateTimeRange();
    loginUser: User = null;
    owners: User[] = [];
    incidents: Incident[] = [];

    constructor(private formBuilder: FormBuilder,
                private authService: AuthService,
                private incidentSearchService: IncidentSearchService) {

    }

    ngOnInit(): void {
        forkJoin([
            this.authService.getLoggedInUser(),
            this.incidentSearchService.getOwners(),
            this.incidentSearchService.getCustomFields()
        ]).subscribe(([responseLoginUser, responseOwners, responseCustomFields]) => {
            this.loginUser = responseLoginUser;       
            this.owners = responseOwners;
            
            _.each(responseCustomFields, field => {
                if(field.showSearchField) {
                    this.searchFields.push(field);
                }
            });

            this.buildSearchForm();
        });    
    }

    search(): void {
        const searchFilters: {[key: number]: string} = {};

        _.each(this.searchFields, field => {
            if (this.filterCriteria.get(field.name).value !== undefined && 
                    this.filterCriteria.get(field.name).value !== null &&
                    this.filterCriteria.get(field.name).value !== '') {
                searchFilters[field.id] = this.filterCriteria.get(field.name).value;
            }            
        });

        this.incidentSearchService.search(this.filterCriteria.get('owner').value, 
            this.filterCriteria.get('text').value, this.filterCriteria.get('showCurrent').value,
            this.filterCriteria.get('showDeleted').value, this.filterCriteria.get('showShared').value,
            this.filterCriteria.get('showExternal').value, this.filterCriteria.get('showActiveExternal').value,
            searchFilters).subscribe(response => {
            this.incidents = response;
        });
    }

    buildSearchForm(): void {
        this.filterCriteria = this.formBuilder.group({
            owner: [''],
            text: [''],
            showCurrent: [true],
            showDeleted: [false],
            showShared: [false],
            showExternal: [false],
            showActiveExternal: [false]           
        });
                
        _.each(this.searchFields, field => {
            this.filterCriteria.addControl(field.name, new FormControl());
        });    
    }
}