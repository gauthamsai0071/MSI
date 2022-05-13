import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import _, { initial, toLower } from "lodash";
import { forkJoin, Observable } from "rxjs";
import { map, share, startWith } from "rxjs/operators";
import { User } from "src/app/models/common/user";
import { Incident } from "src/app/models/incident/incident";
import { AuthService } from "src/app/services/auth/auth.service";
import { CommonService } from "src/app/services/common/common.service";
import { IncidentService } from "src/app/services/incident/incident.service";
import { IncidentSearchService } from "src/app/services/incident/search.service";


@Component({
    templateUrl: './share-incident.component.html',
    styleUrls: ['./share-incident.component.scss']
})
export class shareIncidentComponent implements OnInit {

    @Input()
    popupParam: { mode: string, id: number };
    @Output()
    popupResult: EventEmitter<any>

    public filteredOwners = new Observable<User[]>();
    sharedUsers = []
    shareIncidentForm: FormGroup
    formResetting: boolean = true;
    owners: User[] = [];
    removedSharedUsers = []
    sharedData = {}
    toastService: any;
    initialShare:any
    view: boolean = true
    constructor(private formBuilder: FormBuilder,
        private incidentSearchService: IncidentSearchService,
        private incidentService: IncidentService,
        private incident: Incident) {
    }
    ngOnInit(): void {
        if (this.popupParam.id > 0) {
            this.getShareIncidentById(this.popupParam.id)
        }

        this.buildshareIncidentForm();
        forkJoin([
            this.incidentSearchService.getOwners(),
        ]).subscribe(([responseOwners]) => {
            this.owners = responseOwners;

            this.filteredOwners = this.shareIncidentForm.get('shared').valueChanges.pipe(
                startWith(''),
                map((value) => {
                    return value ? this._filterOwnerOptions(value) : this.owners.slice();
                })
            )
        });

    }
    private _filterOwnerOptions(filterValue: string): User[] {
        return this.owners.filter((opt) =>
            toLower(opt.name).includes(toLower(filterValue))
        );
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
            console.log(resposeIncident)
            
            this.initialShare=resposeIncident
            this.sharedUsers=resposeIncident.sharedWith
            // console.log(this.initialShare)
            // this.sharedUsers=[...this.initialShare.sharedWith]
            // console.log(this.sharedUsers)
        })
    }

    addSharedUsers(addshareW) {
        let pos = this.sharedUsers.map((ele) => {
            return ele.name
        }).indexOf(addshareW)
        if (pos === -1) {
            this.sharedUsers.push({ name: addshareW })

        }
        console.log(this.sharedUsers)

    }

    submit() {
        //have to check the whole sharedUSers and toast a message:success if all users are valid;else error toast message

        const allValidUsers = this.sharedUsers.every((user) => {
            this.view=false
            return this.owners.some((owner) => {
                return owner.name === user.name
                // ?this.initialShare.sharedWith.push(owner):this.initialShare

            })
        })
        if (allValidUsers) {
            if(this.removedSharedUsers.length>0){
            this.sharedData = { addShareWith: this.sharedUsers, removeSharedWith: this.removedSharedUsers }
        }else{
            this.sharedData = { addShareWith: this.sharedUsers}
        }
        
            this.incidentService.shareIncident(this.popupParam.id,
                this.sharedData).subscribe((res) => {
                    console.log(res)
                    // this.incident=this.initialShare
                    // console.log(this.incident)
                    // this.close()
                })
        }
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
    deleteSharedUser(removeShare) {
        this.view = false
        this.removedSharedUsers.push({ name: removeShare })
        this.sharedUsers = this.sharedUsers.filter((val) => {
            return val.name != removeShare
        })

        this.incident.sharedWith = this.incident.sharedWith.filter((val) => {
            return val.name != removeShare
        })
    }

}