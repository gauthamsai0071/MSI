import { Component, OnInit, ViewChild } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { DatePickerControlComponent, DateTimeRange } from "@msi/cobalt";
import { NgbDate } from "@ng-bootstrap/ng-bootstrap";
import _, { toLower } from "lodash";
import moment from "moment";
import { Incident } from "../../../models/incident/incident";
import { CommonService } from "../../../services/common/common.service";
import { IncidentService } from "../../../services/incident/incident.service";

@Component({
    templateUrl: './manage-incident.component.html',
    styleUrls: ['./manage-incident.component.scss']
})
export class ManageIncidentComponent implements OnInit {

    incidentForm: FormGroup = null;
    incidentId: number = 0;
    submitted = false;
    view: boolean = false;
    formResetting: boolean = true;
    incidentTimeDatePickerValue: string;
    incidentTimeDefaultValue: DateTimeRange;
    getVersion: number;
    getSignature: string;
    title: string = "Create";
    private textFields = ["title", "reference-code", "notes", "signature"];
    private dateTimeFields = ["creation-time", "update-time", "incident-time"];

    @ViewChild('customDatepicker', { static: true }) customDatepicker: DatePickerControlComponent;

    constructor(private formBuilder: FormBuilder, private route: ActivatedRoute, private router: Router, private incidentService: IncidentService, private commonService: CommonService) {
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
        this.buildIncidentForm();

        if (this.incidentId === undefined) {
            let date = new Date(moment().format('MM-DD-YYYY HH:mm'));
            this.incidentTimeDefaultValue = new DateTimeRange({
                startDate: new NgbDate(date.getUTCFullYear(), date.getUTCMonth() + 1, date.getUTCDate())
            });
            //,  startTime: { hour: date.getHours(), minute: date.getMinutes(), second: 0 }

        }
        else {
            this.getIncidentById(this.incidentId);
        }
    }

    onCalendarDateChanged($event) {
        if (this.customDatepicker) {
            this.incidentTimeDatePickerValue = this.customDatepicker.dateTextModel;
        }
    }

    getIncidentById(id: number) {
        let field = null;
        this.incidentService.getIncident(this.incidentId).subscribe((incident: Incident) => {
            this.getVersion = incident.version;
            this.getSignature = incident.signature;
            _.each(this.textFields, data => {
                field = incident.customFields.find(item => toLower(item.name) == toLower(data));
                if (field.value !== undefined)
                    this.incidentForm.get(data).patchValue(field.value.text);
            });

            _.each(this.dateTimeFields, dateTimeData => {
                field = incident.customFields.find(item => toLower(item.name) == toLower(dateTimeData));
                let dateTimeValue = moment(field.value.timestamp).format("DD/MM/YYYY HH:mm");
                if (dateTimeData === 'incident-time') {
                    //this.customDatepicker.dateChange.subscribe((value) => {
                    this.customDatepicker.dateTextModel = dateTimeValue;
                    //});
                } else {
                    this.incidentForm.get(dateTimeData).patchValue(dateTimeValue);
                }
            });
        });
    }

    onSubmit() {
        this.formResetting = false;
        this.submitted = true;
        if (this.incidentForm.invalid) {
            return;
        }

        const formValue = this.incidentForm.value;

        if (this.incidentTimeDatePickerValue !== '') {
            this.incidentTimeDatePickerValue = this.commonService.convertStringToTimesamp(this.incidentTimeDatePickerValue);
        }

        let mGroupId = this.commonService.createGroupId();
        let fields = null;
        this.incidentService.getTemplate(mGroupId).subscribe((incident: Incident) => {

            _.each(this.textFields, data => {
                fields = incident.customFields.find(item => toLower(item.name) == toLower(data));
                let formFieldValue = this.incidentForm.get(data).value;
                if (fields !== undefined && formFieldValue !== '') {
                    fields.value = { "text": formFieldValue };
                }
            });

            fields = incident.customFields.find(item => toLower(item.name) == toLower("incident-time"));
            if (fields !== undefined && this.incidentTimeDatePickerValue !== '') {
                fields.value = { "timestamp": Number(this.incidentTimeDatePickerValue) };
            }

            if (this.incidentId === undefined) {
                this.incidentService.createIncident(mGroupId, incident).subscribe((incident: Incident) => {
                    this.incidentService.deleteMediaGroup(mGroupId).subscribe();
                    return this.router.navigateByUrl('/incidents/view/' + incident.id);
                });
            }
            else {
                incident.id = this.incidentId;
                incident.signature = this.getSignature;
                incident.version = this.getVersion;

                this.incidentService.updateIncident(this.incidentId, mGroupId, incident).subscribe((incident: Incident) => {
                    return this.router.navigateByUrl('/incidents/view/' + incident.id);
                });
            }
        });
    }

    buildIncidentForm(): void {
        this.incidentForm = this.formBuilder.group({
            title: ['', Validators.required],
            "creation-time": [''],
            "update-time": [''],
            "incident-time": [''],
            "reference-code": [''],
            notes: [''],
            nClips: ['None'],
            owner: [sessionStorage.getItem('username')],
            signature: [''],
        });
    }

    get formControls() { return this.incidentForm.controls; }
}