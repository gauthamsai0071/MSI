import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import _, { toLower } from "lodash";
import { forkJoin } from "rxjs";
import { Export } from "../../../models/incident/export/export";
import { ExportProfile } from "../../../models/incident/export/exportProfile"
import { } from "../../../models/incident/export/export";
import { Incident } from "../../../models/incident/incident";
import { IncidentService } from "../../../services/incident/incident.service";
import { CommonService } from "../../../services/common/common.service";
import { ToastService } from "@msi/cobalt";

@Component({
    templateUrl: './export-incident.component.html',
    styleUrls: ['./export-incident.component.scss']
})
export class ExportIncidentComponent implements OnInit {

    @Input()
    popupParam: { mode: string, id: number, rows: [] };

    @Output()
    popupResult: EventEmitter<any>;

    exportForm: FormGroup = null;
    submitted = false;
    formResetting: boolean = true;
    profileSelectedValue: string;
    incident: Incident = null;
    export: Export;
    exportProfile: ExportProfile;
    mGroupId: string | null;

    constructor(private formBuilder: FormBuilder, private incidentService: IncidentService, private commonService: CommonService, private toastService: ToastService) {
    }

    ngOnInit(): void {
        this.buildExportForm();

        this.mGroupId = this.commonService.createGroupId();
        forkJoin([
            this.incidentService.getIncident(this.popupParam.id),
            this.incidentService.getExportTemplate(this.popupParam.id, this.mGroupId)
        ]).subscribe(([responseIncidents, responseExport]) => {
            this.incident = responseIncidents;

            let field = this.incident.customFields.find(item => toLower(item.name) == toLower("title"));
            this.incident.title = field !== undefined ? field.value.text : '';
            if (field.value !== undefined)
                this.exportForm.get("description").setValue(field.value.text);

            this.export = responseExport;
            this.exportForm.get("exportProfile.profileId").setValue(this.export.profiles[0].type);
        });
        this.exportForm.get("exportProfile.profileDvdFormat").setValue(false);
    }

    outputSelectChanges() {
        this.profileSelectedValue = this.exportForm.get("exportProfile.profileId").value;
    }

    onSubmit() {
        this.formResetting = false;
        this.submitted = true;
        if (this.exportForm.invalid) {
            return;
        }

        let form = this.exportForm;
        _.each(this.export.profiles, data => {
            if (data.type === this.profileSelectedValue) {
                form.get("exportProfile.id").setValue(data.id);
            }
        });

        _.unset(form.value, 'exportProfile.profileId');

        this.incidentService.createExport(this.popupParam.id, form.value).subscribe((response: ExportProfile) => {
            this.incidentService.deleteMediaGroup(this.mGroupId).subscribe();
            this.close();
        }, (error) => {
            if (error.status === 400 && error.error.errorKey === 'errorExportingIncidentNoClipsFound') {
                this.toastService.error("Error while exporting incident: the export contains no clips.", undefined, { autoDismiss: 5000, closeButton: true });
            }
        });
    }

    buildExportForm(): void {
        this.exportForm = this.formBuilder.group({
            description: ['', Validators.required],
            exportProfile: this.formBuilder.group({
                profileId: '',
                id: '',
                profileDvdFormat: true,
                profileSelectMedia: 4.7,
                includeFootage: true,
                includeConvertedFootage: false,
                includeMetadata: false
            })
        });
    }

    get formControls() { return this.exportForm.controls; }

    close(): void {
        if (!this.popupResult.isStopped && this.popupResult.observers !== null) {
            this.popupResult.emit();
        }
    }

    cancel(): void {
        this.popupResult.emit(null);
    }

}    