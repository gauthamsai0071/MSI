import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { CustomField } from 'src/app/models/common/custom-field';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss']
})
export class MediaSearchComponent implements OnInit {
  @Output()
  searchCriteria : EventEmitter<any>;

  mediaSearchCriteria : {
    filterCriteria : FormGroup,
    calendarFields : Map<number, string>,
    checkBoxFields : Map<string, Array<string>>,
    searchFields : CustomField[]
  };

  constructor() { 
    this.searchCriteria = new EventEmitter();
  }

  ngOnInit(): void {
  }
  searchMedia(mediaSearchCriteria : {
    filterCriteria : FormGroup,
    calendarFields : Map<number, string>,
    checkBoxFields : Map<string, Array<string>>,
    searchFields : CustomField[],
  }){
    this.mediaSearchCriteria = mediaSearchCriteria;
    this.searchCriteria.emit(this.mediaSearchCriteria);
  }
}
