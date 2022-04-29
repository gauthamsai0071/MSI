import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { DateTimeRange } from '@msi/cobalt';
import { MediaFilterService } from '../../../../services/media/media-filter.service';
import { IDropdownSettings } from 'ng-multiselect-dropdown';
import _ from 'lodash';
import { FeedManager } from '../../../../models/feed/feed-manager';
import { ApiUrls } from '../../../../../app/util/api-urls';
import { MediaGroupManager } from '../../../../../app/models/feed/media-group-manager';
import { StateAdto, VideoFilesSubscriptionAdto } from '../../../../../app/interfaces/adto';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../../../../app/services/auth/auth.service';
import { Feedsubscription } from '../../../../models/feed/feed-subscription';
import { CustomField } from '../../../../models/common/custom-field';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-media-filter',
  templateUrl: './filter.component.html',
  styleUrls: ['./filter.component.scss']
})

export class MediaFilterComponent implements OnInit {
  filterCriteria : FormGroup = null;
  customFields :CustomField[] = null;
  advancedFilter : string = '';
  private location : { lat : number, lng: number};
  private radius : null;
  searchFields: CustomField[] = [];
  queryParams:any = [];
  public checkBoxFields = new Map();
  public calendarFields = new Map();
  captureDateModel: DateTimeRange = new DateTimeRange();
  dropdownSettings:IDropdownSettings = {};
  public feed: FeedManager;
  public apiUrls :ApiUrls;
  public mgroup : MediaGroupManager;
  public state : StateAdto;
  searchResult : any;
  offset = "61";
  id = "5885";
  url:string;
  constructor(
    private mediaFilters : MediaFilterService,
    private formBuilder: FormBuilder,
    private http : HttpClient,
    private authService: AuthService,
    private mediaFilterService : MediaFilterService
  ) { 
    this.feed = new FeedManager(this.apiUrls,this.mgroup,this.state,this.http);
    this.apiUrls = new ApiUrls();
  }

  ngOnInit(): void {
    this.mediaFilters.getCustomFields().subscribe((result: CustomField[]) =>{
      this.customFields = result;
      this.getAllSearchFields();
      this.buildSearchForm();
    });
    this.viewSubscription();
  }

  getAllSearchFields(){
    for(let i =0; i<this.customFields.length; i++){
      if(this.customFields[i].showSearchField == true){
        this.searchFields.push(this.customFields[i]);
      }
    }
  }

  onSubmit(){
    this.queryParams = [];
    this.advancedFilter = '';
    let advanceQuery = '';
    _.each(this.searchFields, cf =>{
      let value = this.filterCriteria.get(cf.name)?.value;
      if(cf.name == 'system'){
        if(value == 'astro'){
          this.mediaFilterService.notifysystemSelected('astro');
        }else if(value == 'broadband'){
          this.mediaFilterService.notifysystemSelected('broadband');
        }else{
          this.mediaFilterService.notifysystemSelected('default');
        }
        if(value){
          this.queryParams.push({id : cf.id,value :  value})
        }
      }
      if(cf.isTimestamp){
        if(this.calendarFields.get(cf.id)){
          this.queryParams.push({id: cf.id, value: this.calendarFields.get(cf.id)});
        }
      }
      if(this.filterCriteria.get(cf.name)?.value){
        if(cf.isText){
          value = this.filterCriteria.get(cf.name)?.value;
          this.queryParams.push({id : cf.id,value :  value})
        }else if(cf.isEnumeration){
          value = this.filterCriteria.get(cf.name)?.value;
          if(Array.isArray(value) && value.length > 0){
            if(advanceQuery.length > 1){
              advanceQuery = advanceQuery + " AND ";
            }
            _.each(value, val=>{
              if(val != value[value.length-1]){
                advanceQuery = advanceQuery + cf.name + " = '" + val + "' OR ";
              }else{
                advanceQuery = advanceQuery + cf.name + " = '" +val + "'";
              }
            })
            this.advancedFilter = advanceQuery;
          }
          else if(cf.displayName.includes(',checkbox,')){
            if(advanceQuery.length > 1){
              advanceQuery = advanceQuery + " AND ";
            }
            _.each(this.checkBoxFields.get(cf.name), val => {
              if(val != this.checkBoxFields.get(cf.name)[this.checkBoxFields.get(cf.name).length-1]){
                advanceQuery = advanceQuery + cf.name + " = '" + val + "' OR ";
              }else{
                advanceQuery = advanceQuery + cf.name + " = '" +val + "'";
              }
            })
            this.advancedFilter = advanceQuery;
          }
        }
      }
    })
    this.getLocationData();
    this.viewSubscription();
  }

  clickCheckbox(event:any, value, name,  id){
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
  
  private createGroupId() : string {
    return '' + Math.floor(Math.random() * 100000000 );
  }

  viewSubscription(){
    //sessionStorage.removeItem('socketResponse');
  
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

  getLocationData(){
    let  location : { lat : number, lng: number};
    let radius = this.filterCriteria?.get('radius').value;
    let latLong = this.filterCriteria?.get('latLong').value;
    if(radius){
      this.radius = radius;
    }
    if(latLong){
      location.lat = latLong.split(',').slice(0,1).toString();
      location.lng = latLong.split(',').slice(1,2).toString();
      this.location = location;
    }
  }

  clearForm(){
    this.queryParams = [];
    this.advancedFilter = '';
    this.calendarFields.clear();
    this.location = null;
    this.viewSubscription();
  }

  updateCaptureDateRange(dateTimeRange: DateTimeRange, customFieldName){
    this.captureDateModel = dateTimeRange;
    let value = '';
    _.each(this.searchFields, cf =>{
      if(cf.name == customFieldName){
        value = this.captureDateModel.startMoment().format("X")+"000" + "-" + this.captureDateModel.endMoment().format("X")+"000"; 
        this.calendarFields.set(cf.id, value);
        //this.queryParams.push({id : cf.id,value :  value})
      }
    })
  }
}