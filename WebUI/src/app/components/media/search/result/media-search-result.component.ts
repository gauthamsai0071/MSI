import { Component, OnInit } from '@angular/core';
import _ from 'lodash';
import moment from 'moment';
import { Subscription } from 'rxjs';
import { DialogService } from 'src/app/services/common/dialog.service';
import { MediaFilterService } from '../../../../services/media/media-filter.service';
import { PlayerComponent } from 'src/app/components/common/player/player.component';

@Component({
  selector: 'app-media-search-result',
  templateUrl: './media-search-result.component.html',
  styleUrls: ['./media-search-result.component.scss']
})
export class MediaSearchResultComponent implements OnInit {
  rows: Array<any> = [];
  isAstroFieldsVisible:boolean = true;
  private customFields :any = null;
  private dataSub : Subscription;
  private systemSub : Subscription;

  showhidecoloumns: { [key: string]: boolean };

  constructor(
    private mediaFilters : MediaFilterService,
    private mediaFilterService : MediaFilterService,
    private dialogService: DialogService) {
      this.showhidecoloumns = {
        'media_name' : true,
        'timestamp' : true,
        'mimeType' : true,
        'media_duration' : true,
        'talkgroupId' : true,
        'agencyName' : true,
        'unitId' : false,
        'channel' : false,
        'siteId' : false,
        'zoneId' : false,
        'rscAlias' : false,
        'individualAlias' : false,
        'System' : true,
        'originatingMDN' : false,
        'terminatingMDN' : false,
        'participatingMDN' : false,
        'talkgroupName' : false
      };
    }

  ngOnInit() {
    
    this.dataSub = this.mediaFilterService.filteredRespone$.subscribe(result =>{
      if(result){
        this.rows = result;
      }else{
        this.rows = [];
      }
    });
    this.mediaFilters.getCustomFields().subscribe(result => {
      this.customFields = result;
    })
    this.systemSub = this.mediaFilterService.systemSelected$.subscribe(result => {
      if(result == 'astro'){
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
      }else if(result =='broadband'){
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
      }else{
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

  findElement(row : any, fieldName: string){
    let ans = null;
    _.each(row?.customFields, cf => {
      if(cf.name === fieldName){
        if(cf.isTimestamp == true){
          ans = moment(cf.value?.timestamp).format("DD MMM YYYY hh:mm a");
        }else{
          ans =  cf.value?.text;
        }
        return ans;
      }
    })
    return ans ? ans : '-';
  }
  onMediaPlay(row): void {
    this.dialogService.showDialog('Media Player', PlayerComponent, row.id, { id: row.id })
    .subscribe();
  }
}
