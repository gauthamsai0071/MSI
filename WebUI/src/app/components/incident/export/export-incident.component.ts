import { Component, OnInit } from "@angular/core";
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

@Component({
    templateUrl: './export-incident.component.html',
    styleUrls: ['./export-incident.component.scss']
})
export class ExportIncidentComponent implements OnInit {

    exportForm: FormGroup = null;
    incidentId: number = 0;
    submitted = false;
    formResetting: boolean = true;
    profileSelectedValue: number;
    incident: Incident = null;
    export: Export;
    exportProfile: ExportProfile;
    mGroupId: string | null;

    constructor(private formBuilder: FormBuilder, private route: ActivatedRoute, private router: Router, private incidentService: IncidentService, private commonService: CommonService) {
    }

    ngOnInit(): void {
        this.incidentId = this.route.snapshot.params['id'];
        this.buildExportForm();

        this.mGroupId = this.commonService.createGroupId();
        forkJoin([
            this.incidentService.getIncident(this.incidentId),
            this.incidentService.getExportTemplate(this.incidentId, this.mGroupId)
        ]).subscribe(([responseIncidents, responseExport]) => {
            this.incident = responseIncidents;

            let field = this.incident.customFields.find(item => toLower(item.name) == toLower("title"));
            this.incident.title = field !== undefined ? field.value.text : '';
            if (field.value !== undefined)
                this.exportForm.get("description").setValue(field.value.text);

            this.export = responseExport;
            this.exportForm.patchValue({
                exportProfile: {
                    id: this.export.profiles[0].id
                }
            })
        });
    }

    outputSelectChanges() {
        this.profileSelectedValue = this.exportForm.get("exportProfile.id").value;
    }

    onSubmit() {
        this.formResetting = false;
        this.submitted = true;
        if (this.exportForm.invalid) {
            return;
        }

        const formValue = this.exportForm.value;
        this.incidentService.createExport(this.incidentId, formValue).subscribe((response: ExportProfile) => {
            this.incidentService.deleteMediaGroup(this.mGroupId).subscribe();
            return this.router.navigateByUrl('/incidents/exports');
        });
    }

    buildExportForm(): void {
        this.exportForm = this.formBuilder.group({
            description: ['', Validators.required],
            exportProfile: this.formBuilder.group({
                id: ''
            })
        });
    }

    get formControls() { return this.exportForm.controls; }

}    