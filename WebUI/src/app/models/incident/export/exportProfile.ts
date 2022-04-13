export class ExportProfile {
    id: number;
    description: string;
    includeTitlePages: boolean = false;
    includeConvertedFootage: boolean = false;
    includeFootage: boolean = false;
    includeMetadata: boolean = false;
    ntscDvd: boolean = false;
    maxMediaSize: number;
    profile: Profile
}

export class Profile {
    id: number;
}