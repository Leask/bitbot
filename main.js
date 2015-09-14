'use strict';

// load configs
var config = require('./config');
if (!config) {
    console.log('Error loading configs!');
    process.exit(1);
}

// import dependencies
var express    = require('express'),
    http       = require('http'),
    bodyParser = require('body-parser'),
    spawn      = require('child_process').spawn,
    mailgun    = require('mailgun').Mailgun;

// init express
var bbApp = express();
bbApp.server = http.createServer(bbApp);

// keep reference to config
bbApp.config = config;

// main
var building = [];
var report = new mailgun(bbApp.config.mailgun.api_key);

bbApp.all('*', function(req, res, next) {
    if (req.query.token !== bbApp.config.token) {
        return res.send(401);
    }
    var project = req.query.project ? req.query.project : 'default';
    if (!bbApp.config.build_script[project]) {
        return res.send(400);
    }
    if (building[project]) {
        return res.send(200);
    }
    building[project] = true;
    var stdout = '';
    var stderr = '';
    var build  = spawn('sh', [bbApp.config.build_script[project]]);
    build.stdout.on('data', function(data) {
        stdout += data;
    });
    build.stderr.on('data', function(data) {
        stderr += data;
    });
    build.on('close', function(code) {
        console.log('Build process exited with code: ' + code + '.');
        var rtCode = code ? 500 : 200;
        if (bbApp.config.notification === 'all'
        || (bbApp.config.notification === 'error' &&  code)) {
            report.sendText(
                bbApp.config.mailgun.sender,
                bbApp.config.mailgun.recipients,
                '[BitBot] ' + project + ': Building Logs @ ' + new Date(),
                stdout + '\n' + stderr,
                function(err) {
                    err && console.log(err);
                    res.send(rtCode);
                }
            );
        } else {
            res.send(rtCode);
        }
    });
    building[project] = false;
});

bbApp.listen(bbApp.config.port, bbApp.config.domain, function() {
    console.log('<<<<<<< BitBot is now ON AIR! >>>>>>>');
    console.log('listening @ ' + bbApp.config.domain
                         + ':' + bbApp.config.port);
});
