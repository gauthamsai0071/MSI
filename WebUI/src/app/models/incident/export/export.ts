export class Export {
    id: number;
    incidentId: number;
    creationTime: number;
    completionTime : number;
    description : string;
    signature: string;    
    state: string;
    running: boolean;
    ready: boolean;
    hasError: boolean;
    allowedActions: string;
    encrypted: boolean;

    profiles: Profiles[] = [];
    owner: Owner[] = [];
}  

export class Profiles {
    id: number;
    name: string;
    type: string;
    isDefault : boolean;
    outputDirectory: string;
    selectClips: boolean;
    encrypt: boolean;
    aclEnabled: boolean;
    includeCommitFile: boolean;
    overwriteExistingFiles: boolean;
}

export class Owner {
    id: number;
    name: string;
    displayName: string;
    type: string;
}