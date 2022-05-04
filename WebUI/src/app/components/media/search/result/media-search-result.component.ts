import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
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
  set mediaSearchCriteria( inputValue : {
    filterCriteria : FormGroup,
    calendarFields : Map<number, string>,
    checkBoxFields : Map<string, Array<string>>,
    searchFields : CustomField[],
  }){
    if(inputValue){
      this.mediaFilterService.buildSearchParams(inputValue.filterCriteria, inputValue.calendarFields, inputValue.checkBoxFields, inputValue.searchFields);
    }
  }
  rows: MediaFile[] = [];
  private filteredMedia : Subscription;
  isLoading : boolean;
  subscription: Feedsubscription;
  
  showhidecolumns: { [key: string]: boolean };

  constructor(
    private mediaFilterService: MediaFilterService,
    private dialogService: DialogService) {
    this.showhidecolumns = {
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
    this.mediaFilterService.buildSearchParams(null, null, null, null);
    this.isLoading = true;
    this.filteredMedia = this.mediaFilterService.filteredRespone$.subscribe(result => {
      if(result){
        this.isLoading = false;
        _.each(result, mediaFile => {
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

            field = mediaFile.customFields.find(item => toLower(item.name) == toLower("system"));
            this.onDisplayColumnChange(field !== undefined ? field.value?.text : '');
            
            field = mediaFile.customFields.find(item => toLower(item.name) == toLower("originatingMDN"));
            mediaFile.originatingMDN = field !== undefined ? field.value?.text : '';
            
            field = mediaFile.customFields.find(item => toLower(item.name) == toLower("terminatingMDN"));
            mediaFile.terminatingMDN = field !== undefined ? field.value?.text : '';

            field = mediaFile.customFields.find(item => toLower(item.name) == toLower("participatingMDN"));
            mediaFile.participatingMDN = field !== undefined ? field.value?.text : '';
            
            field = mediaFile.customFields.find(item => toLower(item.name) == toLower("talkgroupName"));
            mediaFile.talkgroupName = field !== undefined ? field.value?.text : '';          
        })
        this.rows = result;
      }
    });   
  }

  onMediaPlay(row): void {
    this.dialogService.showDialog(row.name, PlayerComponent, row.id, { id: row.id });
  }

  mediaIncident(tableRows): void {
    this.dialogService.showDialog('Add media to New Incident', ManageIncidentComponent, tableRows, { mode: 'mediaIncident', id: 0, rows: tableRows }) 
      .subscribe();
  }

  onDisplayColumnChange(value : string){
    if(value == 'astro'){
      this.showhidecolumns['unitId'] = true;
      this.showhidecolumns['channel'] = true;
      this.showhidecolumns['siteId'] = true;
      this.showhidecolumns['zoneId'] = true;
      this.showhidecolumns['rscAlias'] = true;
      this.showhidecolumns['individualAlias'] = true;
      this.showhidecolumns['originatingMDN'] = false;
      this.showhidecolumns['terminatingMDN'] = false;
      this.showhidecolumns['participatingMDN'] = false;
      this.showhidecolumns['talkgroupName'] = false;
    }else if(value == 'broadband'){
      this.showhidecolumns['unitId'] = false;
      this.showhidecolumns['channel'] = false;
      this.showhidecolumns['siteId'] = false;
      this.showhidecolumns['zoneId'] = false;
      this.showhidecolumns['rscAlias'] = false;
      this.showhidecolumns['individualAlias'] = false;
      this.showhidecolumns['originatingMDN'] = true;
      this.showhidecolumns['terminatingMDN'] = true;
      this.showhidecolumns['participatingMDN'] = true;
      this.showhidecolumns['talkgroupName'] = true;
    }else{
      this.showhidecolumns['unitId'] = false;
      this.showhidecolumns['channel'] = false;
      this.showhidecolumns['siteId'] = false;
      this.showhidecolumns['zoneId'] = false;
      this.showhidecolumns['rscAlias'] = false;
      this.showhidecolumns['individualAlias'] = false;
      this.showhidecolumns['originatingMDN'] = false;
      this.showhidecolumns['terminatingMDN'] = false;
      this.showhidecolumns['participatingMDN'] = false;
      this.showhidecolumns['talkgroupName'] = false;
    }
  }
  
  onScrolledToBottom(event: any) {
    console.log('scrolled to bottom row:', event);
  }

  ngOnDestroy(): void {
    if (this.subscription !=null) {
      this.mediaFilterService.closeSubscription();
      this.subscription.cancel();      
      this.filteredMedia.unsubscribe();
    }
  }
}
