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
import { IncidentSearchResultComponent } from '../../../incident/search/result/result.component';

@Component({
  selector: 'app-media-search-result',
  templateUrl: './media-search-result.component.html',
  styleUrls: ['./media-search-result.component.scss']
})
export class MediaSearchResultComponent implements OnInit, OnDestroy {
  @Input()
  set mediaSearchCriteria(inputValue: {
    filterCriteria: FormGroup,
    calendarFields: Map<number, string>,
    checkBoxFields: Map<string, Array<string>>,
    searchFields: CustomField[],
  }) {
    if (inputValue) {
      if (this.subscription != null) {
        this.mediaFilterService.closeSubscription();
        this.subscription.cancel();
        this.filteredMedia.unsubscribe();
      }

      this.isLoading = true;
      this.rows = [];
      this.mediaFilterService.buildSearchParams(inputValue.filterCriteria, inputValue.calendarFields, inputValue.checkBoxFields, inputValue.searchFields);
    }
  }
  rows: MediaFile[] = [];
  private filteredMedia: Subscription;
  isLoading: boolean;
  subscription: Feedsubscription;
  customFields : CustomField[];

  showhidecolumns: { [key: string]: boolean };

  constructor(
    private mediaFilterService: MediaFilterService,
    private dialogService: DialogService) {
    this.showhidecolumns = {
      'Name': true,
      'Capture Date': true,
      'Media Type': true,
      'Duration': true,
      'Talkgroup ID': true,
      'Agency': true,
      'Unit ID': false,
      'Channel': false,
      'Site ID': false,
      'Zone ID': false,
      'Resource Alias': false,
      'Individual Alias': false,
      'System': true,
      'Originating MDN': false,
      'Terminating MDN': false,
      'Participating MDN': false,
      'Talkgroup Name': false
    };
  }


  ngOnInit() {
    this.isLoading = true;
	
    this.mediaFilterService.getCustomFields().subscribe( (result: CustomField[] )=>{
      if(result){
        this.customFields = result;
        this.mediaFilterService.buildSearchParams(null, null, null, this.customFields);
      }
    })   
      
    this.filteredMedia = this.mediaFilterService.filteredRespone$.subscribe(result => {
      if (result === null) {
        this.rows = [];
      } else if (result) {    
        this.rows = this.rows.concat(this.setMediaResults(result));
      }
	  
      this.isLoading = false;
    });
  }

  onMediaPlay(row): void {
    this.dialogService.showDialog(row.name, PlayerComponent, row.id, { id: row.id });
  }

  onDisplayColumnChange(value: string) {
    if (value == 'astro') {
      this.showhidecolumns['Unit ID'] = true;
      this.showhidecolumns['Channel'] = true;
      this.showhidecolumns['Site ID'] = true;
      this.showhidecolumns['Zone ID'] = true;
      this.showhidecolumns['Resource Alias'] = true;
      this.showhidecolumns['Individual Alias'] = true;
      this.showhidecolumns['Originating MDN'] = false;
      this.showhidecolumns['Terminating MDN'] = false;
      this.showhidecolumns['Participating MDN'] = false;
      this.showhidecolumns['Talkgroup Name'] = false;
    } else if (value == 'broadband') {
      this.showhidecolumns['Unit ID'] = false;
      this.showhidecolumns['Channel'] = false;
      this.showhidecolumns['Site ID'] = false;
      this.showhidecolumns['Zone ID'] = false;
      this.showhidecolumns['Resource Alias'] = false;
      this.showhidecolumns['Individual Alias'] = false;
      this.showhidecolumns['Originating MDN'] = true;
      this.showhidecolumns['Terminating MDN'] = true;
      this.showhidecolumns['Participating MDN'] = true;
      this.showhidecolumns['Talkgroup Name'] = true;
    } else {
      this.showhidecolumns['Unit ID'] = false;
      this.showhidecolumns['Channel'] = false;
      this.showhidecolumns['Site ID'] = false;
      this.showhidecolumns['Zone ID'] = false;
      this.showhidecolumns['Resource Alias'] = false;
      this.showhidecolumns['Individual Alias'] = false;
      this.showhidecolumns['Originating MDN'] = false;
      this.showhidecolumns['Terminating MDN'] = false;
      this.showhidecolumns['Participating MDN'] = false;
      this.showhidecolumns['Talkgroup Name'] = false;
    }
  }


  addMediaToIncident(mode, tableRows): void {
    const title = mode.charAt(0).toUpperCase() + mode.slice(1);

    this.dialogService.showDialog('Add media to ' + title + ' Incident', (mode === 'create') ? ManageIncidentComponent : IncidentSearchResultComponent, tableRows, { mode: mode, id: 0, rows: tableRows })
      .subscribe();
  }

  onScrolledToBottom() {
     if(this.rows.length > 0){
      this.mediaFilterService.fetchMoreMedia();
     }
  }

  private setMediaResults(rows: MediaFile[]): MediaFile[] {
	_.each(rows, mediaFile => {
		let field = mediaFile.customFields.find(item => toLower(item.name) == toLower("timestamp"));
		mediaFile.timestamp = (field && field.value) ? moment(field.value.timestamp).toDate() : null;

		field = mediaFile.customFields.find(item => toLower(item.name) == toLower("mimeType"));
		mediaFile.mimeType = (field && field.value) ? field.value?.text : '-';

		field = mediaFile.customFields.find(item => toLower(item.name) == toLower("talkgroupId"));
		mediaFile.talkgroupId = (field && field.value) ? field.value?.text : '-';

		field = mediaFile.customFields.find(item => toLower(item.name) == toLower("agencyName"));
		mediaFile.agencyName = (field && field.value) ? field.value?.text : '-';

		field = mediaFile.customFields.find(item => toLower(item.name) == toLower("unitId"));
		mediaFile.unitId = (field && field.value) ? field.value?.text : '-';

		field = mediaFile.customFields.find(item => toLower(item.name) == toLower("channel"));
		mediaFile.channel = (field && field.value) ? field.value?.text : '-';

		field = mediaFile.customFields.find(item => toLower(item.name) == toLower("siteId"));
		mediaFile.siteId = (field && field.value) ? field.value?.text : '-';

		field = mediaFile.customFields.find(item => toLower(item.name) == toLower("zoneId"));
		mediaFile.zoneId = (field && field.value) ? field.value?.text : '-';

		field = mediaFile.customFields.find(item => toLower(item.name) == toLower("rscAlias"));
		mediaFile.rscAlias = (field && field.value) ? field.value?.text : '-';

		field = mediaFile.customFields.find(item => toLower(item.name) == toLower("individualAlias"));
		mediaFile.individualAlias = (field && field.value) ? field.value?.text : '-';

		field = mediaFile.customFields.find(item => toLower(item.name) == toLower("system"));
		this.onDisplayColumnChange((field && field.value) ? field.value?.text : '-');

		field = mediaFile.customFields.find(item => toLower(item.name) == toLower("originatingMDN"));
		mediaFile.originatingMDN = (field && field.value) ? field.value?.text : '-';

		field = mediaFile.customFields.find(item => toLower(item.name) == toLower("terminatingMDN"));
		mediaFile.terminatingMDN = (field && field.value) ? field.value?.text : '-';

		field = mediaFile.customFields.find(item => toLower(item.name) == toLower("participatingMDN"));
		mediaFile.participatingMDN = (field && field.value) ? field.value?.text : '-';

		field = mediaFile.customFields.find(item => toLower(item.name) == toLower("talkgroupName"));
		mediaFile.talkgroupName = (field && field.value) ? field.value?.text : '-';
	})

    return rows;
  }

  ngOnDestroy(): void {
    if (this.subscription != null) {
      this.mediaFilterService.closeSubscription();
      this.subscription.cancel();
      this.filteredMedia.unsubscribe();
    }
  }

  onColumnViewChange(value){
    switch(value){
      case 'Name' : 
        this.showhidecolumns['Name'] = !this.showhidecolumns['Name'];
        break;
      case 'Capture Date' : 
        this.showhidecolumns['Capture Date'] = !this.showhidecolumns['Capture Date'];
        break;
      case 'Media Type' : 
        this.showhidecolumns['Media Type'] = !this.showhidecolumns['Media Type'];
        break;
      case 'Duration' : 
        this.showhidecolumns['Duration'] = !this.showhidecolumns['Duration'];
        break;
      case 'Talkgroup ID' : 
        this.showhidecolumns['Talkgroup ID'] = !this.showhidecolumns['Talkgroup ID'];
        break;
      case 'Agency' : 
        this.showhidecolumns['Agency'] = !this.showhidecolumns['Agency'];
        break;
      case 'Unit ID' : 
        this.showhidecolumns['Unit ID'] = !this.showhidecolumns['Unit ID'];
        break;
      case 'Channel' : 
        this.showhidecolumns['Channel'] = !this.showhidecolumns['Channel'];
        break;
      case 'Site ID' : 
        this.showhidecolumns['Site ID'] = !this.showhidecolumns['Site ID'];
        break;
      case 'Zone ID' : 
        this.showhidecolumns['Zone ID'] = !this.showhidecolumns['Zone ID'];
        break;
      case 'Resource Alias' : 
        this.showhidecolumns['Resource Alias'] = !this.showhidecolumns['Resource Alias'];
        break;
      case 'Individual Alias' : 
        this.showhidecolumns['Individual Alias'] = !this.showhidecolumns['Individual Alias'];
        break;
      case 'System' : 
        this.showhidecolumns['System'] = !this.showhidecolumns['System'];
        break;
      case 'Originating MDN' : 
        this.showhidecolumns['Originating MDN'] = !this.showhidecolumns['Originating MDN'];
        break;
      case 'Terminating MDN' : 
        this.showhidecolumns['Terminating MDN'] = !this.showhidecolumns['Terminating MDN'];
        break;
      case 'Participating MDN' : 
        this.showhidecolumns['Participating MDN'] = !this.showhidecolumns['Participating MDN'];
        break;
      case 'Talkgroup Name' : 
        this.showhidecolumns['Talkgroup Name'] = !this.showhidecolumns['Talkgroup Name'];
        break;
    }
  }
  returnZero() {
    return 0
  }
}
