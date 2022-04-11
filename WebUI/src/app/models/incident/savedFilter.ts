export class SavedFilter {
    name : string;
    searches : Searches[];
}
export class Searches {
    id : number;
    name : string;
    category : string;
    permissionGroup : {
        id : number;
        name : string;
    };
    positionInList : number;
    filter : IncidentFilter;
}
export class IncidentFilter {
    owned : boolean;
    shared : boolean;
    supervised : boolean; 
    includeLive : boolean;
    includeDeleted : boolean;
    recentlyEdited : boolean;
    onlySharedIncidents : boolean;
    onlyExternalLinks : boolean;
    onlyActiveExternalLinks : boolean;
    text : string;
    customValues : [{
            id : number;
            value : string;
        }
    ]
}
