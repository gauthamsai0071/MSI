import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { DateTimeRange } from '@msi/cobalt';
import { MediaFilterService } from '../../../../services/media/media-filter.service';
import { IDropdownSettings } from 'ng-multiselect-dropdown';
import _ from 'lodash';
import { CustomField } from '../../../../models/common/custom-field';

@Component({
  selector: 'app-media-filter',
  templateUrl: './filter.component.html',
  styleUrls: ['./filter.component.scss']
})

export class MediaFilterComponent implements OnInit {
  @Output()
  searchMedia : EventEmitter<{
    filterCriteria : FormGroup,
    calendarFields : Map<number, string>,
    checkBoxFields : Map<string, Array<string>>,
    searchFields : CustomField[],
  }>;
  
  filterCriteria : FormGroup = null;
  customFields :CustomField[] = null;
  searchFields: CustomField[] = [];
  public checkBoxFields = new Map();
  public calendarFields = new Map();
  captureDateModel: DateTimeRange = new DateTimeRange();
  dropdownSettings:IDropdownSettings = {};
  constructor(
    private mediaFilterService : MediaFilterService
  ) { 
    this.searchMedia = new EventEmitter();
  }

  ngOnInit(): void {
    this.mediaFilterService.getCustomFields().subscribe((result: CustomField[]) =>{
      this.customFields = result;
      this.getAllSearchFields();
      this.buildSearchForm();
    });
  }

  getAllSearchFields(){
    for(let i =0; i<this.customFields.length; i++){
      if(this.customFields[i].showSearchField == true){
        this.searchFields.push(this.customFields[i]);
      }
    }
  }

  onSubmit(){
    this.searchMedia.emit({
      filterCriteria : this.filterCriteria,
      calendarFields : this.calendarFields,
      checkBoxFields : this.checkBoxFields,
      searchFields : this.searchFields,
    })
  }

  clickCheckbox(event:any, value, name){
    if(event){
      if(!this.checkBoxFields.has(name)){
        let valueArr = new Array();
        this.checkBoxFields.set(name,  valueArr);
      }
      this.checkBoxFields.get(name).push(value);
    }else{
      const index = this.checkBoxFields?.get(name)?.indexOf(value);
      this.checkBoxFields?.get(name)?.splice(index, 1);
    }
  }
  
  buildSearchForm(){
    this.filterCriteria = new FormGroup({});
    for(let i=0; i<this.searchFields.length; i++){
      this.filterCriteria.addControl(this.searchFields[i].name, new FormControl())
    }
    this.filterCriteria.addControl('pani', new FormControl());
    this.filterCriteria.addControl('latLong', new FormControl());
    this.filterCriteria.addControl('radius', new FormControl());
  }

  clearForm(){
    this.calendarFields.clear();
    this.checkBoxFields.clear();
    this.filterCriteria.reset();
    this.searchMedia.emit({
      filterCriteria : this.filterCriteria,
      calendarFields : this.calendarFields,
      checkBoxFields : this.checkBoxFields,
      searchFields : this.searchFields,
    })
  }

  updateCaptureDateRange(dateTimeRange: DateTimeRange, customFieldName){
    this.captureDateModel = dateTimeRange;
    let value = '';
    _.each(this.searchFields, cf =>{
      if(cf.name == customFieldName){
        value = this.captureDateModel.startMoment().format("X")+"000" + "-" + this.captureDateModel.endMoment().format("X")+"000"; 
        this.calendarFields.set(cf.id, value);
      }
    })
  }
}