// from this project - https://cors-anywhere.herokuapp.com/corsdemo
var fs = require('fs');
var path = require('path');

// Listen on a specific host via the HOST environment variable
var host = process.env.HOST || 'localhost';
// Listen on a specific port via the PORT environment variable
var port = process.env.PORT || 3001;

var cors_proxy = require('cors-anywhere');
cors_proxy.createServer({
    originWhitelist: [], // Allow all origins
    requireHeader: ['origin', 'x-requested-with'],
    removeHeaders: ['cookie', 'cookie2'],
    httpsOptions: { 
        key: fs.readFileSync('./certs/localhost-key.pem'), 
        cert: fs.readFileSync('./certs/localhost.pem'), 
      },
}).listen(port, host, function() {
    console.log('Running CORS Anywhere on ' + host + ':' + port);
});
