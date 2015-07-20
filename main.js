'use strict';

var express    = require('express'),
    http       = require('http'),
    bodyParser = require('body-parser'),

var bbApp = express();
wdApp.server = http.createServer(wdApp);

wdApp.all('*', function(req, res, next) {
    console.log(req);

});
