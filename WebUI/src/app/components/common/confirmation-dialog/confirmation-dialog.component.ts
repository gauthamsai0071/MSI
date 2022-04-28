import { Component, Input } from "@angular/core";
import { MsiModalRef } from "@msi/cobalt";
import { IncidentService } from "../../../services/incident/incident.service";

@Component({
    selector: 'app-confirmation-dialog',
    templateUrl: './confirmation-dialog.component.html',
    styleUrls: ['./confirmation-dialog.component.scss']
})
export class ConfirmationDialogComponent {

    @Input()
    type: string;

    @Input()
    id: number;

    constructor(private dialogRef: MsiModalRef, private incidentService: IncidentService) {
    }

    delete() {
        if (this.type === 'export') {
            this.incidentService.deleteExportById(this.id).subscribe();
        }
        else if(this.type === 'incident') {
            this.incidentService.deleteIncident(this.id).subscribe();
        }
        
        this.dialogRef.close(true);
    }

    cancel(): void {
        this.dialogRef.close(true);
    }

}     