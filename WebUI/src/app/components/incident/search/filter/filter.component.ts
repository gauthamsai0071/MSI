import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { DateTimeRange } from '@msi/cobalt';
import { IncidentSearchService } from '../../../../services/incident/search.service';
import { IDropdownSettings } from 'ng-multiselect-dropdown';
import { CustomField } from '../../../../models/common/custom-field';
import { forkJoin, Observable } from 'rxjs';
import { AuthService } from '../../../../services/auth/auth.service';
import { User } from '../../../../models/common/user';
import _ from 'lodash';
import { Incident } from '../../../../models/incident/incident';
import { IncidentFilter, SavedFilter } from '../../../../models/incident/savedFilter';
import { NgbDate } from '@ng-bootstrap/ng-bootstrap';
import { startWith,map } from 'rxjs/operators';
import { DialogService } from '../../../../services/common/dialog.service';
import { SaveFilterComponent } from './save-filter/save-filter.component';
import { IncidentService } from '../../../../services/incident/incident.service';

@Component({
  selector: 'app-incident-filter',
  templateUrl: './filter.component.html',
  styleUrls: ['./filter.component.scss']
})
export class IncidentFilterComponent implements OnInit { 
    @Input()
    set clickedSavedFilterCriteria(value : IncidentFilter){
        if(value){
            this.filterCriteria.reset();
            _.each(this.searchFields, sf => {
                _.find(value.customValues, cf=>{
                    if(cf.id == sf.id){
                        if(sf.isTimestamp){
                            let date = cf.value.split('-').slice();
                            let startDate = new Date(parseInt(date[0]));
                            let endDate = new Date(parseInt(date[1]));
                            this.dateModel = new DateTimeRange({
                                startDate: new NgbDate(startDate.getUTCFullYear(), startDate.getUTCMonth() + 1, startDate.getUTCDate()),
                                startTime: { hour: startDate.getHours(), minute: startDate.getMinutes(), second: 0 },
                                endDate: new NgbDate(endDate.getUTCFullYear(), endDate.getUTCMonth() + 1, endDate.getUTCDate()),
                                endTime: { hour: endDate.getHours(), minute: endDate.getMinutes(), second: 0 },
                            });                      
                        }else{
                            this.filterCriteria.controls[sf.name].setValue(cf.value);
                        }
                    }
                })
            })
            this.filterCriteria.controls['text'].setValue(value.text);
            this.filterCriteria.controls['showCurrent'].setValue(value.includeLive);
            this.filterCriteria.controls['showDeleted'].setValue(value.includeDeleted);
            this.filterCriteria.controls['showShared'].setValue(value.onlySharedIncidents);
            this.filterCriteria.controls['showExternal'].setValue(value.onlyExternalLinks);
            this.filterCriteria.controls['showActiveExternal'].setValue(value.onlyActiveExternalLinks);
        }
    }
    @Output()
    searchIncidents: EventEmitter<{owner: string, text: string, showCurrent: boolean, showDeleted: boolean,
                            showShared: boolean, showExternal: boolean, showActiveExternal: boolean,
                            searchFilters: {[key: string]: string}}>;
    @Output()
    saveFilter : EventEmitter<SavedFilter>;

    filterCriteria : FormGroup = null;
    searchFields: CustomField[] = [];
    dropdownSettings:IDropdownSettings = {};
    dateModel: DateTimeRange= new DateTimeRange();
    loginUser: User = null;
    owners: User[] = [];
    public filteredOwners  = new Observable<User[]>();
    incidents: Incident[] = [];
    calendarFields = new Map();
    checkBoxFields = new Map();

    constructor(private formBuilder: FormBuilder,
                private authService: AuthService,
                private incidentSearchService: IncidentSearchService,
                private incidentService: IncidentService,
                private dialogService: DialogService) {
        this.searchIncidents = new EventEmitter();
        this.saveFilter = new EventEmitter();
    }

    ngOnInit(): void {
        forkJoin([
            this.authService.getCurrentState(),
            this.incidentSearchService.getOwners(),
            this.incidentSearchService.getCustomFields()
        ]).subscribe(([responseCurrentState, responseOwners, responseCustomFields]) => {
            this.loginUser = responseCurrentState.user;       
            this.owners = responseOwners;

            _.each(responseCustomFields, field => {
                if(field.showSearchField) {
                    this.searchFields.push(field);
                }
            });

            this.buildSearchForm();

            this.filteredOwners = this.filterCriteria.get('owner').valueChanges.pipe(
                startWith(''),
                map((value) =>{
                  return  value ? this._filterOwnerOptions(value) : this.owners.slice();
                })
            )

            // this.incidentService.shareIncident(17523, {"addSharedWith":[{"name":"admin"}]} ).subscribe(response => {
            //     console.log(response);
            // })
        });          
    }
    private _filterOwnerOptions(filterValue: string): User[] {
        return this.owners.filter((opt) =>
          opt.name.toLowerCase().includes(filterValue.toLowerCase()),
        );
    }

    search(): void {
        const searchFilters: {[key: number]: string} = {};
        this.getFormValue(searchFilters);
        this.searchIncidents.emit( { owner : this.filterCriteria.get('owner').value, 
                                     text: this.filterCriteria.get('text').value, 
                                     showCurrent: this.filterCriteria.get('showCurrent').value,
                                     showDeleted: this.filterCriteria.get('showDeleted').value, 
                                     showShared: this.filterCriteria.get('showShared').value,
                                     showExternal: this.filterCriteria.get('showExternal').value, 
                                     showActiveExternal: this.filterCriteria.get('showActiveExternal').value,
                                     searchFilters: searchFilters });
    }

    getFormValue(searchFilters: {[key: number]: string}){
        _.each(this.searchFields, field => {
            if (this.filterCriteria.get(field.name).value !== undefined && 
                    this.filterCriteria.get(field.name).value !== null &&
                    this.filterCriteria.get(field.name).value !== '') {
                    searchFilters[field.id] = this.filterCriteria.get(field.name).value;
            }else if (field.isTimestamp){
                if(this.calendarFields.get(field.id)){
                    searchFilters[field.id] = this.calendarFields.get(field.id);
                }
            }            
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

    updateSelectedDate(dateTimeRange: DateTimeRange,  calendarFieldId){
        let value = dateTimeRange.startMoment().format("X")+"000" + "-" + dateTimeRange.endMoment().format("X")+"000"; 
        this.calendarFields.set(calendarFieldId, value);
    }

    clearfilters(){
       // this.filterCriteria.get('showCurrent').setValue(true);
    }

    onCheckboxClick(event, value, name,  id){
        if(event){
            if(!this.checkBoxFields.has(name)){
                let valueArr = new Array();
                this.checkBoxFields.set(name,  valueArr);
            }
            this.checkBoxFields.get(name).push(value);
            }
        else{
            const index = this.checkBoxFields?.get(name)?.indexOf(value);
            this.checkBoxFields?.get(name)?.splice(index, 1);
        }
    } 

    openSaveSearchPopUp() {
        const searchFilters: {[key: number]: string} = {};
        this.getFormValue(searchFilters);
        this.dialogService.showDialog('Save Incident Search',SaveFilterComponent, 0,
            { owner : this.filterCriteria.get('owner').value, 
            text: this.filterCriteria.get('text').value, 
            showCurrent: this.filterCriteria.get('showCurrent').value,
            showDeleted: this.filterCriteria.get('showDeleted').value, 
            showShared: this.filterCriteria.get('showShared').value,
            showExternal: this.filterCriteria.get('showExternal').value, 
            showActiveExternal: this.filterCriteria.get('showActiveExternal').value,
            searchFilters: searchFilters }).subscribe(result => {
                this.saveFilter.emit(result);
            });
    }

    setCurrentOwner(){
        this.filterCriteria.get('owner').setValue(this.loginUser.name);
    } 
}