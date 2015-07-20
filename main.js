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
var building = false;
var report = new mailgun(bbApp.config.mailgun.api_key);

bbApp.all('*', function(req, res, next) {
    if (req.query.token !== bbApp.config.token) {
        return res.send(401);
    }
    if (building) {
        return res.send(200);
    }
    building = true;
    var stdout = '';
    var stderr = '';
    var build  = spawn('sh', [bbApp.config.build_script]);
    build.stdout.on('data', function(data) {
        stdout += data;
    });
    build.stderr.on('data', function(data) {
        stderr += data;
    });
    build.on('close', function(code) {
        if (code) {
            return res.send(500);
        }
        // console.log('child process exited with code ' + code);
        report.sendText(
            bbApp.config.mailgun.sender,
            bbApp.config.mailgun.recipients,
            'BitBot: Building Logs @ ' + new Date(),
            stdout + '\n' + stderr,
            function(err) {
                err && console.log(err);
                res.send(200);
            }
        );
    });
    building = false;
});

bbApp.listen(bbApp.config.port, function() {
    console.log('<<<<<<< BitBot is now ON AIR! >>>>>>>');
    console.log('listening @ ' + bbApp.config.port);
});
