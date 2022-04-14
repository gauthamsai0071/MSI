import { Component, EventEmitter, Input, Output } from "@angular/core";

@Component({
    templateUrl: './add-incident.component.html'
})
export class AddIncidentComponent {
    @Input()
    popupParam: { id?: number };

    @Output()
    popupResult: EventEmitter<any>;    

    close(): void {
        if (!this.popupResult.isStopped && this.popupResult.observers !== null) {
            this.popupResult.emit({
                incidentId: 100
            });
        }
    }

    cancel(): void {
        this.popupResult.emit(null);
    }
}