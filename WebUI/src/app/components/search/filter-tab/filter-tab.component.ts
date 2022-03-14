import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { DateTimeRange } from '@msi/cobalt';
import { CustomFiltersService } from 'src/app/services/customFilters/custom-filters.service';
import { IDropdownSettings } from 'ng-multiselect-dropdown';
import _ from 'lodash';

@Component({
  selector: 'app-filter-tab',
  templateUrl: './filter-tab.component.html',
  styleUrls: ['./filter-tab.component.scss']
})
export class FilterTabComponent implements OnInit {
  filterCriteria : FormGroup ;
  customFields :any = null;
  searchFields :any = [];
  queryParams:any = [];
  captureDateModel: DateTimeRange= new DateTimeRange();
  dropdownSettings:IDropdownSettings = {};
  constructor(
    private customFilters : CustomFiltersService,
    private formBuilder: FormBuilder,
  ) { }

  ngOnInit(): void {
    this.customFilters.getCustomFields().subscribe((result: any) =>{
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
    console.log(this.searchFields);
  }

  onSubmit(){
    this.queryParams = [];
    _.each(this.searchFields, element =>{
      if(this.filterCriteria.get(element.name)?.value){
        this.queryParams.push({id : element.id,value :  this.filterCriteria.get(element.name)?.value  })
      }
    })
    console.log(this.queryParams);
  }
  buildSearchForm(){
    this.filterCriteria = new FormGroup({});
    for(let i=0; i<this.searchFields.length; i++){
      this.filterCriteria.addControl(this.searchFields[i].name, new FormControl())
    }
  }
  clearForm(){
    console.log('clear form');
  }
}
