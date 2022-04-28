import { BehaviorSubject } from "rxjs";
import { MediaFilterService } from "../../services/media/media-filter.service";
import { FeedManager } from "./feed-manager";
import { io } from 'socket.io-client';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';
import { PlayerService } from "src/app/services/player/player.service";

export class Feedwebsocket {

    private ready = false;
    private closed = false;
    private ws: WebSocket;
    private idleTimer: any;
    private keepAliveResponseTimeout: any;
    public messageResponse : any;
    
    constructor(private feed : FeedManager, private url: string, public mediaFilterService: MediaFilterService) {}

      start() : any {          
        this.ws = new WebSocket(this.url);        
        
        
        this.ws.onopen = () => {
            if (this.ws) {
                this.ready = true;
                this.sendKeepAlive();
            }
        };

        this.ws.onclose = ( closeEvent ) => {
            if (this.ws) {
                console.log(("FeedManager websocket closed with status " + closeEvent.code) + (closeEvent.reason ? ": " + closeEvent.reason : ""));
                this.feed.creatingSocket = false;
                this.cleanupFeed(false);
            }
        };

        this.ws.onerror = ( errorEvent ) => {
            if (this.ws) {
                console.log("FeedManager websocket has encountered an error");
                console.log(errorEvent);
            }
        };

        this.ws.onmessage = ( event ) => {
            if (this.ws) {
                if (this.ready) {
                    let message = JSON.parse(event.data);
                    clearTimeout(this.keepAliveResponseTimeout);
                    switch (message.type) {
                        case "CREATE_RESPONSE":
                            this.feed.initFeed(message.response);
                            this.feed.creatingSocket = false;
                            break;
                        case "EVENT_DATA":
                            this.feed.processEventIfReady(message.eventData);
                            if(message.eventData && message.eventData.id && message.eventData.data[message.eventData.id].videoFiles){
                                this.messageResponse = message?.eventData?.data[2]?.videoFiles;
                                if(this.feed.subscriptions[0].url == "/api/videos/subscribe"){
                                    MediaFilterService.notifyfilteredRespone(this.messageResponse);
                                }
                                else {
                                    PlayerService.getMediaResponse(JSON.stringify(message.eventData));
                                }
                            }else if(message.eventData && message.eventData.id && message.eventData.data[message.eventData.id].moreVideoFilesAvailable == false){
                                if(this.feed.subscriptions[0].url == "/api/videos/subscribe"){
                                    MediaFilterService.notifyfilteredRespone(null);
                                }
                            }
                            else{
                                MediaFilterService.notifyfilteredRespone(null);
                            }
                            break;
                        case "SESSION_EXPIRED":
                            this.cleanupFeed(true);
                            break;
                        case "KEEP_ALIVE":
                            // Only sent to clear the alive timer
                            break;
                        default:
                            console.log("FeedSocket received a message without a valid type.");
                            break;
                    }
                }
            }
        }
    }

    sendKeepAlive() {
        if (this.ready && this.ws) {
            let data: any = {keepAlive: true};
            data.activeTime = this.feed.getAndResetActiveState();
            if (this.feed.mgroup.haveLiveGroups())
                data.mgroup = this.feed.mgroup.getLiveGroupIds();
            this.ws.send(JSON.stringify( data ) );
            this.keepAliveResponseTimeout = setTimeout( () => {
                this.cleanupFeed( false );
            }, 15000 );
            clearTimeout( this.idleTimer );
        }
    }

    sendAck( eventId : number ) {
        if (this.ready) {
            let data: any = {eventId: eventId};
            this.ws.send(JSON.stringify(data));
        }
    }

    private cleanupFeed( unauthorised: boolean ) {
        if (!this.closed) {
            this.closed = true;
            this.ready = false;
            this.feed.handleError( unauthorised );
        }
    }

    public shutdown() {
        this.closed = true;
        this.ready = false;
        this.killSocket( 1000, "Shutting down");
    }

    closeSocket(status: number, reason: string ) {
            if (this.ws) {
                this.ws.close(status, reason);
                this.ws == null;
            }
    }

    killSocket(status: number, reason: string ) {
        if (this.ws) {
            let ws = this.ws;
            this.ws == null;
            ws.close(status, reason);
        }
    }

}
