import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormGroup } from '@angular/forms';
import _, { toLower } from 'lodash';
import { Subject, Subscription } from 'rxjs';
import { shareReplay } from 'rxjs/operators';
import { VideoFilesSubscriptionAdto } from '../../interfaces/adto';
import { Feedsubscription } from '../../models/feed/feed-subscription';
import { MediaGroupManagerService } from '../../models/feed/media-group-manager';
import { ApiUrls } from '../../util/api-urls';
import { CustomField } from '../../models/common/custom-field';
import { AuthService } from '../auth/auth.service';
import { MediaFile } from '../../models/media/mediaFile';

@Injectable()
export class MediaFilterService {
  public mediaSubscriptions : Feedsubscription;
  private filteredRespone = new Subject<any>();
  filteredRespone$ = this.filteredRespone.asObservable().pipe(
    shareReplay(1)
  );

  public apiUrls :ApiUrls = new ApiUrls();
  queryParams:{id:number , value: string}[] = [];
  private radius : number;
  private location : { lat : number, lng: number};
  advancedFilter : string = '';
  mediaResutsSubscription: Subscription = null;
  mediaAmendmentErrorSubsription: Subscription = null;

  private isMoreMediaAvailable : boolean = false;

  private static cachedMedia: MediaFile[] = [];
  nextPageMedia: MediaFile[] = [];
  private pageNo: number;

  constructor(private http: HttpClient,
    private groupManager: MediaGroupManagerService,
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
    ) {
      
      if (filterCriteria === null && calendarFields === null && checkBoxFields === null && searchFields === null 
            && MediaFilterService.cachedMedia !== null && MediaFilterService.cachedMedia.length > 0) {
        this.filteredRespone.next(MediaFilterService.cachedMedia);
      }

      this.queryParams = [];
      this.advancedFilter = '';
      let advanceQuery = '';
      _.each(searchFields, cf =>{
        let value = filterCriteria?.get(cf.name)?.value;
        if(cf.isTimestamp){
          if(calendarFields?.get(cf.id)){
            this.queryParams.push({id: cf.id, value: calendarFields.get(cf.id)});
          }
        }
        if(filterCriteria?.get(cf.name)?.value){
          if(cf.isText){
            value = filterCriteria?.get(cf.name)?.value;
            this.queryParams.push({id : cf.id,value :  value})
          }else if(cf.isEnumeration){
            value = filterCriteria?.get(cf.name)?.value;
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
              _.each(checkBoxFields?.get(cf.name), val => {
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
        }else if(toLower(cf.name) == 'mimetype' && (!value)){
            if(advanceQuery.length > 1){
              advanceQuery = advanceQuery + " AND ";
            }
            advanceQuery = advanceQuery + cf.name + " != '" + "Non-Call Event'";
            this.advancedFilter = advanceQuery;
        }
    })
    if(filterCriteria == null){
      let field = searchFields.find(item => toLower(item.name) == toLower("mimeType"));
      if(field){
        this.advancedFilter = "mimeType != 'Non-Call Event'";
      }
    }

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

  viewSubscription() {
    let queryParams : VideoFilesSubscriptionAdto = {
      thumbnail: 'SINGLE',
      includeDeleted : true,
      mgroupid : this.createGroupId(),
      customValues: this.queryParams,
      radius : this.radius,
      location : this.location,
      advancedFilter : this.advancedFilter,
      limit: 50,
    };

    let videoSubscribeUrl = this.apiUrls.videoListSubscribe;
    this.pageNo = 1;
    MediaFilterService.cachedMedia = [];
    this.nextPageMedia = [];

    this.startSubscription(videoSubscribeUrl, queryParams);

    this.mediaAmendmentErrorSubsription = this.mediaSubscriptions.nextAmendmentError.subscribe(() => {
                                              this.pageNo = 1;
                                              MediaFilterService.cachedMedia = [];
                                              this.nextPageMedia = [];
                                              this.startSubscription(videoSubscribeUrl, queryParams);
                                          });                                 
  }

  fetchMoreMedia() {
    if(this.isMoreMediaAvailable) {
      this.pageNo++;

      if (this.nextPageMedia.length > 0) {
        if (this.pageNo === 3) {
          MediaFilterService.cachedMedia = MediaFilterService.cachedMedia.concat(this.nextPageMedia);
        }

        this.filteredRespone.next(this.nextPageMedia);
      }

      this.mediaSubscriptions.amend(this.apiUrls.videoListFetchMore, { limit: 50 });
    }
  }

  private createGroupId() : string {
    return '' + Math.floor(Math.random() * 100000000 );
  }

  private startSubscription(videoSubscribeUrl, queryParams): void {
    if (this.mediaResutsSubscription !== null) {
      this.mediaResutsSubscription.unsubscribe();
    }    

    if (this.mediaAmendmentErrorSubsription !== null) {
      this.mediaAmendmentErrorSubsription.unsubscribe();
    }
    
    this.mediaSubscriptions = new Feedsubscription(videoSubscribeUrl, this.groupManager,
      (this.apiUrls.videoListSubscribe,() => queryParams),this.http, this.authService);   

    this.mediaResutsSubscription = this.mediaSubscriptions.dataReceived.subscribe(message => {
        if(message.data[message.id]?.moreVideoFilesAvailable == true){
          this.isMoreMediaAvailable = true;
        }else{
          this.isMoreMediaAvailable = false;
        }
                
        if (this.pageNo == 1) {
          this.filteredRespone.next(null);
          this.filteredRespone.next(message?.data[message.id]?.videoFiles);
          MediaFilterService.cachedMedia = MediaFilterService.cachedMedia.concat(message?.data[message.id]?.videoFiles);
          this.fetchMoreMedia();
        } else {
          this.nextPageMedia = message?.data[message.id]?.videoFiles;
        }
      });
  }

  closeSubscription(): void {
    this.filteredRespone.complete();

    if (this.mediaResutsSubscription !== null) {
      this.mediaResutsSubscription.unsubscribe();
    }

    if (this.mediaAmendmentErrorSubsription !== null) {
      this.mediaAmendmentErrorSubsription.unsubscribe();
    }
  }

  static clearCache(): void {
    MediaFilterService.cachedMedia = [];
  }
}
