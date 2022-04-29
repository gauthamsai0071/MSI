import { EventEmitter } from "@angular/core";
import { MediaGroupManagerService } from "./media-group-manager";

export class Feedwebsocket {

    private ready = false;
    private closed = false;
    private ws: WebSocket;
    private idleTimer: any;
    private keepAliveResponseTimeout: any;
    public messageResponse : any;
    
    dataReceived: EventEmitter<any>;
    socketError: EventEmitter<any>;

    constructor(private url: string, private groupManager: MediaGroupManagerService) {
        this.dataReceived = new EventEmitter<any>();
        this.socketError = new EventEmitter<any>();
    }

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
                            this.dataReceived.emit(message.response);
                            break;
                        case "EVENT_DATA":                            
                            if(message.eventData && message.eventData.id) {
                                this.dataReceived.emit(message.eventData);
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
            data.activeTime =  Math.max(0, Date.now());
            if (this.groupManager.haveLiveGroups())
                data.mgroup = this.groupManager.getLiveGroupIds();
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
            this.socketError.emit(unauthorised);
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
