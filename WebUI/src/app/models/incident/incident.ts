import { CustomField } from "../common/custom-field";

export class Incident {
    id: number;
    version: number;
    createdTimeStamp: Date;
    signature: string;
    clips?: Clips[] = [];
    public get allClips(): Clips[] {
        return this.clips;
    }
    public set allClips(value: Clips[]) {
        this.clips = value;
    }
    nClips: number;
    allowedActions: string;
    sharedWith?: [];
    isRestricted: boolean;
    controlState: string;
    isEditable: boolean;
    attachments?: [];
    effectiveTitle: string;
    isCommittable: boolean;
    isNewOrUpdated: boolean;

    referenceCode: string;
    title: string;
    incidentTime?: Date;

    customFields: CustomField[] = [];
    public get allCustomFields(): CustomField[] {
        return this.customFields;
    }
    public set allCustomFields(value: CustomField[]) {
        this.customFields = value;
    }

    recordings?: Recordings[] = [];
    public get allRecordings(): Recordings[] {
        return this.recordings;
    }
    public set allRecordings(value: Recordings[]) {
        this.recordings = value;
    }
}

export class Clips {
    videoIds: number[];
    publicVideoIds: number[];
    notes: string;
    allowedActions: string;
    allowedActionsIfCloned: string;
    annotationConfig: string[];
    mediaFields: CustomField[] = [];
    recordingGroupId: string;
    isClipped: boolean;
    startTime: number;
    durationSeconds: number;
    operator: Operator[] = [];
    deviceName: string;
    deviceLongId: string;
    deviceType: string;
    thumbnail: Thumbnail[] = [];
    isRestricted: boolean;
    isLocal: boolean;
    locationEntries: [];
    category: string;
    visibleDurationSeconds: number;
}

export class Operator {
    id: number;
    name: string;
    displayName: string;
    type: string;
}

export class Thumbnail {
    uri: string;
    width: number;
    height: number;
}

export class Recordings {
    recordingGroupId: string;
    operator: Operator[] = [];
    deviceName: string;
    deviceType: string;
    startTime: number;
    durationInSeconds: number;
    visibleDurationSeconds: number;
    mediaFields: CustomField[] = [];
    clips: [];
    allowedActions: string;
}