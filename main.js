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
    var rtnErr = '';
    if (req.query.token !== bbApp.config.token) {
        console.log((rtnErr = 'Error token: ' + req.query.token));
        return res.status(401).send(rtnErr);
    }
    var project = req.query.project ? req.query.project : 'default';
    if (!bbApp.config.build_script[project]) {
        console.log((rtnErr = 'Error project: ' + req.query.project));
        return res.status(400).send(rtnErr);
    }
    if (building[project]) {
        console.log((rtnErr = 'Project is busy now: ' + req.query.project));
        return res.status(500).send(rtnErr);
    }
    building[project] = true;
    var stdout = '';
    var stderr = '';
    var build  = spawn('bash', [bbApp.config.build_script[project]]);
    build.stdout.on('data', function(data) {
        stdout += data;
    });
    build.stderr.on('data', function(data) {
        stderr += data;
    });
    build.on('close', function(code) {
        var title = '[BitBot] ' + project + ': Building Logs @ ' + new Date();
        stdout   += (stderr ? ('\n' + stderr) : '')
                  + '\n' + 'Build process exited with code: ' + code + '.\n';
        console.log(title + '\n' + stdout);
        var rtCode = code ? 500 : 200;
        if (bbApp.config.notification === 'all'
        || (bbApp.config.notification === 'error' &&  code)) {
            report.sendText(
                bbApp.config.mailgun.sender,
                bbApp.config.mailgun.recipients,
                title, stdout,
                function(err) {
                    if (err) {
                        rtnErr  = 'Error sending notifications: ' + err;
                        stdout += rtnErr + '\n';
                        rtCode  = 500;
                        console.log(rtnErr);
                    }
                    res.status(rtCode).send(stdout);
                }
            );
        } else {
            res.status(rtCode).send(stdout);
        }
    });
    building[project] = false;
});

bbApp.listen(bbApp.config.port, bbApp.config.domain, function() {
    console.log('<<<<<<< BitBot is now ON AIR! >>>>>>>');
    console.log('listening @ ' + bbApp.config.domain
                         + ':' + bbApp.config.port);
});
