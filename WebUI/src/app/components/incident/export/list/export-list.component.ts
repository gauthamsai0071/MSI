import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { Export } from "../../../..//models/incident/export/export";
import { IncidentService } from "../../../../services/incident/incident.service";

@Component({
    templateUrl: './export-list.component.html',
    styleUrls: ['./export-list.component.scss']
})
export class ExportListComponent implements OnInit {

    results: Export[] = [];

    constructor(private router: Router, private incidentService: IncidentService) {
    }

    ngOnInit() {
        this.incidentService.getAllExports().subscribe(result => {
            this.results = result;
        });
    }

    downloadExport(id: number) {
        this.incidentService.downloadExportById(id).subscribe();
    }

    deleteExport(id: number) {
        this.incidentService.deleteExportById(id).subscribe();
    }
}   