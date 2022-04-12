import { Component, HostBinding, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges, ViewChild, ChangeDetectorRef } from '@angular/core';
import { DataTableComponent } from '@msi/cobalt/data-table/data-table.component';
import _ from 'lodash';
import moment from 'moment';
import { Subscription } from 'rxjs';
import { MediaFilterService } from '../../../../services/media/media-filter.service';

@Component({
  selector: 'app-media-search-result',
  templateUrl: './media-search-result.component.html',
  styleUrls: ['./media-search-result.component.scss']
})
export class MediaSearchResultComponent implements OnInit, OnChanges {
  sticky :boolean = true;
  sortable :boolean = true;
  filterable :boolean = false;
  draggable :boolean = true;
  resizable :boolean = true;
  pinning :boolean = false;
  selection :boolean = true;
  condensed :boolean = false;
  fixedWidth :boolean = true;
  _selected: any;
  rows: Array<any> = [];
  @Output() childEvent = new EventEmitter();
  @Output() onDataSelected = new EventEmitter<any>();
  @Output() onDataSort = new EventEmitter<any>();
  @Output() selectedSortVal = new EventEmitter<string>();
  @Input() tableWidth: number;


  @ViewChild('table') table: DataTableComponent;
  @HostBinding('style.width') hostWidth = '100%';
  isAstroFieldsVisible:boolean = true;
  wrappingMode: 'default' | 'horizontalScrollbar' = 'default';
  private customFields :any = null;
  private dataSub : Subscription;
  private systemSub : Subscription;
  // private defaultFields = ['media_name','timestamp','mimeType', 'media_duration','talkgroupId', 'System' ];
  // private astroFields = ['media_name','unitId','talkgroupId',  'timestamp', 'channel', 'siteId','zoneId','rscAlias','individualAlias','agencyName']; 
  private broadbandFields = ['media_name','unitId','talkgroupId', 'timestamp','agencyName', 'originatingMDN', 'terminatingMDN','participatingMDN', 'talkgroupName' ];
  showhidecoloumns: { [key: string]: boolean };
  //public visibleFields = this.defaultFields;
  constructor(private changeDetector: ChangeDetectorRef,
    private mediaFilters : MediaFilterService,
    private mediaFilterService : MediaFilterService) {
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
      this.rows = result;
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

  ngOnChanges(changes: SimpleChanges) {
    this.changeDetector.detectChanges();
  }

  nameSort(a, b) {
    return parseInt(a.replace(/[^\d]/g, ''), 10) - parseInt(b.replace(/[^\d]/g, ''), 10);
  }

  onScroll() {
    this.childEvent.emit();
  }

  onSelect(data: any): void {
    this.onDataSelected.emit(data);
  }

  findElement(row : any, fieldName: string){
    let ans= null;
    if(fieldName == "media_name"){
      ans = row.name;
      return ans;
    }else{
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
    }
    return ans ? ans : '-';
  }
  
  findColumnName(fieldName: string){
    let ans= null;
    _.each(this.customFields, cf => {
      if(cf.name === fieldName){
        ans = cf.displayName
        return;
      }
    })
    return ans;
  }

  customSort = (a, b): number => {
    return a.localeCompare(b);
  }

  public rowClass = (index) => index % 2 === 0 ? 'even' : 'odd';

}
