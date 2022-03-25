import { DOCUMENT } from '@angular/common';
import { ChangeDetectorRef, Component, ElementRef, Inject, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import moment from 'moment';
import { CommonService } from 'src/app/services/common/common.service';
import * as _ from 'lodash';
import { IncidentsService } from 'src/app/services/incidents.service';
import { DatePickerControlComponent, DateTimeRange } from '@msi/cobalt';
import { NgbDate } from '@ng-bootstrap/ng-bootstrap';
import { Subject } from 'rxjs';

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
  templateData: any[] = [];
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
  @ViewChild('incidentTimeView') incidentTimeView: ElementRef;

  constructor(@Inject(DOCUMENT) private _document: any, private incidentService: IncidentsService, private router: Router, private aRouter: ActivatedRoute, private formBuilder: FormBuilder, private commonSrv: CommonService, private changeDetectorRef: ChangeDetectorRef) {
    const urlLength = this.aRouter.snapshot.url.length;
    const url: string = this.aRouter.snapshot.url.join('/');

    if (url.indexOf("incidents/create") != -1) {
      this.pageMode = "Add";
      this.isAdd = true;
      this.isEdit = false;
    } else if (url.indexOf("incidents/edit") != -1) {
      this.pageMode = "Edit";
      this.isEdit = true;
      this.isAdd = false;
    }
    else {
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
      this.incidentService.getIncident(this.incidentId).subscribe(incident => {
        let responeIncident: any = incident;
        this.getVersion = responeIncident.version
        this.getSignature = responeIncident.signature;
        this.templateData = _.entries(responeIncident);
        if (this.templateData.length > 0) {
          if (this.templateData[4][0] === 'customFields') {
            this.templateData[4][1].forEach((data: any, mainIndex: any) => {
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
        }
      });
    }

    if (this.isAdd) {
      this.date = new Date(moment().format('MM-DD-YYYY HH:mm'));
      this.incidentTimeDefaultValue = new DateTimeRange({
        startDate: new NgbDate(this.date.getUTCFullYear(), this.date.getUTCMonth() + 1, this.date.getUTCDate() + 1),
        startTime: { hour: this.date.getHours(), minute: this.date.getMinutes(), second: 0 }
      });
    }

    if (this.isEdit) {
      this.subject.subscribe((val: string) => {
        this.customDatepicker.dateTextModel = val;
      });
      //subject.complete();
    }
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
      this.incidentTimeDatePickerValue = this.commonSrv.convertStringToTimesamp(this.incidentTimeDatePickerValue);
    }

    // API call : To get custom template infos
    let mGroupId = this.commonSrv.createGroupId();
    this.incidentService.getTemplate(mGroupId).subscribe(res => {
      let customFieldMap = new Map();
      let responseTemplate: any = res;
      this.templateData = _.entries(responseTemplate);

      if (this.templateData.length > 0) {
        if (this.templateData[2][0] === 'customFields') {
          this.templateData[2][1].forEach((data: any, mainIndex: any) => {
            customFieldMap.set(data.name, data.id);
          });
        }
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
        this.incidentService.createIncident(mGroupId, this.requestArray[0]).subscribe(results => {
          let responseIncident: any = results;
          // Delete Media Group
          this.incidentService.deleteMediaGroup(mGroupId).subscribe(results => {
          });
          return this.router.navigateByUrl('/incidents/' + responseIncident.id);
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
      this.incidentTimeDatePickerValue = this.commonSrv.convertStringToTimesamp(this.incidentTimeDatePickerValue);
    }

    // API call : To get custom template infos
    let mGroupId = this.commonSrv.createGroupId();
    this.incidentService.getTemplate(mGroupId).subscribe(res => {
      let customFieldMap = new Map();
      let responseTemplate: any = res;
      this.templateData = _.entries(responseTemplate);

      if (this.templateData.length > 0) {
        if (this.templateData[2][0] === 'customFields') {
          this.templateData[2][1].forEach((data: any, mainIndex: any) => {
            customFieldMap.set(data.name, data.id);
          });
        }
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
          "owner": responseTemplate.owner,
          "customFields": this.customFields
        })

        // API call : To update incident
        this.incidentService.updateIncident(this.incidentId, mGroupId, this.requestArray[0]).subscribe(results => {
          let responseIncident: any = results;
          return this.router.navigateByUrl('/incidents/' + responseIncident.id);
        });
      }
    });
  }

  view() {
    this.router.navigateByUrl("/incidents/" + this.incidentId)
  }
}
