import { ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import _ from "lodash";
import { User } from "../../../models/common/user";
import { IncidentService } from "../../../services/incident/incident.service";
import { IncidentSearchService } from "../../../services/incident/search.service";


@Component({
    templateUrl: './share-incident.component.html',
    styleUrls: ['./share-incident.component.scss']
})
export class shareIncidentComponent implements OnInit {

    @Input()
    popupParam: { mode: string, id: number };

    @Output()
    popupResult: EventEmitter<any>

    // public filteredOwners = new Observable<User[]>();    
    shareIncidentForm: FormGroup
    formResetting: boolean = true;

    owners: User[] = [];
    sharedUsers: string[] = []
    removedSharedUsers: string[] = []
    hasChanged: boolean = false;

    constructor(private formBuilder: FormBuilder,
        private incidentSearchService: IncidentSearchService,
        private incidentService: IncidentService) {
    }

    ngOnInit(): void {
        if (this.popupParam.id > 0) {
            this.getShareIncidentById(this.popupParam.id)
        }

        this.buildshareIncidentForm();
        
        this.incidentSearchService.getOwners().subscribe(responseOwners => {
            this.owners = responseOwners;          
        });

    }
  
    buildshareIncidentForm(): void {
        this.shareIncidentForm = this.formBuilder.group({
            owner: [sessionStorage.getItem("username"), Validators.required],
            restriction: true,
            shared: ['']
        })
    }

    get formControls() { return this.shareIncidentForm.controls; }

    getShareIncidentById(id: number) {
        this.incidentService.getShareIncident(id).subscribe((resposeIncident) => {
            this.sharedUsers=_.map(resposeIncident.sharedWith, item => item.name);  
        })
    }

    addSharedUsers(user) {
        if(this.sharedUsers.indexOf(user) === -1) {
            this.sharedUsers.push(user);
        }
        this.hasChanged = true;
    }

    submit(): void {        
        if (!this.hasChanged) {
            this.popupResult.emit(false);
        }

        this.incidentService.shareIncident(this.popupParam.id, 
                _.map(this.sharedUsers, item => { return {name: item} }), 
                _.map(this.removedSharedUsers, item => { return {name: item} })).subscribe(res => {
                this.popupResult.emit(true);
        });
    }

    cancel(): void {
        this.popupResult.emit(null);
        this.close()
    }

    close(): void {
        if (!this.popupResult.isStopped && this.popupResult.observers !== null) {
            this.popupResult.emit();
        }
    }

    deleteSharedUser(user) {
        if (this.removedSharedUsers.indexOf(user) === -1) {
            this.removedSharedUsers.push(user)
        }

        if (this.sharedUsers.indexOf(user) !== -1) {
            this.sharedUsers = this.sharedUsers.splice((this.sharedUsers.indexOf(user)), 1);
        }

        this.hasChanged = true;        
    }
}