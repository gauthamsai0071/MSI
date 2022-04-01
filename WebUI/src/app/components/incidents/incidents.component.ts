import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { DatePickerControlComponent, DateTimeRange } from '@msi/cobalt';
import { CommonService } from '../../../app/services/common/common.service';
import { IncidentsService } from '../../../app/services/incidents.service';
import moment from 'moment';
import * as _ from 'lodash';
import { Subject } from 'rxjs';
import { Incidents } from '../../../app/models/incidents.model';
import { NgbDate } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-incidents',
  templateUrl: './incidents.component.html',
  styleUrls: ['./incidents.component.scss']
})
export class IncidentsComponent implements OnInit {

  incidentForm: FormGroup;
  isSubmitted = false;
  csrfToken = '';
  formResetting: boolean = true;
  customFields: any[] = [];
  requestArray: any[] = [];
  output: JSON;
  obj: any;
  incidentId: number;
  creationTime: number;
  updateTime: number;
  incidentTime: number;
  incidentTimeStamp: number;
  clipCount: string;
  owner: string;
  signature: string;
  isEdit: boolean = false;
  isAdd: boolean = false;
  pageMode: string;
  version: number;
  getVersion: number;
  getSignature: string;
  incidentTimeDatePickerValue: any;
  isVisibleMsiCalendar: boolean = true;
  isVisibleCalendar: boolean = false;
  date: any;
  incidentTimeDefaultValue: any;
  subject = new Subject();

  @ViewChild('customDatepicker', { static: true }) customDatepicker: DatePickerControlComponent;

  constructor(private incidentService: IncidentsService, private router: Router, private aRouter: ActivatedRoute, private formBuilder: FormBuilder, private commonService: CommonService, private changeDetectorRef: ChangeDetectorRef) {
    const url: string = this.aRouter.routeConfig.path;

    if (url === "incidents/create") {
      this.pageMode = "Add";
      this.isAdd = true;
      this.isEdit = false;
    } else if (url === "incidents/edit/:id") {
      this.pageMode = "Edit";
      this.isEdit = true;
      this.isAdd = false;
    } else {
      this.pageMode = "View";
      this.isEdit = false;
      this.isAdd = false;
      this.isVisibleCalendar = true;
      this.isVisibleMsiCalendar = false;
    }

    if (!this.isAdd) {
      const routeParams = this.aRouter.snapshot.paramMap;
      const id = Number(routeParams.get('id'));
      this.incidentId = id;
    }
  }

  onCalendarDateChanged($event) {
    if (this.customDatepicker) {
      this.incidentTimeDatePickerValue = this.customDatepicker.dateTextModel;
    }
  }

  ngOnInit(): void {
    this.incidentForm = this.formBuilder.group({
      title: ['', Validators.required],
      "creation-time": [{ value: '', disabled: true }],
      "update-time": [{ value: '', disabled: true }],
      "incident-time": [''],
      "reference-code": [''],
      notes: [''],
      "clip-count": [{ value: 'None', disabled: true }],
      owner: [{ value: sessionStorage.getItem('username'), disabled: true }],
      signature: [{ value: '', disabled: true }],
    });

    // Disable at View Time
    if (!this.isAdd && !this.isEdit) {
      this.incidentForm.get("title")?.disable();
      this.incidentForm.get("reference-code")?.disable();
      this.incidentForm.get("incident-time")?.disable();
      this.incidentForm.get("notes")?.disable();
    }

    // Called at View & Edit time to View Data
    if (!this.isAdd) {
      this.incidentService.getIncident(this.incidentId).subscribe((incidents: Incidents) => {
        this.getVersion = incidents.version
        this.getSignature = incidents.signature;

        if (incidents.customFields.length > 0) {

          incidents.customFields.forEach((data: any) => {
            let formValue = '';
            switch (data.name) {
              case 'creation-time':
                if (data.value) {
                  this.creationTime = data.value;
                  formValue = moment(data.value.timestamp).format("DD/MM/YYYY HH:mm");
                }
                else {
                  formValue = '';
                }
                break;
              case 'update-time':
                if (data.value) {
                  this.updateTime = data.value;
                  formValue = moment(data.value.timestamp).format("DD/MM/YYYY HH:mm");
                }
                else {
                  formValue = '';
                }
                break;
              case 'incident-time':
                if (data.value) {
                  this.incidentTime = data.value;
                  this.incidentTimeStamp = data.value.timestamp;
                  this.subject.next(moment(data.value.timestamp).format("DD/MM/YYYY HH:mm"));
                  formValue = moment(data.value.timestamp).format("DD/MM/YYYY HH:mm");
                }
                else {
                  formValue = '';
                }
                break;
              case 'clip-count':
                if (data.value) {
                  this.clipCount = data.value;
                  formValue = data.value.text;
                }
                else {
                  formValue = '';
                }
                break;
              case 'owner':
              case 'signature':
                if (data.value) {
                  this["data.name"] = data.value;
                  formValue = data.value.text;
                }
                else {
                  formValue = '';
                }
                break;
              default:
                formValue = (data.value) ? data.value.text : '';
                break;
            }
            this.incidentForm.get(data.name)?.patchValue(formValue);
          });
        }
      });
    }

    if (this.isAdd) {
      this.date = new Date(moment().format('MM-DD-YYYY HH:mm'));
      this.incidentTimeDefaultValue = new DateTimeRange({
        startDate: new NgbDate(this.date.getUTCFullYear(), this.date.getUTCMonth() + 1, this.date.getUTCDate()),
        startTime: { hour: this.date.getHours(), minute: this.date.getMinutes(), second: 0 }
      });
    }

    if (this.isEdit) {
      this.subject.subscribe((val: string) => {
        this.customDatepicker.dateTextModel = val;
      });
    }
  }

  ngOnDestroy() {
    this.subject.unsubscribe();
  }

  ngAfterViewChecked() {
    this.changeDetectorRef.detectChanges();
  }

  ngAfterViewInit() {
  }

  get formControls() { return this.incidentForm.controls; }

  /**
   * To create the incident.
   * 
   * @returns 
   */
  createIncident() {
    this.formResetting = false;

    this.isSubmitted = true;
    if (this.incidentForm.invalid) {
      return;
    }

    const formValue = this.incidentForm.value;
    if (this.incidentTimeDatePickerValue !== '') {
      this.incidentTimeDatePickerValue = this.commonService.convertStringToTimesamp(this.incidentTimeDatePickerValue);
    }

    // API call : To get custom template infos
    let mGroupId = this.commonService.createGroupId();
    this.incidentService.getTemplate(mGroupId).subscribe((incidents: Incidents) => {
      let customFieldMap = new Map();

      if (incidents.customFields.length > 0) {
        incidents.customFields.forEach((data: any, mainIndex: any) => {
          customFieldMap.set(data.name, data.id);
        });
      }

      if (customFieldMap.size > 0) {
        for (let key in formValue) {
          if (key !== 'incident-time') {
            this.customFields.push({
              "id": customFieldMap.get(key),
              "name": key,
              "value": { "text": formValue[key] }
            });
          }
          else {
            this.customFields.push({
              "id": customFieldMap.get(key),
              "name": key,
              "value": { "timestamp": this.incidentTimeDatePickerValue }
            });
          }
        }
        this.customFields.push({
          "id": customFieldMap.get("creation-time"),
          "name": "creation-time",
          "value": {}
        }, {
          "id": customFieldMap.get("update-time"),
          "name": "update-time",
          "value": {}
        });

        this.requestArray.push({
          "customFields": this.customFields
        })

        // API call : To create incident
        this.incidentService.createIncident(mGroupId, this.requestArray[0]).subscribe((incidents: Incidents) => {
          // Delete Media Group
          this.incidentService.deleteMediaGroup(mGroupId).subscribe();
          return this.router.navigateByUrl('/incidents/' + incidents.id);
        });
      }
    });
  }

  /**
   * To update the incident.
   * 
   * @returns 
   */
  updateIncident() {
    this.formResetting = false;

    this.isSubmitted = true;
    if (this.incidentForm.invalid) {
      return; ``
    }

    const formValue = this.incidentForm.value;
    if (this.incidentTimeDatePickerValue !== '') {
      this.incidentTimeDatePickerValue = this.commonService.convertStringToTimesamp(this.incidentTimeDatePickerValue);
    }

    // API call : To get custom template infos
    let mGroupId = this.commonService.createGroupId();
    this.incidentService.getTemplate(mGroupId).subscribe((incidents: Incidents) => {
      let customFieldMap = new Map();

      if (incidents.customFields.length > 0) {
        incidents.customFields.forEach((data: any, mainIndex: any) => {
          customFieldMap.set(data.name, data.id);
        });
      }

      if (customFieldMap.size > 0) {
        for (let key in formValue) {
          if (key === 'incident-time') {
            this.customFields.push({
              "id": customFieldMap.get(key),
              "name": key,
              "value": { "timestamp": this.incidentTimeDatePickerValue }
            });
          }
          else {
            this.customFields.push({
              "id": customFieldMap.get(key),
              "name": key,
              "value": { "text": formValue[key] }
            });
          }
        }
        this.customFields.push({
          "id": customFieldMap.get("creation-time"),
          "name": "creation-time",
          "value": this.creationTime
        }, {
          "id": customFieldMap.get("update-time"),
          "name": "update-time",
          "value": {}
        },
          {
            "id": customFieldMap.get("clip-count"),
            "name": "clip-count",
            "value": this.clipCount
          }, {
          "id": customFieldMap.get("owner"),
          "name": "owner",
          "value": this.owner
        },
          {
            "id": customFieldMap.get("signature"),
            "name": "signature",
            "value": this.signature
          });

        this.requestArray.push({
          "id": this.incidentId,
          "version": this.getVersion,
          "signature": this.getSignature,
          "owner": incidents.owner,
          "customFields": this.customFields
        })

        // API call : To update incident
        this.incidentService.updateIncident(this.incidentId, mGroupId, this.requestArray[0]).subscribe((incidents: Incidents) => {
          return this.router.navigateByUrl('/incidents/' + incidents.id);
        });
      }
    });
  }

  view() {
    this.router.navigateByUrl("/incidents/" + this.incidentId)
  }
}
