export class Export {
    description: string;
    dvdMedia?: string;
    canOverrideMedia?: boolean;
    isLocal?: boolean;
    hasRestrictedClips?: boolean;
    id?: number;
    incidentId?: number;
    creationTime?: number;
    completionTime?: number;
    signature?: string;
    state?: string;
    running?: boolean;
    ready?: boolean;
    hasError?: boolean;
    allowedActions?: string;
    encrypted?: boolean;
    profiles?: Profiles[] = [];
    exportProfile?: {
        id: number;
        name: string;
        type: string;
        isDefault: boolean;
        outputDirectory: string;
        selectClips: boolean;
        encrypt: boolean;
        aclEnabled: boolean;
        includeCommitFile: boolean;
        overwriteExistingFiles: boolean;
    };
    owner?: Owner[] = [];
}

export class Profiles {
    id: number;
    name: string;
    type: string;
    isDefault: boolean;
    outputDirectory: string;
    selectClips: boolean;
    encrypt: boolean;
    aclEnabled: boolean;
    titlePages: string;
    overlay: string;
    watermark: string;
    originalFootage: string;
    confidentialMetadata: string;
    ntscDvd: string;
    filePerClip: string;
    convertedFootage: string;
    exportMetadataTemplate: {
        useTemplateForFilename: boolean;
        addMetadataFile: boolean;
    }
    includeCommitFile: boolean;
    originalFootageTemplate: {
        useTemplateForFilename: boolean;
        addMetadataFile: boolean;
    }
    convertedFootageTemplate: {
        useTemplateForFilename: boolean;
        addMetadataFile: boolean;
    }
    overwriteExistingFiles: boolean;
    metadataLevel: string;
    exportTitlePageTemplate: {
        useTemplateForTitlePage: boolean;
    }
    accessControlList: [] = [];
}

export class Owner {
    id: number;
    name: string;
    displayName: string;
    type: string;
}