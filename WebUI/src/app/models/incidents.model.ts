export class Incidents {
    id: number;
    version: number;
    signature: string;
    owner : Owner[];
    customFields : CustomFields[];   
}

export class Owner {
    id: number;
    name: string;
    displayName: string;
    type: string;
}

export class CustomFields {
    id: number;
    name: string;
    value: any;
} 