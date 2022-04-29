import { Component, OnDestroy, OnInit } from '@angular/core';
import _, { toLower } from 'lodash';
import moment from 'moment';
import { Subscription } from 'rxjs';
import { DialogService } from '../../../../services/common/dialog.service';
import { MediaFilterService } from '../../../../services/media/media-filter.service';
import { PlayerComponent } from '../../../common/player/player.component';
import { ManageIncidentComponent } from '../../../incident/manage/manage-incident.component';
import { MediaFile } from '../../../../models/media/mediaFile';
import { CustomField } from '../../../../models/common/custom-field';
import { Feedsubscription } from '../../../../models/feed/feed-subscription';

@Component({
  selector: 'app-media-search-result',
  templateUrl: './media-search-result.component.html',
  styleUrls: ['./media-search-result.component.scss']
})
export class MediaSearchResultComponent implements OnInit, OnDestroy {
  @Input()
  set filterCriteria(value: {
    owner: string, text: string, showCurrent: boolean, showDeleted: boolean,
    showShared: boolean, showExternal: boolean, showActiveExternal: boolean,
    searchFilters: { [key: string]: string }
  }) {
    this._filterCriteria = value;


    this.incidentSearchService.search(value.owner, value.text, value.showCurrent, value.showDeleted, value.showShared,
      value.showExternal, value.showActiveExternal, value.searchFilters).subscribe(response => {
        _.each(response, incident => {
          let field = incident.customFields.find(item => toLower(item.name) == toLower("title"));
          incident.title = (field && field.value) !== undefined ? field.value.text : '';

          field = incident.customFields.find(item => toLower(item.name) == toLower("reference-code"));
          incident.referenceCode = (field && field.value) !== undefined ? field.value.text : '';

          field = incident.customFields.find(item => toLower(item.name) == toLower("incident-time"));

          incident.incidentTime = (field && field.value) !== undefined ? moment(field.value.timestamp).toDate() : null;
        });
        this.results = response;
      });

      if (this.subscription !=null) {
        this.subscription.cancel();
      }

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

      this.subscription = new Feedsubscripton(videoSubscribeUrl,(this.apiUrls.videoListSubscribe,() => queryParams),this.http,this.authService);

       this.subscription.dataReceived.subscribe(response => {
          this.bindGrid(response);
       });
  }

  rows: MediaFile[] = [];
  private customFields :CustomField[] = null;
  isAstroFieldsVisible:boolean = true;
  private dataSub : Subscription;
  private systemSub : Subscription;
  isLoading : boolean;
  subscription: Feedsubscription;

  showhidecoloumns: { [key: string]: boolean };

  constructor(
    private mediaFilterService: MediaFilterService,
    private dialogService: DialogService) {
    
    
   

    this.showhidecoloumns = {
      'media_name': true,
      'timestamp': true,
      'mimeType': true,
      'media_duration': true,
      'talkgroupId': true,
      'agencyName': true,
      'unitId': false,
      'channel': false,
      'siteId': false,
      'zoneId': false,
      'rscAlias': false,
      'individualAlias': false,
      'System': true,
      'originatingMDN': false,
      'terminatingMDN': false,
      'participatingMDN': false,
      'talkgroupName': false
    };
  }

  ngOnInit() {
    this.isLoading = true;
    this.dataSub = this.mediaFilterService.filteredRespone$.subscribe(result => {
        this.bindGrid();
    });

    this.mediaFilterService.getCustomFields().subscribe((result : CustomField[]) => {
      this.customFields = result;
    })
    this.systemSub = this.mediaFilterService.systemSelected$.subscribe((result : string) => {
      if (result == 'astro') {
        this.showhidecoloumns['unitId'] = true;
        this.showhidecoloumns['channel'] = true;
        this.showhidecoloumns['siteId'] = true;
        this.showhidecoloumns['zoneId'] = true;
        this.showhidecoloumns['rscAlias'] = true;
        this.showhidecoloumns['individualAlias'] = true;
        this.showhidecoloumns['originatingMDN'] = false;
        this.showhidecoloumns['terminatingMDN'] = false;
        this.showhidecoloumns['participatingMDN'] = false;
        this.showhidecoloumns['talkgroupName'] = false;
      } else if (result == 'broadband') {
        this.showhidecoloumns['unitId'] = false;
        this.showhidecoloumns['channel'] = false;
        this.showhidecoloumns['siteId'] = false;
        this.showhidecoloumns['zoneId'] = false;
        this.showhidecoloumns['rscAlias'] = false;
        this.showhidecoloumns['individualAlias'] = false;
        this.showhidecoloumns['originatingMDN'] = true;
        this.showhidecoloumns['terminatingMDN'] = true;
        this.showhidecoloumns['participatingMDN'] = true;
        this.showhidecoloumns['talkgroupName'] = true;
      } else {
        this.showhidecoloumns['unitId'] = false;
        this.showhidecoloumns['channel'] = false;
        this.showhidecoloumns['siteId'] = false;
        this.showhidecoloumns['zoneId'] = false;
        this.showhidecoloumns['rscAlias'] = false;
        this.showhidecoloumns['individualAlias'] = false;
        this.showhidecoloumns['originatingMDN'] = false;
        this.showhidecoloumns['terminatingMDN'] = false;
        this.showhidecoloumns['participatingMDN'] = false;
        this.showhidecoloumns['talkgroupName'] = false;
      }
    })
  }

  bindGrid(response): void {
    if(response){
      this.isLoading = false;
      _.each(response, mediaFile => {

        let field = mediaFile.customFields.find(item => toLower(item.name) == toLower("timestamp"));
        mediaFile.timestamp = field !== undefined ? moment(field.value?.timestamp).toDate() : null;

        field = mediaFile.customFields.find(item => toLower(item.name) == toLower("mimeType"));
        mediaFile.mimeType = field !== undefined ? field.value?.text : '';

        field = mediaFile.customFields.find(item => toLower(item.name) == toLower("talkgroupId"));
        mediaFile.talkgroupId = field !== undefined ? field.value?.text : '';
        
        field = mediaFile.customFields.find(item => toLower(item.name) == toLower("agencyName"));
        mediaFile.agencyName = field !== undefined ? field.value?.text : '';
        
        field = mediaFile.customFields.find(item => toLower(item.name) == toLower("unitId"));
        mediaFile.unitId = field !== undefined ? field.value?.text : '';
        
        field = mediaFile.customFields.find(item => toLower(item.name) == toLower("channel"));
        mediaFile.channel = field !== undefined ? field.value?.text : '';
        
        field = mediaFile.customFields.find(item => toLower(item.name) == toLower("siteId"));
        mediaFile.siteId = field !== undefined ? field.value?.text : '';
        
        field = mediaFile.customFields.find(item => toLower(item.name) == toLower("zoneId"));
        mediaFile.zoneId = field !== undefined ? field.value?.text : '';
        
        field = mediaFile.customFields.find(item => toLower(item.name) == toLower("rscAlias"));
        mediaFile.rscAlias = field !== undefined ? field.value?.text : '';
        
        field = mediaFile.customFields.find(item => toLower(item.name) == toLower("individualAlias"));
        mediaFile.individualAlias = field !== undefined ? field.value?.text : '';
        
        field = mediaFile.customFields.find(item => toLower(item.name) == toLower("originatingMDN"));
        mediaFile.originatingMDN = field !== undefined ? field.value?.text : '';
        
        field = mediaFile.customFields.find(item => toLower(item.name) == toLower("terminatingMDN"));
        mediaFile.terminatingMDN = field !== undefined ? field.value?.text : '';

        field = mediaFile.customFields.find(item => toLower(item.name) == toLower("participatingMDN"));
        mediaFile.participatingMDN = field !== undefined ? field.value?.text : '';
        
        field = mediaFile.customFields.find(item => toLower(item.name) == toLower("talkgroupName"));
        mediaFile.talkgroupName = field !== undefined ? field.value?.text : '';
        
      })
      this.rows.concat(response);
    }
  }

  onMediaPlay(row): void {
    this.dialogService.showDialog(row.name, PlayerComponent, row.id, { id: row.id })
      .subscribe();
  }

  createIncident(tableRows): void {
    this.dialogService.showDialog('Add media to New Incident', ManageIncidentComponent, tableRows, { rows: tableRows })
      .subscribe();
  }
  onScrolledToBottom(event: any) {
    console.log('scrolled to bottom row:', event);
  }

  ngOnDestroy(): void {
    if (this.subscription !=null) {
      this.subscription.cancel();
    }
  }
}
