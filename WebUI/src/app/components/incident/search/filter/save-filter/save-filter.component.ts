import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { IncidentService } from 'src/app/services/incident/incident.service';
import { SaveNewFilter } from '../../../../../models/incident/savedFilter';

@Component({
  selector: 'app-save-filter',
  templateUrl: './save-filter.component.html',
  styleUrls: ['./save-filter.component.scss']
})
export class SaveFilterComponent implements OnInit {

  @Input()
  popupParam : {
    owner: string, text: string, showCurrent: boolean, showDeleted: boolean,
    showShared: boolean, showExternal: boolean, showActiveExternal: boolean,
    searchFilters: { [key: string]: string }
  }

  @Output()
  popupResult: EventEmitter<any>;

  saveFilterForm : FormGroup = null;
  saveNewFilter : SaveNewFilter;
  formResetting :boolean = true;
  constructor(
    private formBuilder: FormBuilder,
    private incidentService: IncidentService) 
  {
    this.saveNewFilter = new SaveNewFilter();
  }

  ngOnInit(): void {
    this.buildSaveFilterForm();
    this.saveFilterForm.get('permissionGroup').setValue(0);
  }

  onSubmit(){
    this.formResetting = false;
    if (this.saveFilterForm.invalid) {
      return;
    }
    this.saveNewFilter.name = this.saveFilterForm.get('searchName').value;
    this.saveNewFilter.category = this.saveFilterForm.get('category').value;
    this.saveNewFilter.permissionGroup = this.getPermissionGroupDetails(this.saveFilterForm.get('permissionGroup').value);
    //TODO
    // this.saveNewFilter.filter.supervised =  
    // this.saveNewFilter.filter.recentlyEdited = 
    // this.saveNewFilter.filter.onlySharedIncidents = 
    this.saveNewFilter.filter.shared = this.popupParam.showShared;
    this.saveNewFilter.filter.includeLive = this.popupParam.showCurrent;
    this.saveNewFilter.filter.includeDeleted = this.popupParam.showDeleted;
    this.saveNewFilter.filter.onlyExternalLinks = this.popupParam.showExternal;
    this.saveNewFilter.filter.onlyActiveExternalLinks = this.popupParam.showActiveExternal;
    this.saveNewFilter.filter.text = this.popupParam.text;
    for (const key in this.popupParam.searchFilters){
        this.saveNewFilter.filter.customValues.push({id : Number(key), value : this.popupParam.searchFilters[key]})
    }
    this.incidentService.saveIncident(this.saveNewFilter).subscribe(result => {
      if(result){
        this.popupResult.emit(result);
      }
    });
  }
  onCancel(){
    this.popupResult.emit(null);
  }

  buildSaveFilterForm(){
    this.saveFilterForm = this.formBuilder.group({
      searchName: ['', Validators.required],
      category : [''],
      permissionGroup : [''],
    } );
  }

  get formControls() { return this.saveFilterForm.controls; }

  getPermissionGroupDetails(value : number){
    let permissionGroup : {id : number, name :string } = {id : -1, name : ''};
    switch(value){
      case 0 : 
        permissionGroup.id = 0;
        permissionGroup.name = "Default";
        break;
      case 1 : 
        permissionGroup.id = 1;
        permissionGroup.name = "Access Group One";
        break;
      case 2 : 
        permissionGroup.id = 2;
        permissionGroup.name = "Access Group Two";
        break;
      case 3 : 
        permissionGroup.id = 3;
        permissionGroup.name = "Access Group Three";
        break;
      case 4 : 
        permissionGroup.id = 4;
        permissionGroup.name = "Access Group Four";
        break;
      case 5 : 
        permissionGroup.id = 5;
        permissionGroup.name = "Access Group Five";
        break;
        case 6 : 
        permissionGroup.id = 6;
        permissionGroup.name = "Access Group Six";
        break;
        case 7 : 
        permissionGroup.id = 7;
        permissionGroup.name = "Access Group Seven";
        break;
        case 8 : 
        permissionGroup.id = 8;
        permissionGroup.name = "Access Group Eight";
        break;
        case 9 : 
        permissionGroup.id = 9;
        permissionGroup.name = "Access Group Nine";
        break;
        case 10 : 
        permissionGroup.id = 10;
        permissionGroup.name = "Access Group Ten";
        break;
        case 11 : 
        permissionGroup.id = 11;
        permissionGroup.name = "Access Group Eleven";
        break;
        case 12 : 
        permissionGroup.id = 12;
        permissionGroup.name = "Access Group Twelve";
        break;
        case 13 : 
        permissionGroup.id = 13;
        permissionGroup.name = "Access Group Thirteen";
        break;
        case 14 : 
        permissionGroup.id = 14;
        permissionGroup.name = "Access Group Fourteen";
        break;
        case 15 : 
        permissionGroup.id = 15;
        permissionGroup.name = "Access Group Fifteen";
        break;
        case 16 : 
        permissionGroup.id = 16;
        permissionGroup.name = "Access Group Sixteen";
        break;
        case 17 : 
        permissionGroup.id = 17;
        permissionGroup.name = "Access Group Seventeen";
        break;
        case 18 : 
        permissionGroup.id = 18;
        permissionGroup.name = "Access Group Eighteen";
        break;
        case 19 : 
        permissionGroup.id = 19;
        permissionGroup.name = "Access Group Nineteen";
        break;
        case 20 : 
        permissionGroup.id = 20;
        permissionGroup.name = "Access Group Twenty";
        break;   
    }
    return permissionGroup;
  }
}