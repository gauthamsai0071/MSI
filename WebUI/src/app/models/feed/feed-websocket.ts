import { EventEmitter } from "@angular/core";
import { ApiUrls } from "../../util/api-urls";
import { MediaGroupManagerService } from "./media-group-manager";

export class Feedwebsocket {
    private ready = false;
    private closed = false;
    private ws: WebSocket;
    public messageResponse : any;   
    
    public dataReceived: EventEmitter<any>;
    public socketError: EventEmitter<any>;
    private keepAliveTimer: any;

    constructor(private urls : ApiUrls, private groupManger: MediaGroupManagerService) {
        this.dataReceived = new EventEmitter<any>();
        this.socketError = new EventEmitter<any>();
    }

    start() : any {       
        const url = this.urls.wsFeedWithActiveTime(this.getAndResetActiveState())   
        this.ws = new WebSocket(url);        
        
        this.ws.onopen = () => {            
            if (this.ws) {
                this.ready = true;
                this.keepAliveTimer = null;
                this.sendKeepAlive();
            }
        };

        this.ws.onclose = ( closeEvent ) => {
            if (this.ws) {                
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
                    switch (message.type) {
                        case "CREATE_RESPONSE":
                            this.dataReceived.emit(message);
                            break;
                        case "EVENT_DATA":
                            this.dataReceived.emit(message);                      
                            break;
                        case "SESSION_EXPIRED":
                            this.cleanupFeed(true);
                            break;
                        case "KEEP_ALIVE":
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
        if ((Date.now() - this.groupManger.lastMessageTime) <= 30000)
        {
            this.keepAliveTimer = setTimeout(() => { 
                this.groupManger.activityTime = Date.now();
                this.sendKeepAlive();
            }, (35000 - (Date.now() - this.groupManger.lastMessageTime)));

            return;
        }

        if (this.ready && this.ws) {
            let data: any = {keepAlive: true};
            data.activeTime = this.getAndResetActiveState();
            if (this.groupManger.haveLiveGroups())
                data.mgroup = this.groupManger.getLiveGroupIds();
            this.ws.send(JSON.stringify( data ) );

            this.keepAliveTimer = setTimeout(() => { 
                                        this.groupManger.activityTime = Date.now();
                                        this.sendKeepAlive();
                                    }, 35000);
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
            this.socketError.emit( unauthorised );
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

        this.closeSubscriptions();
    }

    killSocket(status: number, reason: string ) {
        if (this.ws) {
            let ws = this.ws;
            this.ws == null;
            ws.close(status, reason);
        }

        this.closeSubscriptions();
    }    

    // Return time since last activity
    getAndResetActiveState() {
        return Math.max(0, Date.now() - this.groupManger.activityTime);
    }

    closeSubscriptions(): void {
        clearTimeout(this.keepAliveTimer);
        this.dataReceived.complete();
        this.socketError.complete();
    }
}
