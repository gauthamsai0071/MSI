import { CreateFeedResponseAdto, FeedEventAdto, FeedEventSetAdto, StateAdto } from "../../../app/interfaces/adto";
import { ApiUrls } from "../../../app/util/api-urls";
import { Feedsubscription } from "./feed-subscription";
import { Feedwebsocket } from "./feed-websocket";
import { HttpClient } from '@angular/common/http';
import * as $ from "jquery";
import { MediaGroupManagerService } from "./media-group-manager";
import { EventEmitter } from "@angular/core";
import { Subscription } from "rxjs";

export class FeedManager {
    private initialRestartTimeoutMs = 5000;
    private restartTimeoutMs = this.initialRestartTimeoutMs;
    private restartBackoffMs = 2000;
    private maxRestartTimeMs = 30000;
    private transientErrorRetryTimeMs = 10000;
    private keepRunning = true;

    feedId: string;
    private serverStateSubscriptionId?: number;
    public subscriptions: Feedsubscription[] = [];
    private subscribingCount: number = 0;
    private lastFeedEvent: FeedEventSetAdto;

    private errorReported = false;

    private useWebSocketFeeds: boolean;
    private feedSocket: Feedwebsocket;

    private fastReconnect: boolean;
    public usingVmProxy: boolean;

    public dataReceived: EventEmitter<any>;

    private dataSubscription: Subscription = null;
    private errorSubscription: Subscription = null;

    constructor(private urls: ApiUrls, public groupManagerService: MediaGroupManagerService, 
                private state: StateAdto, private _http: HttpClient) {
        this.urls = new ApiUrls();
        this.dataReceived = new EventEmitter<any>();
        this.useWebSocketFeeds = true;
        this.initIdleTracker();
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

    public addSubscription(subscription: Feedsubscription): void {
        if (!this.keepRunning) {
            console.log("Feed has been shut down; addSubscription cancelled.");
            return;
        }

        this.subscriptions.push(subscription);

        if (this.feedId) {
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
        if (this.useWebSocketFeeds) {
            this.feedSocket = new Feedwebsocket(this.urls, this.groupManagerService);

            this.dataSubscription = this.feedSocket.dataReceived.subscribe(message => {
                if (message.type == "CREATE_RESPONSE") {
                    this.initFeed(message.response);
                } else if (message.type == "EVENT_DATA") {
                    this.processEventIfReady(message.eventData);

                    if (message.eventData && message.eventData.id && message.eventData.data[message.eventData.id].videoFiles ||
                        (message.eventData.data[message.eventData.id] &&
                            message.eventData.data[message.eventData.id].moreVideoFilesAvailable == false)) {
                        this.dataReceived.emit(message.eventData);
                    }
                }
            });

            this.errorSubscription = this.feedSocket.socketError.subscribe((error) => {
                this.handleError(error);
            });

            this.feedSocket.start();
        }
        else {
            this._http.post(this.urls.feeds, { minEventTimeMs: 500, serverState: true }).subscribe(
                (response: CreateFeedResponseAdto) => {
                    console.log(response);
                    this.initFeed(response);
                    this.pollFeed(1);
                },
                err => {
                    console.log('Something went wrong!');
                    this.restartTimeoutMs = Math.min(this.maxRestartTimeMs, this.restartTimeoutMs + this.restartBackoffMs);
                }
            );
        }
    }

    initFeed(response: CreateFeedResponseAdto) {
        this.feedId = response ? response.feedId : 'xxx';
        this.serverStateSubscriptionId = response ? response.serverStateSubscriptionId : null;
        this.subscriptions.forEach(subscription => subscription.send());
    }

    public startedSending() {
        this.subscribingCount++;
    }

    public finishedSending() {
        this.subscribingCount--;
        if (this.subscribingCount === 0 && this.lastFeedEvent)
            this.handleFeedEvent();
    }

    public cancelSubscription(subscriptionId: number) {
        this.feedSocket.shutdown();

        if (this.dataSubscription != null) {
            this.dataSubscription.unsubscribe();
        }

        if (this.errorSubscription != null) {
            this.errorSubscription.unsubscribe();
        }

        this.dataReceived.complete();
    }

    public removeSubscription(subscription: Feedsubscription) {
        let index = this.subscriptions.indexOf(subscription);
        if (index != -1) {
            this.subscriptions.splice(index, 1);

            if (this.subscriptions.length === 0 && this.errorReported && !this.state?.allowFeed) {
                this.errorReported = false;
            }
        }

        if (this.dataSubscription != null) {
            this.dataSubscription.unsubscribe();
        }

        if (this.errorSubscription != null) {
            this.errorSubscription.unsubscribe();
        }

        this.dataReceived.complete();
    }

    private feedDeleted() {
        this.subscriptions.forEach((subscription: Feedsubscription) => {
            subscription.feedDeleted();
        });
    }

    private initIdleTracker() {
        $(document).on("mousemove keypress mousedown touchstart kicktimer", () => this.onUserActive() );
        this.groupManagerService.activityTime = Date.now();
    }

    private onUserActive() {
        let now = Date.now();
        if (now > this.groupManagerService.activityTime) {
            this.groupManagerService.activityTime = now;        
        }
    }

    handleError(unauthorised: boolean) {
        let subscriptions = this.subscriptions;

        this.destroyFeed();
        this.feedDeleted();

        this.errorReported = true;

        subscriptions.forEach((subscription: Feedsubscription) => {
            subscription.handleFeedError(unauthorised);
        });       
    }

    private handleTransientPollError(eventId: number) {
        let feedId = this.feedId;

        this.errorReported = true;

        let subscriptions = this.subscriptions;
        subscriptions.forEach((subscription: Feedsubscription) => {
            //subscription.handleFeedError( jqXHR.status == 401 );
        });

        setTimeout(() => {
            if (feedId === this.feedId) {
                this.pollFeed(eventId);
            }
        }, this.transientErrorRetryTimeMs);
    }

    private destroyFeed() {
        if (this.feedId) {
            let feedId = this.feedId;
            this.feedId = null;
            this.serverStateSubscriptionId = null;
            if (this.useWebSocketFeeds) {
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

    private pollFeed(eventId: number) {
        if (!this.keepRunning) {
            return;
        }
        let feedId = this.feedId;
        let data: any = {};
        if (this.groupManagerService.haveLiveGroups())
            data.mgroup = this.groupManagerService.getLiveGroupIds();
        this._http.get(this.urls.feedEvent(feedId, eventId), data).subscribe(
            (dataSet) => {
                if (this.keepRunning && feedId === this.feedId) {
                    if (dataSet) {
                        this.processEventIfReady(dataSet);
                    } else {
                        this.feedId = null;
                        this.serverStateSubscriptionId = null;
                        this.feedDeleted();
                        this.createFeed();
                    }
                }
            },
            err => {
                console.log('Something went wrong!');
            }
        );
    }

    private handleFeedEvent() {
        // We only process feed events when there are no subscription events in flight, or else we may get
        // data for a subscription before we've learned what its subscription ID is
        let dataSet = this.lastFeedEvent;

        let serverStateData: FeedEventAdto = this.subData(dataSet, this.serverStateSubscriptionId);
        if (serverStateData)

            this.subscriptions.forEach((subscription: Feedsubscription) => {

                let data: FeedEventAdto = this.subData(dataSet, subscription.id);
                if (data) {
                    subscription.handleData(data);
                } else if (data = this.subData(dataSet, subscription.newId)) {
                    subscription.idChanged();
                    subscription.handleData(data);
                }
            });

        if (this.errorReported) {
            this.errorReported = false;
        }
        if (this.useWebSocketFeeds) {
            setTimeout(() => this.feedSocket.sendAck(dataSet.id), 10);
        }
        else {
            this.pollFeed(dataSet.nextId);
        }
        this.lastFeedEvent = null;
    }

    processEventIfReady(eventData) {
        this.lastFeedEvent = eventData;
        if (this.subscribingCount === 0) {
            this.handleFeedEvent();
        }
    }

    private subData(dataSet: FeedEventSetAdto, subId: number): FeedEventAdto {
        return subId ? dataSet.data[subId] : null;
    }
}