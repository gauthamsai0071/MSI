import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormGroup } from '@angular/forms';
import _ from 'lodash';
import { Observable,Subject,of } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';
import { VideoFilesSubscriptionAdto } from '../../interfaces/adto';
import { Feedsubscription } from '../../models/feed/feed-subscription';
import { ApiUrls } from '../../util/api-urls';
import { CustomField } from '../../models/common/custom-field';
import { AuthService } from '../auth/auth.service';

@Injectable()
export class MediaFilterService {
  private static filteredRespone = new Subject<any>();
  filteredRespone$ = MediaFilterService.filteredRespone.asObservable().pipe(
    shareReplay(1)
  );
  public apiUrls :ApiUrls = new ApiUrls();
  queryParams:{id:number , value: string}[] = [];
  private radius : number;
  private location : { lat : number, lng: number};
  advancedFilter : string = '';
  
  constructor(private http: HttpClient,
    private authService: AuthService) { }
  
  getCustomFields() {
    return this.http.get('api/videos/customFields').pipe(
      shareReplay(1)
    );
  }

  buildSearchParams(
    filterCriteria : FormGroup,
    calendarFields : Map<number, string>,
    checkBoxFields : Map<string, Array<string>>,
    searchFields : CustomField[]
    ){
      this.queryParams = [];
      this.advancedFilter = '';
      let advanceQuery = '';
      _.each(searchFields, cf =>{
        let value = filterCriteria.get(cf.name)?.value;
        if(cf.isTimestamp){
          if(calendarFields.get(cf.id)){
            this.queryParams.push({id: cf.id, value: calendarFields.get(cf.id)});
          }
        }
        if(filterCriteria.get(cf.name)?.value){
          if(cf.isText){
            value = filterCriteria.get(cf.name)?.value;
            this.queryParams.push({id : cf.id,value :  value})
          }else if(cf.isEnumeration){
            value = filterCriteria.get(cf.name)?.value;
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
              _.each(checkBoxFields.get(cf.name), val => {
                if(val != checkBoxFields.get(cf.name)[checkBoxFields.get(cf.name).length-1]){
                  advanceQuery = advanceQuery + cf.name + " = '" + val + "' OR ";
                }else{
                  advanceQuery = advanceQuery + cf.name + " = '" +val + "'";
                }
              })
              this.advancedFilter = advanceQuery;
            }else if(cf.displayName.includes(',radio,')){
              this.queryParams.push({id : cf.id,value :  value})
            }
          }
        }
    })
    this.getLocationData(filterCriteria);
    this.viewSubscription();
  }

  getLocationData(filterCriteria : FormGroup){
    let radiusVal = filterCriteria?.get('radius').value;
    let latLongVal = filterCriteria?.get('latLong').value;
    if(radiusVal){
      this.radius = radiusVal;
    }
    if(latLongVal){
      this.location.lat = latLongVal.split(',').slice(0,1).toString();
      this.location.lng = latLongVal.split(',').slice(1,2).toString();
    }
  }

  viewSubscription(){
    let queryParams : VideoFilesSubscriptionAdto = {
      thumbnail: 'SINGLE',
      includeDeleted : true,
      mgroupid : this.createGroupId(),
      customValues: this.queryParams,
      radius : this.radius,
      location : this.location,
      advancedFilter : this.advancedFilter,
      limit : 15,
    };
    let videoSubscribeUrl = this.apiUrls.videoListSubscribe;
    let subscription = new Feedsubscription(videoSubscribeUrl,(this.apiUrls.videoListSubscribe,() => queryParams),this.http,this.authService);
  }

  private createGroupId() : string {
    return '' + Math.floor(Math.random() * 100000000 );
  }
  
  public static notifyfilteredRespone(data: string) {
    if (data) {
      this.filteredRespone.next(data);
    }else{
      this.filteredRespone.next(null);
    }
  }
}
