import { CreateFeedResponseAdto, FeedEventAdto, FeedEventSetAdto, StateAdto } from "../../../app/interfaces/adto";
import { ApiUrls } from "../../../app/util/api-urls";
import { Feedsubscription } from "./feedsubscription";
import { Feedwebsocket } from "./feedwebsocket";
import { HttpClient } from '@angular/common/http';
import { MediaGroupManager } from "./media-group-manager";
import { AuthService } from "../../../app/services/auth/auth.service";
import * as $ from "jquery";

export class Feed {
    private static preExpiryNotifyTime = 15000;
    private initialRestartTimeoutMs = 5000;
    private restartTimeoutMs = this.initialRestartTimeoutMs;
    private restartBackoffMs = 2000;
    private maxRestartTimeMs = 30000;
    private transientErrorRetryTimeMs = 10000;
    private keepRunning = true;

    private createRequest : any;
    private pollRequest : any;
    feedId : string;
    private serverStateSubscriptionId? : number;
    private subscriptions : Feedsubscription[] = [];
    private subscribingCount : number = 0;
    private lastFeedEvent : FeedEventSetAdto;
    private restartTimerId : number;

    private errorReported = false;

    private activityTime : number;
    private unnotifiedActivity : boolean;
    private sessionExpiryTime : number;
    private notifyActiveTimer : number;

    private useWebSocketFeeds : boolean;
    creatingSocket : boolean = false;
    private feedSocket : Feedwebsocket;
    
    private fastReconnect: boolean;
    public usingVmProxy : boolean;
        
    
    constructor(private urls : ApiUrls, public mgroup : MediaGroupManager, private state : StateAdto,private _http: HttpClient,private authService: AuthService) {
       // super();
       this.urls = new ApiUrls();
       this.mgroup = new MediaGroupManager(this.urls,this._http);
       this.initIdleTracker();
     /*  this.authService.getCSRFToken().subscribe(res =>{
        console.log("state data" +res);
        this.state = res;
        this.initIdleTracker();
      }); */
    /*    this.authService.getStateData().subscribe(res =>{
        console.log("state data" +res);
       
      }); */
     /*   this._http.get(this.urls.state).subscribe((res)=>{
           console.log('State response' +res);
       }) */
        this.useWebSocketFeeds = true;
       /*  if ( this.state.allowFeed )
            this.initIdleTracker();
        if ( this.state.inCar )
            this.fastReconnect = this.state.inCar.fastReconnect;  */
    }

         public startFeed() {
            this.keepRunning = true;
            this.createFeed();
           /*  if ( !this.state?.allowFeed ) {
                if ( !this.errorReported && this.subscriptions.length > 0 ) {
                    this.errorReported = true;
                    //this.trigger('error' );
                }
            } else if (this.feedId) {
                // console.log("Feed already started.");
            } else if (this.createRequest || this.creatingSocket || this.restartTimerId) {
                // console.log("Feed scheduled for start-up, not starting.");
            } else {
                this.createFeed();
            } */
        }

        public shutdownFeed() {
            this.keepRunning = false;
            if (this.feedSocket) {
                let fs = this.feedSocket;
                this.feedSocket = null;
                this.feedId = null;
                fs.shutdown();
            }
        }

        public addSubscription( subscription : Feedsubscription ) : void {
            if (!this.keepRunning) {
                console.log("Feed has been shut down; addSubscription cancelled.");
                return;
            }

            this.subscriptions.push( subscription );

            if ( this.feedId ) {
                subscription.send();
            } else {
                this.startFeed();
            }
        }

        private createFeed() {
            if (!this.keepRunning) {
                console.log("Feed has been shut down; createFeed cancelled.");
                return;
            }
            if ( this.useWebSocketFeeds )  {
                this.creatingSocket = true;
                this.feedSocket = new Feedwebsocket(this, this.urls.wsFeedWithActiveTime(this.getAndResetActiveState()), null);
                this.feedSocket.start();
            }
            else {
                this.createRequest = this._http.post(this.urls.feeds, { minEventTimeMs: 500, serverState : true }).subscribe(
                    (response : CreateFeedResponseAdto) =>{
                        console.log(response);
                        this.initFeed( response );
                        this.createRequest = null;
                        this.pollFeed(1);
                    },
                    // Errors will call this callback instead:
                    err => {
                    console.log('Something went wrong!');
                    this.createRequest = null;
                    this.restartTimeoutMs = Math.min( this.maxRestartTimeMs, this.restartTimeoutMs + this.restartBackoffMs );
                   /*  this.handleError( jqXHR.status == 401 ); */
                    }
                );
               /*  this.createRequest = $.postJSON( this.urls.feeds, { minEventTimeMs: 500, serverState : true } );
                this.createRequest.
                done( ( response : CreateFeedResponseAdto ) => {
                    this.initFeed( response );
                    this.createRequest = null;
                    this.pollFeed(1);
                } ).
                fail( ( jqXHR : JQueryXHR, textStatus : string, errorThrown ) => {
                    this.createRequest = null;
                    this.restartTimeoutMs = Math.min( this.maxRestartTimeMs, this.restartTimeoutMs + this.restartBackoffMs );
                    this.handleError( jqXHR.status == 401 );
                } ); */
            }
        }

        initFeed( response : CreateFeedResponseAdto ) {
            this.feedId = response ? response.feedId : 'xxx';
            this.serverStateSubscriptionId = response ? response.serverStateSubscriptionId : null;
            this.subscriptions.forEach( subscription => subscription.send() );
        }

        public startedSending() {
            this.subscribingCount ++;
        }

        public finishedSending() {
            this.subscribingCount --;
            if ( this.subscribingCount === 0 && this.lastFeedEvent)
                this.handleFeedEvent();
        }
        //TODO : JP
        public cancelSubscription( subscriptionId : number ) {
        //     // TODO: we could defer this post and then optimise cancellations into a single message
        //     $.postJSON( this.urls.feedUnsubscribe( this.feedId ), [subscriptionId] );
         }

        public removeSubscription( subscription : Feedsubscription ) {
            let index = this.subscriptions.indexOf( subscription );
            if ( index != -1 ) {
                this.subscriptions.splice( index, 1 );

                if ( this.subscriptions.length === 0 && this.errorReported && !this.state?.allowFeed ) {
                    this.errorReported = false;
                    //this.trigger('noerror' );
                }
            }
        }

        private feedDeleted() {
            this.subscriptions.forEach( ( subscription : Feedsubscription ) => {
                subscription.feedDeleted();
            } );
            //this.mCookieManager.clearCache();
        }

    /*     subscriptionError( jqXHR : JQueryXHR, feedBroken : boolean ) {
            if ( feedBroken )
                this.restartTimeoutMs = 0;
            this.handleError( jqXHR.status == 401 );
        } */

        handleError( unauthorised : boolean ) {
            let subscriptions = this.subscriptions;

            this.destroyFeed();
            this.feedDeleted();

            console.trace("handleError");
            this.errorReported = true;
            //this.trigger('error', unauthorised);

            subscriptions.forEach( ( subscription : Feedsubscription ) => {
                subscription.handleFeedError( unauthorised );
            } );

            this.restartTimerId = window.setTimeout(() => {
                this.restartTimerId = null;
                this.createFeed();
            }, this.fastReconnect ? 0 : this.restartTimeoutMs);
        }

        private handleTransientPollError(eventId : number ) {
            let feedId = this.feedId;

            this.errorReported = true;
           // this.trigger('error', jqXHR.status == 401);

            let subscriptions = this.subscriptions;
            subscriptions.forEach( ( subscription : Feedsubscription ) => {
                //subscription.handleFeedError( jqXHR.status == 401 );
            });

            setTimeout( () => {
                if ( feedId === this.feedId ) {
                    this.pollFeed( eventId );
                }
            }, this.transientErrorRetryTimeMs );
        }

        private destroyFeed() {
            if ( this.feedId ) {
                let feedId = this.feedId;
                this.feedId = null;
                this.serverStateSubscriptionId = null;
                this.pollRequest = null;
                if ( this.useWebSocketFeeds ) {
                    this.feedSocket.closeSocket(1000, "Feed has closed");
                }
                else {
                    $.ajax({
                        url: this.urls.feed(feedId),
                        type: 'DELETE'
                    });
                }
            }
        }

        private pollFeed( eventId : number ) {
            if (!this.keepRunning) {
                return;
            }
            let feedId = this.feedId;
            let data : any = { activeTime: this.getAndResetActiveState() };
            if ( this.mgroup.haveLiveGroups() )
                data.mgroup = this.mgroup.getLiveGroupIds();
                this._http.get(this.urls.feedEvent( feedId, eventId ),data).subscribe(
                    ( dataSet) => {
                        if ( this.keepRunning && feedId === this.feedId ) {
                            this.pollRequest = null;
                            if ( dataSet ) {
                                // If there are outstanding subscription requests, don't process the event until they
                                // are complete, otherwise we might get data for a subscription before we learn the
                                // subscription ID.  Which would be bad.
                                this.processEventIfReady( dataSet );
                            } else {
                                // EOF - feed is gone
                                this.feedId = null;
                                this.serverStateSubscriptionId = null;
                                this.feedDeleted();
                                this.createFeed();
                            }
                        }
                    },
                    // Errors will call this callback instead:
                    err => {
                    console.log('Something went wrong!');
                    }
                );
           /*  this.pollRequest = $.ajax( this.urls.feedEvent( feedId, eventId ), {
                type: 'GET',
                dataType: 'json',
                timeout : this.state.ajaxLongPollTimeout,
				headers: { 'X-Ajax-Timeout': '' + this.state.ajaxLongPollTimeout },
                data: data
            } );
            this.pollRequest.
                done( ( dataSet : FeedEventSetAdto ) => {
                    if ( this.keepRunning && feedId === this.feedId ) {
                        this.pollRequest = null;
                        if ( dataSet ) {
                            // If there are outstanding subscription requests, don't process the event until they
                            // are complete, otherwise we might get data for a subscription before we learn the
                            // subscription ID.  Which would be bad.
                            this.processEventIfReady( dataSet );
                        } else {
                            // EOF - feed is gone
                            this.feedId = null;
                            this.serverStateSubscriptionId = null;
                            this.feedDeleted();
                            this.createFeed();
                        }
                    }
                }).
                fail( ( jqXHR : JQueryXHR, textStatus : string, errorThrown ) => {
                    if (this.keepRunning && feedId == this.feedId ) {
                        if ( jqXHR.status === 503 || textStatus === 'timeout' ) {
                            this.handleTransientPollError(eventId );
                        } else {
                            this.pollRequest = null;
                            this.restartTimeoutMs = jqXHR.status === 401 || jqXHR.status === 410 ? 0 : this.initialRestartTimeoutMs;
                            this.handleError( jqXHR.status == 401 )
                        }
                    }
                } ); */
        }

        private handleFeedEvent() {
            // We only process feed events when there are no subscription events in flight, or else we may get
            // data for a subscription before we've learned what its subscription ID is
            let dataSet = this.lastFeedEvent;

            let serverStateData : FeedEventAdto = this.subData(dataSet, this.serverStateSubscriptionId);
            if ( serverStateData )
                //this.trigger('serverState', serverStateData);

            this.subscriptions.forEach( ( subscription : Feedsubscription ) => {

                let data: FeedEventAdto = this.subData( dataSet, subscription.id );
                if (data) {
                    subscription.handleData(data);
                } else if (data = this.subData( dataSet, subscription.newId)) {
                    subscription.idChanged();
                    subscription.handleData(data);
                }
            });

            if ( this.errorReported ) {
                this.errorReported = false;
                //this.trigger('noerror');
            }
            if ( this.useWebSocketFeeds ) {
                let s = this.feedSocket;
                setTimeout(() => s.sendAck( dataSet.id ), 250 );
            }
            else {
                this.pollFeed(dataSet.nextId);
            }
            this.lastFeedEvent = null;
        }

        processEventIfReady( eventData ) {
            this.lastFeedEvent = eventData;
            if (this.subscribingCount === 0 ) {
                this.handleFeedEvent();
            }
        }

        private subData( dataSet: FeedEventSetAdto, subId: number ): FeedEventAdto {
            return subId ? dataSet.data[subId] : null;
        }

        //
        // Active tracking & notification
        //
        private initIdleTracker() {
            $(document).on("mousemove keypress mousedown touchstart kicktimer", () => this.onUserActive() );
            this.activityTime = Date.now();
            this.unnotifiedActivity = true;
            this.sessionExpiryTime = this.activityTime + this.state?.sessionExpiryTime;
        }

        private onUserActive() {
            let now = Date.now();
            if ( now > this.activityTime ) {
                this.activityTime = now;
                this.unnotifiedActivity = true;
                if ( !this.notifyActiveTimer )
                    this.startNotifyTimer();
            }
        }

        // Return time since last activity
        getAndResetActiveState() {
            if ( this.unnotifiedActivity ) {
                this.unnotifiedActivity = false;
                this.sessionExpiryTime = this.activityTime + this.state?.sessionExpiryTime;
            }
            if ( this.notifyActiveTimer ) {
                clearTimeout(this.notifyActiveTimer);
                this.notifyActiveTimer = null;
            }
            return Math.max(0, Date.now() - this.activityTime);
        }

        // start a timer which will prevent session timeout when the session is close to expiring.  Normally, the next long
        // poll will beat the timer, so the timer will seldom actually send anything to the server.
        private startNotifyTimer() {
            let outOfBandNotifyTime = this.sessionExpiryTime - Feed.preExpiryNotifyTime; // aim for 15 seconds before session expiry
            let timeout = Math.max( 20, outOfBandNotifyTime - Date.now() );
            this.notifyActiveTimer = window.setTimeout( () => this.notifyTimerExpired(), timeout );
        }

        private notifyTimerExpired() {
            this.notifyActiveTimer = null;

            if ( this.unnotifiedActivity ) {
                let now = Date.now();
                if ( now > this.sessionExpiryTime - Feed.preExpiryNotifyTime - 100 ) {
                    // session is close to expiry - poke the server
                    if ( this.useWebSocketFeeds ) {
                        this.feedSocket.sendKeepAlive();
                    }
                    else {
                    const headers = {'X-Ajax-Timeout': '' + this.state?.ajaxTimeout}
                       this._http.post(this.urls.sessionUserActive + '?activeTime=' + this.getAndResetActiveState(),this.state?.ajaxTimeout).subscribe(
                            (response) =>{
                                console.log(response);
                            },
                            // Errors will call this callback instead:
                            err => {
                                this.errorReported = true;     /*  this.handleError( jqXHR.status == 401 ); */
                            });
                      /*   $.ajax(this.urls.sessionUserActive + '?activeTime=' + this.getAndResetActiveState(), {
                            type: 'POST',
                            dataType: 'json',
                            timeout: this.state.ajaxTimeout,
                            headers: {'X-Ajax-Timeout': '' + this.state.ajaxTimeout},
                        }).fail((jqXHR: JQueryXHR) => {
                            // Fire error so that app context will flip back to login page
                            this.errorReported = true;
                            //this.trigger('error', jqXHR);
                        }); */
                    }
                } else {
                    this.startNotifyTimer();
                }
            }
        }

}
