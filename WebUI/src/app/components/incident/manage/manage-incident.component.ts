import { Component, OnInit, ViewChild } from "@angular/core";
import { FormBuilder, FormControl, FormGroup, Validators } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { DatePickerControlComponent, DateTimeRange } from "@msi/cobalt";
import { NgbDate } from "@ng-bootstrap/ng-bootstrap";
import * as _ from "lodash";
import { toLower } from "lodash";
import moment from "moment";
import { CustomField } from "../../../models/common/custom-field";
import { Incident } from "../../../models/incident/incident";
import { CommonService } from "../../../services/common/common.service";
import { IncidentService } from "../../../services/incident/incident.service";

@Component({
    templateUrl: './manage-incident.component.html',
    styleUrls: ['./manage-incident.component.scss']
})
export class ManageIncidentComponent implements OnInit {
    incidentForm: FormGroup = null;
    submitted = false;
    formResetting: boolean = true;
    customFields: CustomField[] = [];
    incidentTimeDatePickerValue: string;
    calendarDateTimeDefaultValue: DateTimeRange;
    title: string = 'Create';
    customDatepicker: DatePickerControlComponent;
    calendarDateTimeFields = new Map();

    constructor(private formBuilder: FormBuilder,
        private route: ActivatedRoute,
        private router: Router,
        private incidentService: IncidentService,
        private commonService: CommonService) {
    }

    ngOnInit(): void {
        let mGroupId = this.commonService.createGroupId();
        this.incidentService.getTemplate(mGroupId).subscribe((incident: Incident) => {
            this.customFields = incident.customFields;
            this.buildIncidentForm();
            //  this.setCustomValidators();
        });

        let date = new Date();
        this.calendarDateTimeDefaultValue = new DateTimeRange({
            startDate: new NgbDate(date.getUTCFullYear(), date.getUTCMonth() + 1, date.getUTCDate()),
            startTime: { hour: date.getHours(), minute: date.getMinutes(), second: 0 }
        });
    }

    onCalendarDateChanged($event, calendarFieldId) {
        this.calendarDateTimeDefaultValue = $event;
        this.calendarDateTimeFields.set(calendarFieldId, this.calendarDateTimeDefaultValue)
    }

    get formControls() { return this.incidentForm.controls; }

    // setCustomValidators() {
    //     _.each(this.customFields, field => {
    //         const fieldControl = this.incidentForm.get(field.name);
    //         if (field.isUrl &&
    //             fieldControl.value !== undefined &&
    //             fieldControl.value !== null &&
    //             fieldControl.value !== '') {
    //             fieldControl.setValidators([Validators.pattern(field.validatorPattern)]);
    //             fieldControl.updateValueAndValidity();
    //         }
    //     });
    // }

    buildIncidentForm() {
        this.incidentForm = new FormGroup({});
        for (let i = 0; i < this.customFields.length; i++) {
            let defaultValue = null;
            if (this.customFields[i].fieldType === 'USER_DEFINED') {
                if (this.customFields[i].isBool)
                    defaultValue = (this.customFields[i].defaultValue.bool) ? this.customFields[i].defaultValue.bool : false;
                else
                    defaultValue = (this.customFields[i].defaultValue) ? this.customFields[i].defaultValue.text : '';
            }

            if (this.customFields[i].isUrl) {
                if (this.customFields[i].mandatory) {
                    this.incidentForm.addControl(this.customFields[i].name, new FormControl(defaultValue, [Validators.required, Validators.pattern(this.customFields[i].validatorPattern)]))
                }
                else {
                    this.incidentForm.addControl(this.customFields[i].name, new FormControl(defaultValue))
                }
            }
            else {
                if (this.customFields[i].mandatory) {
                    this.incidentForm.addControl(this.customFields[i].name, new FormControl(defaultValue, Validators.required))
                }
                else {
                    this.incidentForm.addControl(this.customFields[i].name, new FormControl(defaultValue))
                }
            }
        }
    }

    onSubmit() {
        console.log(this.incidentForm)

        this.formResetting = false;
        this.submitted = true;
        if (this.incidentForm.invalid) {
            return;
        }

        _.each(this.customFields, field => {
            let item = {}
            if (field.isText &&
                this.incidentForm.get(field.name).value !== undefined &&
                this.incidentForm.get(field.name).value !== null &&
                this.incidentForm.get(field.name).value !== '') {
                item["text"] = this.incidentForm.get(field.name).value;
            }
            else if (field.isBool) {
                item["bool"] = this.incidentForm.get(field.name).value;
            }
            else if (field.isTimestamp) {
                if (this.calendarDateTimeFields.get(field.id)) {
                    let dateTimeStr = this.calendarDateTimeDefaultValue.startDate.month + "/" + this.calendarDateTimeDefaultValue.startDate.day + "/" + this.calendarDateTimeDefaultValue.startDate.year + " " + this.calendarDateTimeDefaultValue.startTime.hour + ":" + this.calendarDateTimeDefaultValue.startTime.minute;
                    item["timestamp"] = new Date(dateTimeStr).getTime();
                }
            }
            field.value = item;
        });

        let incident = new Incident();
        incident.allCustomFields = this.customFields;
        console.log(incident);
        let mGroupId = this.commonService.createGroupId();
        // this.incidentService.createIncident(mGroupId, incident).subscribe((incident: Incident) => {
        //     this.incidentService.deleteMediaGroup(mGroupId).subscribe();
        //     return this.router.navigateByUrl('/incidents/view/' + incident.id);
        // });
    }
}