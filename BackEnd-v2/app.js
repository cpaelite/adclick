global.setting = require('./config/setting');
import mysql from 'mysql';
const env = process.env.NODE_ENV || 'staging'
const mysqlSetting = setting.mysql[env]

global.pool = mysql.createPool({
    host: mysqlSetting.host,
    user: mysqlSetting.user,
    password: mysqlSetting.password,
    database: mysqlSetting.database,
    connectionLimit: mysqlSetting.connectionLimit,
    debug: process.env.DEBUG === 'true',
    waitForConnections: false
});

var express = require('express');
var favicon = require('serve-favicon');
var log4js = require('log4js');
var logger = log4js.getLogger("app");
var bodyParser = require('body-parser');

var app = express();
var util = require('./util/index');

//router
var auth = require('./routes/auth');
var networktpl = require('./routes/networktpl');
var network = require('./routes/network');
var offer = require('./routes/offer');
var flowCtrl = require('./routes/flow');
var flow=flowCtrl.router;

var report = require('./routes/report');
var user = require('./routes/user');
var campaign = require('./routes/campaign');
var lander = require('./routes/lander');
var traffic = require('./routes/traffic');
var user_setting = require('./routes/user_setting');
var event_log = require('./routes/event_log');
var traffictpl = require('./routes/traffictpl');
var conversions =require('./routes/conversions');

import billing from './routes/billing';
import plan from './routes/plan';
import paypal from './routes/paypal';

import gatekeeper from './routes/gatekeeper'

var express = require('express');
var favicon = require('serve-favicon');
var log4js = require('log4js');
var logger = log4js.getLogger("app");
var bodyParser = require('body-parser');
var compression=require('compression');
var cookiePareser = require('cookie-parser');

var app = express();
var util = require('./util/index');

app.disable('x-powered-by');



//favicon
app.use(favicon(__dirname + '/public/favicon.ico'));

// page
if (process.env.NODE_ENV === "development") {
  app.use("/js", express.static(__dirname + '/../Front/src/js'));
  app.use("/assets", express.static(__dirname + '/../Front/src/assets'));
  app.use("/tpl", express.static(__dirname + '/../Front/src/tpl'));
  app.use("/bower_components", express.static(__dirname + '/../Front/bower_components'));

  app.get('/', function (req, res) {
    res.sendFile('index.html', {root: __dirname + '/../Front/src'});
  });
} else {
  app.use("/assets", compression(), express.static(__dirname + '/../Front/dist/assets'));
  app.use("/tpl", compression(), express.static(__dirname + '/../Front/dist/tpl'));

}

//log4js
app.use(log4js.connectLogger(log4js.getLogger("http"), {level: 'auto'}));

app.use(cookiePareser());
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({extended: false}))
// parse application/json
app.use(bodyParser.json())


app.get('/', function(req, res) {
    res.sendFile('index.html', {
        root: __dirname + '/../Front/dist'
    });
});


app.use(paypal);
app.all('/api/*', util.checkToken(), util.resetUserByClientId(), billing, plan, gatekeeper, user, network, offer, flow, report, campaign, lander, traffic, user_setting, event_log, traffictpl, networktpl, conversions);
app.use('/', auth);

/// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

/// error handlers
app.use(function(err, req, res, next) {
    logger.error("Something went wrong:", err);
    console.error(err, err.stack);
    res.status(err.status || 500);

    //TODO
    if (err.status == 303) { //mysql 出错

    }
    res.json({
        status: err.code? err.code: 0,
        message: err.message,
        data:{}
    });
});
module.exports = app;
