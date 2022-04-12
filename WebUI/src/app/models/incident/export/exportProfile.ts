export class ExportProfile {
    id: number;
    description: string;
    includeTitlePages: boolean;
    includeConvertedFootage: boolean;
    includeFootage: boolean;
    includeMetadata: boolean;
    profile: Profile
}

export class Profile {
    id: number;
}