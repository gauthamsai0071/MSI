import { CreateSubscriptionAdto, CreateSubscriptionResponseAdto, FeedEventAdto, StateAdto } from "../../../app/interfaces/adto";
import { Feed } from "./feed";
import { HttpClient } from '@angular/common/http';
import { ApiUrls } from "../../../app/util/api-urls";
import { MediaGroupManager } from "./media-group-manager";
import { AuthService } from "../../../app/services/auth/auth.service";

export class Feedsubscription {
    private cancelled : boolean;
    private amendments : { url : string; data : any }[] = [];
    id : number;
    newId : number;
    amending : boolean;
    reset : boolean;
    loaded : boolean = false;
    errorReported : boolean = false;
    deferredData: FeedEventAdto [] = [];
    preprocessingData : FeedEventAdto;
    public urls : ApiUrls;
    public mgroup : MediaGroupManager;
    public state : StateAdto;
    feed : Feed;
    refCount: number = 0;
    

    constructor( private url : any, private getData? : () => CreateSubscriptionAdto,public _http?: HttpClient,private authService?: AuthService ) {
        //super();
        this.feed = new Feed(this.urls,this.mgroup,this.state,this._http,this.authService)
        this.feed.addSubscription( this );
    }

         // Issue a request for more data, which replaces the existing subscription ID.  Causes initial handlers to be
        // called again if they have already been called when data is eventually received.
        public amend( url : string, data : any ) {
            if ( this.cancelled ) {
                throw "Cancelled subscription cannot be amended";
            }

            this.amendments.push({ url: url, data: data });
            this.initiateNextAmendment();
        }

        // Cancels the subscription on the server (
        public cancel() : void {
            if ( !this.cancelled ) {
                this.cancelled = true;
                if ( this.id ) {
                    this.feed.cancelSubscription( this.id );
                    this.id = null;
                }
                this.feed.removeSubscription( this );
                //this.trigger('cancel');
            }
        }
        
        public addRef() {
            if ( this.cancelled ) {
                console.warn('Subscription already cancelled.');
            } else {
                this.refCount++;
            }
        }
        
        public decRef() {
            this.refCount--;
            if ( this.refCount < 0 ) {
                console.warn('Reference count below zero');
            } else if ( this.refCount === 0 ) {
                this.cancel();
            }
        }

       send() {
            let data : CreateSubscriptionAdto = (this.getData ? this.getData() : null) || {};
            let feedId = this.feed.feedId;
            data.feedId = feedId;
            this.feed.startedSending();
            this.authService.getSubscribeId(this.url,data).subscribe((res) =>{
                console.log(res);
                this.feed.finishedSending()
            });
            //const response = await this._http.post(this.url,data).toPromise();
           /*  console.log("send res" + response);
            return response; */
              
           /*  this._http.post(this.url,data).subscribe(
                (res) =>{
                    console.log(res);
                },
                // Errors will call this callback instead:
                err => {
                console.log('Something went wrong!');
                }
            ); */
           /*  $.postJSON( this.url, data ).done(
                ( response : CreateSubscriptionResponseAdto ) => {
                    if ( feedId === this.feed.feedId && response )
                        this.gotSubscriptionId( response.subscriptionId )
                }
            ).fail(
                ( jqXHR : JQueryXHR, textStatus : string, errorThrown ) => {
                    if ( feedId === this.feed.feedId )
                        this.handleError( jqXHR )
                }
            ).always(
                () => this.feed.finishedSending()
            ); */
        }

        idChanged() {
            this.id = this.newId;
            this.newId = null;
            this.initiateNextAmendment();
        }

        handleData( data : FeedEventAdto ) {
            if ( this.preprocessingData ) {
                this.deferredData.push( data );
            } else {
                let promise = this.preProcessData( data );

                if ( promise ) {
                    this.preprocessingData = data;
                    promise.always( () => {
                        if (this.preprocessingData === data && !this.cancelled) {
                            this.preprocessingData = null;

                            this.handleDataNow(data);

                            while (this.deferredData.length && !this.cancelled && !this.preprocessingData) {
                                let nextData = this.deferredData.shift();
                                this.handleData(nextData);
                            }
                        }
                    });
                } else {
                    this.handleDataNow(data);
                }
            }
        }

        private preProcessData( data : FeedEventAdto ) {
            if ( data.mediaCookieSetup ) {
               // return this.feed.mCookieManager.setupCookie( data.mediaCookieSetup, null );
            }
            return null;
        }

        private handleDataNow( data : FeedEventAdto ) {
            let reset = this.reset;
            this.reset = false;
            let finished = !this.amending && !this.newId;
            let loaded = !this.loaded && finished;
            if ( loaded )
                this.loaded = true;

            //this.trigger('data', data, reset, finished);
            if ( loaded )
                //this.trigger('loaded');
            if ( this.errorReported ) {
                this.errorReported = false;
                //this.trigger('noerror');
            }
        }

        feedDeleted() {
            this.id = null;
            this.newId = null;
            this.amending = false;
            this.reset = true;
            this.preprocessingData = null;
            this.deferredData = [];
        }

        handleFeedError( unauthorised : boolean ) {
            this.errorReported = true;
            //this.trigger('error', unauthorised);
        }

       /*  handleError( jqXHR : JQueryXHR ) {

            let feedError = jqXHR.status === 401 || jqXHR.status >= 500;

            if ( jqXHR.status === 400 ) {
                try {
                    let json = <ErrorAdto>JSON.parse(jqXHR.responseText);
                    if ( json && json.errorCode === 'FEED_EXPIRED' ) {
                        feedError = true;
                    }
                }
                catch (e) {}
            }

            if ( feedError ) {
                // Not logged in, or a server error - this affects the whole feed
                this.feed.subscriptionError(jqXHR, jqXHR.status < 500 );
            } else {
                // Fatal error just for this subscription - we won't retry unless the feed is recreated
                this.errorReported = true;
                //this.trigger('error', jqXHR);
            }
        } */

        private gotSubscriptionId( subscriptionId : number ) {
            if ( this.cancelled ) {
                this.feed.cancelSubscription( subscriptionId );
            } else {
                this.amending = false;
                if ( this.id && this.id !== subscriptionId )
                    this.newId = subscriptionId;
                else
                    this.id = subscriptionId;
                this.initiateNextAmendment();
            }
        }

        private initiateNextAmendment() {
            if ( this.id && !this.newId && !this.amending && this.amendments.length > 0 ) {
                let amendment = this.amendments.shift();

                let data = amendment.data;
                let feedId = this.feed.feedId;
                data.feedId = feedId;
                data.subscriptionId = this.id;
                this.amending = true;
                this.feed.startedSending();
                this._http.post(amendment.url, data).subscribe(
                    (res : CreateSubscriptionResponseAdto) =>{
                        if ( this.feed.feedId === feedId && res )
                        this.gotSubscriptionId( res.subscriptionId )
                        console.log(res);
                        this.feed.finishedSending()
                    },
                    // Errors will call this callback instead:
                    err => {
                    console.log('Something went wrong!');
                    }

                );
              /*   $.postJSON( amendment.url, data ).done(
                    ( response : CreateSubscriptionResponseAdto ) => {
                        if ( this.feed.feedId === feedId && response )
                            this.gotSubscriptionId( response.subscriptionId )
                    }
                ).fail(
                    ( jqXHR, textStatus, errorThrown ) => {
                        if ( this.feed.feedId === feedId )
                            this.handleError( jqXHR )
                    }
                ).always(
                    () => this.feed.finishedSending()
                ); */
            }
        }
}
