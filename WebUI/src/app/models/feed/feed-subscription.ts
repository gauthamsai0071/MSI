import { CreateSubscriptionAdto, CreateSubscriptionResponseAdto, FeedEventAdto, StateAdto } from "../../../app/interfaces/adto";
import { FeedManager } from "./feed-manager";
import { HttpClient } from '@angular/common/http';
import { ApiUrls } from "../../../app/util/api-urls";
import { MediaGroupManagerService } from "./media-group-manager";
import { AuthService } from "../../../app/services/auth/auth.service";
import { EventEmitter } from "@angular/core";
import { Subscription } from "rxjs";

export class Feedsubscription {
    private cancelled: boolean;
    private amendments: { url: string; data: any }[] = [];
    id: number;
    newId: number;
    amending: boolean;
    reset: boolean;
    loaded: boolean = false;
    errorReported: boolean = false;
    deferredData: FeedEventAdto[] = [];
    preprocessingData: FeedEventAdto;
    public urls: ApiUrls;
    public state: StateAdto;
    feed: FeedManager;
    refCount: number = 0;

    public dataReceived: EventEmitter<any>;
    private feedManagerSubscription: Subscription = null;

    constructor(public url: any,
        private mgroup: MediaGroupManagerService, private getData?: () => CreateSubscriptionAdto,
        public _http?: HttpClient, private authService?: AuthService) {
        this.dataReceived = new EventEmitter<any>();

        this.feed = new FeedManager(this.urls, this.mgroup, this.state, this._http)
        this.feed.addSubscription(this);

        this.feedManagerSubscription = this.feed.dataReceived.subscribe(message => {
                                            this.dataReceived.emit(message);
                                        });
    }

    // Issue a request for more data, which replaces the existing subscription ID.  Causes initial handlers to be
    // called again if they have already been called when data is eventually received.
    public amend(url: string, data: any) {
        if (this.cancelled) {
            throw "Cancelled subscription cannot be amended";
        }
        this.amendments.push({ url: url, data: data });
        if(this.newId){
            this.idChanged();
        }
        this.initiateNextAmendment();
    }

    // Cancels the subscription on the server (
    public cancel(): void {
        if (!this.cancelled) {
            this.cancelled = true;
            if (this.id) {
                this.feed.cancelSubscription(this.id);
                this.id = null;
            }
            this.feed.removeSubscription(this);

            if (this.feedManagerSubscription != null) {
                this.feedManagerSubscription.unsubscribe();
            }

            this.dataReceived.complete();
        }
    }

    public addRef() {
        if (this.cancelled) {
            console.warn('Subscription already cancelled.');
        } else {
            this.refCount++;
        }
    }

    public decRef() {
        this.refCount--;
        if (this.refCount < 0) {
            console.warn('Reference count below zero');
        } else if (this.refCount === 0) {
            this.cancel();
        }
    }

    send() {
        let data: CreateSubscriptionAdto = (this.getData ? this.getData() : null) || {};
        let feedId = this.feed.feedId;
        data.feedId = feedId;
        this.feed.startedSending();
        this.authService.getSubscribeId(this.url, data).subscribe((res) => {
            console.log(res);
            if ( feedId === this.feed.feedId && res ){
                this.gotSubscriptionId(res.subscriptionId);
            }
            this.feed.finishedSending();
        });
    }

    idChanged() {
        this.id = this.newId;
        this.newId = null;
        this.initiateNextAmendment();
    }

    handleData(data: FeedEventAdto) {
        if (this.preprocessingData) {
            this.deferredData.push(data);
        } else {
            let promise = this.preProcessData(data);

            if (promise) {
                this.preprocessingData = data;
                promise.always(() => {
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

    private preProcessData(data: FeedEventAdto) {
        if (data.mediaCookieSetup) {
            // return this.feed.mCookieManager.setupCookie( data.mediaCookieSetup, null );
        }
        return null;
    }

    private handleDataNow(data: FeedEventAdto) {
        let reset = this.reset;
        this.reset = false;
        let finished = !this.amending && !this.newId;
        let loaded = !this.loaded && finished;
        if (loaded)
            this.loaded = true;

        if (loaded)
            if (this.errorReported) {
                this.errorReported = false;
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

    handleFeedError(unauthorised: boolean) {
        this.errorReported = true;
        //this.trigger('error', unauthorised);
    }

    private gotSubscriptionId(subscriptionId: number) {
        if (this.cancelled) {
            this.feed.cancelSubscription(subscriptionId);
        } else {
            this.amending = false;
            if (this.id && this.id !== subscriptionId)
                this.newId = subscriptionId;
            else
                this.id = subscriptionId;
            this.initiateNextAmendment();
        }
    }

    private initiateNextAmendment() {
        if (this.id && !this.newId && !this.amending && this.amendments.length > 0) {
            let amendment = this.amendments.shift();

            let data = amendment.data;
            let feedId = this.feed.feedId;
            data.feedId = feedId;
            data.subscriptionId = this.id;
            this.amending = true;
            this.feed.startedSending();
            this._http.post(amendment.url, data).subscribe(
                (res: CreateSubscriptionResponseAdto) => {
                    if (this.feed.feedId === feedId && res)
                        this.gotSubscriptionId(res.subscriptionId)
                    console.log(res);
                },
                // Errors will call this callback instead:
                err => {
                    console.log('Something went wrong!');
                }

            );
            this.feed.finishedSending();          
        }
    }
}
