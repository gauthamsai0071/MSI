import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { DialogService } from "../../../../services/common/dialog.service";
import { Export } from "../../../../models/incident/export/export";
import { IncidentService } from "../../../../services/incident/incident.service";
import { CommonService } from "../../../../services/common/common.service";
import { ExportIncidentComponent } from "../export-incident.component";

@Component({
    templateUrl: './export-list.component.html',
    styleUrls: ['./export-list.component.scss']
})
export class ExportListComponent implements OnInit {

    @Input()
    popupParam: { mode: string, id: number };

    @Output()
    popupResult: EventEmitter<any>;

    results: Export[] = [];

    constructor(private dialogService: DialogService, private commonService: CommonService, private incidentService: IncidentService) {
    }

    ngOnInit() {
        this.incidentService.getAllExports().subscribe(result => {
            this.results = result;
        });
    }

    manageExport(mode: string, exports: Export): void {
        const title = mode.charAt(0).toUpperCase() + mode.slice(1);
        if (mode === 'download') {
            this.incidentService.downloadExportById(exports.id).subscribe(response => {
                this.commonService.downloadFile(response, 'export-' + exports.signature + '.zip');
            });
        }
        else {
            const componentName = (mode === 'delete') ? ExportListComponent : ExportIncidentComponent;
            this.dialogService.showDialog(title + ' Export', componentName, exports.id, { mode: mode, id: exports.id })
                .subscribe(result => {
                });
        }
    }

    close(): void {
        if (!this.popupResult.isStopped && this.popupResult.observers !== null) {
            this.popupResult.emit();
        }
    }

    cancel(): void {
        this.popupResult.emit(null);
    }
}   