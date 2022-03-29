import { AppUrls } from "./app-urls";

import * as $ from 'jquery';

export class Urls {

    public static isValidHostnameIpv4Ipv6AddressDomainName(url : string){
        return ( this.isValidHostname( url ) && this.isFullyQualifiedDomainName( url ) ) || this.isValidIpV4Address( url ) || this.isValidIpV6Address( url );
    }

    public static isValidHostname( hostname : string ) : boolean {
        return (this.isValidIpV4Address( hostname )
            || (/^(([a-zA-Z0-9]|[a-zA-Z0-9][a-zA-Z0-9\-]*[a-zA-Z0-9])\.)*([A-Za-z]|[A-Za-z][A-Za-z0-9\-]*[A-Za-z0-9])$/).test( hostname ));
    }

    public static isValidIpV4Address( ipAddress : string ) : boolean {
        return (/^\s*((([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5]))\s*$/).test( ipAddress );
    }

    public static isValidIpV6Address( ipAddress : string ) : boolean {
        return /^\s*((([0-9A-Fa-f]{1,4}:){7}([0-9A-Fa-f]{1,4}|:))|(([0-9A-Fa-f]{1,4}:){6}(:[0-9A-Fa-f]{1,4}|((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9A-Fa-f]{1,4}:){5}(((:[0-9A-Fa-f]{1,4}){1,2})|:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9A-Fa-f]{1,4}:){4}(((:[0-9A-Fa-f]{1,4}){1,3})|((:[0-9A-Fa-f]{1,4})?:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){3}(((:[0-9A-Fa-f]{1,4}){1,4})|((:[0-9A-Fa-f]{1,4}){0,2}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){2}(((:[0-9A-Fa-f]{1,4}){1,5})|((:[0-9A-Fa-f]{1,4}){0,3}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){1}(((:[0-9A-Fa-f]{1,4}){1,6})|((:[0-9A-Fa-f]{1,4}){0,4}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(:(((:[0-9A-Fa-f]{1,4}){1,7})|((:[0-9A-Fa-f]{1,4}){0,5}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:)))(%.+)?\s*$/.test(ipAddress);
    }

    public static isFullyQualifiedDomainName( domainName: string ): boolean {
        return domainName.indexOf('.') > -1;
    }

    public static makeAddressStr( address: string, port: number, isHttps = false ): string {

        let prefix = isHttps ? 'https://' : 'http://';
        let portStr = '';

        if ( address == '' ) {
            address = "All address";
        }

        // dont show the port if it is the default.
        if ( (isHttps && port != 443) || !isHttps && port != 80 ) {
            portStr = ':' + port.toString();
        }

        return prefix + address + portStr;

    }

    public static isPublicUrl( appUrls: AppUrls ): boolean {
        return window.location.pathname.indexOf( appUrls.abs(appUrls.pub) ) === 0;
    }

    public static isAnonUrl( appUrls: AppUrls ): boolean {
        return window.location.pathname.indexOf( appUrls.abs(appUrls.anon) ) === 0;
    }

    /* public static getUiModeFromUrl( appUrls: AppUrls ): WebUiGlobalMode {
        if ( window.location.pathname.indexOf( appUrls.abs(appUrls.ivrRoot) ) === 0 ) {
            return Util.WebUiGlobalMode.INCAR;
        } else {
            return Util.WebUiGlobalMode.NORMAL;
        }
    } */

    public static param( url: string, name: string, value: any ): string {
        return url + ((url.indexOf("?") === -1) ? "?" : "&") + name + "=" + value;
    }

    /** Add a path element to the given url e.g. addPath('/users?type=USER', 'template') -> '/users/template?type=USER' */
    public static addPath( url: string, pathElement: any ): string {
        if (pathElement) {
            let pathStr = ""+pathElement;
            if (pathStr.length) {
                if (pathStr.charAt(0) != '/')
                    pathStr = '/' + pathStr;
                let queryPoint = url.lastIndexOf("?");
                if (queryPoint != -1) {
                    url = url.substring(0, queryPoint) + pathStr + url.substring(queryPoint);
                } else {
                    url = url + pathStr;
                }
            }
        }
        return url;
    }

    public static addParams( url: string, params: {} ): string {
        if (params) {
         url += (url.lastIndexOf("?") == -1 ? "?" : "&") + $.param(params);
        }
        return url;
    }

    public static isDevMode(url:any ) {
        return url.match('[&?]dev=true');
    }
}

export class ParsedUrl {

    public protocol: string;
    public host: string;
    public hostname: string;
    public port: string;
    public pathname: string;
    public search: string;
    public searchParams: { [s: string]: string };
    public hash: string;

    public static parse(url:any): ParsedUrl {

        // Based on https://www.abeautifulsite.net/parsing-urls-in-javascript
        let parser = document.createElement('a'),
            searchObject: { [s: string]: string } = {},
            queries,
            query = new ParsedUrl()
            ;

        // Let the browser do the work
        parser.href = url;
        query.protocol = parser.protocol;
        query.host = parser.host;
        query.hostname = parser.hostname;
        query.port = parser.port;
        query.pathname = parser.pathname;
        query.hash = parser.hash;
        query.search = decodeURIComponent(parser.search);

        // Parse each of the search terms
        queries = query.search.replace(/^\?/, '').split('&');
        for (let i = 0; i < queries.length; i++) {
            let split = queries[ i ].split('=');
            searchObject[ split[ 0 ] ] = split[ 1 ];
        }

        query.searchParams = searchObject;
        return query;
    }

    public toUrl(): string {
        let url = this.protocol + "//" + this.hostname,
            params = "";

        if (this.port) {
            url += ":" + this.port;
        }

        if ( this.pathname ) {
            if ( this.pathname.charAt(0) != '/' ) {
                this.pathname = '/' + this.pathname;
            }
            url += this.pathname;
        }

      /*   _.forEach(this.searchParams, (value: string, key: string) => {
            if (key && key.length) {
                if (params.length) {
                    params += "&";
                }
                params += key + "=" + encodeURIComponent(value);
            }
        }); */
        if (params.length) {
            url += "?" + params;
        }
        if (this.hash) {
            url += "#" + this.hash;
        }
        return url;
    }

}