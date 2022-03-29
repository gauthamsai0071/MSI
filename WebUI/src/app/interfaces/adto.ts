export interface SiteSubscriptionAdto {
    feedId? : string;
    identifier?: string; // VdsSiteAccount identifier
}

// matches com.edesix.pss.manager.webserver.api.ThumbnailAdto

type ThumbnailExpressionType = 'AUDIO'|'PDF'|'OTHER'|'MISSING'|'ERROR';

export interface ThumbnailAdto {
    uri : string;
    width : number;
    height : number;
    offsets : number[];
    expressionType : ThumbnailExpressionType; // corresponds to ThumbnailExpressionType enum on server
    expressionText : string;

    // if gallery mode thumbnails are requested, then the offsets array will be filled in with the time offsets
    // available for thumbnail display.  These should be accessed by appending a query parameter 'start' to the
    // provided URI containing the offset value, e.g.
    //   img.src = thumbnail.uri + '?start=' + thumbnail.offsets[n];
}

type SpecialDeviceType = 'SOURCE';

export interface VideoClipAdto {
    startTime : number; // ms since epoch
    durationSeconds : number;
    operator : UserNameAdto;
    deviceName : string;
    deviceLongId : string;
    deviceType? : SpecialDeviceType;
    thumbnail : ThumbnailAdto;
    isLocal : boolean; // Note: for an incident clip, this is only true if ALL videos in the clip are local
    isRestricted : boolean;// Note: for an incident clip, this is true if ANY videos in the clip are restricted
    locationEntries: GeoFixEntryAdto[];
    category : string; //Enum VIDEO, AUDIO, IMAGE, PDF, OTHER
}

export interface VideoRecordingInfoAdto {
    recordingStart : number;
    recordingEnd : number;
    multiFileRecording : boolean;
    hasAddPermission : boolean;
    allVideosAvailable : boolean;
    isPrerecordOnly : boolean;
    isDownloading : boolean;
    isExpunged : boolean;
    sameOperatorFootageCount: number;
}

export interface GeoFixEntryAdto {
    timeStamp: moment.Moment;
    lat: number;
    lng: number;
    speed?: number; // metres/second
    bearing?: number; // degrees clockwise from true north
}

export interface GeoLocationAdto {
    lat : number;
    lng : number;
}

export interface VideoFilePropertiesAdto {
    deviceName? : string;
    operator? : UserNameAdto;
    startTime? : moment.Moment;
    customFields? : CustomFieldAdto[];
}

export interface VideoFileTransformAdto {
    transform: number; //
    original: boolean;
}

type SignatureVerificationResultType = "NOT_VERIFIED"|"NO_SIGNATURE"|"SIGNATURE_FETCH_ERROR"|"SUCCESS"|"FAIL_MALFORMED"|"FAIL_BAD_CERTS"|"FAIL_UNTRUSTED"|
    "FAIL_BAD_MANIFEST"|"FAIL_BAD_DIGEST"|"FAIL_BAD_SIZE"|"FAIL_BAD_NAME"|"FAIL_DID_CERT_MISMATCH"|"FAIL_DID_AGENT_MISMATCH"|"VERIFICATION_ERROR";

export interface VideoFileAdto extends VideoClipAdto {
    id : number;
    incidentCount : number;
    owner : UserNameAdto;
    urn : string;

    // combination of characters; each character represents an action which the current user is allowed to perform:
    //  't' - view thumbnails of the video
    //  'p' - play video
    //  'o' - change the owner of the video
    //  's' - share video
    //  'd' - delete video    (may be set even if the video is currently deleted)
    //  'u' - undelete video  (may be set even if the video is currently not deleted)
    //  'x' - expunge video
    //  'r' - restrict access to video
    //  'l' - view video audit log
    //  'i' - get details of incidents for this video
    //  'a' - add video to existing incident
    //  'c' - add video to a new incident
    //  'f' - initiate video upload
    //  'm' - set location of video (for video which has no location)
    //  'M' - edit location of video (which already has a location)
    //  'D' - edit device
    //  'O' - edit operator
    //  'T' - edit timestamps
    //  'N' - edit transform
    allowedActions : string;
    isDeleted : boolean;
    sharedWith : UserNameAdto[];
    downloadTime : number; // ms since epoch
    bookmarkConfig: string;
    showMetadata : boolean; // should we show metadata by default when we play?
    isAnnotated: boolean;
    dockControllerName? : string; // The name of the dock controller this was downloaded over.
    originSiteName? : string; // The name of the site this was uploaded from.
    videoCodec : number;
    audioCodec : number;
    customFields? : CustomFieldAdto[];
    downloadSignatureCheck?: SignatureVerificationResultType;
    signatureRecheck?: SignatureVerificationResultType;
}

class PlaybackReasonAdto {
    fieldValues : CustomFieldAdto[];
}

export interface VdsSiteExportAdto {
    id: number;
    videoId: number;
    percentProcessed: number;
    state: string;
    exportFail: string; // only filled in if state is FAILED; corresponds to ExportSession.ExportFail enum on server
    stateMessage: string;
    description: string;
    siteExportSignature: string;
    incidentFlag: boolean;
    metadataFlag: boolean;
    canCancel: boolean;
    canRetry: boolean;

    siteName: string;
    siteOnline: boolean;

}

export interface VdsSiteExportSubscriptionAdto {
    feedId? : string;
    includeCompleted?: boolean;
    includeFailed?: boolean;
    siteId?: number;
    minCompleteTime?: moment.Moment;
}


export interface VideoFileSecurityAdto {
    // POST Permissions note: if you supply a field on post, then the api will check that you have permissions to modify
    // that field.  Since there are separate permissions for each field, you should only supply fields which have
    // actually been modified, or your request may be FORBIDDEN.

    owner? : UserNameAdto; // could be null on get if video has no owner.  If null on post, then owner is not updated.
    isRestricted? : boolean; // never null on get.  If null on post, then owner restriction is not updated.

    // Note: on post, you should never provide both sharedWith AND addSharedWith/removeSharedWith.
    sharedWith? : UserNameAdto[]; // Entire list of shares.  If null on post, then shared list is not overwritten.
    addSharedWith? : UserNameAdto[]; // A list of shares to be added.  Never filled in on get.  Can be omitted on post.
    removeSharedWith? : UserNameAdto[]; // A list of shares to be removed.  Never filled in on get.  Can be omitted on post.

    wholeRecording? : boolean; // Whether or not to apply changes to whole recording or single video - only 'restrict' currently
}

export interface CreateFeedResponseAdto {
    feedId : string;
    serverStateSubscriptionId? : number;
}

export interface CreateSubscriptionResponseAdto {
    subscriptionId : number;
}

export interface VideoFilesSubscriptionAdto
{
    feedId? : string;
    start? : moment.Moment;
    end? : moment.Moment;
    limit? : number;
    fixedLength? : boolean;
    ownerNames? : string[];
    operatorNames? : string[];
    deviceNames? : string[];
    urn? : string;
    owned? : boolean;
    shared? : boolean;
    supervised? : boolean;
    incidentStatus? : boolean;
    thumbnail? : string;
    thumbnailOffset? : any;
    includeLive? : boolean; // default true
    includeDeleted? : boolean; // default false
    includeUnbookmarked? : boolean; // default true
    includeNoLocation?: boolean; // default true
    onlySharedVideos?: boolean; // default false
    location? : GeoLocationAdto;
    radius? : number; // distance from location, in metres (integer)
    order?: string; // 'download' or 'record' (default)
    downloadLocation?: string;
    mgroupid?: string;
    customValues?: CustomFieldValueAdto[];
    advancedFilter?: string;
    text?: string;
    deletedNextDays?: number;
    recordingUuid? : string;
    importSignature? : string;
    newlyShared? : boolean;
    newlyOwned? : boolean;
    newlyDownloaded? : boolean;
}

export interface VideoFilesFetchMoreAdto
{
    feedId? : string;
    subscriptionId? : number;
    limit : number;
}

export interface IvrOverlayStatusAdto {
    text: string;
}

export interface LocalRecordingStatusAdto {
    recording : boolean;
    userControllable : boolean;
    canSetRecordingProperties: boolean;
    activeButtons: string[];
}

export interface LocalOutputStateAdto {
    name: string;
    state: string;
}

export interface IvrViewSpecAdto {
    channelIndex? : number;
}

export interface FeedEventSetAdto {

    id : number;
    nextId : number;
    data: { [subscriptionId: number]: FeedEventAdto };
}
type LicenceWarning = 'NONE'|'INVALID'|'EXPIRED'|'CVM_CONNECT';

type LicenceRestart = 'NONE'|'RESTART_REQUIRED'|'WILL_RESTART';

type VdsStatus = 'NONE'
    | 'SERVER_DISABLED'
    | 'SERVER_STARTING'
    | 'SERVER_READY'
    | 'SERVER_STOPPING'
    | 'SERVER_ERROR'
    | 'SITE_NOT_CONFIGURED'
    | 'SITE_DISABLED'
    | 'SITE_CONNECTING'
    | 'SITE_CONNECTED'
    | 'SITE_DISCONNECTING'
    | 'SITE_ERROR'
    | 'SITE_CONNECT_FAILED'
    | 'SITE_CONNECT_FAILED_INCOMPATIBLE';

export interface SiteConnectionStatusAdto {
    error: string;
    status: VdsStatus;
}

type VerificationState = 'IN_PROGRESS'|'SUCCESS'|'FAILED'|'UNAVAILABLE';

export interface FileVerificationStateAdto {
    time : moment.Moment;
    state : VerificationState;
    message: string;
}

type TvmConnectionStatus = 'CONNECTING'|'CONNECTED'|'DISCONNECTED'|'NONE'|'DISABLED'
type ServerStateReloadReason = 'IVR_SETTINGS_CHANGE'
type CCVaultState = 'OFFLINE_IDLE'
    | 'OFFLINE_CONNECTION_REQUIRED'
    | 'UPLOAD_ERROR'
    | 'UPLOAD_BUSY'
    | 'UPLOAD_SYNCED'
    | 'CONFIG_ERROR'
    | 'CONFIG_BUSY'
    | 'CONFIG_SYNCED';

export interface WifiStatusAdto {
    ssid: string;
    strength: number;
}

type IvrInputType = 'IP_CAMERA'|'WMIC';
type IvrInputState = 'UNCONFIGURED'|'NO_CARRIER'|'NOT_RECORDING'|'RECORDING_MUTED'|'RECORDING_NOT_MUTED';
type IvrInputNameType = 'lmic'|'rmic';
export interface IvrInputStateAdto {
    inputName: IvrInputNameType;
    type: IvrInputType;
    state: IvrInputState;
}

export interface FeedEventAdto {

    mediaCookieSetup: string;

    videoFiles : VideoFileAdto[];
    deletedVideoFiles : number[];
    moreVideoFilesAvailable : boolean;
    verificationState : FileVerificationStateAdto;

    deviceStatuses : DeviceSummaryStatusAdto[];
    device: DeviceAdto;
    deletedDeviceStatuses : string[];

    dockControllers : DockControllerAdto[];
    deletedDockControllers : string[];
    dockController : DockControllerAdto;

    reports : ReportJobAdto[];
    deletedReports: number[];

    scheduledReports : ScheduledReportAdto[];
    deletedScheduledReports: number[];

    export: ExportAdto;
    exports : ExportAdto[];
    deletedExports : number[];

    site: VdsSiteAccountAdto;
    sites: VdsSiteAccountAdto[];
    deletedSites: string[];

    siteFootageExports: { [videoId: number]: VdsSiteExportAdto };
    siteExports: VdsSiteExportAdto;
    deletedSiteExports: number[];

    liveStats: LiveStatsReportAdto;
    backupStatus: BackupStatusAdto;
    platformChangeStatus: PlatformChangeStatusAdto;

    appWarnings: AppWarningAdto[];
    deletedAppWarnings: number[];
    appWarningCount: number;

    serverIsFrozen: boolean;
    recordingStatus: LocalRecordingStatusAdto;
    shutdownIssued: boolean;
    outputs: LocalOutputStateAdto[];
    changeToView : IvrViewSpecAdto;

    ivrState: IvrStateAdto;

    ivrStatusText : string;
    ivrStreamErrors: IvrStreamErrorAdto[];

    licenceWarningNow : LicenceWarning;
    licenceWarningSoon : LicenceWarning;
    expiryDate : number;
    licenceRestart : LicenceRestart;
    objectStorageBreach : boolean;
    centralManagerBreach : boolean;
    streamingBreach : boolean;
    clearanceExportBreach : boolean;
    deviceCountBreach : boolean;
    compAnalysisBreach : boolean;
    middlewareExportBreach : boolean;
    stateReloadReasons: ServerStateReloadReason[];
    gridRestartRequired: boolean;

    healthResult : number
    healthMessage : string;

    compAnalysis: CompAnalysisAdto;
    compAnalyses: CompAnalysisAdto[];
    deletedCompAnalyses: number[];

    cvmConnectionOk: boolean;
    cvmConnectionStatus: SiteConnectionStatusAdto;

    assetImport: AssetImportAdto;
    assetImports: AssetImportAdto[];
    deletedAssetImports: number[];

    tvmWall: TvmWallAdto;
    tvmWalls: TvmWallAdto[];
    deletedTvmWalls: number[];

    tvmEvents : TvmEventAdto[];

    tvmStatus: TvmConnectionStatus;

    ivrRecordings: IvrRecordingAdto[];
    removedIvrRecordingIds: number[];

    deleted: boolean; // applies to detail view for single items, e.g. dock controller
    available: boolean;

    notificationStatus: NotificationAdto;

    auditEntries: AuditLogAdto[];
}

export interface IvrChanelStateAdto {
    channelName: string;
    primaryStreamError: IvrStreamErrorAdto;
    liveStreamError: IvrStreamErrorAdto;
}

export interface IvrStreamErrorAdto {
    channelName: string;
    errorState: IvrStreamErrorState;
    status: number;
    reason: string;
}

export interface IvrStateAdto {
    ivrStatusText : string;
    ivrRecordingUploadInProgress: boolean;
    ivrRecordingBytesToUpload: number;
    estimatedUploadByteRate: number;
    remainingUploadCount: number;
    ccVaultState: CCVaultStateAdto;
    freeSpacePercent: number;
    freeSpaceHours: number;
    wifiState: WifiStatusAdto;
    ivrChannelStates: IvrChanelStateAdto[];
    appWarning: AppWarningAdto; // Highest priority unread App Warning
}

type IvrStreamErrorState = 'NONE'|'INVALID_HOSTNAME'|'HTTP_RESPONSE_STATUS'|'TIMEOUT'|'DECODE_META_FAILED'| 'CANNOT_CONNECT';
type CCVaultConnectionState = 'OFFLINE_CONNECTION_REQUIRED'|'OFFLINE_IDLE'|'ONLINE';
type CCVaultUploadState = 'UPLOAD_ERROR'|'UPLOAD_BUSY'|'UPLOAD_SYNCED';
type CCVaultConfigState = 'CONFIG_ERROR'|'CONFIG_BUSY'|'CONFIG_SYNCED';

export interface CCVaultStateAdto {
    connectionState: CCVaultConnectionState;

    uploadState: CCVaultUploadState;
    uploadError: string;

    configState: CCVaultConfigState;
    configError: string;

    configLastSyncedTimeStamp: number;
    firmwareLastSyncedTimeStamp: number;
    tagsLastSyncedTimeStamp: number;
}

type TvmEventSeverity = 'INFO'|'ALERT'|'SEVERE';

export interface TvmEventAdto {
    seqNo : number;
    timestamp : number; // ms since epoch
    deviceName?  : string;
    deviceId?  : string;
    severity : TvmEventSeverity;
    message : string;
}

export interface DockControllerAdto {
    id : string;
    state : string; // see DockControllerState java class
    lastSeenTime? : number; // ms since epoch
    mode : string;
    allowedActions : string;
    // c - configure
    // r - restart
    // l - download logs
    // u - upgrade
    // d - forget
    // b - edit bandwidth rule
    name : string;
    softwareVersion : string;
    hardwareVersion : string;
    vmHost : string;
    address : string;
    devices : DeviceAdto[];
    prePopulatedApiShortId : string;
    prePopulatedApiHost : string;
    prePopulatedApiPort : number;
    prePopulatedApiSsl : boolean;
    bandwidthRule : BandwidthRuleAdto;
    upgradeDownloadProgress : number;
    dockControllerRfidConfig: DockControllerRfidConfigAdto; 
}

export interface DockControllerSubscriptionAdto {
    feedId?: string;
    frozen?: boolean;
}

export interface DockControllerRfidConfigAdto {
    useRfidReaderFrom : String;
}

export interface DockControllerDeviceSettingsAdto {
    useDefaultSettings: boolean;
    touchAssignFullBatteryRequired: boolean;
    touchAssignMinChargeTimeMinutes: number;
}

export interface DockControllerNameAdto {
    name : string;
    serialNumber : string;
}

export interface PlayRecordingVideoAdto {
    offsetInPlayback : number;
    durationInPlayback : number;
    isPrerecord : boolean;
    startTime : number; // ms since epoch - wallclock start time of the whole video
    endTime : number; // ms since epoch - wallclock end time of the whole video
    duration : number; // duration in seconds of the video
    videoId : number;
    videoUrn : string;
    deviceSerial : string;
    startOffsetInVideo : number;
    trueVideoId : number;
    trueVideoUrn : string;
    trueStartOffsetInVideo : number;
}

export interface CreateAvailableVideoSubscriptionRequestAdto {
    // This is an opaque - you get one back in PlayRecordingAdto and then you pass it to videoSubscribeAvailable
}

// matches com.edesix.pss.manager.webserver.api.PlayRecordingAdto
export interface PlayRecordingAdto {
    mediaUri:string;
    initialOffset:number;
    start:number; // ms since epoch
    end:number; // ms since epoch
    duration:number; // seconds
    videos:PlayRecordingVideoAdto[]; // components of the clip
    fps: number; // in frames per second
    isEmpty: boolean;
    watermark: string;
    nextVideoSubscriptionRequest : CreateAvailableVideoSubscriptionRequestAdto;
}

export interface ScreenshotRequestAdto
{
    videoId : number;
    offset : number;
}

export interface ResourceMetadataAdto {
    // 0 - no audio redaction
    // 1 - allow mute only
    // 2 - allow mute + second channel
    audioStreamCount: number;
}

export interface UserNameAdto {
    id? : number;
    name? : string;
    displayName? : string;
    deleted? : boolean;
    type?: PssUserType;
    multiValCount?: number; // transient and only used in the client side
}

export interface DeviceNameAdto {
    name : string;
}

export interface DownloadLocationAdto {
    name : string;
}

export interface VariantAdto {
    text? : string;
    date? : number;
    timestamp? : number;
    bool? : boolean;
}

type CustomFieldPurpose = 'INCIDENT'|'INCIDENT_DELETE'|'MEDIA'|'CC_VAULT'|'PLAYBACK_REASON'|'INCIDENT_CLIP';

type CustomFieldColumnWidth = 'NARROW'|'MEDIUM'|'WIDE';

type CustomFieldPermissionGroup = 'PUBLIC'|'ONE'|'TWO'|'THREE'|'FOUR'|'FIVE'|'SIX'|'SEVEN'|'EIGHT'|'NINE'|'TEN'|'ELEVEN'|'TWELVE'|'THIRTEEN'|'FOURTEEN'|'FIFTEEN'|'SIXTEEN'|'SEVENTEEN'|'EIGHTEEN'|'NINETEEN'|'TWENTY';

export interface CustomFieldAdto {
    id : number;
    isText : boolean;
    isDate : boolean;
    isTimestamp : boolean;
    isEnumeration : boolean;
    isBool : boolean;
    isUrl : boolean;
    isComputed : boolean;
    isComputedAutoDelete : boolean;
    isComputedExpression : boolean;
    isTagList : boolean;
    name : string;
    displayName: string;
    mandatory : boolean;
    fieldType: string;
    isDerived: boolean;
    filterByRange : boolean;
    defaultValue : VariantAdto;
    deleted : boolean;
    numTextLines : number;
    visibleTextLines : number;
    validValues : string[];
    validValueLabels: string[];
    validatorPattern: string;
    validatorFlags: string;
    validatorDescription: string;
    conditions : CustomIncidentFieldConditionAdto[];
    value : VariantAdto;
    tagValues : String[];
    urlDisplayText : string;
    endValue : VariantAdto; // only used when filtering
    columnWidth: CustomFieldColumnWidth;
    orderIndexSmall: number;
    orderIndexMedium: number;
    orderIndexWide: number;
    orderIndexCompanionApp: number;
    genericSearchable: boolean;
    showSearchField: boolean;
    canRead: boolean;
    purpose : CustomFieldPurpose;
    showInSummary: boolean;
    permissionGroup: CustomFieldPermissionGroup;
    isMultiValue?: boolean;
    multiValues?: VariantAdto[];
}

export interface CustomIncidentFieldConditionAdto {
    fieldId: number;
    fieldName: string;
    fieldDisplayName: string;
    value: VariantAdto;

    // These fields sent by server to client for rendering use only.
    isBool: boolean;
    isEnum: boolean;
    isTagList: boolean;
}

export interface CustomFieldValidatorAdto {
    validatorId: number;
    validatorName: string;
    validatorPattern: string;
    validatorDescription: string;
    validatorFlags: string;
}

export interface CustomFieldUploadResultAdto {
    addedFields: number;
    updatedFields: number;
    addedValidators: number;
    updatedValidators: number;
    deletedFields: string[];
}

export interface AnnotationKeyFrameAdto {
    time: number;
    x: number;
    y: number;
    width: number;
    height: number;
    isEased: boolean; // should these new values be eased from the values in the previous keyframe?
    isTerminal: boolean; // should the annotation stop after this key frame?
}

export interface AnnotationAdto {

    type: string;
    shape: string;
    brightness: string;
    keyFrames: AnnotationKeyFrameAdto[];
}

export interface IncidentVideoClipAdto extends VideoClipAdto {
    id : number; // Filled in only for saved clips
    videoIds : number[];
    publicVideoIds : number[]; // doesn't include pre-record
    notes : string;
    // combination of characters; each character represents an action which the current user is allowed to perform
    // on this clip:
    // 't' - view thumbnail of clip
    // 'p' - play clip
    // 'd' - delete clip
    // 'e' - edit clip bounds (!! note - if clip is redacted, this has side-effect of edit the redaction, so 'r' permission must be checked in this case !!)
    // 'n' - edit clip notes
    // 'b' - edit clip bookmarks
    // 'f' - initiate clip upload
    // 'v' - view original video
    // 'r' - redact clip
    allowedActions : string;
    allowedActionsIfCloned : string;

    annotationConfig: string; // JSON encoded version of AnnotationConfigModel
    bookmarks: string;

    mediaFields: CustomFieldAdto[];
}

export interface IncidentCompositeVideoAdto {

    clips: IncidentCompositeClipAdto[];
}

export interface IncidentCompositeClipAdto {

    enabled: boolean;       // Whether to include this in the composite.
    offset: number;         // time-offset for this clip
    audioEnabled: boolean;  // include audio from first clip with audioEnabled
}

export interface IncidentAdto {
    id : number;
    clonedFromId : number; // filled in for template incident when cloning an incident
    createdTimeStamp : number;
    deletionTimeStamp: number;
    editedTimeStamp : number;
    signature : string;
    owner : UserNameAdto; // Ignored on PUT/POST - use IncidentSecurityAdto instead
    customFields : CustomFieldAdto[];
    clips : IncidentVideoClipAdto[];
    nClips : number;

    // combination of characters; each character represents an action which the current user is allowed to perform:
    //  'o' - change the owner of the incident
    //  's' - share incident
    //  'd' - delete incident    (may be set even if the incident is currently deleted)
    //  'u' - undelete incident  (may be set even if the incident is currently not deleted)
    //  'A' - view incident audit log
    //  'e' - edit incident details
    //  'c' - add a comment to incident
    //  'a' - add a clip to this incident
    //  'x' - export this incident
    //  'C' - commit this incident
    //  'r' - restrict this incident
    //  'U' - access anon access URLs for incident
    //  'P' - create custom anon access URLs for incident
    //  '+' - add attachments
    //  '-' - remove attachments
    //  'v' - view attachments
    //  'D' - clone this incident
    //  'l' - view incident location
    //  'L' - edit incident location
    //  '<' - add to incident
    //  '>' - create new incident containing this one
    //  '/' - delete child incident
    allowedActions : string;
    sharedWith : UserNameAdto[]; // Ignored on PUT/POST - use IncidentSecurityAdto instead
    location : GeoLocationAdto;
    controlState : string; // SITE, LOCAL, CENTRE, GONE
    isEditable: boolean;
    attachments : IncidentAttachmentAdto[];
    effectiveTitle : string;

    compositeVideo: IncidentCompositeVideoAdto;
    isCommittable: boolean;
    children : IncidentAdto[];
}

export interface IncidentAttachmentAdto {
    id : number;
    fileName : string; // ignored on post
    deleted : boolean; // never set when getting; set when posting to delete an attachment
    canDelete : boolean;
}

export interface IncidentSecurityAdto {
    // POST Permissions note: if you supply a field on post, then the api will check that you have permissions to modify
    // that field.  Since there are separate permissions for each field, you should only supply fields which have
    // actually been modified, or your request may be FORBIDDEN.

    owner? : UserNameAdto; // could be null on get if video has no owner.  If null on post, then owner is not updated.

    // Note: on post, you should never provide both sharedWith AND addSharedWith/removeSharedWith.
    sharedWith? : UserNameAdto[]; // Entire list of shares.  If null on post, then shared list is not overwritten.
    addSharedWith? : UserNameAdto[]; // A list of shares to be added.  Never filled in on get.  Can be omitted on post.
    removeSharedWith? : UserNameAdto[]; // A list of shares to be removed.  Never filled in on get.  Can be omitted on post.
}

export interface IncidentQueryAdto {
    savedSearchId: number;
    start : number;
    end : number;
    owner : string;
    operator : string;
    device : string;
    text : string;
    owned : boolean;
    shared : boolean;
    supervised : boolean;
    limit : number;
    includeLive : boolean;
    includeDeleted : boolean;
    siteIncidents : boolean;
    recentlyEdited : boolean;
    onlySharedIncidents : boolean;
    onlyExternalLinks : boolean;
    onlyActiveExternalLinks : boolean;
    advancedFilter: string;

    newlyShared : boolean;
    newlyOwned : boolean;

    // Also allowed fields with name "custom.id" of type string
}

export interface IncidentFilterAdto extends IncidentQueryAdto {
    customValues: CustomFieldValueAdto[];
}

export interface CustomFieldValueAdto {
    id: number,
    value: string
}

export interface IncidentSavedSearchAdto {
    id: number;
    name: string;
    category: string;
    permissionGroup: IncidentFieldPermGroupAdto;
    positionInList: number;
    filter: IncidentFilterAdto;
}

export interface IncidentFieldPermGroupAdto {
    id: number,
    name: string
}

export interface ErrorAdto {
    errorCode : string;
    errorKey : string;
    errorArgs : string [];
}

export interface StateVideosAdto {
    canListMine : boolean; // have permission to list videos owned by me
    canListShared : boolean; // have permission to list videos shared with me
    canListSupervised : boolean; // have permission to list videos owned by users supervised by me
    canSearch : boolean; // have permission to search for videos
    canSeeDeleted : boolean; // have permission to view deleted videos
    canBulkEdit : boolean; // has permission to bulk-edit videos
    canBulkCreateIncident : boolean; // has permission to create incident from multiple videos
    canDoLargeFetch : boolean; // has permission to fetch a large amount of videos
    canSearchByLocation : boolean;
    canSearchByOnlySharedVideos: boolean;  // has permission to filter video searches by shared videos only
    canSearchWithAdvancedFilter: boolean;
    canSearchWithIncidents: boolean;
    canSearchByScheduledDeletionDate: boolean;
    canSearchByBookmarked : boolean; // have permission to search only bookmarked videos
    canControlQuality : boolean;
    canSeeIvrReview : boolean; // has permission to see the IVR review page
    canImport : boolean; // has permission to import videos
    playWholeRecording : boolean; // when playing a video, should we
    allowedActions : string; // All possible actions allowed on an video
    bulkFetchLimit : number; // Limit in seconds at which warnings / permission kicks in for large uploads
    showOldImportWarning : boolean; // Whether or not to show a warning on imported videos recorded more than a year ago
    canTakeScreenshot : boolean;
    canSeeOriginFilter : boolean;
    canSeeScheduledDeleted: boolean; // see the list of videos scheduled to be deleted
    canSeeShared: boolean; // has permission to see shared videos
    canSeeOwned: boolean; // has permission to see owned videos
    canListRestricted: boolean;

    canSeeOwnerFilter: boolean;
    canSeeOperatorFilter: boolean;
    canSeeDatesFilter: boolean;
    canSeeVideoId: boolean; // URN
    canSeeRecordingId: boolean;
    canSeeOrigin: boolean;

    canSeeLargeView: boolean;
    canSeeGalleryView: boolean;
    canSeeListView: boolean;

    searchVideoDisplayMode: string;
    searchVideoOrderByMode: string;
}

export interface StateIncidentsAdto {
    canListMine : boolean; // have permission to list incidents owned by me
    canListShared : boolean; // have permission to list incidents shared with me
    canListSupervised : boolean; // have permission to list incidents owned by users supervised by me
    canSearch : boolean; // have permission to search for incidents
    canSeeDeleted : boolean; // have permission to view deleted videos
    allowedActions : string; // All possible actions allowed on an incident
    allowedClipActions : string; // All possible actions allowed on an incident clip.  Note that actions may be allowed
                                 // on a new, unsaved clip which are not listed in this list, e.g. you can always edit
                                 // a clip and add notes before you save it, even if this list is blank.
    canCreate : boolean; // does this user have permission to create a new incident (without footage)
    canUseSingleVideoAsEvidence : boolean;
    canUseWholeRecordingAsEvidence : boolean;
    canUseSameOperatorFootageAsEvidence: boolean;
    canBulkEdit : boolean;
    canSeeOnlySharedIncidents: boolean;
    canSeeOnlyExternalLinks: boolean;
    canSearchWithAdvancedFilter: boolean;
    canUseSavedSearch: boolean;
    canCreateSavedSearch: boolean;
    canEditSavedSearch: boolean;
    canDeleteSavedSearch: boolean;

    canSeeCCVaultIncidentCommit: boolean;
    showIncidentReports: boolean;

    groupClipsByRecording: boolean;

    canSeeShared: boolean; // has permission to see shared incidents
    canSeeOwned: boolean; // has permission to see owned incidents
}

export interface StateExportsAdto {
    canListMine : boolean; // have permission to list exports owned by me
    canListSupervised : boolean; // have permission to list exports owned by users supervised by me
    canManageExports : boolean; // have permission to manage all exports
}

export interface StateCompAnalysesAdto {
    canView: boolean;   // Have permission to view the Manage Comp Analyses page

    canManageAll: boolean; // Have permission to manage all analysis jobs
    canManageSupervised : boolean; // have permission to list analysis jobs owned by users supervised by me
    canManageOwn : boolean; // have permission to list analysis jobs owned by me
}

export interface StateAssetImportsAdto {
    canView: boolean;   // Have permission to view the Manage Asset Imports page
    canManageAll: boolean; // Have permission to manage all import jobs
    canManageSupervised : boolean; // have permission to list import jobs owned by users supervised by me
    canManageOwn : boolean; // have permission to list import jobs owned by me
    canImport: boolean;
}

export interface StateReportsAdto {
    canView : boolean; // have permission to list all reports
    canCreate : boolean; // have permission to create reports
    canViewScheduled : boolean; // have permission to list all scheduled reports
    canCreateScheduled : boolean; // have permission to create scheduled reports
}

export interface StateAuditLogsAdto {
    canListAll : boolean; // have permission to list all audit logs
}

export interface StateDashboardAdto {
    canSeeHome : boolean;      // see the Home link
    canSeeOwnedDevices : boolean;   // see owned devices on the dashboard
    canSeeSupervisedDevices : boolean;   // see supervised devices on the dashboard
    canSeeVideos : boolean;    // see video list on the dashboard
    canSeeIncidents : boolean; // see incident list on the dashboard
    canDownloadLogs: boolean;  // download the log files from the dashboard.
    canSeePlatformStatus : boolean  // see platform status on the dashboard on demand
    allowChangeLanguage: boolean; // see language select on the dashboard
    dashboardVideoDisplayMode: string; // what display mode should videos on dashboard display in ( LIST or GALLERY )
    canDownloadAllWorkerLogs : boolean // download the log files for centre and all workers from dashboard
    checkForLicenceExpiry : boolean; // should system check for licence expiry
    canSeeScheduledDeletedVideos: boolean; // see the list of videos scheduled to be deleted
}

export interface StateSettingsAdto {
    // PEOPLE
    canSeeUsers : boolean;
    canSeeGroups : boolean;
    usersNeedPasswordsToLogin : boolean;
    canCreateUsers: boolean;
    canCreateGroups: boolean;
    canReassignUsers: boolean;
    canSeeRoles : boolean;
    canEditRoles : boolean;
    canSeeSilos : boolean;
    canEditSilos : boolean;
    canSeeTwoFactorAuthentication: boolean;
    canEditTwoFactorAuthentication: boolean;
    canExportUsersAndGroups: boolean;
    canImportUsersAndGroups: boolean;
    // USER export interface
    canSeeLoginSettings : boolean;
    canSeeVideoList : boolean;
    canSeeMessages : boolean;
    canEditMessages: boolean
    canSeeThemeResources : boolean;
    canEditThemeResources : boolean;
    canSeePlayer : boolean;
    canSeeLanguage : boolean;
    canSeeMaps : boolean;
    canSeeThumbnails : boolean;
    canSeeIncidentUiSettings : boolean;
    // FIRMWARE
    canSeeFirmwareSettings : boolean;
    canSeeDeviceImages : boolean;
    canEditDeviceImages : boolean;
    canSeeDockControllerImages : boolean;
    canEditDockControllerImages : boolean;
    canSeeEdgeControllerImages : boolean;
    canEditEdgeControllerImages : boolean;
    // CAMERAS
    canSeeDeviceSettings : boolean;
    canSeeDeviceTimecodeTrackSettings : boolean;
    canSeeDeviceProfiles : boolean;
    canEditDeviceProfiles : boolean;
    canImportDeviceProfiles : boolean;
    canSeeAccessControlKeyManagement : boolean;
    canEditAccessControlKeyManagement : boolean;
    canSeeIvr : boolean;
    canSeeDeviceCaCerts: boolean;
    canEditDeviceCaCerts: boolean;
    vmCertificateDefaultExpiryDays: number;

    // CONNECTIVITY
    canSeeStreaming : boolean;
    canSeeWifiProfiles : boolean;
    canEditWifiProfiles : boolean;
    canImportWifiProfiles : boolean;
    canSeeBandwidthRules : boolean;
    canEditBandwidthRules : boolean;
    canSeeAutoFetch : boolean;
    canSeeConfigurationReplication : boolean;
    canSeeSiteManager : boolean;
    canSeeClearance : boolean;
    canSeeStreamingServer: boolean;
    canSeeEmailProperties: boolean;
    // POLICY
    canSeeDeletionPolicy : boolean;
    canSeeIncidentExports : boolean;
    canSeeFileExports : boolean;
    canSeeAutoIncidentCreation : boolean;
    canSeePasswordComplexity : boolean;
    canEditPasswordComplexity : boolean;
    canSeeReports : boolean;
    canSeeUserDefinedFields : boolean;
    canEditUserDefinedFields : boolean;
    canImportUserDefinedFields: boolean;
    canSeeUserDefinedMediaFields : boolean;
    canEditUserDefinedMediaFields : boolean;
    canCreateUserDefinedMediaFields : boolean;
    canSeeUserDefinedPlaybackReasonFields : boolean;
    canEditUserDefinedPlaybackReasonFields : boolean;
    canSeeUserDefinedCCVaultFields : boolean;
    canSeeImportProfile : boolean;
    canSeeAntivirusPolicy : boolean;
    canEditImportProfile : boolean;
    canImportImportProfile : boolean;
    canSeeSharingPolicy : boolean;
    canSeePlaybackPolicy : boolean;
    canSeeCompanionAppSettings : boolean;
    videosScheduledDeletedInSecs: number;

    // SYSTEM
    canSeeStorage : boolean;
    canEditStorage : boolean;
    canSeeWebServer : boolean;
    canSeeBackups : boolean;
    canInitiateImmediateBackup: boolean;
    canSeeLicences : boolean;
    canEditLicences : boolean;
    canSeeAdvancedSettingsFile : boolean;
    canSeeServerControls : boolean;
    canSeeImportExportConfig : boolean;
    canEditImportExportConfig : boolean;

    // COMPUTER ANALYSIS
    canSeeComputerAnalysisSettings: boolean;
    // AUTHENTICATION
    canSeeAuthenticationSettings: boolean;
    // CCVAULTV2
    canSeeCCVaultV2Config: boolean;
    // APIKEYMANAGEMENT
    canSeeApiKeyManagement: boolean;
    canEditApiKeyManagement: boolean;
    canSeeApiKeyBearerSettings: boolean;
    // SELF SERVICE
    canSeeSelfServiceSettings: boolean;
    canImportSelfServiceSettings : boolean;
    // USER IMPORT TOOl
    canSeeUserImportToolSettings: boolean;
    canEditUserImportToolSettings: boolean;
    // Not related to an admin page section
    canSeeSites : boolean;
    canSeeGridStatus : boolean;
    canSeeGridConfig : boolean;
    canSeeAuditLog : boolean;
    canSeeSystemStatus: boolean;
    canSeeLiveStats: boolean;
    hasExternalHostConfig: boolean;
    serverPublicHost: string;
    serverPublicSsl: boolean;
    serverPublicPort: number;
    templateWifiNetwork : WifiNetworkAdto;
    maxCryptoKeySize: number;
    canExportFileSpaceKey: boolean;
    canSeePlatformChangeRequests: boolean;
    canSeeCentralManager: boolean;
    silosEnabled: boolean;
    canSeeNotifications: boolean;
    twoFactorAuthenticationType: string;
    objectStorageEnabled: boolean;
    canSeeHealthCheckButton : boolean;
    canSeeAbout : boolean;
    elevationRequiresPassword: boolean;
    canSeeOpenApiResources : boolean;
    loginByEmailType: string;
    realmId: string;
}

export interface StateDevicesAdto {
    canSeeDevices : boolean;
    canSeeUnassigned : boolean;
    canSeeAllAssigned : boolean;
    canSeeAssignedToMe : boolean;
    canSeeSupervised : boolean;
    canSeeRemote : boolean;
    canSeeForgotten : boolean;
    canBulkEdit : boolean;
    canAccessPublicDeviceQrBootstrapCode : boolean;
    canNavigateToDeviceBootstrapQrCode : boolean;
    canPreAssign : boolean;
    showDeviceReports : boolean;
    showDeviceLiveStats : boolean;
    canSeeAllocated : boolean;
    canManuallyAssignSingle : boolean;
    canManuallyAssignPermanent : boolean;
    canManuallyAssignAllocate : boolean;

    allowedActions : string;
}

export interface StateDockControllersAdto {
    canSee : boolean;
    canManage : boolean;
    canBulkEdit : boolean;
}

type PssOptionalFeature =
    "IMPORT" | "IVR" | "CCPATROL" | "STREAMING" | "SILOS" | "NOTIFICATION" | "OBJECT_STORAGE" |
    "CREATE_COMPOSITE_CLIPS" | "ONVIF_PSS_AUTH" | "CLEARANCE" | "CENTRAL_MANAGER" |
    "MIDDLE_TIER" | "GRID" | "ASSISTED_REDACTION" | "RECORD_LIVE_STREAM" | "MIDDLEWARE_EXPORT" |
    "MEDIA_PROPERTIES" | "TVM" | "ASSET_IMPORT" | "MEDIA_PREPARATIONS" | "NESTED_INCIDENTS" |
    "DEVICES" | "LEGACY_INCIDENT_ATTACHMENTS" | "VIDEO_EDGE_NVR" | "CCVAULT_INCIDENT_EXPORT" |
    "COMPANION_APP" | "STREAMING_SERVER_EXPORT" | "SELF_SERVICE" | "INCIDENTS" |
    "ANTIVIRUS" | "USER_IMPORT_TOOL"
    ;


export interface StateSystemInfoAdto {
    appName : string;
    appVersion : string;
    databaseFingerprint : string;
    copyrightNotice : string;
    locale : string;
    licensedFeatures : PssOptionalFeature[];
    isConnectToServer : boolean;
    isCentralVideoManager : boolean;
    isUsingExternalDatabase : boolean;
    sqlServer: boolean;
    isArch64: boolean;
    osName: string;
    maxMemory: number;
    isGridMaster: boolean;
}

export interface LocaleAdto {
    localeName: string;
    localeDisplayName: string
    localeDescription: string
    isServer: boolean;    // is the current server locale
    isSupported: boolean; // is a "supported" locale
    isDev: boolean;       // this locale has been uploaded
    isClient: boolean;       // this is the current client locale
    devOnly: boolean;
    advancedOnly: boolean;
    isEnabled: boolean;
    isHelpIncluded: boolean;

    //'d' download this locale
    //'x' delete this locale right now
    //'X' can ever delete this locale
    //'c' change to this locale
    //'h' can be enabled/disabled
    allowedActions: string;
}

export interface HelpFileAttachmentAdto {
    name: string;
    fileId: number;
}

export interface BaseSettingsAdto {
    version : number; // must be round tripped back to server
    readOnly: boolean;
}

export interface AutoFetchSettingsAdto extends BaseSettingsAdto {
    autoFetchMetadata: boolean;
    autoFetchFootage: string;
    replicateKeys: boolean;
    replicateRoles: boolean;
    replicateUsers: boolean;
    replicateDeviceProfiles: boolean;
    replicateDeletionPolicies: boolean;
    replicateUserDefinedFields: boolean;
    replicateDeviceImages: boolean;
    congestionWarningEnabled: boolean;
    congestionWarningTimeHours: number;
    autoCancelEnabled: boolean;
    autoCancelTimeHours: number;
    replicateSynchroniseClocks: boolean;
}

export interface BackupSettingsAdto extends BaseSettingsAdto {
    backupEnabled : any;
    backupRetainDays : number;
    backupRetainHours : number;
    backupAvoidBusyTimes : boolean;
}

export interface DeletionPolicySettingsAdto extends BaseSettingsAdto {
    deletionPolicyAutoDeleteFootage: boolean;
    deletionPolicyKeepForSecsAfterRecord: number;
    deletionPolicyKeepForSecsAfterRemovedFromIncident: number;
    deletionPolicyKeepForSecsAfterDeleteRequested: number;
    deletionPolicyKeepForSecsAfterDownload: number;
    deletionPolicyKeepNonExportedFootage: boolean;
    deletionPolicyAutoDeleteIncidents: boolean;
    deletionPolicyEnableBookmarkedFootage: boolean;
    deletionPolicyAutoDeleteBookmarkedFootage: boolean;
    deletionPolicyKeepBookmarkedForSecsAfterRecord: number;
    deletionPolicyAutoDeleteAuditLogs: boolean;
    deletionPolicyKeepAuditLogsForSecs: number;
    deletionPolicyAutoAnnualDeleteAuditLogs: boolean;
    deletionPolicyKeepAuditLogsForAtLeastYears: number;

    // Fields to use to warn user when switching on automatic incident delete
    autoDeleteIncidentsAutoDeleteField: CustomFieldAdto;
    autoDeleteIncidentsForecast7: number;
    autoDeleteIncidentsForecast0: number;
}

export interface SharingPolicySettingsAdto extends BaseSettingsAdto {
    defaultAnonEmail: string;
    defaultAnonExpiryTime: number;
    defaultAnonPermissions: CustomFieldPermissionGroup[];
}

export interface DeviceSettingsAdto extends BaseSettingsAdto {
    fullBatteryRequired : boolean;
    minChargeTime : number;
    enableDeviceDiscovery : boolean;
    defaultDeviceAssignmentMode : DeviceAssignmentMode;
    downloadThrottleSize : number;
    encryptDownloads : boolean;
    mothballedDownloads : boolean;
    partialChargeBattery : boolean;
    deviceExpectConnectivityOnCharger : boolean;
    deviceConnectionLossRestartTime : number;
    downloadOldestFirst : boolean;
}

export interface TimecodeTrackSettingsAdto extends BaseSettingsAdto {

    config: TimecodeTrackConfigAdto;
}

export interface TimecodeTrackConfigAdto {
    elements: TimecodeTrackElementAdto[];
}

type TimecodeTrackElementType = 'OPERATOR'|'TIME_DATE'|'FRAME_COUNTER'|'RECORDING_TIME'|'DEVICE_SERIAL'|'PRE_RECORD_FLAG'|'TEXT'|'GPS'|'DEVICE_NAME'|'BATTERY_LEVEL';
type TimecodeTrackTimezoneType = 'UTC'|'LOCAL';
type TimecodeTrackTimeDateFormatType = 'CUSTOM'|'ISO';
type TimecodeTrackTimezoneDisplayType = 'NONE'|'OFFSET'|'NAME';
type TimecodeTrackClockDisplayType = 'TWELVE'|'TWENTY_FOUR';
type TimecodeTrackDateFormatType = 'DMY'|'MDY'|'YMD'|'DMY_DASH'|'MDY_DASH'|'YMD_DASH';
type TimecodeTrackYearFormatType = 'YY'|'YYYY';
type TimecodeTrackRecordingTimeStartType = 'FIRST_FRAME'|'RECORD_PRESSED';

export interface TimecodeTrackElementAdto {
    type: TimecodeTrackElementType;

    operatorMaxChars?: number;
    operatorMinChars?: number;

    timeDateFormat?: TimecodeTrackTimeDateFormatType;
    timeDateZone?: TimecodeTrackTimezoneType;
    timeDateZoneDisplay?: TimecodeTrackTimezoneDisplayType;
    timeDateClock?: TimecodeTrackClockDisplayType;
    timeDateDateFormat?: TimecodeTrackDateFormatType;
    timeDateYearFormat?: TimecodeTrackYearFormatType;
    text?: string;

    recordingTimeStartAt?: TimecodeTrackRecordingTimeStartType;

    gpsIncludeTrack?: boolean;
    gpsIncludeSpeed?: boolean;
}

export interface ExportSettingsAdto extends BaseSettingsAdto {
    exportsDefaultDvdMedia : string;
    exportsCanOverrideDvdMedia : boolean;
    incidentAutoExportEnabled : boolean;
    incidentAutoExportProfile : string;
}

type AutoFileExportMode = 'NONE' | 'FILE_EXPORT' | 'CLEARANCE_EXPORT' | 'MIDDLEWARE_EXPORT' | 'CC_VAULT_EXPORT';

export interface AutoFileExportSettingsAdto extends BaseSettingsAdto {
    autoFileExportMode : AutoFileExportMode;
    autoFileExportPath : string;
    autoFileExportName : string;

    defaultAutoFileExportPath : string;
    defaultAutoFileExportFileName : string;

    canSeeAutoFileClearanceExport : boolean;
    canSeeAutoFileMiddlewareExport : boolean;
    canSeeAutoFileCCVaultExport : boolean;
}

export interface LocaleSettingsAdto extends BaseSettingsAdto {
    serverDefaultLoginLocale: boolean;
    serverLocale: string;
}

type TwoFactorAuthenticationType = 'MANDATORY'|'PER_ROLE'|'DISABLED';

export interface RealmSettingSettingsAdto {
    realmSettings: RealmSettingAdto[];
    DEFAULT_PASSTHROUGH_MATCHER: string;
    DEFAULT_PASSTHROUGH_USERNAME: string;
}

export interface RealmSettingAdto {
    identifier: string;
    name: string;
    passthroughLoginMatcher: string;
    passthroughLoginUsername: string;
    useLocalAuth: boolean;
    siteIdentifiers: String[];
}

export interface LoginSettingsAdto extends BaseSettingsAdto {
    loginWarning : string;
    requireUserAgreement : boolean;
    userAgreement : string;
    userAgreementTitle : string;
    userAgreementAcceptanceText : string;
    twoFactorAuthenticationType: TwoFactorAuthenticationType;
    sessionTimeOut: number;
    elevationRequiresPassword: boolean;
    elevationTimeoutMinutes : number;
    elevationAutoElevate: boolean;
    isWindowsAuthSupported: boolean;
    realmSettings: RealmSettingSettingsAdto;
}

export interface ValidateLoginMatcherRequestAdto {
    passthroughLoginMatcher: string;
    passthroughLoginUsername: string;
    testWaffle: string;
}

export interface ValidateLoginMatcherResponseAdto {
    username: string
}

export interface CheckOAuthConfigResponseAdto {
    result: string
}

export interface MapSettingsAdto extends BaseSettingsAdto {
    useMaps : boolean;
    mapProvider: string; // GOOGLE, OPEN_STREET_MAP, ARCGIS
    mapLookupProvider: string; // GOOGLE, NOMINATIM, NONE, ARCGIS
    googleMapsAPIKey : string;
    osmTileServerUrl : string;
    arcGisTileServerUrl: string;
    arcGisServerUrl: string;
    arcGisAuthUrl: string;
    arcGisClientId: string;
    arcGisClientSecret: string;
    nominatimServerUrl: string;
    nominatimApiKey: string;
    mapDefaultLocation: GeoLocationAdto;
    distanceUnits: string; // METRIC, IMPERIAL
}

export interface ThumbnailSettingsAdto extends BaseSettingsAdto {
    thumbnailExpressionAudio : string;
    thumbnailExpressionPdf : string;
    thumbnailExpressionOther : string;
}

export interface ReportSettingsAdto {
    reportsAutoDeleteMinAge: number;
    scheduledReportTime: number; // offset seconds since midnight
    customSchedules: CustomScheduleAdto[];
}

export interface CustomReportScheduleAdto {
    customSchedules : CustomScheduleAdto[];
}

export interface CustomScheduleAdto {
    id : number;
    name : string;
    scheduleDates : ScheduleDateAdto[];
}

export interface ScheduleDateAdto {
    startDay : number;
    startMonth : number;
    endDay : number;
    endMonth : number;
}

export interface CustomScheduleImportResponseAdto {
    deleted : CustomScheduleImportResponseScheduleAdto[];
    edited : CustomScheduleImportResponseScheduleAdto[];
}

export interface CustomScheduleImportResponseScheduleAdto {
    name : string;
}

// Any updates to the notification type must be consistent with NotificationType.java
type NotificationType = 'SHARED_VIDEO' | 'OWNER_VIDEO_CHANGED' | 'SHARED_INCIDENT' | 'OWNER_INCIDENT_CHANGED' | 'RECORDED_VIDEO_DOWNLOADED' | 'COMPLETED_EXPORTS' | 'COMPLETED_IMPORTS';

export interface NotificationAdto {
    type?: NotificationType;

    videoShareCount: number;
    videoOwnerCount: number;
    incidentShareCount: number;
    incidentOwnerCount: number;
    videoDownloadedCount: number;
    completeExportsCount: number;
    completeImportsCount: number;

    totalCount: number;

    lastImportAwkTime: number; // time in milliseconds
}

type RtspAuthMode = 'NONE' | 'BASIC' | 'BASIC_WITH_ONVIF_AUTH';

export interface RtspSettingsAdto extends BaseSettingsAdto {
    rtspServerEnabled: boolean;
    rtspAuthMode : RtspAuthMode;
    rtspServerUser: string;
    rtspServerPass: string;
    rtspVideoCodec: string; // MPEG4, H264
    rtspAudioCodec: string; // G711_ULAW, AAC
    rtspOutputs: RtspOutputAdto[];
    rtspOutputsIps: RtspOutputIpAdto[];
    rtspOutputsPerIp : number;
    maxRtspOutputs : number;
    rtspMultiIpEnabledDeviceMode: string; // OFF, MULTI_IP, MULTI_DOMAIN
    rtspServerPort: number;
    rtspAutoChannelAssignmentEnabled: boolean;

    // read-only
    allowStreaming : boolean;
    allowPssUserAuth : boolean;
}

export interface SiteManagerSettingsAdto extends BaseSettingsAdto {
    siteManagerConnectToServer : boolean;
    siteManagerServerRmiHost : string;
    siteManagerServerRmiPort : number;
    siteManagerServerRmiUseSsl : boolean;
    siteManagerSiteIdentifier : string;
    siteManagerSitePassword : string;
    siteManagerBasestationRandomIdAsHex : string;
    siteManagerFetchSiteSecret : boolean;

    centralManager : boolean;
    allowMiddleTier : boolean;
    allowFetchSiteSecret : boolean;
}

export interface WebServerSettingsAdto extends BaseSettingsAdto {
    webServerUseCentralVideoManager: boolean;
    webServerListenAddress: string;
    webServerListenAddressPort: number;
    webServerUseListenAddressSSL: boolean;
    webServerEnableOldSslProtocols: boolean;
    webServerPublicAddress: string;
    webServerPublicAddressPort: number;
    webServerUsePublicAddressSSL: boolean;
    webServerCertificate: string;
    webServerCertificateDetails: SslDetailAdto;
    webServerUseWebSocketFeeds: boolean;
    licenceHasWebAddressScope: boolean;

    connectToServer: boolean;
    allowCentral: boolean;
    allowMiddleTier: boolean;
    silosEnabled: boolean;
}

export interface AdvancedSettingsFileAdto extends BaseSettingsAdto {
    fileText : string;
}

export interface SslDetailAdto {
    validFrom: number; // ms since epoch;
    validTo: number; // ms since epoch;
    subject: SslEntityAdto;
    issuer: SslEntityAdto;
}

export interface SslEntityAdto {
    email: string;
    commonName: string;
    orgUnit: string;
    org: string;
    locality: string;
    state: string;
    country: string;
}

export interface RtspOutputAdto {
    operator: UserNameAdto;
    device: string;
    tvmPanelIndex: number;
    lockedTimeStamp: number;
}

export interface RtspOutputIpAdto {
    address: string;
    mac: string;
    parentMac: string;
    assignedStart: number;
    assignedEnd: number;
}

export interface DashboardMessageAdto {
    id : number;
    type : any;
    title : string;
    text : string;
    link : string;
    canHide : boolean;
}

export interface PasswordComplexityAdto {
    primaryPasswordComplexity: PasswordComplexitySetAdto;
    alternatePasswordComplexity: PasswordComplexitySetAdto;
}

export interface PasswordComplexitySetAdto {
    version: number;
    enabled : boolean;
    minLen : number;
    minTypes : number;
    requireLowers : boolean;
    requireUppers : boolean;
    requireDigits : boolean;
    requireSpecials : boolean;
    isNotUsername : boolean;
    isAlternate : boolean;
    maxRepeatedChars : number;
    checkPreviousPasswords : number;
    minPasswordChangeInterval : number;
    maxPasswordChangeInterval : number;
    maxSequentialFailedLogins : number;
    loginAutolockTimeout : number;
    temporaryPasswordLife : number;
    disableAdminPasswordExpiry : boolean;

    defaultMaxSequentialFailedLogins: number;
}

export interface BandwidthRuleConfigurationAdto {
    bandwidthRule : BandwidthRuleAdto;
    highPriority : boolean;
}

export interface BandwidthRuleAdto {
    id : number;
    name : string;
    deletionTimeStamp : any;
    ruleProfileEntries : BandwidthRuleProfileEntry[];
    bandwidthGroup : boolean;
    slow : boolean;
}

export interface BandwidthRuleProfileEntry {
    daysOfWeek : number;
    startTime : number;
    endTime : number;
    minPriority : number;
    maxRateKpbs : number;
}

export interface PtzControlAdto {
    pan : number;
    tilt : number;
    zoom : number;
}

export interface LiveViewCropInfoAdto {
    left : number;
    right : number;
    top : number;
    bottom : number;
}

enum LiveViewRotation { IDENT = 0, ROT_90 = 1, ROT_180 = 2, ROT_270 = 3 };

export interface LocalVideoInputFrameInfoAdto {
    codec : "H264" | "JPEG" | "AAC" | "PCM_F32LE" | "MSE";
    aspectWidth : number;
    aspectHeight : number;
    crop : LiveViewCropInfoAdto;
    hFlip : boolean;
    sampleRate : number;
    channels : number;
    keepAlive : boolean;
    transform : LiveViewRotation;
    mimeCodec : string;
}

type SensorType = "GPIO" | "GAUGE"
type GpioValue = "UNKNOWN" | "INACTIVE" | "ACTIVE"
export interface LocalSensorAdto {
    name : string;
    type : SensorType;
    displayName : string;
    gpioValue : GpioValue;
    numericValue : number;
}

export interface TwoFactorAuthenticationAdto {
    canUserDisableTfa : boolean;
    canUserViewTfaDetails : boolean;
    isUserReplicated : boolean
    authenticationKey : string;
    authenticationCode : string;
}

export interface LicenseAgreementAdto {
    licenseText : string;
}

export interface InitialSetupAdto {
    agreedToLicense: boolean;
    username: string;
    password: string;
    encryptFileSpaces: boolean;
    storageLocation: string;
}

export interface StateLocalVideoInputAdto {
    id : number;
    name : string;
    deviceName : string;
    deviceDid: string;
    capabilities : string;
    isWmic : boolean;
}

type IvrPlatformType = 'OTHER' | 'FLEET_PC' | 'PI_IVR' | 'VBOX_3210';
export interface StateInCarAdto {
    isIvr : boolean;
    allowIncarMode : boolean;
    allowFullScreen : boolean;
    allowRecord : boolean;
    allowViewSwitch : boolean;
    localVideoInputs : StateLocalVideoInputAdto[];
    inCarSearchDays : number;
    supportsRecording : boolean;
    canSeeLiveView: boolean;
    updateRequired: boolean;
    localInputsEnabled: boolean;
    buttons: IvrButtonsAdto;
    ivrPlatform : IvrPlatformType;
    showUiSensors: boolean;
    fastReconnect: boolean;
    deviceName: string;
    canConfigureWifi: boolean;
    defaultAdminUsername: string;
}


export interface StateTvmAdto {
    canView : boolean;
    canViewWall: boolean;
    maxEventAgeSeconds: number;
}

export interface StateSpecialLoginModeAdto {
    mandatoryTFASetup: boolean;
    mandatoryInitialSetup: boolean;
    mandatoryMustUseLocalAddress: boolean;
    mandatoryCCVaultPairing: boolean;
    anotherServerRunning: boolean;
    localAddressUrl : string;
    ccVaultDeviceId: string;
    manadatoryElevation: boolean;
}

export interface StateAdto {
    // User/login stuff
    user : UserNameAdto;
    loggedIn : boolean;
    showHelp : boolean;
    silo : SiloAdto;
    cvmPassthroughAuth: boolean;
    previousLoginDate : number; // ms since epoch
    canChangePassword : boolean;
    canViewUserWifiNetworks : boolean;
    canEditUserWifiNetworks : boolean;
    canProvisionCompanionApp : boolean;
    canProvisionCompanionAppToSelf : boolean;
    systemInfo : StateSystemInfoAdto;
    autoLogin : "NONE" | "DEFAULT" | "STICKY";
    hasDefaultLogin : boolean; // true if there is a default login available
    localAddressUrl : string;
    csrfToken : string;
    canChangeDisplayName : boolean;
    anonymousAccessRedirectPath? : string;

    // Information about different functions
    dashboard : StateDashboardAdto;
    videos : StateVideosAdto;
    incidents : StateIncidentsAdto;
    exports : StateExportsAdto;
    compAnalyses : StateCompAnalysesAdto;
    reports : StateReportsAdto;
    auditLogs : StateAuditLogsAdto;
    settings : StateSettingsAdto;
    devices : StateDevicesAdto;
    dockControllers : StateDockControllersAdto;
    specialLoginMode : StateSpecialLoginModeAdto;
    assetImports : StateAssetImportsAdto;

    // Settings which affect the website
    allowFeed : boolean;
    ajaxTimeout : number;
    ajaxLongPollTimeout : number;
    sessionExpiryTime : number;
    defaultPlayQuality : string;
    useMaps : boolean;
    scheduledReportTime: number;
    mapProvider: string; // GOOGLE, OPEN_STREET_MAP
    mapLookupProvider: string; // GOOGLE, NOMINATIM, NONE
    googleMapsAPIKey : string;
    osmTileServerUrl : string;
    arcGisTileServerUrl: string;
    arcGisAuthEnabled: boolean;
    nominatimServerUrl: string;
    nominatimApiKey: string;
    mapDefaultLocation: GeoLocationAdto;
    distanceUnits: string; // METRIC, IMPERIAL
    disableCopyPaste: boolean;
    disablePrint: boolean;
    developmentMode : boolean;
    productionMode : boolean;
    incidentNoun : string;
    devicesMayBeSources : boolean;
    sessionLocale : string;
    availableHelpLocales: string[];
    playerKeyBinds : any; // map<string, string>
    useWebSocketFeeds : boolean;

    //In car
    inCar : StateInCarAdto;

    //TVM
    tvm : StateTvmAdto;

    //Elevation Roles
    elevatedPrivilegeRoles: PssRoleSummaryAdto[];
    elevatedPrivilegeRole: PssRoleSummaryAdto;
    privilegeTimeout: number;

    loginType: string;
}

class TwoFactorAuthenticationKeyAndLabel {
    authenticationKey : string;
    authenticationLabel : string;
}

class UserNotificationTestAdto {
    notificationAddress : string;
}

class ChangePasswordRequestAdto {
    currentPassword : string;
    newPassword : string;
}

class IncidentDeleteAdto {
    deleteFieldValues : CustomFieldAdto[];
}

class ChangeDisplayNameRequestAdto {
    displayName : string;
}

//
// Media server types
//

export interface VideoFrameAdto {
    time: number;
    frame: string;
    burnin: any;
    p: boolean; // is this a p-frame.  If missing or false, this implies it's an I-frame.
}

export interface VideoFramesAdto {
    srcWidth: number; // original width of the frames (actual frames may have been scaled down)
    srcHeight: number;// original height of the frames (actual frames may have been scaled down)
    width: number;    // frame width
    height: number;   // frame height
    darw: number;     // display aspect ratio width
    darh: number;     // display aspect ratio height
    mwscale: boolean; // true if frames were scaled down because of maxDimension specification in request
    frames:VideoFrameAdto[];
    error:string;
    next:number;
    bof:boolean;      // true if searching backwards and passed start of file
    eof:boolean;      // true if searching fowrards and passed start of file
    empty: boolean;   // true if there are no video frames (e.g. audio-only)
}

export interface LoginRequestAdto {
    userName : string;
    password : string;
    userAgreementConfirmed : boolean;    // true if the user has confirmed the user agreement.
    tfaCode : string;
    disableCsrfCookie : boolean
}

type LoginFailure = "AUTH_FAILED" |
    "ACCOUNT_LOCKED" |
    "NO_PERMISSION" |
    "TOO_MANY_FAILURES" |
    "TEMPORARY_PASSWORD_EXPIRED" |
    "PASSWORD_CHANGE_REQUIRED" |
    "NEW_PASSWORD_INVALID" |
    "VERSION_MISMATCH" |
    "SERVER_ERROR" |
    "UNKNOWN" |
    "TWO_FACTOR_AUTHENTICATION_REQUIRED" |
    "TWO_FACTOR_AUTHENTICATION_FAILED" |
    "LOGIN_BY_EMAIL_REQUIRED"

export interface LoginResponseAdto {
    success : boolean;
    failure: LoginFailure;
    errorMessage: string;
    badName : boolean; // bad username/password
    noPermission : boolean; // correct username/password, but this user isn't allowed to log into the web
    defaultUri : string; // initial page for this user
    passwordChangeNotPersistent : boolean;
    userAgreement: string; // markup for the configurable user agreement text
    twoFactorAuthenticationRequired: boolean;
    userAgreementTitle: string;
    userAgreementAcceptanceText: string;
}

export interface ExportAdto {
    id : number; // id of export - null on request
    exportProfile : ExportProfileAdto;
    creationTime : moment.Moment; // date in ms since epoch - ignored on creation request
    completionTime : moment.Moment; // date in ms since epoch - ignored on creation request. null if job has not completed
    description : string;
    signature : string; // null on request
    owner : UserNameAdto; // can be null; system initiated exports have no owner - null on request
    running : boolean ;
    ready : boolean;
    hasError : boolean;
    status : string;
    // combination of characters; each character represents an action which the current user is allowed to perform:
    //  's' - share export
    //  'd' - delete export
    //  'l' - view export audit log
    //  'x' - download this export
    //  'r' - retry export (only makes sense if hasError is true)
    allowedActions: string;
    errorStack: string;
}

type MetadataGenerationLevel = 'PARENT_AND_CHILDREN' | 'PARENT_ONLY' | 'CHILDREN_ONLY';

type OptionalExportBool = 'YES' | 'NO' | 'YES_EDITABLE' | 'NO_EDITABLE' | 'NOT_APPLICABLE';

export interface ExportProfileAdto {
    id? : number;
    type : string; // VIDEO_DVD - VIDEO_MP4 - EVIDENCE_EXPORT - XMP - GENETEC_CLEARANCE
    name : string;
    isDefault : boolean;
    boxFolderId : string;
    boxConfigJson : string;
    boxEmail : string;
    boxProxyHost: string;
    boxProxyPort : number;
    readyRuleExpression: string;
    selectClips: boolean;

    // These fields only filled in in ExportTemplateAdto.profiles and when retrieving the list of profiles from the server
    enabled : boolean;
    titlePages : OptionalExportBool;
    overlay : OptionalExportBool;
    watermark : OptionalExportBool;
    originalFootage : OptionalExportBool;
    confidentialMetadata : OptionalExportBool;
    ntscDvd: OptionalExportBool;
    convertedFootage: OptionalExportBool;
    filePerClip: OptionalExportBool;
    exportMetadataTemplate: ExportProfileTemplateAdto;
    originalFootageTemplate: ExportProfileTemplateAdto;
    convertedFootageTemplate: ExportProfileTemplateAdto;
    includeCommitFile: boolean;
    readyRuleResult: string;
    outputDirectory: string;
    encrypt: boolean;
    exportTitlePageTemplate: ExportTitlePageTemplateAdto

    overwriteExistingFiles: boolean;
    metadataLevel: MetadataGenerationLevel;
}

export interface ExportProfileTemplateAdto {
    useTemplateForFilename: boolean;
    filenameTemplate: string;
    addMetadataFile: boolean;
    metadataFilenameTemplate: string;
    metadataContentTemplate: string;
}

export interface ExportTitlePageTemplateAdto {
    useTemplateForTitlePage: boolean;
    titlePageTemplate: string;
}

export interface CreateExportAdto
{
    exportProfile: ExportProfileAdto;
    description: string;
    includeFootage: boolean;
    includeMetadata: boolean;
    includeTitlePages: boolean;
    includeOverlay: boolean;
    includeWatermark: boolean;
    ntscDvd: boolean;
    maxMediaSize: number;
    includeConvertedFootage: boolean;
    selectedClipIds: number[];
}

export interface ExportTemplateAdto {
    description : string;
    dvdMedia: string; // template value
    canOverrideMedia: boolean; // template value
    isLocal : boolean; // true if none of the videos are remote
    hasRestrictedClips : boolean;
    incidentId : number;
    profiles : ExportProfileAdto[];
}

export interface CreateSubscriptionAdto {
    feedId? : any;
}

export interface ExportSubscriptionAdto extends CreateSubscriptionAdto {
    includeOld? : boolean;
    includeCompletedAuto? : boolean;
    states? : string; // desired export states (p = pending, r = running, s = succeeded, f = failed), e.g. 'sf' will give you succeeded and failed jobs
    owned? : boolean;
    supervised? : boolean;
    signaturePrefix? : string;
    profile? : number; // TBD: how to get valid values
}

export interface ExportCountSubscriptionAdto extends CreateSubscriptionAdto {
}

type AppWarningMode = 'ALL'|'IVR';

export interface AppWarningsSubscriptionRequestAdto extends CreateSubscriptionAdto {
    warningMode?: AppWarningMode;
}

export interface AccessUrlAdto {
    id: number; // id of share; null on request
    type: string; // AccessUrlType { SHARE, TRAINING_ARTICLE }
    recipientEmail: string;
    title: string;
    text: string;
    url: string;
    expiryDate: number; // ms since epoch

}

export interface AuditLogAdto {
    client : string;
    server : string;
    timeStamp : number;
    eventType : string;
    user : string;
    message : string;
    location : string;
    affectedVideoFileUrn : string;
    affectedImportExportJobSignature : string;
    affectedDevice : string;
    affectedSource : string;
    affectedIncidentSignature : string;
    affectedReportJobSignature : string;
    affectedUser : string;
    affectedGroup : string;
    affectedOperator : string;
    oldAffectedUser: string;
    oldAffectedGroup: string;
    affectedAPIKey : string;
}

type SimpleWebStatus = 'Unknown' | 'InUse' | 'InUseConnected' | 'Busy' | 'Downloading' |
    'Unassigned' | 'Ready' | 'Error' | 'Unavailable' | 'UpgradeComplete' | 'UnconfiguredDevice' | 'Deleted' |
    'Allocated' | 'ServiceRequired';

type ChargeStatusFilter = 'MeetsCriteria'|'FailsCriteria'|'FailsCriteriaCharging'|'FailsCriteriaNotCharging'|'Charged'|'Charging';

export interface DeviceSubscriptionAdto extends CreateSubscriptionAdto {
    name? : string;
    operatorNames? : string[];
    dockControllerId? : string;
    showManagedElsewhere? : boolean;
    showForgotten? : boolean;
    owned? : boolean;
    supervised? : boolean;
    includeAssigned? : boolean;
    includeUnassigned? : boolean;
    docked? : boolean;
    location? : string;
    frozen?: boolean;
    streamAvailable?: boolean;
    assignable?: boolean;
    silo?: number;
    statuses?: SimpleWebStatus[]; // see status in DeviceSummaryStatusAdto to see valid values
    customStatus?: string;
    showRemote? : boolean;
    charge? : ChargeStatusFilter;
}

type AutoUpgradeStatus = 'Upgraded' | 'Upgrading' | 'AwaitingUpgrade' | 'UpgradeFailed' | 'Disabled' | 'DisabledGlobally' |
    'Unknown' | 'NotEligible' | 'NotDowngrading' | 'AwaitingImage';

type DeviceAlertLevel = 'NONE' | 'LOW' | 'HIGH';

type SimpleWebChargeStatus = 'Charged' | 'ChargingReady' | 'ChargingNotReady' | 'NotChargingDockedReady'
    | 'NotChargingDockedNotReady' | 'NotCharging' | 'OldSite' | 'BadBattery';

export interface DeviceSummaryStatusAdto {
    id : string;
    name : string;
    operator : UserNameAdto;
    preAssignedOperator? : UserNameAdto;
    status : SimpleWebStatus;
    fullStatus : string;
    customStatus: string; // If user has manually set the status
    chargeStatus : SimpleWebChargeStatus;
    location : string; // Either location OR lastLocation is filled in
    lastLocation : string;
    percentDownloaded? : number; // only present during downloading
    error? : string; // only present if status is "error"
    firmware: string;
    isRunningDefaultFirmware : boolean;
    touchAssign: boolean;
    serialNumber: string;
    autoUpgrade: boolean;
    alertLevel: DeviceAlertLevel;
    // Service required status
    serviceRequired: boolean;

    // combination of characters; each character represents an action which the current user is allowed to perform:
    //  'p' - can cancel pre-assign
    //  'a' - can assign a device
    //  'r' - can return a device
    //  'c' - can configure device
    //  'i' - can resolve issue on this device
    //  'f' - can factory reset this device
    //  'u' - can upgrade device
    //  'l' - can retrieve audit log
    //  'k' - can configure shareable key
    //  'd' - can delete
    //  'S' - can edit silo
    //  'R' - can visit remote site web proxy for device
    allowedActions : string;
}

export interface DeviceProfileSummary {
    deviceProfileName : string;
    wifiProfileName : string;
}

export interface DeviceAdto extends DeviceSummaryStatusAdto {
    // When PUTting the DeviceAdto, only the following fields are considered by the server:
    //   id, name, customStatus, touchAssign, defaultDeviceProfile, staticIpConfig, silo, clearAssignedOperator
    revision: string;
    chassis: string;
    batteryId: string;
    microControllerFirmwareApp: string;
    microControllerFirmwareBoot: string;
    storage: string;
    basestation: string;
    accessControlKey: string;
    recording: boolean;
    hasStaticIp: boolean;
    staticIpConfig: StaticIpAddressConfigAdto;
    rtspUrl: string;
    streaming: boolean;
    silo?: number;
    profiles?: DeviceProfileSummary;
    lastSeenTime? : number; // ms since epoch
    deviceType? : string; // UNKNOWN|OTHER|VB_100_200|VB_300|VT_50|VT_100
    remoteSiteId? : number; // if device is remote, then the ID of the site which owns the device
    autoUpgradeStatus : AutoUpgradeStatus;
    locationEntry : GeoFixEntryAdto;
}

export interface Pss3BootstrapConfigurationAdto {
    wifiProfileId : number;
    deviceProfileId: number;
    did : string;
    operator: string;
    serialNumber: string;
}

export interface CompanionAppProvisionSetupRequestAdto {
    operator? : UserNameAdto;
}

export interface StaticIpAddressConfigAdto {
    ip : string;
    mask : string;
    gateway : string;
    dnsServer1 : string;
    dnsServer2 : string;
}

export interface DeviceIssueAdto {
    issueType : string; // COMMS, DISK_SPACE, FAILURES
    tooOldForAutoDelete : boolean; // only applies to disk space
    allowedActions : string; // string containing: d - delete, i - ignore, r - retry
}

export interface DeviceIssueResolutionAdto {
    resolution : string; // DELETE, IGNORE, RETRY
}

export interface DeviceLiveRecordAdto {
    record : boolean;
}

type ReportType = 'DEVICES' | 'SITES' | 'MANAGEMENT' | 'USER_SUMMARY' | 'INCIDENT_SUMMARY' | 'INCIDENT_METADATA' |
    'VIDEOS' | 'USER_EXPORT' | 'AUDIT_ENTRIES' | 'OPERATOR_RECORDER_SUMMARY' | 'ASSIGNMENT' | 'EQUIPMENT' |
    'BATTERY_AUDIT' | 'DEVICE_AVAILABILITY' | 'SCOTRAIL_ESTATE_OVERVIEW' | 'SCOTRAIL_DETAILED_USER_MONITOR' |
    'SCOTRAIL_OVERVIEW_USER_MONITOR' | 'DEVICE_FIELD_TRIP' | 'OPERATOR_ACTIVITY' | 'USER_EXPORT_FULL';

export interface CreateReportOptionsAdto {
    reportTypes: ReportTypeAdto[]; // Populated by server
    reportType: ReportType; // Populated by the client
    startDate: number;
    endDate: number;
    name: string;
    config: string; // ReportConfigAdto  - JSON serialised
    downloadFormat: string;
    autoFields: ReportAutoFieldAdto[];
    defaultReportTime: number; // offset seconds since midnight
    customSchedules: CustomScheduleAdto[];
    args: string;
}

export interface ReportTypeAdto {
    reportType: ReportType;
    name: string;
    isCsv: boolean;
    isDevice: boolean;
    isCvm: boolean;
    isVisible: boolean;
}

export interface ReportAutoFieldAdto {
    fieldName : string;
    description : string;
}

export interface ReportJobAdto {
    id : number;
    signature : string;
    creationTime : number; // ms since epoch
    name : string;
    status : string;
    type : string;

    //  'v' - can view a report
    //  'd' - can download a report
    //  'D' - can delete a report
    //  'r' - can re-run a report
    allowedActions: string

    percentComplete: number; // may be null
    message: string; // optional message
}

export interface ReportSubscriptionAdto extends CreateSubscriptionAdto {
    scheduledReportId?: number;
}

export interface ScheduledReportAdto {
    id?: number;
    creationTime?: number; // ms since epoch
    nextPeriodEnd?: number; // ms since epoch
    message?: string;
    name: string;
    type: string;
    config?: string;  // ReportConfigAdto - JSON serialised
    enabled?: boolean;
    //frequency: VmApp.ScheduledReports.TimePeriod
    //reportPeriod: VmApp.ScheduledReports.TimePeriod
    freqDayOfWeek?: number; // 1: Sunday - 7: Saturday
    freqDayOfMonth?: number // 1-31
    nextRunTime?: number; // ms since epoch
    showDownloadUrl?: boolean;
    autoCopyFilePath: string;
    autoCopyEnabled: boolean;
    reportTime: number;
    customSchedule: CustomScheduleNameAdto;
    args?: string;
    maxOldReports: number;
}

export interface CustomScheduleNameAdto {
    name : string;
    id : number;
}

export interface ScheduleSubscriptionAdto extends CreateSubscriptionAdto {
}

export interface PssRoleSummaryAdto {
    id : number;
    name : string;
}

export interface DomainUserAdto {
    id : number;
    username : string;
    domainname : string;
}


type PssUserType = 'USER' | 'GROUP';

export interface PrincipalAdto {
    type: PssUserType;
    id : number;
    username : string;
    password : string; // on read will be '' if the user has no password or 'X' if the user has a password.
                       // should be omitted on post if the password is not to be updated.
    displayName : string;
    enabled : boolean;
    locked : boolean;
    lockedUntilDate : moment.Moment;
    unlock : boolean; // sent by client
    replicated : boolean;
    temporaryPassword: boolean;
    scope : string;
    rfidId : string;
    roles : PssRoleSummaryAdto[];
    vdsSiteAccountAdto : VdsSiteAccountAdto;
    domainUsers : DomainUserAdto[];
    autoShareWithUsers : UserNameAdto[];
    usersWhoShareWithMe : UserNameAdto[];
    createVideoSharesFor : UserNameAdto[];
    createIncidentSharesFor : UserNameAdto[];
    supervisedUsers : UserNameAdto[];
    wifiNetworks : WifiNetworkAdto[];
    mobile : string;
    email : string;
    silo: SiloAdto;
    twoFactorAuthenticationEnabled: boolean;
    mobileValidationRegex: string;

    sourceGroups: UserNameAdto[]; // Only for Permission Report - the group memberships that led to a given user belonging to this group.
}

class VideoUploadMetadataAdto {
    deviceLongId : string; // Globally unique identifier for device which created video, if known
    deviceName : string; // Display name for device which created video, if known
    createDeviceIfMissing : boolean; // If device not in the database, will it be created?
    operator : UserNameAdto; // Optional (if not provided, operator default to user who uploads file)
    startTime : moment.Moment;  // Start of recording (in future will be optional).
    endTime : moment.Moment;    // End of recording (in future will be optional; not optional right now)
    fileName : string;   // File name which uniquely identifies this video file on this device
}

export interface VideoUploadResultAdto {
    videoFileId : number; // video file ID of file
    uploaded : boolean;   // Video CANNOT be uploaded if this is true
    expunged : boolean;
}

export interface PssPermissionAdto {
    id : number;
    displayOrder : number; // a key which can be used to sort permissions within a category
    description : string;
    category : string;
    action : string;
    relationship : string;
    assignable : boolean; // does logged in user have permission to add/remove this permission to/from a role
    bannedForSiloUsers: boolean; // If true, this permission will have no effect for Silo users
    advOnly: boolean; // permission only shown when in adv-only mode
    sourceRoles: PssRoleSummaryAdto[]; // Only for Permission Report - the roles that led to this permission being granted.
}

export interface PssRoleAdto {
    id : number;
    name : string;
    description : string;
    enabled : boolean;
    deleted : boolean;
    predefined : boolean; // if true, then cannot be deleted or edited in any way
    requiresAlternatePasswordComplexity : boolean;
    addNewUsersToThisGroup : boolean;
    permissions : PssPermissionAdto[]; // not filled in when reading role list
    assignable : boolean; // does logged in user have permission to add/remove this role to/from users
    hasLoginPermission : boolean; // does this role contain a permission to allow a user to log in
    defaultDeviceProfile : DeviceProfileNameAdto;
    roleTwoFactorAuthenticationType: string; //MANDATORY, OPTIONAL, DISABLED
    requiresElevation: boolean;
    sourceGroups: UserNameAdto[]; // Only for Permission Report - the groups that led to this role being attached to a user / group
    roleAssignmentTier: number;
}

export interface UserExportProfileAdto {
    exportProfile: ExportProfileAdto;
    sources: UserNameAdto[]; // Only for Permission Report - the groups that led to this export profile being attached to a user / group
}

export interface EffectivePermissionsAdto {
    permissions: PssPermissionAdto[];
    roles: PssRoleAdto[];
    groups: PrincipalAdto[];
    networks: WifiNetworkAdto[];
    deviceProfiles: EffectivePermissionsDeviceProfilesAdto[];
    defaultWifiProfile: WifiProfileAdto;
    exportProfiles: UserExportProfileAdto[];
    roleAssignmentTier: PssRoleAdto;
    roleAnyPermittedExportProfile: PssRoleAdto;
}

export interface AssignDeviceOptionsAdto {
    operator : UserNameAdto; // default user assignment
    operatorEditable : boolean; // if false, then assigned operator must be the value specified in "operator"
    assignmentMode : DeviceAssignmentMode; // default value for the auto reassign option
    profileEditable: boolean;
    deviceProfiles : DeviceProfileNameAdto[];
    defaultDeviceProfile: DeviceProfileNameAdto;
    wifiProfileEditable: boolean;
    wifiProfiles: WifiProfileNameAdto[];
    defaultWifiProfile: WifiProfileNameAdto;
}

export interface UserAssignDeviceOptionsAdto {
    defaultDeviceProfile: DeviceProfileNameAdto;
    pairingMutexOwner : string;
    userHasWifiNetworks: boolean;
}

type DeviceProfileFamily = 'GENERIC'|'VB'|'VB_400'|'VT'|'BW'

export interface DeviceProfileNameAdto {
    id : number;
    name : string;
    family : DeviceProfileFamily;
    isDefault : boolean;
    isCompatibleWithRtsp : boolean;
    requiresPairingMutex : boolean;
    requiresWifi: boolean;
}

export interface WifiProfileNameAdto {
    id : number;
    name : string;
    isRtspEnabled : boolean;
    hasWifiNetworks: boolean;
    isUserWifiAllowed: boolean;
}

type DeviceLedPattern = 'SOLID_RED'|'SOLID_GREEN'|'BLINKING_RED'|'BLINKING_RED_TOP_ONLY'|'DIMMED_GREEN_TOP_ONLY';

export interface DeviceLedPatternSettings {
    customiseLedPatternEnabled: boolean;
    recordLedPattern: DeviceLedPattern;
    prerecordLedPattern: DeviceLedPattern;
}

type DeviceProfileIdleBehaviour = 'SHUTDOWN'|'STANDBY';

type DeviceProfileVideoResolution = "STANDARD" | "HIGH" | "FULL_HD";
type DeviceProfileVideoOptimisation = 'QUALITY' | 'BALANCED' | 'STORAGE';
type DeviceProfileVideoEncoder = 'H264' | 'H265';
type DeviceProfileAudioCodec = 'AAC' | 'PCM';

export interface DeviceProfileAdto {
    id : number;
    name : string;
    family : DeviceProfileFamily;

    idleOffSinceChargerSecs : number;
    yaHolsterAwareCount : number;
    parEnabled : boolean;
    parDelaySeconds: number;
    parBeaconTimeoutMs: number;
    parSensitivityRangeRssi: number;
    bleRadioSmartReady : boolean;
    bluetoothRadioType : DeviceBluetoothRadioType;
    radioEmergencyActivatesRecordings: boolean;

    alarmOnStorageFull : boolean;
    alarmOnLowBattery : boolean;
    alarmOnStartStopRecording : boolean;
    alarmWhileRecordingPeriod : number;
    hushModeAlarmsEnabled : boolean;
    usbBuzzerEnabled : boolean;
    streamingOnly : boolean;
    prerecordLedEnabled : boolean;
    ledPatternSettings: DeviceLedPatternSettings;
    recordingAlarmSettings: RecordingAlarmSettingsAdto;

    burnInDateTime : boolean;
    overwriteFootageWhenFull : boolean;
    prerecordSeconds : number;
    frontLedsEnabled : boolean;
    recordAudio : boolean;
    prerecordAudio : boolean;
    gpsEnabled : boolean;
    audioConsentRequired : boolean;

    videoResolution : DeviceProfileVideoResolution;
    videoOptimisation: DeviceProfileVideoOptimisation;
    videoEncoder: DeviceProfileVideoEncoder;
    frameRate : number;
    enhancedNightVision : boolean;

    audioCodec: DeviceProfileAudioCodec;

    deviceModeSettings: DeviceModeSettingsAdto;

    controlSets : DeviceProfileControlSetAdto[];

    settingOverrides : string;
    jsonOverrides : string;

    allowedActions : string;

    idleBehaviour : DeviceProfileIdleBehaviour;

    holdTiming : DeviceProfileButtonTiming;
    doubleClickTiming : DeviceProfileButtonTiming;

    holdSlowTiming: number;
    holdNormalTiming: number;
    holdFastTiming: number;

    doubleClickSlowTiming: number;
    doubleClickNormalTiming: number;
    doubleClickFastTiming: number;
}

type DeviceProfileButtonTiming = 'SLOW' | 'NORMAL' | 'FAST';

export interface DeviceModeSettingsAdto {
    deviceSettings: DeviceModeSettingAdto[];
}

type DeviceModeType = 'NORMAL'|'HUSH';

export interface DeviceModeSettingAdto {
    type: DeviceModeType;
    ledsEnabled: boolean;
    beepsEnabled: boolean;
    hapticFeedbackEnabled: boolean;
    xSeriesLedsEnabled: boolean;
    xSeriesHapticFeedbackEnabled: boolean;
}

export interface RecordingAlarmSettingsAdto {
    recordingAlarmSettings: RecordingAlarmSettingAdto[];
}

type RecordingAlarmMode = 'PRERECORD'|'RECORD';

export interface RecordingAlarmSettingAdto {
    recordMode: RecordingAlarmMode;
    beepsEnabled: boolean;
    hapticFeedbackEnabled: boolean;
    alarmIntervalSeconds: number;
}

export interface DeviceProfileControlSetAdto {
    deviceTypes : string[]; //VB100, VB200, VB300, X100, X200
    gestures : DeviceProfileGestureMappingAdto[];
    rules : DeviceProfileControlRuleAdto[];
}

type DeviceProfileAction = 'NONE'
    | 'START_STOP_RECORDING'
    | 'START_RECORDING'
    | 'STOP_RECORDING'
    | 'SHUTDOWN'
	| 'STATUS'
    | 'RECORD_BOOKMARK'
    | 'ENTER_COVERT_MODE'
    | 'EXIT_COVERT_MODE'
    | 'TOGGLE_COVERT_MODE'
    | 'ENTER_SAFETY_MODE'
    | 'EXIT_SAFETY_MODE'
    | 'TOGGLE_SAFETY_MODE'
    | 'WAKE_WIRELESS'
    | 'START_WIRELESS'
    | 'STOP_WIRELESS'
    | 'TOGGLE_WIRELESS'
    | 'AUTHORIZE_AUDIO'
    | 'START_PRE_RECORD'
    | 'STOP_PRE_RECORD'
    | 'TOGGLE_PRE_RECORD'
    | 'PAIR_PERIPHERAL'
    | 'BYPASS_PERIPHERAL_WARNING'
    ;

export interface DeviceProfileGestureMappingAdto {
    control : string;   //SLIDE, RECORD_BUTTONS, FUNCTION_BUTTON
    gesture : string;   // Gestures you can do with a slide
                        // SLIDE_UP_DOWN,
                        //
                        // // Gestures you can do with a pair of buttons
                        // SQUEEZE,
                        // SQUEEZE_AND_HOLD,
                        // CLICK_ONE,
                        // HOLD_ONE,
                        //
                        // // Gestures you can do with a single button
                        // CLICK,
                        // HOLD
    allowedActions : DeviceProfileAction[];
    action : DeviceProfileAction;
}

export interface DeviceProfileConditionAdto {
    control : string;   //SLIDE, RECORD_BUTTONS, FUNCTION_BUTTON
    gesture : string;   // Gestures you can do with a slide
                        // SLIDE_UP_DOWN,
                        //
                        // // Gestures you can do with a pair of buttons
                        // SQUEEZE,
                        // SQUEEZE_AND_HOLD,
                        // CLICK_ONE,
                        // HOLD_ONE,
                        //
                        // // Gestures you can do with a single button
                        // CLICK,
                        // HOLD
    action : DeviceProfileAction;
}

export interface DeviceProfileControlRuleAdto {
    userChange : DeviceProfileConditionAdto;
    conditions : DeviceProfileConditionAdto[];
    action : DeviceProfileConditionAdto;
}


export interface DeviceInputAdto {
    id : number;
    name : string;
    description : string;
    codecSettings : CodecSettingsAdto[];
}

export interface CodecSettingsAdto {
    id : number;
    name : string;
    isDefault : boolean;
}

type DeviceBluetoothRadioType = "NONE"|"TETRA"|"MOTOTBRO"|"APX";

type DeviceAssignmentMode = "SINGLE"|"PERMANENT"|"ALLOCATED";

export interface AssignOperatorAdto {
    operator : UserNameAdto;
    deviceProfileId : number; // optional - if not provided, then default profile for device/user is used
    wifiProfileId : number;
    assignmentMode : DeviceAssignmentMode;
    bleAssignEnabled: boolean;

    serialNumber: string; // optional and only used for config generation.
}

export interface VdsSiteAccountAdto {
    id: number;
    identifier: string;
    name: string;

    lastSeen?: moment.Moment;
    synced?: boolean;

    uploading?: number; // Number of exports in progress for this site
    oldestJobDate?: moment.Moment; // The date of the oldest upload job in progress for this site

    state: string;
    password: string;
    autoFetchFootageMode: string;
    defaultAutoFetchFootageMode: string;
    deleteFootageAfterUpload: boolean;

    bandwidthRuleId: number;
    bandwidthRuleName: string;
    siteSecret: string;
    local: boolean;
    publicAddress?: string;

    incompatibleConfig : boolean;
    version : string; // not filled in if site is not connected.  Set to ? if site version is too old to provide version info

    allowedActions: string;
}

export interface EdgeControllersettingsAdto {
    siteId : number
    serial : string
    wifiFile? :  string
    networkFile? : string
    wifiOption : string
    networkOption : string
    includeConfig? : boolean
    wifiSsid? : string
    wifiPassword? : string
    address? : string
    gateway? : string
    dns1? : string
    dns2? : string
    ntp1? : string
    ntp2? : string
}

export interface VdsSiteAccountSubscriptionAdto extends CreateSubscriptionAdto {
    identifier?: string; // VdsSiteAccount identifier
    includeDeleted?: boolean;
}


export interface ClientLogReportAdto {
    title: string;
    message: string;
    url: string;
    report: any;
}

export interface ClientTransferInfoAdto {
    data : number[][]; // a list of (timeoffset, datareceived) data points for the download
    timeoutMs : number; // timeout used on the request
}

export interface FailAnalysisAdto {
    result : string; // "SLOW_SERVER", "UNKNOWN", "SLOW_TRANSFER"
    serverBytesPerSecond : number; // speed at which server generated the data for the request
    streamBytesPerSecond : number; // speed of data (i.e. approximate speed at which everything needs to run to avoid buffering).  May be zero.
    transferBytesPerSecond : number; // apparent speed at which client was transferring data
}

export interface UserResourceReassignAdto {
    from: UserNameAdto;
    to: UserNameAdto;
    shareOption: string; // MOVE, LEAVE or DELETE
}

export interface UserResourceReassignResultAdto {
    videoSharesAffected: number;
    incidentSharesAffected: number;
    incidentsAffected: number;
    videoFilesAffected: number;
    exportJobsAffected: number;
}

class AttachedFileUploadMetadataAdto {
    id?: number;
    fileName: string;
    size: number;
    notes?: string;
}

export interface DeviceImageAdto {
    id : number;
    name : string;
    imageType: string;      // pss_legacy, pss, pss_ptest, dock_controller, edge_controller, pss3, apk, pss4
    imageVersion: string;
    hwRevisions: string[];
    fileId: number;
    isDefault: boolean;

    showUpgradeWarning: boolean;
    showDowngradeWarning: boolean;
    readOnly: boolean;
    canEditDefault: boolean;
}

export interface UpgradeRequestAdto {
    imageId : number; // The id of a DeviceImageAdto
    useDefault: boolean,
}

class DockControllerConfigurationAdto {
    serial : string;
    shortId : string;
    network : NetworkConfigurationAdto;
    agent : AgentConfigurationAdto;
}

class NetworkAuthAdto {
    security : string;
    identity : string;
    keyText : string;
}

class NetworkConfigurationAdto {
    staticIp : boolean;
    ip : string;
    netmask : string;
    gateway : string;
    primaryDns : string;
    secondaryDns : string;
    auth : NetworkAuthAdto;
}

class AgentConfigurationAdto {
    apiHost : string;
    apiPort : number;
    apiSsl : boolean;
    apiKey : string;
    apiSecret : string;
}

export interface AccessControlKeyAdto {
    description : string;
    keyText : string;
    fingerprint : string;
    isDefault : boolean;
    allowedActions : string;
}

export interface AccessControlKeyImportAdto {
    description : string;
    file : any;
}

export interface BrandingAdto {
    loginText : string;
    title : string;
    hasLoginVideo : boolean;
    managerName : string;
    cvmName : string;
    ivrName : string;
    IC25Name : string;
    videoBadgeName : string;
    videoTagName : string;
    videoBadgePss4Name : string;
    dockControllerName : string;
    edgeControllerName : string;
    streamName : string;
    externalAppName : string;
    companionAppName : string;
    companionServicesAppName: string;
    VB100Name : string;
    VB200Name : string;
    VB300Name : string;
    VB301Name : string;
    VB321Name : string;
    VB400Name : string;
    VB400NName : string;
    VT50Name : string;
    VT100Name : string;
    X100Name : string;
    X200Name : string;
    deviceFamilyVB: string;
    deviceFamilyVB400: string;
    deviceFamilyVT: string;
    deviceFamilyBW: string;
    deviceFamilyGeneric: string;
}

export interface WifiProfileAdto {
    id : number;
    name : string;
    isDefault : boolean;
    copyFromId : number;
    networks : WifiNetworkAdto[];
    enableRtsp : boolean;
    enableWifiDownload : boolean;
    settingOverrides : string;
    userNetworkStreamingEnabled : boolean;
    userNetworkUploadEnabled : boolean;
    userNetworkDockingAllowed : boolean;
    streamServerEnabled : boolean;
    allowedActions : string;
}

type WifiNetworkSecurity = 'wpa2_psk'|'wpa_psk'|'wep'|'open'|'wpa2_peap_mschapv2';

export interface WifiNetworkAdto {
    ssid : string;
    ssidBytes : number[]; // only sent if ssid cannot be encoded as a string; this should not be edited, but just round-tripped
    security : WifiNetworkSecurity;
    identity : string;
    keyText : string;
    isNew : boolean;
    ignore24xxMhz : boolean;
    ignore5xxxMhz : boolean;
    isUserNetworksPlaceholder : boolean;
    staticIpConfig : StaticIpAddressConfigAdto;
    signalThreshold : SignalThresholdAdto;
    isHidden : boolean;
    sources? : UserNameAdto[]; // In permissions report, how did the current user get this network
}

export interface SignalThresholdAdto {
    enabled : boolean;
    signalPercent : number;
    timeS : number;
}

type FileSpaceState = 'ONLINE' | 'OBSOLETE' | 'OFFLINE' | 'EVACUATE';

type FileSpaceCategory = 'FOOTAGE' | 'EXPORTS' | 'REPORTS' | 'BACKUPS' | 'RESOURCES' | 'REPORT_AUTO_COPY' | 'IMPORT_TEMP';

export interface FileSpaceAdto {
    id : number;
    path : string;
    name : string;
    category : FileSpaceCategory;
    maxBytes : number;
    usedBytes : number;
    isPreferred : boolean;
    status : string;
    statusDetail : string;
    state : string;
    evacState : string; // RUNNING, COMPLETE, FAILED
    containerId: number;
    containerName: string;
    containerType: string;
    encryptionType: string; // AES or null
    encryptionKeyLen: number;
}

export interface EvacuationReportAdto {
    canRetry : boolean;
    message : string;
}

export interface FileContainerAdto {
    id : number;
    name : string;
    type : string;
    bucketName : string;
    endpoint : string;
    https : boolean;
    key : string;
    secret : string;
}

export interface AnnotationResourceAdto {
    id : number;
}

export interface LiveStatsReportAdto {
    updateTime: moment.Moment;
    updateInterval: number; // ms between refreshes.
    latest: LiveStatsEntryAdto;
    history: LiveStatsEntryAdto[];
}

export interface LiveStatsEntryAdto {

    devicesIdle : number;
    devicesDownloading : number;
    devicesInField : number;
    devicesError : number;
    devicesOther : number;
    devicesAllocated : number;

    ingestRate : number;

    dockControllersConfiguredConnected: number;
    dockControllersConfiguredDisonnected: number;
    dockControllersOpenConnected: number;
    dockControllersOpenDisconnected: number;
    dockControllersOther: number;

    sitesOnline : number;
    sitesConfigured : number;

    webUserSessions: number;
    webAnonSessions: number;
    apiSessions: number;

    mediaPlaybackRate: number;

    videos : number;
    videosByDay: number[];

    footageStoredEvidence : number;
    footageStoredWaterfall : number;
    footageBytesWrittenToday : number;

    fileSpaces : LiveStatsFileSpaceAdto[];
}

export interface LiveStatsFileSpaceAdto {
    name : string;
    id : number;
    warningMessage : string;

    evidenceBytes: number;
    waterfallBytes: number;
    attachmentBytes: number;
    reportJobBytes: number;
    exportJobBytes: number;
    backupBytes : number;
    otherBytes: number;
}

export interface SimpleLocationAdto {
    type : string; // USB|DOCK_CONTROLLER|WIFI|UNKNOWN
    id : string; // ssid or dock controller name
}

export interface ReportConfigAdto {}

export interface UserSummaryReportAdto extends ReportConfigAdto {
    username : string;
}

export interface UserExportReportAdto extends ReportConfigAdto {
    showBle : boolean;
}

export interface UserExportFullReportAdto extends ReportConfigAdto {
    showWifiNetworks : boolean;
}

export interface IncidentSummaryReportAdto extends ReportConfigAdto {
    username : string;
    rowPeriod : string;
}

export interface IncidentDetailReportAdto extends ReportConfigAdto {
    username : string;
}

export interface AuditEntryReportConfigAdto extends ReportConfigAdto {
    // These dates are only used with applying a filter
    startDate : moment.Moment; // utc midnight date
    endDate : moment.Moment; // utc midnight date
    historyDays : number;

    deviceName : string;
    eventTypes : string[]
    username : string;
    sigOrUserText : string;
    messageLikeText : string;
    clientLikeText : string;
    serverLikeText : string;
    incidentId : string;
    videoUrn : string;
    location : string;
    exportJobId : string;
    videoDigest : string;
}

type BackupStatusEntryResult = 'SUCCEEDED'|'FAILED'|'SKIPPED'|'IN_PROGRESS';

export interface BackupStatusEntryAdto {
    started : number; // ms since epoch
    ended : number; // ms since epoch
    result : BackupStatusEntryResult;
    errorMessage : string;
}

export interface BackupStatusAdto {
    backupHistory : BackupStatusEntryAdto[];
}

type PlatformChangeStatus = 'SUBMITTED'|'RUNNING'|'COMPLETE'|'FAIL';

export interface PlatformChangeStatusAdto {
    status: PlatformChangeStatus;
    resultMessage: string;
    hasFiles: boolean;
}

type AppWarningLevel = 'LOW'|'NORMAL'|'HIGH';

export interface AppWarningAdto {
    id: number;
    title: string;
    description: string;
    code: string;
    level: AppWarningLevel;
    log: string;
    read: boolean;
    isMarkdown: boolean;
}

export interface ThemeResourceAdto {
    id : string;
    name : string;
    resourceType: string;		// LOGIN_BACKGROUND, LOGIN_LOGO, NAVBAR_LOGO
    fileId: number;
}


export interface ThemeStyleAdto {

    pageBg:         string;   // Background colour for the whole page
    textFg:         string;   // Default text colour
    anchorFg:       string;   // Default anchor colour
    darkBg:         string;   // Base 'dark' background (for headers etc.)
    lightBg:        string;   // Base 'light' background (for content areas etc.)

    navFg:          string;   // Nav bar text colour
    navActiveFg:    string;   // Nav bar 'active' entry text colour (current tab)
    navBg:          string;   // Nav bar background
    navActiveBg:    string;   // Nav bar 'active' entry background colour (current tab)
    navHoverBg:     string;   // Nav bar menu mouseover background

    inIncidentHeaderBg: string;   // Header bar background colour for videos that are included in incidents
}

export interface ThemeStyleConfigAdto extends BaseSettingsAdto {
    config: ThemeStyleAdto;
    defaults: ThemeStyleAdto;
}

export interface PlayerSettingsAdto extends BaseSettingsAdto {
    quality : number;
}

export interface HostAdto {
    address : string;
}

export interface IvrConfigAdto extends BaseSettingsAdto {
    settings : IvrSettingsAdto;
    channels: IvrChannelAdto[];
    sensors: IvrSensorAdto[];
}

export interface IvrSettingsAdto extends BaseSettingsAdto {
    id: string;
    name: string;
    stickyLogin: boolean;
    gps: boolean;
    recordingMode: string // MANUAL, AUTO
    fromSettingsFile: boolean;
    errors: string[];
    jsonOverrides: string;
    defaultUser: UserNameAdto;
    defaultView: string;
    shutdownIgnitionOffMins?: number;
    shutdownLowVoltage?: number;
    loginOptionsIps: string[];
}

export interface IvrChannelAdto extends BaseSettingsAdto {
    id: string;
    name: string;
    type: string; // DASH_CAM, FIXED_CAM, LOCAL_AUDIO, USB, GENERIC_RTSP, AXIS
    hostOrIpAddress: string;
    usbPath: string;
    recordingUri: string;
    liveUri: string;
    dar: string; // SIXTEEN_NINE, FOUR_THREE, UNSPECIFIED
    transport: string; // TCP, UDP
    maxUdpPacketSize: number;
    user: string;
    password: string;
    recordAudioChannel:string
    liveViewVideo: boolean;
    liveViewAudio: string;
    liveViewMirrorMode: boolean;
    ptzControls: boolean;
    label: string;
    liveViewCaption: string;
    liveViewNupFps: string;
}

export interface IvrSensorAdto extends BaseSettingsAdto {
    id: string;
    name: string;
    type: string; // ENUM??
    input: string; // ENUM??
    activeWhenSignalHigh: string; // HIGH, LOW
    recordingAction: string; // FORCE_WHILE_ACTIVE, START_STOP_BASED_ON_LEVEL, START_WHEN_ACTIVE, STOP_WHEN_ACTIVE, TOGGLE_RECORDING, NONE
    burninText: boolean;
    burninActiveText: string;
    burninInactiveText: string;
    statusBarText: boolean;
    statusBarActiveText: string;
    statusBarInactiveText: string;
    risingView: string;
    fallingView: string;
}

export interface IvrButtonAdto {
    identifier: string;
    name: string;
}

export interface IvrButtonsAdto {
    buttons: IvrButtonAdto[];
}

export interface CCVaultDeviceConfigAdto {
    json: string;
}

export interface GridWorkerStatusResultAdto {
    type: string; // UNCONFIGURED | SUCCESS | WARNING | ERROR
    key: string;
    args: string[];
}

export interface GridWorkerStatusResultsAdto {
    brokenFileSpaces: GridWorkerStatusResultAdto[];
    workerWebUriResult: GridWorkerStatusResultAdto;
    masterWebUriResult: GridWorkerStatusResultAdto;
}

export interface GridWorkerStatusAdto {
    gridWebUrl: string;
}

export interface SiloAdto {
    id: number;
    name: string;
    deleted: boolean;
}

export interface VideoListSettingsAdto extends BaseSettingsAdto {
    videoDisplayMode: string; // LIST, GALLERY, NONE
    videoOrderByMode: VideoFileOrder;
}

export interface DeviceBootstrapQrCodeRequest {

    serial: string;
    ssid? : string;        // UTF-8 decoded SSID
    ssidBytes? : number[]; // only sent if ssid cannot be encoded as a string; this should not be edited, but just round-tripped

    wifiProfileId? : number; // if ssid was obtained from a wifi profile, this is the SSID of the profile.  Must be null/undefined otherwise.
    security? : string;      // if ssid was manually typed, then security type for the network
    keyText? : string;       // if ssid was manually typed, the passphrase for the network
    identity? : string;      // if ssid was manually typed and security is enterprise, the identity for eap credentials
}

export interface DeviceBootstrapQrCodeResponse {
    qrcode : string; // base64 encoded bytes of QRCode;  decode with atob(), then pass to qr library with "raw=true" option.
    errorCode : string;
}

export interface ClearanceAuthSettingsRequestAdto {
    clearanceJson: string;
}

export interface ClearanceAuthSettingsAdto extends BaseSettingsAdto {
    clearanceClientId: string;
}

type InvalidLicenceReason =
    'ALREADY_USED'|
    'INVALID_FILE'|
    'ID_ALREADY_IMPORTED'|
    'ALREADY_IMPORTED'|
    'NOT_APPLICABLE'| // you can still import a licence if you get this result
    'NOT_APPLICABLE_PERM'|
    'SIGNING_ERROR'

type LicenceCompatibilityWarningReason =
    'NO_WARNING' |
    'CONNECT_WITH_STANDARD' |
    'LESS_UPGRADES_THAN_CONNECT' |
    'MORE_UPGRADES_THAN_CONNECT'

export interface LicenceCompatibilityWarning {
    reason: LicenceCompatibilityWarningReason;
    numberOfLicences: number;
}
export interface PssDeviceLicenceAdto {
    deviceLicenceName : string;
    licenceCount : number;
    used : number;
    warning : LicenceCompatibilityWarning;
    breach? : 'LOCAL'|'CENTRAL';
}

type PssDeviceLicenceType = 'STANDARD' | 'CONNECT' | 'UPGRADE';
export interface PssLicenceAdto {
    id : number; // database ID
    licenceId : string; // ID embedded in licence file
    importedDate : number;
    licenseeName? : string;
    licenseeCompany? : string;
    customerName? : string; // the name to which the licence is bound
    issuedBy? : string; // the name on the signing certificate
    valid : boolean;
    inInvalidGracePeriod : boolean;
    invalidGracePeriodEnd : number;
    invalidReason? : InvalidLicenceReason;
    notApplicableReason? : string; // only if reason is not_applicable or not_applicable_perm
    canImport : boolean;
    customerNameRequired : boolean;
    expired : boolean;
    expiryDate? : number;
    cvmValidationExpiryDate? : number;
    canDelete : boolean;
    features : PssOptionalFeature[];
    deviceLicences : PssDeviceLicenceAdto[];
    objectStorageCapacity : number; // in bytes
    softwareAssuranceEndDate? : number; // ms since epoch
    type: PssDeviceLicenceType;
}

export interface PssGlobalLicenceStatusAdto {
    features : PssOptionalFeature[];
    deviceLicences : PssDeviceLicenceAdto[];
    showExpiryNotification : boolean;
    pendingExpiryDate? : number; // the date when the current licence will expire (if there is one)
    objectStorageCapacity : number; // in bytes
    softwareAssuranceEndDate? : number; // ms since epoch
    isConnect: boolean;

    objectStorageSpaceUsed : number; // in bytes
    centralManagerBreach : boolean;
    streamingBreach : boolean;
    clearanceExportBreach : boolean;
    compAnalysisBreach : boolean;
}

export interface PlaybackPolicySettingsAdto {
    playbackPolicyEnabled: boolean;
    playbackReasonRequiredSecsSinceRecorded: number;
}

export interface CompanionAppSettingsAdto{
    updateInterval: number;
}

export interface UserImportToolSettingsAdto {
    handleMissingData: string;
    excludeData: string;
    userImportConfiguration: string;
    files: UserImportFileDataAdto[];
    userImportSchedule: UserImportScheduleAdto;
}

export interface UserImportFileDataAdto {
    path: string;
    fileName: string;
    defaultValues: UserImportDefaultAdto[];
}

export interface UserImportDefaultAdto {
    column: string;
    value: string;
}

export interface UserImportScheduleAdto {
    enable: boolean;
    hoursOfDay: number[];
}

export interface FileExportFieldDetailsAdto {
    fields: FileExportFieldAdto[],
    fieldsUniqueCombinations: FileExportFieldAdto[][]
}

export interface FileExportFieldAdto {
    name : string;
    description : string;
    example : string;
}

export interface CompAnalysisSettingsAdto {
    enabled: boolean;
    inputBucketName: string;
    inputPath: string;
    sharesInOutParams : boolean;
    outputBucketName: string;
    outputPath: string;

    apiKey : string;
    apiSecret : string;
    region : string;
    transcoderRoleArn : string;
    rekognitionRoleArn : string;

    name : string;
    description : string;
}

export interface CreateComputerAnalysisAdto
{
    incidentId: any;
    analysisType : CompAnalysisType
}


type CompAnalysisType = "FACE_TRACKING"|"FULL_BODY_TRACKING"|"PERSON_TRACKING"|"VULCAN_TRACKING";

type CompAnalysisState = "QUEUED"|"UPLOADING"|"UPLOADED"|"TRANSCODING"|"READY"|"ANALYSING"|"SUCCEEDED"|"FAILED"|"CANCELLED"|"DELETED";

export interface CompAnalysisAdto {

    id: any;
    creationTime: number;
    signature: string;
    owner : UserNameAdto;
    state: CompAnalysisState;
    analysisType: CompAnalysisType;
    incidentId: any;
    incidentSig: string;

    // 'd' - can delete
    allowedActions: string;

    analysisData: string;

    typeText: string;

    progressMessage: string;
    progressPercent: number;
}

export interface CompAnalysisSubscriptionAdto extends CreateSubscriptionAdto {
    analysisId?: number;

    states?: string;
    owned?: boolean;
    supervised?: boolean;
    signaturePrefix?: string;
    analysisType?: CompAnalysisType;
}

export interface AWSRegionAdto {
    display : string;
    name : string;
}

export interface CompAnalysisTypeDescriptionAdto {
    analysisType : CompAnalysisType;
    name : string;
    description : string;
}

export interface CompAnalysisTemplateAdto {
    incidentId: number;
    defaultType: CompAnalysisType;
    isLocal: boolean;
    typeDescriptions: CompAnalysisTypeDescriptionAdto[];
}

export interface StorageConfigurationAdto extends BaseSettingsAdto {
    footageThresholdWarning : number;
    backupThresholdWarning : number;
    exportThresholdWarning : number;
    footageThresholdWarningEnabled : boolean;
    backupThresholdWarningEnabled : boolean;
    exportThresholdWarningEnabled : boolean;
    
    redirectConfigEnabled : boolean;
    redirectConfigPath : string;
}

export interface AboutAdto {
    productName: string;
    productVersion: string;
    softwareLicense: string;
    copyrightNotice: string
}

export interface FirmwareSettingsAdto {
    autoUpgradeEnabled : boolean;
    useLatestByDefault : boolean;
}

export interface AnnotationResourceSpecAdto {
    mgroupid : string;
    replacesId? : number;
    annotationConfig : string; // JSON encoded AnnotationConfigModel
}

export interface ThumbnailAdditionalDataAdto {
    annotationConfig : string;
    mgroupid : string;
}

export interface ImportProfileAdto {
    id : number;
    name : string;
    description : string;
    profile : string;
    automatic : boolean;
}

export interface ImportProfileTemplateAdto {
    id : number;
    name : string;
    description : string;
    profile : string;
    automatic : boolean;

    customFields? : CustomFieldAdto[];
}

export interface AssetImportSubscriptionAdto extends CreateSubscriptionAdto {
    importJobId?: number;

    states?: string;
    start?: moment.Moment;
    end?: moment.Moment;
    owned?: boolean;
    supervised?: boolean;
    signaturePrefix?: string;
    includeMedia?:boolean;
    newlyImported? : boolean;
}

type AssetImportState = "QUEUED"|"PROCESSING"|"COMPLETED"|"FAILED"|"CANCELLED"|"DELETED"|"COMPLETING"|"POST_PROCESS_FAILED";

export interface AssetImportAdto {

    id: any;
    creationTime: number;
    completionTime: number;
    signature: string;
    owner : UserNameAdto;
    state: AssetImportState;
    automatic: boolean;
    importProfile : string;
    errorMessage : string;

    // 'd' - can delete
    allowedActions: string;

    progressMessage: string;
    progressPercent: number;

    mediaFiles: ImportMediaFileAdto[];
}

type StreamDisposition = "TRANSCODE" | "COPY" | "DISCARD" | "NONE" | "UNKNOWN";
type AntivirusResult = "NOT_SCANNED" | "SCANNED" | "FAILED" | "NO_ANTIVIRUS";

export interface ImportMediaFileAdto {
    name : string;
    size : number;
    state : ImportMediaFileState;
    errorMessage : string;
    hasOriginal : boolean;
    videoDisposition : StreamDisposition;
    audioDisposition : StreamDisposition;
    conversionFailed : boolean;
    antivirusResult : AntivirusResult;
}

export interface AssetImportSessionRequestAdto {
    id: string;
}

export interface AssetImportUploadRequestAdto {
    id: string,
    lastModifiedMap: {[key: string]: number}
    fileNameMap: {[key: string]: string}
}

type ImportMediaFileState = "QUEUED"|"IMPORTED"|"COMPLETED"|"FAILED"|"NOT_IMPORTED";

export interface AssetImportResultAdto {
    state: ImportMediaFileState;
    path: string;
    reason: string;
}

export interface AssetImportEndResponseAdto {
    id: string;
    signature: string;
    path: string;
    state: AssetImportState;
    reason: string;
    results: AssetImportResultAdto[]
}

export interface AssetImportStartAsyncResponseAdto {
    id: string;
    signature: string;
}

type TvmPanelTypeName = 'EMPTY'|'VIDEO';

export interface TvmLiveViewAdto {
    did : string;
    capabilities : string;
    channelIndex: number;
}

export interface TvmPanelChannelAdto {
    name: string;
}

export interface DeviceGpioAdto {
    description: string;
    state: string;
    severity: TvmEventSeverity;
}

export interface DeviceRecordingStatusAdto {
    isRecording: boolean;
}

export interface TvmPanelAdto {
    index: number;
    deviceId: string;
    deviceName: string;
    channels: TvmPanelChannelAdto[];
    type: TvmPanelTypeName;
    liveView: TvmLiveViewAdto;
    operator: UserNameAdto;
    gpioStates: DeviceGpioAdto[];
    recordingStatus: DeviceRecordingStatusAdto;
    allowedActions: string;
}

export interface TvmWallAdto {
    identifier: string;
    panels: TvmPanelAdto[];
}

type IvrRecordingState = 'RECORDING'
    | 'STOPPING'
    | 'COMPLETE'
    | 'UPLOAD_QUEUED'
    | 'UPLOADING'
    | 'UPLOADED'
    | 'UPLOAD_FAILED'
    | 'DELETED'
    | 'GARBAGED';

export interface IvrRecordingAdto {
    id: number;
    startTimestamp: number,
    endTimestamp: number,
    state: IvrRecordingState
    totalUploadPercentage: number,
    thumbnail: ThumbnailAdto,
    videoFiles: VideoFileAdto[];
    customFields: CustomFieldAdto[];
    hasCustomFields: boolean;
    allowedActions: string;
    channelIds: number[];
}

export interface QRCodeAdto {
    qrcode: string;
}

export interface OAuth2SettingsAdto extends BaseSettingsAdto {
    issuerUrl: string;
    clientId: string;
    clientSecret: string;
    userClaim: string;
    nameClaim: string;
    defaultRoles: PssRoleSummaryAdto[];
    groupMappings: OAuth2GroupMappingAdto[];
    responseType: string;
    loginPrompt: string;
    logoutOAuth2: boolean;
}

export interface OAuth2GroupMappingAdto {
    groupIdentifier: string;
    supervisor: boolean;
    roles: PssRoleSummaryAdto[];
}

type CCPWifiType = "NONE"|"WPA2PSK";

export interface PrivilegeElevationAdto {
    roleAdto: PssRoleSummaryAdto;
    password: string;
}

type VaultCommitUserType = "NONE" | "MANUAL" | "USER" | "OPERATOR";

export interface CCVaultV2ConfigAdto extends BaseSettingsAdto {
    enabled: boolean;
    agencyId: string;
    authEndpoint: string;
    vaultHost: string;
    clientId: string;
    clientSecret: string;

    vaultUserType: VaultCommitUserType;
    vaultUser: string;
}

type CustomFieldValueType = "TEXT"
    | "DATE"
    | "TIMESTAMP"
    | "ENUMERATION"
    | "BOOL"
    | "NUMBER"
    | "URL"
    | "COMPUTED"
    | "COMPUTED_AUTO_DELETE"
    | "TAG_LIST";

export interface CCVaultCustomFieldMappingAdto {
    localFieldName: string;
    localFieldDisplayName: string;
    localFieldType: CustomFieldValueType;
    vaultFieldName: string;
    vaultFieldDisplayName: string;
    vaultFieldType: CustomFieldValueType;
}

type SimulatedEventType = "FILE_CREATE"
    | "TEMPLATE_FILE_CONTENT"
    | "FILENAME_TEMPLATE_ERROR"
    | "TEMPLATE_ERROR"
    | "OTHER_ERROR";

export interface ExportSimulatedRunAdto {
    logs: LogEntryAdto[]
}

export interface LogEntryAdto {
    type: SimulatedEventType;
    name: string;
    data: string;
}

export interface ExportSimulationAdto {
    signature: string;
    profile: ExportProfileAdto;
}

export interface ExportProfileImportAdto {
    data: string;
}

type CryptoKeyErrorStatus = 'MISSING'|'WRONG_KEY';

export interface CryptoKeyStatusAdto {
    status? : CryptoKeyErrorStatus;
    path? : string;
    readOnly : boolean;

    usingCompanionApp : boolean;
    replicatedFromCvm : boolean;
    usingVault : boolean;
}

export interface ExportProfileBoxEmailAdto {
    serviceAccountEmail: string;
}

export interface EffectivePermissionsDeviceProfilesAdto {
    defaultProfile: DeviceProfileSummaryAdto;
    family: DeviceProfileFamily;
    otherProfiles: DeviceProfileSummaryAdto[];
}

export interface DeviceProfileSummaryAdto {
    id: number;
    name: string;
    roles: PssRoleSummaryAdto[];
}

type VideoFileOrder = 'STARTTIME_DESC'|'STARTTIME_ASC'|'DOWNLOADTIME_DESC';

export interface VideoFileOrderAdto {
    order: VideoFileOrder;
}

type DeletionPolicyBookmarkMode = "SAME"
    | "NO_AUTO_DELETION"
    | "KEEP_FOR";

export interface SelfServiceSettingsAdto extends BaseSettingsAdto {
    passwordResetEnabled : boolean;
    registrationEnabled : boolean;
    verificationExpiryTimeMinutes : number;

    registrationTerms : string;

    templates : SelfServiceEmailConfigAdto[];
    profiles : SelfServiceProfileAdto[];
}

type SelfServiceTemplateType = 'WELCOME' | 'ALREADY_REGISTERED' | 'PASSWORD_RESET' | 'FIRST_LOGIN' | 'DEVICE_STREAMING' | 'STORAGE_WARNING';

export interface SelfServiceEmailConfigAdto {
    templateType : SelfServiceTemplateType;
    subjectTemplate : string;
    contentTemplate : string;
    sendAsHtml : boolean;
    requiredFields: string[]; // Sent by server
}

export interface SelfServiceProfileAdto {
    id? : number;
    enabledForSelfService : boolean;
    group : UserNameAdto;
    addressPattern : string;
    orderIndex : number;
}

export interface EmailPropertiesAdto {
    enableNotifications : boolean;
    emailProperties : EmailPropertyAdto[];
    emailUsername : string;
    emailPassword : string;
    emailFrom : string;
    smtpHost : string;
    smtpPort : number;
    smtpAuth : boolean;
    smtpStartTlsEnable : boolean;
    smtpTrust : boolean;
    transportProtocol : string;
    emailTo: string;
    templates: SelfServiceEmailConfigAdto[];
    firstLoginEnabled: boolean;
    deviceStreamingEnabled: boolean;
    storageWarningEnabled: boolean
}

export interface EmailPropertyAdto {
    property : string;
    value : string;
}

export interface EmailPropertiesTestResponseAdto {
    successful: boolean;
    errorMessage: string;
}

export interface ApiKeyAdto {
    name: string;
    key: string;
    apiKeyRole: string;
    role: string;

    secret: string;
    autoGeneratedSecret: string; //This is only received by the front end. Never set.

    auditNominated: boolean;
}

export interface ApiKeyOptionsAdto {
    apiKeyRoles: string[];
    roles: string[];
}

export interface ApiKeySettingsAdto extends BaseSettingsAdto {
    bearerAuthenticationEnabled: boolean;
    tokenIntrospectionEndpoint: string;
    scopeMappings: ApiKeyScopeMappingAdto[];
}

export interface ApiKeyScopeMappingAdto {
    scope: string;
    roles: PssRoleSummaryAdto[];
}

export interface TermsAdto {
    terms: string;
}

// This adto is only used for typeahead on the device filter view
export interface DeviceLocationAdto {
    name: string;
}

// This adto is only used for typeahead on the device filter view
export interface DeviceFirmwareVersionAdto {
    firmwareVersion: string;
}

//This adto is only used for Account profile Password Rules popover
export interface PasswordComplexityRulesAdto {
    passwordComplexityRules: string[];
}

export interface OriginRequestAdto {
    origin: string;
}

export interface AutoIncidentCreationAdto {
    enabled: boolean;
    wholeRecording: boolean;
    autoIncidentCreationExpression: string;
}

/* export interface ImportExportConfigAdto {
    importConfigMetadata: ConfigMetadataAdto[];
} */

/* export interface ConfigMetadataAdto {
    type: VmApp.ImportExportConfig.ConfigurationMetadataType,
    importType: VmApp.ImportExportConfig.ImportType,
    supportedImportTypes: VmApp.ImportExportConfig.ImportType[]
}
 */

/* export interface ImportResultsAdto {
    mergeResults: ImportResultAdto[],
    replaceResults: ImportResultAdto[],
} */

/* export interface ImportResultAdto {
    type: VmApp.ImportExportConfig.ConfigurationMetadataType,
    isError: boolean;
    errorKey: string;
    stats: ImportResultStatsAdto;

} */

export interface ImportResultStatsAdto {
    added: number;
    updated: number;
    deleted: number;
    skipped: number;
}

type OpswatConnectionState = 'UNKNOWN'|'KNOWN_BAD'|'KNOWN_GOOD';

export interface OpswatConnectionStateInfoAdto {
    state: OpswatConnectionState;
    time: moment.Moment;
}

type OpswatConfigFailReason = 'CREATING_REQUEST'|
    'SENDING_REQUEST' |
    'UNAUTHORISED'    |
    'BAD_ENDPOINT';

export interface OpswatConfigValidateResultAdto {
    connectionState: OpswatConnectionStateInfoAdto;
    reason: OpswatConfigFailReason;
}

export interface ArcGisAccessTokenAdto {
    accessToken: string;
    expiresIn: number;
    expiresAt: number;  // time in milliseconds
}

export interface ArcGisSuggestionsAdto {
    suggestions: ArcGisSuggestionAdto[];
}

export interface ArcGisSuggestionAdto {
    text: string;
    magicKey: string;
    isCollection: boolean;
}

export interface ArcGisAddressCandidatesAdto {
    candidates: CandidatesAdto[];
}

export interface CandidatesAdto {
    address: string;
    location: LocationAdto;
}

export interface LocationAdto {
    x: number;
    y: number;
}

export interface UserBluetoothPairingDatabaseAdto {
    hostMacAddress?: string;
    bluetoothMacAddress?: string;
    peripherals?: BlePeripheralAdto[];
    peers?: BluetoothPeerAdto[];
    deviceId?: string;
}

export interface BlePeripheralAdto {
    address: string;
    type: string;
    serial: string;
    firmware: string;
    pairingTimestamp: moment.Moment;
    connectionTimestamp: moment.Moment;
}
export interface BluetoothPeerAdto {
    type: BluetoothPeerType;
    radioType: DeviceBluetoothRadioType;
    address: string;
    alias: string;
    pairingTimestamp: moment.Moment;
    connectionTimestamp: moment.Moment;
}

type BluetoothPeerType = "NONE"|"COMPANION"|"RADIO"|"ANY"; // corresponds to BluetoothPeer.BluetoothPeerType in the Java code

export interface BluetoothMacPrefixAdto {
    macPrefix: string;
}

export interface BluetoothPairingToBeDeleted {
    toDeleteCount: number;
}

export interface GridMasterValidationResultAdto {
    valid: boolean;
    warning: ErrorAdto;
}

type GridWorkerHardwareAccelerationConfig = 'DISABLED' | 'ENABLED';

export interface GridWorkerAdto {
    name: string;
    enabled: boolean;
    workerGridWebUri: string;
    firstConnectionTimestamp: number;
    lastConnectionTimestamp: number;
    
    media: boolean;
    mediaAddress: string;
    download: boolean;
   //  downloadAddress;
    downloadLimit: number;
    export: boolean;
    exportRunners: number;
    exportHardwareAcceleration: GridWorkerHardwareAccelerationConfig;
    codecServers: number;
    
    useAffinity: boolean;
    affinity: GridWorkerMasterAffinityAdto[];
}

export interface GridWorkerMasterAffinityAdto {
    masterId: number;
    masterName: string;
    affinity: boolean;
}

type GridWorkerState = 'STARTING'|'WRONG_VERSION'|'NOT_LICENSED'|'READY'|'FROZEN'|'STOPPING'|'DISCONNECTED'|'DISABLED'|'ERROR'|'STANDBY';
type HardwareAccelerationErrorType = 'UNSUPPORTED'|'NOT_ENOUGH_SESSIONS';
    
export interface GridWorkerStatusAdto {
    id: number;
    name: string;
    state: GridWorkerState;
    lastConnectionTime: number;
    stateMessage: string;
    mediaBaseUrl: string;
    mediaFramesProcessed: number;
    downloadBaseUrl: string;
    activeDownloadCount: number;
    downloadLimit: number;
    gridWebUrl: string;
    exportRunnerCount: number;
    activeExportCount: number;
    usingHwAccel: boolean;
    errorHwAccel: HardwareAccelerationErrorType;
    errorHwAccelLog: string[];
}

export interface GridWorkerConvertToMasterAdto {
    convert: boolean;
    primary: boolean;
}

type GridStandbyState = 'CONNECTING'|'CONNECTED'|'WAITING_FOR_RESTART'|'UNKNOWN'|'INITIALISING';

export interface StandbyStatusAdto {
    state: GridStandbyState;
    activeWsAddress: string;
}

export interface CaptionsAdto {
    captions: WebVttCueAdto[];
}

export interface WebVttCueAdto {
    identifier: string;
    startMs: number;
    endMs: number;
    text: string;
}

/** Matches com.edesix.pss.manager.model.security.StoredCertificateType */
type VmStoredCertType = "COMPAPP_AUTH_CA"|"COMPAPP_AUTH_CLIENT_APP"|"COMPAPP_AUTH_SERVER_DEVICE"|"ANDROID_SSL_CA"|"ANDROID_SSL_SIGNING"|"VM_CA"|"VM_DEVICE_SIGNING"|"XXX_ESTATE_BLE_KEY"|"XXX_KEY_ENCRYPTOR_CHECK";

export interface VmCertAdto {
    id: number;
    type: VmStoredCertType;
    subject: VmCertDnAdto;
    issuer: VmCertDnAdto;
    issuerId: number;
    thumbprint: string;
    validFrom: number;
    validTo: number;
    hasPrivateKey: boolean;
    selfSigned: boolean;
    activeState: VmCaActiveState;
    chain?: VmCertAdto[];
}

export interface VmCertDnAdto {
    raw: string;
    commonName: string;
    email?: string;
    orgUnit?: string;
    org?: string;
    locality?: string;
    state?: string;
    country?: string;
}

export interface VmCaCreateAdto
{
    subject: VmCertDnAdto;
    expiryDate: number;
}

export interface VmCertImportRequestAdto {
    doImport: boolean; /** False for unlock, True for commit */
    password: string;
}

type VmCertImportResultType = "SUCCESS"|"SUCCESS_NOT_IMPORTED"|"FAIL"|"NEEDS_PASSWORD"|"WRONG_PASSWORD";

export interface VmCertImportResultAdto {
    result: VmCertImportResultType;
    certificate?: VmCertAdto;
}

type VmCaActiveState = "ACTIVE"|"ACTIVE_PARENT"|"INACTIVE";

type VmCertType = 'VM_CA'|'VM_DEVICE_SIGNING';

export interface AuditLogsSubscriptionAdto extends CreateSubscriptionAdto {
    start?: number;
    end?: number;
    startDate?: number;
    endDate?: number;
    historyDays?: number;
    deviceName?: string;
    deviceDid?: string;
    eventTypeStr?: string; // TODO AuditEventType
    username?: string;
    signatureOrUserText?: string;
    messageLikeText?: string;
    clientLikeText?: string;
    serverLikeText?: string;
    incidentId?: string;
    videoFileUrn?: string;
    exportJobId?: string;
    offset?: number;
    limit?: number;
    format?: string;
    location?: string;
    videoDigest?: string;
}
