import { CreateFeedResponseAdto, FeedEventAdto, FeedEventSetAdto, StateAdto } from "../../interfaces/adto";
import { ApiUrls } from "../../util/api-urls";
import { Feedsubscription } from "./feed-subscription";
import { Feedwebsocket } from "./feed-websocket";
import { HttpClient } from '@angular/common/http';
import { MediaGroupManagerService } from "./media-group-manager";

export class FeedManager {
    private static preExpiryNotifyTime = 15000;
    private initialRestartTimeoutMs = 5000;
    private restartTimeoutMs = this.initialRestartTimeoutMs;
    private restartBackoffMs = 2000;
    private maxRestartTimeMs = 30000;
    private keepRunning = true;

    feedId : string;
    private serverStateSubscriptionId? : number;
    subscriptions : Feedsubscription[] = [];
    private subscribingCount : number = 0;
    private lastFeedEvent : FeedEventSetAdto;

    private errorReported = false;

    private activityTime : number;
    private unnotifiedActivity : boolean;
    private sessionExpiryTime : number;
    private notifyActiveTimer : number;

    private useWebSocketFeeds : boolean;
    feedSocket : Feedwebsocket;
    
    public usingVmProxy : boolean;
        
    private createRequest : any;
    private pollRequest : any;

    constructor(private urls : ApiUrls, private groupManager : MediaGroupManagerService, private state : StateAdto, private _http: HttpClient) {
       this.urls = new ApiUrls();
        this.initIdleTracker();
        this.useWebSocketFeeds = true;
    }

        public startFeed() {
        this.keepRunning = true;
        this.createFeed();
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
                console.log("FeedManager has been shut down; addSubscription cancelled.");
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
                console.log("FeedManager has been shut down; createFeed cancelled.");
                return;
            }
            if ( this.useWebSocketFeeds )  {
                this.feedSocket = new Feedwebsocket(this.urls.wsFeedWithActiveTime(this.getAndResetActiveState()), this.groupManager);

                this.feedSocket.dataReceived.subscribe(response => {
                    this.initFeed(response);
                });

                this.feedSocket.socketError.subscribe(error => {
                    this.handleError(error);
                });

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
                    err => {
                    console.log('Something went wrong!');
                    this.createRequest = null;
                    this.restartTimeoutMs = Math.min( this.maxRestartTimeMs, this.restartTimeoutMs + this.restartBackoffMs );
                   }
                );
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
        public cancelSubscription( subscriptionId : number ) {
            this._http.post( this.urls.feedUnsubscribe( this.feedId ), [subscriptionId] );
         }

        public removeSubscription( subscription : Feedsubscription ) {
            let index = this.subscriptions.indexOf( subscription );
            if ( index != -1 ) {
                this.subscriptions.splice( index, 1 );

                if ( this.subscriptions.length === 0 && this.errorReported && !this.state?.allowFeed ) {
                    this.errorReported = false;
                }
            }

            this.feedSocket.shutdown();
        }

        private feedDeleted() {
            this.subscriptions.forEach( ( subscription : Feedsubscription ) => {
                subscription.feedDeleted();
            } );
        }

        handleError( unauthorised : boolean ) {
            let subscriptions = this.subscriptions;

            this.destroyFeed();
            this.feedDeleted();

            console.trace("handleError");
            this.errorReported = true;

            subscriptions.forEach( ( subscription : Feedsubscription ) => {
                subscription.handleFeedError( unauthorised );
            } );
        }

        private destroyFeed() {
            if ( this.feedId ) {
                let feedId = this.feedId;
                this.feedId = null;
                this.serverStateSubscriptionId = null;
                this.pollRequest = null;
                if ( this.useWebSocketFeeds ) {
                    this.feedSocket.closeSocket(1000, "FeedManager has closed");
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
            if ( this.groupManager.haveLiveGroups() )
                data.mgroup = this.groupManager.getLiveGroupIds();
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
            this.onUserActive();
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
            let outOfBandNotifyTime = this.sessionExpiryTime - FeedManager.preExpiryNotifyTime; // aim for 15 seconds before session expiry
            let timeout = Math.max( 20, outOfBandNotifyTime - Date.now() );
            this.notifyActiveTimer = null;
        }
}
