const koa = require("koa");
const proxy = require("koa-http2-proxy");
const gracefulShutdown = require('http-graceful-shutdown');
const fileSystem = require('fs');

const https = require('https');
const { default: enforceHttps } = require('koa-sslify');

const bodyParser = require('koa-bodyparser');
const path = require('path');

const ui_path  = path.join(path.resolve(__dirname, '..'), 'UI\\');

var serverConfig = JSON.parse(fileSystem.readFileSync('config.json', 'utf8'));

const app = new koa();
const port = serverConfig.port;

app.use(async (ctx, next) => {
	if (ctx.request.url.indexOf('.') !== -1) {
		const extension = ctx.request.url.split('.').pop();			
		
		switch(extension) {
			case 'css':
				serve(ctx, 'text/css');
				break;
			case 'js':
				serve(ctx, 'text/javascript');
				break;
			case 'ico':
				serve(ctx, 'image\/vnd.microsoft.icon');
				break;
			case 'jpg':
			case 'jpeg':
				serve(ctx, 'image/jpeg');
				break;
			case 'gif':
			case 'png':
				serve(ctx, 'image/' + extension);
				break;
			case 'svg':
				serve(ctx, 'image/svg+xml');
				break;
			case 'swf':
				serve(ctx, 'application/x-shockwave-flash');
				break;
			case 'tif':
			case 'tiff':
				serve(ctx, 'image/tiff');
				break;
			case 'ttf':				
				serve(ctx, 'font/ttf');
				break;
			case 'eot':
				serve(ctx, 'application/vnd.ms-fontobject');
				break;
			case 'otf':
				serve(ctx, 'font/otf');
				break;
			case 'woff':
			case 'woff2':
				serve(ctx, 'font/' + extension);
				break;
			case 'gz':
				serve(ctx, 'application/gzip');
				break;
			case 'zip':
				serve(ctx, 'application/zip');
				break;
			case '7z':
				serve(ctx, 'application/x-7z-compressed');
				break;
			case '7z':
				serve(ctx, 'application/x-7z-compressed');
				break;
			case 'map':
				serve(ctx, 'application/json');
		}
		
		return;	
	}
	
	if (ctx.request.url === '/health')
	{
		ctx.status = 200;
	} else if (ctx.request.url === '/' || ctx.request.url === '/login' || ctx.request.url === '/home' || 
		(ctx.request.url.indexOf('/api') === -1 && ctx.request.url.indexOf('/incidents') !== -1)) {
		setResponseHeaders(ctx.response, 'text/html');
		ctx.body = fileSystem.createReadStream(ui_path + 'index.html');
	} else {
		await next();
	}		
});
	
app.use(
	  proxy("/", {
		target: serverConfig.assetManagerUrl,
		ws: true, 
		changeOrigin: true,
		logLevel: 'debug'
	  })
);

app.use(bodyParser());

app.use(enforceHttps({
 port: port
}));

var options = {
  key: fileSystem.readFileSync(path.resolve('./certs/private.key')),
  cert: fileSystem.readFileSync(path.resolve('./certs/certificate.crt'))
}

const server = https.createServer(options, app.callback()).listen(port);

//const server = app.listen(port);

console.log(`listening on port ${port}`);

gracefulShutdown(server,
    {
        signals: 'SIGINT SIGTERM',
        timeout: 30000,
        development: false,
        onShutdown: raiseAlarm,
        finally: () => {
            console.log('Server gracefully shutting down.....')
        }
    }
);

function raiseAlarm() {
  return new Promise((resolve) => {
    console.log('Raising Alarm')
	resolve();    
  });
}

function serve(ctx, mimeType) {
	setResponseHeaders(ctx.response, mimeType);
	ctx.body = fileSystem.createReadStream(ui_path + ctx.request.url);
}

function setResponseHeaders(response, mimeType) {
	response.set({
        "X-Content-Security-Policy" : "default-src 'self'",
        "Strict-Transport-Security" : "max-age=31536000; includeSubDomains",
         "X-Content-Type-Options" : "nosniff",
         "X-Frame-Options" : "SAMEORIGIN",
         "X-XSS-Protection" : "1; mode=block",
         "Referrer-Policy" : "same-origin",
         "Cache-Control" : "no-store",
		 "Content-Type": mimeType
    });
}