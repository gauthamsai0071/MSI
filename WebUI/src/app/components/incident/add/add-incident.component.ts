import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";

@Component({
    templateUrl: './add-incident.component.html'
})
export class AddIncidentComponent implements OnInit {
    @Input()
    popupParam: { id?: number };

    @Output()
    popupResult: EventEmitter<any>;

    ngOnInit(): void {        
    }

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