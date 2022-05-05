import { Component, Input } from "@angular/core";
import { MsiModalRef, ToastService } from "@msi/cobalt";
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
    message: string;

    @Input()
    id: number;

    constructor(
        private dialogRef: MsiModalRef,
        private toastService: ToastService,
        private incidentService: IncidentService) {
    }

    delete() {
        if (this.type === 'export') {
            this.incidentService.deleteExportById(this.id).subscribe();
        }
        else if (this.type === 'incident') {
            this.incidentService.deleteIncident(this.id).subscribe();
        }
        const title = this.type.charAt(0).toUpperCase() + this.type.slice(1);
        this.toastService.success(title + " deleted successfully.", undefined, { autoDismiss: 5000, closeButton: true });
        this.dialogRef.close(true);
    }

    cancel(): void {
        this.dialogRef.close(true);
    }

}     