import { Component, HostBinding, ViewChild } from '@angular/core';
import { NgbDate } from '@ng-bootstrap/ng-bootstrap';
import { DateTimeRange, ngbDateFromMoment, DatePickerControlComponent } from '@msi/cobalt';
import _moment from 'moment';

const moment = _moment;

@Component({
  selector: 'app-date-picker',
  templateUrl: './date-picker.component.html',
  styleUrls: ['./date-picker.component.scss']
})
export class DatePickerComponent {

  @HostBinding('style.width') readonly forcedWidth = '100%'; 

  controlsExampleMinDate: NgbDate = ngbDateFromMoment(moment());
  controlsExampleMaxDate: NgbDate = ngbDateFromMoment(moment().endOf('month'));
  controlsExampleDefaultDate: NgbDate = new NgbDate(2019, 3, 23);
  dateMoment = moment('2020/12/12 12:00', 'YYYY/MM/DD HH:mm', true);

  date = new Date(moment().format('MM-DD-YYYY'));
  dateTimeRangeToday = new DateTimeRange({
    startDate: new NgbDate(this.date.getUTCFullYear(), this.date.getUTCMonth() + 1, this.date.getUTCDate() + 1)
  });

  today = moment(new Date);

  @ViewChild('customDatepicker', { static: true }) customDatepicker: DatePickerControlComponent;
  expireNow: boolean = false;

  setDate(datepicker) {
    datepicker.setValue(new NgbDate(2019, 5, 8));
  }

  onCustomActionSelection(selected: boolean) {
    if (selected) {
      this.customDatepicker.calendarDropDown.close();
      this.customDatepicker.setValue();
      this.customDatepicker.dateTextModel = 'Expire Now';
      this.customDatepicker.calendarDatepicker.dateTime = new DateTimeRange();
      this.expireNow = true;
    } else {
      this.expireNow = false;
      if (!this.customDatepicker.date) {
        this.customDatepicker.dateTextModel = '';
      }
    }
  }

  disabledDates(date: NgbDate, current: { year: number, month: number }) {
    return date.day === 2;
  }

  ngOnInit(): void {
  }
}
