global.setting = require('./config/setting');
var mysql = require('mysql');
global.pool = mysql.createPool({
    host: setting.mysql.host,
    user: setting.mysql.user,
    password: setting.mysql.password,
    database: setting.mysql.database,
    connectionLimit:setting.mysql.connectionLimit,
    debug: debug: process.env.DEBUG === 'true',
    waitForConnections:false
});
pool.on('connection', function (connection) {
    console.log('Connection %d 链接', connection.threadId);
});
pool.on('release', function (connection) {
  console.log('Connection %d released', connection.threadId);
});
var express = require('express');
var favicon = require('serve-favicon');
var log4js = require('log4js');
var logger = log4js.getLogger("app");
var bodyParser = require('body-parser');

var app = express();
var util = require('./util/index');

//router
var routes = require('./routes/oauth');
var networktpl = require('./routes/networktpl');
var network = require('./routes/network');
var offer = require('./routes/offer');
var flow = require('./routes/flow');
var report = require('./routes/report');
var user = require('./routes/user');
var campaign = require('./routes/campaign');
var lander=require('./routes/lander');
var traffic= require('./routes/traffic');
var user_setting=require('./routes/user_setting');

//favicon
app.use(favicon(__dirname + '/public/favicon.ico'));

// page
app.use("/assets", express.static(__dirname + '/../Front/dist/assets'));
app.use("/tpl", express.static(__dirname + '/../Front/dist/tpl'));

//log4js
app.use(log4js.connectLogger(log4js.getLogger("http"), {
    level: 'auto'
}));

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({
    extended: false
}))

// parse application/json
app.use(bodyParser.json())

app.get('/', function(req, res) {
    res.sendFile('index.html', {
        root: __dirname + '/../Front/dist'
    });
});

app.all('/api/*', util.checkToken(), user, network, offer, flow, report,
    campaign,lander,traffic,user_setting);

app.use('/', routes, networktpl);


/// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

/// error handlers
app.use(function(err, req, res, next) {
    logger.error("Something went wrong:", err);
    res.status(err.status || 500);

    //TODO
    if (err.status == 303) { //mysql 出错

    }
    res.json({
        status: 0,
        message: err.message,
        data: {}
    });
});


module.exports = app;
