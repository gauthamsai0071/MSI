import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { DateTimeRange } from '@msi/cobalt';
import { MediaFilterService } from '../../../../services/media/media-filter.service';
import { IDropdownSettings } from 'ng-multiselect-dropdown';
import _ from 'lodash';
import { Feed } from '../../../../../app/models/feed/feed';
import { ApiUrls } from '../../../../../app/util/api-urls';
import { MediaGroupManager } from '../../../../../app/models/feed/media-group-manager';
import { StateAdto, VideoFilesSubscriptionAdto } from '../../../../../app/interfaces/adto';
import { Feedwebsocket } from '../../../../../app/models/feed/feedwebsocket';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../../../../app/services/auth/auth.service';
import { Feedsubscription } from '../../../../../app/models/feed/feedsubscription';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-media-filter',
  templateUrl: './filter.component.html',
  styleUrls: ['./filter.component.scss']
})

export class MediaFilterComponent implements OnInit {
  filterCriteria : FormGroup = null;
  customFields :any = null;
  advancedFilter : any = '';
  private location : any = null;
  private radius : null;
  searchFields :any = [];
  queryParams:any = [];
  public checkBoxFields = new Map();
  public calendarFields = new Map();
  captureDateModel: DateTimeRange = new DateTimeRange();
  dropdownSettings:IDropdownSettings = {};
  public feed: Feed;
  public apiUrls :ApiUrls;
  public mgroup : MediaGroupManager;
  public state : StateAdto;
  public socket : Feedwebsocket;
  searchResult : any;
  offset = "61";
  id = "5885";
  url:string;
  private sub : Subscription;
  constructor(
    private mediaFilters : MediaFilterService,
    private formBuilder: FormBuilder,
    private http : HttpClient,
    private authService: AuthService,
    private mediaFilterService : MediaFilterService
  ) { 
    this.feed = new Feed(this.apiUrls,this.mgroup,this.state,this.http,this.authService);
    this.socket = new Feedwebsocket(this.feed,this.url, null);
    this.apiUrls = new ApiUrls();
  }

  ngOnInit(): void {
    this.mediaFilters.getCustomFields().subscribe((result: any) =>{
      this.customFields = result;
      this.getAllSearchFields();
      this.buildSearchForm();
    });
    this.sub = this.mediaFilterService.filteredRespone$.subscribe(result =>{
      this.searchResult = result;
    })
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
      if(cf.name == 'System'){
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
    sessionStorage.removeItem('socketResponse');
    let queryParams : VideoFilesSubscriptionAdto = {
     /*  feedId: "1", */
      thumbnail: 'SINGLE',
      includeDeleted : true,
      mgroupid : this.createGroupId(),
      customValues: this.queryParams,
      radius : this.radius,
      location : this.location,
      advancedFilter : this.advancedFilter
    };
    // For video
    let videoSubscribeUrl = this.apiUrls.videoListSubscribe;
    let subscription = new Feedsubscription(videoSubscribeUrl,(this.apiUrls.videoListSubscribe,() => queryParams),this.http,this.authService);
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
    let  location = { lat : String, lng: String};
    let radius = this.filterCriteria?.get('radius').value;
    let latLong = this.filterCriteria?.get('latLong').value;
    if(radius){
      this.radius = radius;
    }
    if(latLong){
      location.lat = (latLong.split(',').slice(0,1)).toString();
      location.lng = latLong.split(',').slice(1,2).toString();
      this.location = location;
    }
  }

  clearForm(){
    this.queryParams = [];
    this.advancedFilter = '';
    this.calendarFields.clear();
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