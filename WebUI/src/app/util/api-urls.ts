declare var $:any;

export type ThumbnailMode = 'NONE' | 'SINGLE' | 'GALLERY';

export class ApiUrls {

    public static HEADER_CSRF_TOKEN = "X-Pss-Csrf-Token";

    private apiRoot = '/api';
    private feedRoot = '/api-feeds';
    private uploadRoot = '/api-upload';
    private liveViewRoot = '/liveView';
    public vmCsrfToken = sessionStorage.getItem('token');

    
        feeds = this.apiRoot + '/feeds';

        public static addParams( url: string, params: {} ): string {
			if (params) {
				url += (url.lastIndexOf("?") == -1 ? "?" : "&") + $.param(params);
			}
			return url;
		}

        feed(feedId : string ) { return this.feeds + '/' + feedId; }

        feedEvent(feedId : string, eventId : number ) { return this.feedRoot + '/' + feedId + '/events/' + eventId; }

        feedUnsubscribe(feedId : string) { return this.feeds+'/' + feedId + '/unsubscribe'; }

        // wsFeed - create a web socket for a feed
        // Creating a WebSocket with this url will create a new feed which will send event data through the socket
        /* wsFeed = window.location.protocol.replace('http','ws') + '//' + window.location.host + '/api-ws-feeds'; */
        wsFeed = "ws://localhost:9080/api-ws-feeds";

        // wsFeedWithActiveTime - create a web socket for a feed
        // activeTime: updates the active time for the visit on creating the new websocket
        wsFeedWithActiveTime(activeTime: number) { return this.wsFeed + "?serverStateSub&activeTime=" + activeTime; }

        videos = this.apiRoot + '/videos';

        // videoListSubscribe - similar to getting videos, but creates a subscription for videos matching criteria.
        // POST - create a subscription
        //   Accepts: VideoFilesSubscriptionAdto.  feedId property must be a valid feedId.  Other parameters have
        //            the same semantics as the query parameters used to GET a the videos resource.  Additional
        //            thumbnailOffset parameter can be passed.
        //   Returns: CreateSubscriptionResponseAdto - contains the subscription id.
        videoListSubscribe = this.videos + '/subscribe';

        //videoFileOrder - gets the video file order from settings
        // GET -
        //   Returns: VideoFileOrderAdto - contains the order
        videoFileOrder = this.videos + '/video-order';

        // videoAvailableSubscribe - create a subscription for the existence of a video with a specific recording ID and index
        // POST - create a subscription
        //   Accepts: CreateAvailableVideoSubscriptionRequestAdto.
        //   Returns: CreateSubscriptionResponseAdto - contains the subscription id.
        videoListSubscribeAvailable = this.videos + '/subscribeAvailable';

        videoSubscribe(id: any) { return this.video(id) + "/subscribe"; }


        // videoListFetchMore - increase the limit on a video file subscription (to allow infinite scrolling)
        // POST - update the limit
        //   Accepts: VideoFilesSubscriptionAdto.  feedId & subscriptionId must be valid.
        //            limit specifies the number of new videos to be included.
        //   Returns: CreateSubscriptionResponseAdto - contains a new subscription id which replaces the old one.
        videoListFetchMore = this.videos + '/fetchMore';

        // videoImport - create a video file in the database based on provided metadata
        // POST - create a video file record.  If the video already exists, this returns the existing ID for it.
        //   Accepts: VideoUploadMetadataAdto (see comments in that class)
        //   Returns: VideoUploadResultAdto (see comments in that class)
        videoImport = this.videos + '/import';

        // videoImportUpload - resource used to upload video files
        // PUT - upload a video file previously created with videoImport resource.  If file has already been uploaded,
        //       returns 409 Conflict.  Request must be sent with a Content-Length header.
        //   Accepts: any data (treated as binary - content-type is ignored)
        //   Returns: nothing
        videoImportUpload( id: any ) { return this.uploadRoot + '/video/' + id; }

        deviceMetadataImportUpload( deviceId: string, fileName: string ) {
        	return this.uploadRoot + '/device-metadata/' + deviceId + '/' + encodeURIComponent(fileName);
        }

        // video - represents a video file
        // GET - gets the details of a specific video
        //   Returns: VideoFileAdto
        //   Query params:
        //     thumbnailOffset - thumbnail returned shows will be at this offset
        //     thumbnailMode - mode which the thumbnail will be shown as
        
       video( id:any, thumbnailOffset?: number, thumbnailMode?: ThumbnailMode ) {
            const baseUrl = this.videos + '/' + id;
            let params:any;

            if (thumbnailOffset) {
                params['thumbnailOffset'] = thumbnailOffset;
            }

            if (thumbnailMode) {
                params['thumbnailMode'] = thumbnailMode;
            }

            return ApiUrls.addParams(baseUrl, params);
        } 

        // videoByUrn - represents a video file
        // GET - gets the details of a specific video by the Urn parameter
        //   Returns: VideoFileAdto
        //   Query params:
        //     "urn" - string - only videos whose URN matches the provided string are returned
        
        videoByUrn (urn: any, thumbnailOffset?: number) {
            let url = this.videos + "/byId?urn=" + urn;
            if (thumbnailOffset) {
                url += "?thumbnailOffset=" + thumbnailOffset;
            }
            return url;
        }

        // videoPreparation - represents a specific preparation of a video file
        videoOrPreparation( id: any, preparationIndex?: number ) {
            let url = this.video(id);
            if (preparationIndex) {
                if ( preparationIndex == -1 )
                    url += '/original';
                else
                    url += '/preparation/'+preparationIndex;
            }
            return url;
        }

        // videoScheduledDeletionTime - scheduled deletion date and the reason of a single Video file
        // GET - gets the scheduled deletion date of a single Video file
        //   Returns: VideoFileDeletionInfoAdto[]
        videoScheduledDeletionTime( id: any ) { return this.video(id) + '/scheduled-deletion-date'; }

        // videoIncidents - list of incidents containing the specified video file
        // GET - gets the list of incidents for a video
        //   Returns: IncidentAdto[] (excluding fields: clips, notes, owner, custom fields, edit/create timestamp, local flag)
        videoIncidents( id: any ) { return this.video(id) + '/incidents'; }

        // videoSecurity - security information about the video, i.e. owner, restriction and sharing.
        // GET - gets security information for the video (not very useful - just a duplicate of the info in the VideoFileAdto)
        //   Returns: VideoFileSecurityAdto
        // POST - sets security information for the video.  This can be used to "patch" security information field by field
        //     (see comments in VideoFileSecurityAdto class).
        //   Accepts: VideoFileSecurityAdto
        //   Returns: nothing
        videoSecurity( id: any ) { return this.video(id) + '/security'; }

        // videoLocation - locaiton where video was recorded
        // POST - sets location of the video.  Sending no content clears the location
        //   Accepts: GeoLocationAdto
        //   Returns: nothing
        videoLocation( id: any ) { return this.video(id) + '/location'; }


        // videoLocations - returns a list of geo location entries for the given video
		// GET - gets list of location entries, with timestamp and lat/long
		//		Returns: List of GeoFixEntryAdto
		videoLocations(videoId: number) { return this.video(videoId) + '/locations'; }


		// videoProperties - basic information about the video, i.e. device, operator, and startTime.
        // GET - gets video properties
        //   Returns: VideoFilePropertiesAdto
        // POST - sets video properties
        //   Accepts: VideoFilePropertiesAdto
        //   Returns: nothing
        videoProperties( id: any ) { return this.video(id) + '/properties'; }


        // videoPreparations - video redaction and adjustment annotations
		// GET  - gets the list of media preparations
		//	 Returns: PreparedAnnotationsConfigModel[]
        // POST - sets the list of preparations
        //   Accepts: PreparedAnnotationsConfigModel[]
        //   Returns: nothing
        videoPreparations(videoId: number) { return this.video(videoId) + '/preparationConfig'; }


        // videoRecording - basic information about the recording that the video belongs to
        // GET - gets recording properties
        //   Returns: VideoRecordingInfoAdto
        videoRecording( id: any, countSameOperatorFootage = false ) {
            let url = this.video(id) + '/recording';
            if (countSameOperatorFootage) {
                url += "?countSameOperatorFootage=true";
            }
            return url;
        }

        // videoDelete - used to delete a specific video
        // POST - delete the specified video
        //   Returns: nothing
        videoDelete( id: any ){ return this.video(id) + '/delete'; }

        // videoExpunge - used to expunge a specific video
        // POST - expunge the specified video
        // Returns: nothing
        videoExpunge( id: any ) { return this.video(id) + '/expunge' }

        // videoReinstate - used to reinstate a specific video
        // POST - reinstate the specified video
        //   Returns: nothing
        videoReinstate( id: any ) { return this.video(id) + '/reinstate' }

        // videoNewClip - returns a resource which can be used to represent the video converted to an incident clip
        // This resource is Playable, so other subresources of Playable can be used to play/edit/screenshot the clip.
        videoNewClip( id: any ) { return this.video(id) + '/newClip' }

        // videoTransform - used to set the transform on a video
        // POST - set the video transform
		// Accepts: VideoFileTransformAdto
        // Returns: nothing
        videoTransform( id: any ) { return this.video(id) + '/transform' }

        // videoDownloadFile - returns raw binary file.  This resource is only accessible for file types which cannot
        // be viewed via the media server, e.g. PDF, word doc
        // GET -retrieves file to download
        //   Returns: raw file with suitable content disposition
        videoDownloadFile( id: any ) { return this.video(id)+ '/file' }

        // videoDownloadRawFile - returns raw binary file.  This resource is only accessible if you have the download
        // permission
        // GET -retrieves file to download
        //   Returns: raw file with suitable content disposition
        videoDownloadRawFile( id: any ) { return this.video(id)+ '/rawfile' }

        videoSignature( id: any ) { return this.video(id) + '/signature' }

        // videoSigCheckReportDownload - download a zip-file containing the cert report for this video - signature, certs,
        //                           manifest details etc.
        // GET -retrieves file to download
        //   Returns: file with suitable content disposition
        videoSigCheckReportDownload( id: any ) { return this.videoSignature(id) + '/report/download' }

        // videoVerify - initiates file checksum verification
        // POST - initiate checksum verification
        //   Accepts: Nothing
        //   Returns: Nothing
        videoVerify( id: any ) { return this.video(id)+ '/verify' }

        account = this.apiRoot + "/account";

        sessionUserActive = this.account + '/userActive';

        mediaGroups = this.apiRoot + '/mediaGroups';

        mediaGroup( mgroupid : string ) { return this.mediaGroups + '/' + mgroupid; }

        state = this.apiRoot + '/state';

        // stateCurrent - information about the logged in user, the server and the current session
        // GET - return information about the currently logged in user, the server and the current session
        //   Query parameters:
        //     "mode" - string - NORMAL or INCAR (NORMAL is the default if not specified).  Specifies the UI mode; INCAR will hide many features and show live view.
        //   Returns: StateAdto
        stateCurrent = this.state + '/current';

    
}