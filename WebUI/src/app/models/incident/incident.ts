import { CustomField } from "../common/custom-field";

export class Incident {
    id: number;
    createdTimeStamp: Date;
    signature: string;    
    nClips: number;
    allowedActions: string;
    isRestricted:boolean;
    controlState: string;
    isEditable: boolean;
    effectiveTitle: string;
    isCommittable: boolean;
    isNewOrUpdated: boolean;

    referenceCode: string;
    title: string;
    incidentTime?: Date;

    customFields: CustomField[] = [];
}