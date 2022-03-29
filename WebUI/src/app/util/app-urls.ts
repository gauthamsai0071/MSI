export class AppUrls {
    static addParams(baseUrl: string, params: any) {
        throw new Error('Method not implemented.');
    }
    static param(url: string, arg1: string, vmCsrfToken: string | null): string {
        throw new Error('Method not implemented.');
    }
    appRoot = '/app';

    abs( path : string ) {
        return this.appRoot + '/' + path;
    }

    isRelative( url: any ): boolean {
        return (url && url.indexOf(this.appRoot) == 0);
    }

    rel( url: string ): string {
        if (this.isRelative(url)) {
            url = url.substr(this.appRoot.length);
        }
        return url;
    }

    /**
     * Take a JSON object, and return a copy
     * with the keys converted from camelCase to hyphens.
     */
    public static replaceCamlecaseKeys( data: any ): any {
        let newdata = {};
        for ( let key in data ) {
            let newkey = key.replace( /([A-Z])/g, "-$1" ).toLowerCase();
           // newdata[newkey] = data[key];
        }
        return newdata;
    }

    login = 'login';

    pub = 'public';

    anon = 'anon';

    dashboard = 'dashboard';

    anonymousAccess = 'access/:identifier';

    ivrRoot = 'ivr';
    ivrLiveView = this.ivrRoot + '/liveView';
    ivrRecordings(queryString?: string ) { return this.ivrRoot + '/recordings' + ( queryString ? '?' + queryString : '' ) };
    ivrRecording( id: string ) { return this.ivrRoot + '/recordings/' + id; }
    ivrSystem = this.ivrRoot + '/system';
    ivrSettings = this.ivrRoot + '/settings';
    ivrAppWarnings = this.ivrRoot + '/appWarnings';

    tvm = 'tvm';
    tvmWall( id: string ) { return this.tvm + "/walls/" + id; }

    videos = 'videos';
    myVideos( queryString?: string ) { return this.videos + "/mine" + ( queryString ? '?' + queryString : '' ); }
    sharedVideos( queryString: string ) { return this.videos + "/shared" + ( queryString ? '?' + queryString : '' ); }
    supervisedVideos( queryString: string ) { return this.videos + "/supervised" + ( queryString ? '?' + queryString : '' ); }
    searchVideos( queryString: string ) { return this.videos + "/search" + ( queryString ? '?' + queryString : '' ); }
    video( id: string ) { return this.videos + '/' + id; }
    videoInfo( id: any, offset: string ) { return this.video( id ) + '/info' + ( ( offset ) && !( offset ) ? '?offset=' + offset : '' ); }
    auditLogForVideo( id: any ) { return this.video( id ) + '/auditLog'; }
    incidentsForVideo( id: any ) { return this.video( id ) + '/incidents'; }
    incidentForVideo( id: any ) { return this.video( id ) + '/incident'; } // TODO: this needs a route added for it.
    importFiles = this.videos + '/import';
    videoFileView ( id: any ) { return this.video(id)+ '/fileview'; }
    videoByUrn( urn: string, offset: string ) { return this.videos + '/byId/' + urn + '/info' + ( ( offset ) && ( offset ) ? '?offset=' + offset : '' ); }

    incidents = 'incidents';
    myIncidents = this.incidents + '/mine';
    sharedIncidents = this.incidents + '/shared';
    supervisedIncidents = this.incidents + '/supervised';
    searchIncidents = this.incidents + '/search';
    savedSearchIncidents = this.incidents + '/savedSearch';
    manageSavedSearchIncidents = this.savedSearchIncidents + '/manage';
    newIncident = this.incidents + '/new';
    addVideoToIncident = '/addVideoToIncident';
    addIncidentToIncident = '/addIncidentToIncident';
    duplicateIncident( id: string ) { return this.incidents + '/new?incidentId=' + id; }
    incident( id: string ) { return this.incidents + '/' + id; }
    anonIncident( id: string, linkId: string ) { return this.anon + '/incidents/' + id + '/' + linkId; }
    editIncident( id: any ) { return this.incident( id ) + '/edit'; }
    auditLogForIncident( id: any ) { return this.incident( id ) + '/auditLog'; }
    newExportForIncident( id: any ) { return this.incident( id ) + '/newExport'; }
    multiplayIncident( id: any ) { return this.incident( id ) + '/multiplay'; }
    addVideosToMyIncidents( videoIds: any[]  ) { return AppUrls.createAddVideosToIncidentUrl("mine", videoIds); }
    addVideosToSharedIncidents( videoIds: any[]  ) { return AppUrls.createAddVideosToIncidentUrl("shared", videoIds); }
    addVideosToSearchedIncidents( videoIds: any[] ) { return AppUrls.createAddVideosToIncidentUrl("search", videoIds);}
    addVideosToSupervisedIncidents( videoIds: any[]  ) { return AppUrls.createAddVideosToIncidentUrl("supervised", videoIds); }
    incidentCreateCompAnalysis(id: any) { return this.incident(id) + '/create-comp-analysis'; }
    addIncidentToMyIncidents(incidentId: string) { return this.incidents + '/' + incidentId + this.addIncidentToIncident + '/mine'; }
    addIncidentToSharedIncidents(incidentId: string) { return this.incidents + '/' + incidentId + this.addIncidentToIncident + '/shared'; }
    addIncidentToSupervisedIncidents(incidentId: string) { return this.incidents + '/' + incidentId + this.addIncidentToIncident + '/supervised'; }
    addIncidentToSearchedIncidents(incidentId: string) { return this.incidents + '/' + incidentId + this.addIncidentToIncident + '/search'; }
    incidentFileView( incidentId: any, clipId: string ) { return this.incident(incidentId) + '/clips/' + clipId + '/fileview';}

    public static createAddVideosToIncidentUrl(area: string, videoIds: any[]): string {
        let url = "videos/" + videoIds[0] + '/addVideoToIncident/' + area;
        if (videoIds.length > 1){
            //url = url + "?" +_.map(videoIds.slice(1), (id: string) => 'videoId=' + id ).join('&');
        }
        return url;
    }

    myExports = this.incidents + '/exports';
    supervisedExports = this.incidents + '/supervised-exports';
    manageExports = this.incidents + '/manage-exports';

    export( id: string ) { return this.incidents + "/export/" + id; }
    viewExport( id: any ) { return this.export( id ) + "/view"; }
    accessUrlsForExport( id: any ) { return this.export( id ) + '/accessUrls'; }
    auditLogForExport( id: any ) { return this.export( id ) + '/auditLog'; }

    devicesMain = 'devices';

    deviceBootstrapQrCode = this.devices() + '/device-config-code';
    deviceBootstrapQrCodePublic = this.pub + '/device-config-code';

    wifiProfiles = this.devices() + '/wifi-profiles';
   /*  deviceImagesFiltered(imageType : DeviceImages.DeviceImageTargetType) {
        switch ( imageType ) {
            case DeviceImages.DeviceImageTargetType.DOCK_CONTROLLER:
                return this.deviceImagesForDockControllers;
            case DeviceImages.DeviceImageTargetType.EDGE_CONTROLLER:
                return this.siteImages;
            default:
                return this.deviceImages;
        }
    } */
    deviceImages = this.devices() + '/images';
    accessControlKeys = this.devices() + '/access-control-keys';

    devices( queryData? : string ): string {
        let url = this.devicesMain + '/devices';
        if ( queryData ) url += "?" + queryData;
        return url;
    }
    device( did: string | number | boolean, encodeId : boolean = true ) {
        if ( encodeId ) did = encodeURIComponent( did );
        return this.devicesMain + "/device/" + did;
    }
    viewDevice( did: any, encodeId = true ) { return this.device( did, encodeId ) + "/view"; }
    auditLogForDevice( did: any, encodeId = true ) { return this.device( did, encodeId ) + '/auditLog'; }
    liveViewDevice( did: any, encodeId = true ) { return this.device( did, encodeId ) + '/liveView'; }
    anonLiveViewDevice( did: string | number | boolean, encodeId = true ) {
        if ( encodeId ) did = encodeURIComponent( did );
        return this.anon + '/devices/' + did + '/liveView';
    }

    anonLinkExpired = this.pub + "/link-expired";

    anonLoginLinkExpired = this.pub + "/login/link-expired";

    dockControllers( queryData? : string ): string {
        let url = this.devicesMain + '/dock-controllers';
        if ( queryData ) url += "?" + queryData;
        return url;
    }
    dockController( did: string | number | boolean, encodeId : boolean = true ) {
        if ( encodeId ) did = encodeURIComponent( did );
        return this.devicesMain + "/dock-controller/" + did;
    }
    viewDockController( did: any, encodeId : boolean = true ) { return this.dockController( did, encodeId ) + "/view"; }
    deviceImagesForDockControllers = this.dockControllers() + '/images';

    dockControllerGenerateConfig = this.dockControllers() + '/generate-config';

    status = 'status';
    allReports = this.status + '/reports';

    // reportView - not really an API call, when you "get" this address, it will return a "redirect" to the report HTML itself (or the report itself)
    reportView( reportId: string ) { return this.allReports + '/' + reportId + '/view/'; }
    scheduledReportView(scheduleId: string ) { return this.allReports + '/report-schedule/' + scheduleId + '/view'; }

    sites = this.status + '/sites';
    siteList = this.sites + '/list';
    siteImages = this.sitesList() + '/images';
    siteGenerateConfig = this.sitesList() + '/generate-config';
    sitesList( queryData? : string ): string {
        let url = this.siteList;
        if ( queryData ) {
            url += "?" + queryData;
        }
        return url;
    }

    compAnalyses = this.incidents + "/comp-analyses";
    compAnalysisDetails(id: any) { return this.compAnalyses + '/' + id; }

    myAssetImports = this.status + '/my-imports';
    myAssetsImports (queryData? : string): string {
        let url = this.myAssetImports;
        if ( queryData ) {
            url += "?" + queryData;
        }
        return url;
    }

    assetImports = this.status + "/imports";
    assetImportDetails(id: any) { return this.assetImports + '/' + id; }
    assetImportForm = this.assetImports + "/upload";
    assetsImports (queryData? : string): string {
        let url = this.assetImports;
        if ( queryData ) {
            url += "?" + queryData;
        }
        return url;
    }

    admin = 'admin';

    // Admin - People
    settingsGroupPeople = this.admin + '/people';
   /*  settingsUsers( queryData?: string ) { return this.settingsPrincipals( "USER", queryData ) };
    settingsGroups( queryData?: string ) { return this.settingsPrincipals( "GROUP", queryData ) };
 */    /* settingsPrincipals( type: PssUserType, queryData?: string ) {
        let url = this.settingsGroupPeople + ((type === "GROUP") ? '/groups' : '/users');
        if (queryData) url += "?" + queryData;
        return url;
    } */
    settingsRoles = this.settingsGroupPeople + '/roles';
    settingsSilos = this.settingsGroupPeople + '/silos';
    settingsTwoFactorAuthentication = this.settingsGroupPeople + '/two-factor-authentication';
    settingsUserImportSettings = this.settingsGroupPeople + '/user-import-tool';

    // Admin - Interface
    settingsGroupUserInterface = this.admin + '/user-interface';
    settingsLogin = this.settingsGroupUserInterface + '/login';
    settingsVideoList = this.settingsGroupUserInterface + '/video-list';
    settingsMessages = this.settingsGroupUserInterface + '/messages';
    settingsThemeResources = this.settingsGroupUserInterface + '/theme-resources';
    settingsPlayer = this.settingsGroupUserInterface + '/player';
    settingsLocales = this.settingsGroupUserInterface + '/locales';
    settingsMaps = this.settingsGroupUserInterface + '/maps';
    settingsThumbnails = this.settingsGroupUserInterface + '/thumbnails';
    settingsIncidentsUi = this.settingsGroupUserInterface + '/incidents';

    // Admin - Firmware
    settingsGroupFirmware = this.admin + '/firmware';
    settingsDockControllerImages = this.settingsGroupFirmware + '/dockcontroller-images';
    settingsDeviceImages = this.settingsGroupFirmware + '/camera-images';
    settingsEdgeControllerImages = this.settingsGroupFirmware + '/edgecontroller-images';
    settingsVBPatrolImages = this.settingsGroupFirmware + '/recorder-images';
    settingsAutomaticUpdate = this.settingsGroupFirmware + '/automatic-update';
    settingsFirmwareSettings = this.settingsGroupFirmware + '/firmware-settings'

    // Admin - Cameras
    settingsGroupDevices = this.admin + '/devices';
    settingsDeviceSettings = this.settingsGroupDevices + '/system-wide-settings';
    settingsDeviceTimecodeTrackSettings = this.settingsGroupDevices + '/video-metadata-overlay-settings';
    settingsDeviceProfiles(query: string | null) { return this.settingsGroupDevices + '/device-profiles' + ( query ? '?' + query : '' ); }
        adminDeviceProfileCreate = this.settingsDeviceProfiles(null) + '/new';
        adminDeviceProfile = (id: string ) => this.settingsDeviceProfiles(null) + '/' + id;
    settingsAccessControlKeys = this.settingsGroupDevices + '/access-control-keys';
    settingsIvr = this.settingsGroupDevices + '/recorder';

    settingsDeviceCaCerts = this.settingsGroupDevices + '/ca-certs';
    settingsDeviceCaCert = (id: string ) => this.settingsDeviceCaCerts + '/' + id;

    // Admin - Connectivity
    settingsGroupConnectivity = this.admin + '/connectivity';
    settingsRtsp = this.settingsGroupConnectivity + '/rtsp';
    settingsWifiProfiles = this.settingsGroupConnectivity + '/wifi-profiles';
        settingsWifiProfileCreate = this.settingsWifiProfiles + '/new';
        settingsWifiProfile = (id: string) => this.settingsWifiProfiles + '/' + id;
    settingsBandwidthRules = this.settingsGroupConnectivity + '/bandwidth-rules';
    settingsAutoFetch = this.settingsGroupConnectivity + '/auto-fetch';
    settingsConfigurationReplication = this.settingsGroupConnectivity + '/configuration-replication';
    settingsSiteManager = this.settingsGroupConnectivity + '/site-manager';
    settingsPeering = this.settingsGroupConnectivity + '/peering';
    settingsClearanceAuth = this.settingsGroupConnectivity + '/clearance-auth';
    settingsStreamingServer = this.settingsGroupConnectivity + '/streaming-server';
    settingsEmailProperties = this.settingsGroupConnectivity + '/email-properties'

    // Admin - Policy
    settingsGroupPolicies = this.admin + '/policies';
    settingsDeletionPolicy = this.settingsGroupPolicies + '/deletion-policy';
    settingsExports = this.settingsGroupPolicies + '/exports';
    settingsExportsProfileNew = this.settingsExports + '/profile/new';
    settingsExportsProfileEdit(id: string) { return this.settingsExports + '/profile/' + id; }
    settingsPasswordComplexity = this.settingsGroupPolicies + '/password-complexity';
    settingsReports = this.settingsGroupPolicies + '/reports';
  /*   settingsCustomFields( family: VmApp.UserDefinedFields.UserDefinedFieldFamily ) {
        let url: string;
        switch ( family ) {
            case VmApp.UserDefinedFields.UserDefinedFieldFamily.INCIDENT:
                url = this.settingsGroupPolicies + '/user-defined-incident-fields';
                break;

            case VmApp.UserDefinedFields.UserDefinedFieldFamily.MEDIA:
                url = this.settingsGroupPolicies + '/user-defined-media-fields';
                break;

            case VmApp.UserDefinedFields.UserDefinedFieldFamily.PLAYBACK_REASON:
                url = this.settingsGroupPolicies + '/user-defined-playback-fields';
                break;

            case VmApp.UserDefinedFields.UserDefinedFieldFamily.CC_VAULT:
                url = this.settingsGroupPolicies + '/user-defined-vault-fields';
                break;

            default:
                console.log( "Unknown user-defined field family '%s'", family );
                url = this.settingsGroupPolicies + "/user-defined-unknown-fields";
                break;
        }
        return url;
    }
    settingsCustomFieldsCreate(family: any, purpose: CustomFieldPurpose) {
        return this.settingsCustomFields(family) + ((purpose === "INCIDENT_DELETE") ? '/deletion' : '') + '/new';
    };
    settingsCustomFieldEdit(id: any, family: any, purpose?: CustomFieldPurpose) {
        let url = this.settingsCustomFields(family);
        if (purpose === 'INCIDENT_CLIP') {
            url = Util.Urls.addPath(url, 'incidentClip');
        }
        return Util.Urls.addPath(url, id);
    }; */
 /*    settingsCustomFieldValidators (family: any) { return this.settingsCustomFields(family) + '/validators' };
    settingsCustomFieldLayouts (family: any) { return this.settingsCustomFields(family) + '/layouts' };
 */    settingsAutoExports = this.settingsGroupPolicies + '/auto-exports';
    settingsPlaybackPolicy = this.settingsGroupPolicies + '/playback';
    settingsImportProfile = this.settingsGroupPolicies + '/import-profiles';
    settingsAntivirusPolicy = this.settingsGroupPolicies + '/antivirus-policy';
    settingsSharingPolicies = this.settingsGroupPolicies + '/sharing-policies';
    settingsCompanionAppSettings = this.settingsGroupPolicies + '/companion-app';
    settingsAutoIncidentCreation = this.settingsGroupPolicies + '/auto-incident-creation';

    // Admin - System
    settingsGroupSystem = this.admin + '/system';
    settingsFilespaces = this.settingsGroupSystem + '/storage';
    settingsWebServer = this.settingsGroupSystem + '/web-server';
    settingsBackups = this.settingsGroupSystem + '/backups';
    settingsLicences = this.settingsGroupSystem + '/licensing';
    settingsAdvancedSettingsFile = this.settingsGroupSystem + '/advanced-settings-file';
    settingsServerControls = this.settingsGroupSystem + '/server-controls';
    settingsImportExportConfig = this.settingsGroupSystem + '/import-export-config';
    settingsPreviewFeatures = this.settingsGroupSystem + '/preview-features';

    // Admin - Computer Analysis
    settingsCompAnalysis = this.settingsGroupSystem + "/comp-analysis";

    // Admin - Legal
    settingsGroupLegal = this.admin + '/legal';
    settingsAbout = this.settingsGroupLegal + '/about';

    // Admin - Authentication
    settingsAuthentication = this.settingsGroupPeople + "/authentication";

    // Admin - CCVaultV2Config
    settingsCCVaultV2Config = this.settingsGroupPolicies + "/vault-config";

    // Admin - ApiKeyManagement
    settingsApiKeyManagement( queryData?: string ) {
        let url = this.settingsGroupPolicies + "/api-key-management"
        if (queryData) url += "?" + queryData;
        return url;
    }

    // Admin - SelfService
    settingsSelfService = this.settingsGroupPeople + "/self-service";

    siteExportsList = this.status + '/site-uploads';

    site = ( id: string ) => this.sites + '/' + id;

    fullAuditLog = this.status + '/audit-log';
    liveStats = this.status + '/live-stats';
    failedRfidScansAuditLog = this.fullAuditLog + '/failed-rfid-scans';
    grid = this.status + '/grid';
    gridWorker( id: string ) { return this.grid + "/worker/" + id };

    systemStatus = this.status + '/system';

    ivrChannels = this.settingsIvr + '/channels';
    newIvrChannel = this.ivrChannels + '/new';
    ivrChannel(did: string) { return this.ivrChannels + '/' + did }
    editIvrChannel(did: any) { return this.ivrChannel(did) + '/edit'; }

  /*   private newUser = this.settingsUsers() + '/new';
    user( id: string ) { return this.settingsUsers() + '/' + id; }
    editUser( id: any ) { return this.user( id ) + '/edit'; }
    userEffectivePerms(id: any ) { return this.userOrGroupEffectivePerms("USER", id); }

 */    newRole = this.settingsRoles + '/new';
    role( id: string ) { return this.settingsRoles + '/' + id; }
    editRole( id: any ) { return this.role( id ) + '/edit'; }

 /*    private newGroup = this.settingsGroups() + '/new';
    group( id: string ) { return this.settingsGroups() + '/' + id; }
    editGroup( id: any ) { return this.group( id ) + '/edit'; }
    groupEffectivePerms(id: any ) { return this.userOrGroupEffectivePerms("GROUP", id); }
 */
 /*    newPrincipal( type: PssUserType ) { return type == "USER" ? this.newUser : this.newGroup; }
    principal(type: PssUserType, id: any ) { return type == "USER" ? this.user(id) : this.group(id); }
    editPrincipal(type: PssUserType, id: any ) { return this.principal(type, id) + '/edit'; }
    userOrGroupEffectivePerms(type: PssUserType, id: any ) { return this.principal(type, id) + '/effective-permissions'; }

 */    newImportProfile = this.settingsImportProfile + '/new';
    importProfile ( id: string ) { return this.settingsImportProfile + '/' + id; }
    editImportProfile ( id: any ) { return this.importProfile(id) + '/edit'; }

    account = 'account';
    language = 'language';
    logout = this.account + '/logout';

    messages = this.admin + '/messages';

   /*  forSiteProxy(siteId:number, appUrl:string) { return vmUrlPrefix+'site/'+siteId+appUrl+ '?setupProxyAuth'; }
 */
    help(localeCode?: string) {
        return 'help/' + (localeCode||'default') + '/Default.htm';
    }

    pubPasswordResetRequest = this.pub + '/password-reset';
    pubRegistrationRequest = this.pub + '/registration';
    anonCompleteCreateAccount( linkid: string, profileid: string ) { return this.anon + '/complete-create-account/' + linkid + '/' + profileid; }
    anonPasswordUpdate( linkid: string ) { return this.anon + '/password-update/' + linkid; }
    anonCompleteLogin( linkid: string, requestedUrl: string ) { return this.anon + '/complete-login/' + linkid + '/' + requestedUrl; }

    newRealm = this.settingsAuthentication + '/new';
    realm( id: string ) { return this.settingsAuthentication + '/' + id; }
    editRealm( id: any ) { return this.realm( id ) + '/edit'; }

    constructor() {
       // _.bindAll.apply( this, _.flatten( [this, _.keys(AppUrls.prototype).filter( (k: string | number) => _.isFunction( this[k] ) )] ) );
    }

}