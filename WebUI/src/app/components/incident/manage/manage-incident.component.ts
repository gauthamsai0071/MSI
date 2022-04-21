import { Component, OnInit } from "@angular/core";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { DateTimeRange } from "@msi/cobalt";
import { NgbDate } from "@ng-bootstrap/ng-bootstrap";
import * as _ from "lodash";
import { IDropdownSettings } from "ng-multiselect-dropdown";
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
    calendarDateTimeDefaultValue: DateTimeRange;
    title: string = 'Create';
    calendarDateTimeFields = new Map();
    multiSelectFields = new Map();
    checkBoxFields = new Map();
    dropdownSettings: IDropdownSettings = {};
    view: boolean = false;
    incidentId: number = 0;
    version: number;
    signature: string;
    selectedItems = [];
    selectedCheckboxItems = [];

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private incidentService: IncidentService,
        private commonService: CommonService) {
    }

    ngOnInit(): void {

        let url: string = this.route.routeConfig.path;
        if (url === "view/:id") {
            this.view = true;
            this.title = "View";
        }
        else if (url === "edit/:id") {
            this.title = "Edit";
        }

        this.incidentId = this.route.snapshot.params['id'];

        let mGroupId = this.commonService.createGroupId();
        this.incidentService.getTemplate(mGroupId).subscribe((incident: Incident) => {
            this.customFields = incident.customFields;
            this.buildIncidentForm();

            if (this.incidentId !== undefined) {
                this.getIncidentById(this.incidentId);
            }
        });

        if (this.incidentId === undefined) {
            let date = new Date();
            this.calendarDateTimeDefaultValue = new DateTimeRange({
                startDate: new NgbDate(date.getUTCFullYear(), date.getUTCMonth() + 1, date.getUTCDate()),
                startTime: { hour: date.getHours(), minute: date.getMinutes(), second: 0 }
            });
        }
    }

    getIncidentById(id: number) {

        this.incidentService.getIncident(this.incidentId).subscribe((incident: Incident) => {
            this.version = incident.version;
            this.signature = incident.signature;

            _.each(incident.customFields, field => {
                if (field.isTimestamp) {
                    let date = new Date(field.value.timestamp);
                    this.calendarDateTimeDefaultValue = new DateTimeRange({
                        startDate: new NgbDate(date.getUTCFullYear(), date.getUTCMonth() + 1, date.getUTCDate()),
                        startTime: { hour: date.getHours(), minute: date.getMinutes(), second: 0 }
                    });
                    this.incidentForm.get(field.name).patchValue(this.calendarDateTimeDefaultValue);
                } else if (field.isBool) {
                    this.incidentForm.get(field.name).patchValue(field.value.bool);
                } else if (field.isEnumeration) {
                    if (field.displayName.includes(',multiselect,') && field.value !== undefined) {
                        this.selectedItems = field.value.text.split(",");
                        this.incidentForm.get(field.name).patchValue(this.selectedItems);
                    }
                    else if (field.displayName.includes(',checkbox,') && field.value !== undefined) {
                        _.each(field.validValues, value => {
                            _.includes(field.value.text.split(","), value) ? this.selectedCheckboxItems.push(value) : this.selectedCheckboxItems.push(null)
                        });
                    }
                    else {
                        if (field.value !== undefined)
                            this.incidentForm.get(field.name).patchValue(field.value.text);
                    }
                }
                else {
                    if (field.value !== undefined)
                        this.incidentForm.get(field.name).patchValue(field.value.text);
                }
            });
        });
    }

    onCalendarDateChanged($event, calendarFieldId) {
        this.calendarDateTimeDefaultValue = $event;
        this.calendarDateTimeFields.set(calendarFieldId, this.calendarDateTimeDefaultValue)
    }

    onMultiSelectChanged($event, fieldId, type) {
        if ($event instanceof Array) {
            this.multiSelectFields.set(fieldId, $event)
        }
        else {
            if (!this.multiSelectFields.has(fieldId))
                this.multiSelectFields.set(fieldId, []);

            if (this.multiSelectFields.get(fieldId).includes($event)) {
                if (!type)
                    this.multiSelectFields.get(fieldId).pop($event)
            }
            else {
                if ($event !== undefined)
                    this.multiSelectFields.get(fieldId).push($event);
            }
        }
    }

    onCheckboxChange($event, value, fieldId) {
        if ($event) {
            if (!this.checkBoxFields.has(fieldId)) {
                this.checkBoxFields.set(fieldId, []);
            }
            this.checkBoxFields.get(fieldId).push(value);
        }
        else {
            const index = this.checkBoxFields?.get(fieldId)?.indexOf(value);
            this.checkBoxFields?.get(fieldId)?.splice(index, 1);
        }
    }

    get formControls() { return this.incidentForm.controls; }

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

            let validators = [Validators.required];
            if (this.customFields[i].isUrl) {
                validators.push(Validators.pattern(this.customFields[i].validatorPattern));
            }

            if (this.customFields[i].mandatory) {
                this.incidentForm.addControl(this.customFields[i].name, new FormControl(defaultValue, validators))
            }
            else {
                this.incidentForm.addControl(this.customFields[i].name, new FormControl(defaultValue))
            }
        }
    }

    onSubmit() {
        this.formResetting = false;
        this.submitted = true;
        if (this.incidentForm.invalid) {
            return;
        }

        _.each(this.customFields, field => {
            let item = {}
            if ((field.isText || field.isUrl) &&
                this.incidentForm.get(field.name).value !== undefined &&
                this.incidentForm.get(field.name).value !== null &&
                this.incidentForm.get(field.name).value !== '') {
                item["text"] = this.incidentForm.get(field.name).value;
            }
            else if (field.isBool) {
                item["bool"] = this.incidentForm.get(field.name).value;
            }
            else if (field.isTimestamp && field.fieldType === 'USER_DEFINED' && this.calendarDateTimeFields.get(field.id)) {
                let dateTimeStr = this.calendarDateTimeDefaultValue.startDate.month + "/" + this.calendarDateTimeDefaultValue.startDate.day + "/" + this.calendarDateTimeDefaultValue.startDate.year + " " + this.calendarDateTimeDefaultValue.startTime.hour + ":" + this.calendarDateTimeDefaultValue.startTime.minute;
                item["timestamp"] = new Date(dateTimeStr).getTime();
            } else if (field.isEnumeration) {
                if (this.multiSelectFields.get(field.id)) {
                    item["text"] = this.multiSelectFields.get(field.id).join(",");
                } else if (this.checkBoxFields.get(field.id)) {
                    item["text"] = this.checkBoxFields.get(field.id).join(",");
                } else {
                    item["text"] = this.incidentForm.get(field.name).value;
                }
            }
            field.value = item;
        });

        let incident = new Incident();
        incident.allCustomFields = this.customFields;
        let mGroupId = this.commonService.createGroupId();

        if (this.incidentId === undefined) {
            this.incidentService.createIncident(mGroupId, incident).subscribe((incident: Incident) => {
                this.incidentService.deleteMediaGroup(mGroupId).subscribe();
                return this.router.navigateByUrl('/incidents/view/' + incident.id);
            });
        }
        else {
            incident.id = this.incidentId;
            incident.signature = this.signature;
            incident.version = this.version;

            this.incidentService.updateIncident(this.incidentId, mGroupId, incident).subscribe((incident: Incident) => {
                return this.router.navigateByUrl('/incidents/view/' + incident.id);
            });
        }
    }
}