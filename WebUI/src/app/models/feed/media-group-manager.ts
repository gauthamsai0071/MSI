import { ApiUrls } from "../../../app/util/api-urls";
import { HttpClient } from '@angular/common/http';
import { Injectable } from "@angular/core";

@Injectable({
    providedIn: 'root'
})
export class MediaGroupManagerService {
    private thumbId : string;
    private playerId : string;

    constructor(private http: HttpClient) {
    }

    haveLiveGroups() {
        if(!this.thumbId){
            return this.getThumb();
        }
        return this.thumbId || this.playerId;
    }

    getLiveGroupIds() {
        let ids = '';
        if ( this.thumbId )
            ids += this.thumbId;
        if ( this.playerId )
            ids += (ids?',':'') + this.playerId;
        return ids;
    }

    getThumb() : string {
        if ( !this.thumbId )
            this.thumbId = this.createGroupId();
        return this.thumbId;
    }

    newThumb() : string {
        this.releaseThumb();
        let tid = this.getThumb();
        return tid;
    }

    releaseThumb() : void {
        this.releaseGroup( this.thumbId );
        this.thumbId = null;
    }

    createPlayer() : string {
        this.releasePlayer( this.playerId );
        this.playerId = this.createGroupId();
        return this.playerId;
    }

    releasePlayer( playerId: string ) {
        if ( playerId && playerId == this.playerId ) {
            this.releaseGroup(this.playerId);
            this.playerId = null;
        }
    }

    private createGroupId() : string {
        return '' + Math.floor(Math.random() * 100000000 );
    }

    private releaseGroup(mgroupid : string ) {
        if ( mgroupid ) {
            let url = ApiUrls.mediaGroup(mgroupid)
            this.http.request('delete', url).subscribe();
           /*  $.ajax({
                type: 'DELETE',
                url: this.apiUrls.mediaGroup(mgroupid)
            }); */
        }
    }

}
