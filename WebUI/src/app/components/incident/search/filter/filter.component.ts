import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { DateTimeRange } from '@msi/cobalt';
import { IncidentSearchService } from '../../../../services/incident/search.service';
import { IDropdownSettings } from 'ng-multiselect-dropdown';
import { CustomField } from '../../../../models/common/custom-field';
import { forkJoin } from 'rxjs';
import { AuthService } from '../../../../services/auth/auth.service';
import { User } from '../../../../models/common/user';
import _ from 'lodash';
import { Incident } from '../../../../models/incident/incident';

@Component({
  selector: 'app-incident-filter',
  templateUrl: './filter.component.html',
  styleUrls: ['./filter.component.scss']
})
export class IncidentFilterComponent implements OnInit {
    @Output()
    searchIncidents: EventEmitter<{owner: string, text: string, showCurrent: boolean, showDeleted: boolean,
                            showShared: boolean, showExternal: boolean, showActiveExternal: boolean,
                            searchFilters: {[key: string]: string}}>;

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
        this.searchIncidents = new EventEmitter();
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

        this.searchIncidents.emit( { owner : this.filterCriteria.get('owner').value, 
                                     text: this.filterCriteria.get('text').value, 
                                     showCurrent: this.filterCriteria.get('showCurrent').value,
                                     showDeleted: this.filterCriteria.get('showDeleted').value, 
                                     showShared: this.filterCriteria.get('showShared').value,
                                     showExternal: this.filterCriteria.get('showExternal').value, 
                                     showActiveExternal: this.filterCriteria.get('showActiveExternal').value,
                                     searchFilters: searchFilters });
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