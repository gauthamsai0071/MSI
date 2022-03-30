import { Component,ElementRef,EventEmitter,HostBinding,Input,OnDestroy,OnInit,Output,ViewChild } from '@angular/core';
import type { TemplateRef } from '@angular/core'; // eslint-disable-line no-duplicate-imports
import type { DropdownComponent } from '@msi/cobalt/dropdown';
import { NgbDate,} from '@ng-bootstrap/ng-bootstrap';
import { DateTimeRange } from '@msi/cobalt';
import { QuickSelectionDateRange } from '@msi/cobalt/calendar'
import { CalendarDatepickerComponent } from '@msi/cobalt';
import _moment from 'moment';
import { Observable, Subscription } from 'rxjs';


const moment = _moment;

@Component({
  selector: 'app-calendar',
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.scss']
})
export class CalendarComponent implements OnInit,OnDestroy {
  displayMonths : number= 2;
  // @HostBinding('style.width') readonly forcedWidth = '100%'; 
  dateString:string;

  /** Host class for CSS styles */
  @Input() @HostBinding('class.has-dropdown') dropdown = true;
  
  /** Specifies if date-picker control can be empty */
  @Input() allowEmpty?: boolean = true;
  /** Value that specifies if additional validation should be made */
  @Input() extraValidation?: boolean = true;
  /** Specifies the first date that should be shown */
  @Input() minDate?: NgbDate;
  /** Specifies the last date that should be shown */
  @Input() maxDate?: NgbDate;
  /** Specifies if date should be disabled */
  @Input() disabledDates?: (date: NgbDate, current: { year: number; month: number; }) => boolean;
  /** Additional HTML element below date-picker */
  @Input() belowDatepickerDropdown: TemplateRef<any>;
  /** Additional input for the conditional error state */
  @Input() conditionalErrorState?: boolean = false;
  @Input() allowFutureDates: boolean = false;

  /**For clearing date from parent componenet */
  @Input() clearDateEvent: Observable<void>;
  /** Setting date from parent component*/
  @Input() setDateEvent: Observable<DateTimeRange>;

  private setDateSubscription: Subscription;

  /** Reference to the input element */
  @ViewChild('input', {static: false}) input: ElementRef;
  /** Reference to the drop down element */
  @ViewChild('calendarDropDown', {static: false}) calendarDropDown: DropdownComponent;
  /** Reference to the calendar date-picker element */
  @ViewChild('calendarDatepicker', {static: false}) calendarDatepicker: CalendarDatepickerComponent;

  /** Host class for CSS styles */
  @HostBinding('class.msi-date-picker-control') readonly hostClass: boolean = true;

  constructor() {
  }
  @Input() dateTimeRange: DateTimeRange ;
  
  ngOnInit(){
  // this.setDateSubscription = this.setDateEvent.subscribe((dateTimeRangeFromParent) => {
  //     this.dateTimeRange = dateTimeRangeFromParent;
  //     this.setDateString(this.dateTimeRange);
  //   })
  }
  setDateString(dateTimeRange : DateTimeRange){
    if(dateTimeRange.endDate!= undefined){

      this.dateString = dateTimeRange.startDate.month+'/'
                      +dateTimeRange.startDate.day+'/'
                      +dateTimeRange.startDate.year+' '
                      +dateTimeRange.startTime.hour+':'
                      +dateTimeRange.startTime.minute+':'
                      +dateTimeRange.startTime.second+' - '
                      +dateTimeRange.endDate.month+'/'
                      +dateTimeRange.endDate.day+'/'
                      +dateTimeRange.endDate.year+' '
                      +dateTimeRange.endTime.hour+':'
                      +dateTimeRange.endTime.minute+':'
                      +dateTimeRange.endTime.second; 
      }else{
        this.dateString = "All Dates"
      }
  }

  oneRmsDateRanges: QuickSelectionDateRange[] = [
    {
      text: 'Last 24 hours',
      dateFrom: (today: moment.Moment) => today.subtract(24, 'hours'),
      dateTo: (today: moment.Moment) => today,
    },
    {
      text: 'Last 7 days',
      dateFrom: (today: moment.Moment) => today.subtract(7, 'days').startOf('day'),
      dateTo: (today: moment.Moment) => today,
    },
    {
      text: 'Last 30 days',
      dateFrom: (today: moment.Moment) => today.subtract(30, 'days').startOf('day'),
      dateTo: (today: moment.Moment) => today,
    },
    {
      text: 'Today',
      dateFrom: (today: moment.Moment) => today.startOf('day'),
      dateTo: (today: moment.Moment) => today,
    },
    {
      text: 'This week',
      dateFrom: (today: moment.Moment) => today.startOf('isoWeek'),
      dateTo: (today: moment.Moment) => today,
    },
    {
      text: 'This month',
      dateFrom: (today: moment.Moment) => today.startOf('month'),
      dateTo: (today: moment.Moment) => today,
    },
    {
      text: 'This year',
      dateFrom: (today: moment.Moment) => today.startOf('year'),
      dateTo: (today: moment.Moment) => today,
    },
  ];

 
  @Output() onDatePicked = new EventEmitter<any>();

  onCalendarReset() {
    this.dateString='All Dates';
    this.calendarDropDown.close();
  }
  onCalendarSearch(dateTimeRange: DateTimeRange){
    this.dateTimeRange = dateTimeRange;
    this.setDateString(dateTimeRange);
    this.onDatePicked.emit(dateTimeRange);
    this.calendarDropDown.close();
  }
  ngOnDestroy(){
    //TODO
    //this.setDateSubscription.unsubscribe();
  }
}
