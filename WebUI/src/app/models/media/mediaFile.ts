import { CustomField } from "../common/custom-field";

export class MediaFile{
    allowedActions : string;
    audioCodec : number;
    category : string;
    customFields: CustomField[] = [];
    dar : string;
    deviceLongId : string;
    deviceName : string;
    deviceType : string;
    downloadSignatureCheck : string;
    downloadTime : Date;
    durationSeconds : number;
    height : number;
    id : number;
    incidentCount : number;
    isAnnotated : boolean;
    isDeleted : boolean;
    isLocal : boolean;
    isRestricted : boolean;
    isSingleFileRecording : boolean;
    name : string;
    operator : {
        displayName : string;
        id : number;
        name : string;
        type : string; 
    };
    originalName : string;
    owner : {
        displayName : string;
        id : number;
        name : string;
        type : string; 
    };
    showDownloadTime : boolean;
    showEncodingInformation : boolean;
    showMetadata : boolean;
    showOrigin : boolean;
    showSignature : boolean;
    showStartTime : boolean;
    startTime : Date;
    thumbnail : {
        height : number;
        uri : string;
        width : number;
    };
    transform : number;
    urn : string;
    videoCodec : number;
    visibleDurationSeconds : number;
    width : number;

    timestamp : Date;
    mimeType : string;
    talkgroupId : string;
    agencyName : string;
    unitId : string;
    channel : string;
    siteId : string;
    zoneId : string;
    rscAlias : string;
    individualAlias : string;
    system : string;
    originatingMDN : string;
    terminatingMDN : string;
    participatingMDN : string;
    talkgroupName : string;
}