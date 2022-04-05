import { Component, HostBinding, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges, ViewChild, ViewEncapsulation, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { DataTableComponent } from '@msi/cobalt/data-table/data-table.component';
import _, { result } from 'lodash';
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
  fixedWidth :boolean = false;
  _selected: any;
  rows: Array<any> = [];
  @Output() childEvent = new EventEmitter();
  @Output() onDataSelected = new EventEmitter<any>();
  @Output() onDataSort = new EventEmitter<any>();
  @Output() selectedSortVal = new EventEmitter<string>();
  @Input() tableWidth: number;


  @ViewChild('table') table: DataTableComponent;
  @HostBinding('style.width') hostWidth = '200%';
  wrappingMode: 'default' | 'horizontalScrollbar' = 'horizontalScrollbar';
  private customFields :any = null;
  private dataSub : Subscription;
  private systemSub : Subscription;
  private defaultFields = ['media_name','unitId','talkgroupId',  'timestamp'];
  private astroFields = ['media_name','unitId','talkgroupId',  'timestamp', 'channel', 'siteId','zoneId','rscAlias','individualAlias','agencyName']; 
  private broadbandFields = ['media_name','unitId','talkgroupId', , 'timestamp','agencyName' ];
  public visibleFields = this.defaultFields;
  constructor(private changeDetector: ChangeDetectorRef,
    private mediaFilters : MediaFilterService,
    private mediaFilterService : MediaFilterService) {}

  ngOnInit() {
    
    this.dataSub = this.mediaFilterService.filteredRespone$.subscribe(result =>{
      console.log(result);
      this.rows = result;
    });
    this.mediaFilters.getCustomFields().subscribe(result => {
      this.customFields = result;
      console.log(result);
    })
    this.systemSub = this.mediaFilterService.systemSelected$.subscribe(result => {
      if(result == 'astro'){
        this.visibleFields = this.astroFields;
      }else if(result =='broadband'){
        this.visibleFields = this.broadbandFields;
      }else{
        this.visibleFields = this.defaultFields;
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
  checkFieldVisibility(row : any){
    _.each(row.customFields, cf=>{
      if(this.visibleFields.includes(cf.name)){
        return true;
      }else{
        return false;
      }
    })
    return false;
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
            ans =  cf.value?.text
          }
          return ans;
        }
      })
    }
    return ans;
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

  public rowClass = (index) => index % 2 === 0 ? 'even' : 'odd';

}
