global.setting = require('./config/setting');
import mysql from 'mysql';
const env = process.env.NODE_ENV || 'staging'
const mysqlSetting = setting.mysql[env]
var express = require('express');
var favicon = require('serve-favicon');
var log4js = require('log4js');
var logger = log4js.getLogger("app");
var bodyParser = require('body-parser');
var compression = require('compression');
var cookiePareser = require('cookie-parser');
var util = require('./util/index');
var requestIp = require('request-ip');

//router
var auth = require('./routes/auth');
var networktpl = require('./routes/networktpl');
var network = require('./routes/network');
var offer = require('./routes/offer');
var flowCtrl = require('./routes/flow');
var flow = flowCtrl.router;

var report = require('./routes/report');
var user = require('./routes/user');
var campaign = require('./routes/campaign');
var lander = require('./routes/lander');
var traffic = require('./routes/traffic');
var user_setting = require('./routes/user_setting');
var event_log = require('./routes/event_log');
var traffictpl = require('./routes/traffictpl');
var conversions = require('./routes/conversions');
var coupon = require('./routes/coupon');
var route_noplan = require('./routes/router_noplan');
var thirdParty = require('./routes/thirdparty');
import ts_report from './routes/ts_report';
var sudden_change = require('./routes/sudden_change');
var fraud_filter = require('./routes/fraud_filter');
import billing from './routes/billing';
import plan from './routes/plan';
import paypal from './routes/paypal';
import {supplementRouter} from './routes/supplement';
import {
  qrpayRouter,
  qrpayCallbackRouter
}
  from './routes/qrpay';

global.pool = {
  m1: mysql.createPool({
    host: mysqlSetting.host,
    user: mysqlSetting.user,
    password: mysqlSetting.password,
    database: mysqlSetting.database,
    connectionLimit: mysqlSetting.connectionLimit,
    debug: false,
    waitForConnections: false
  }),
  m2: mysql.createPool({
    host: setting.reportSQL.host,
    user: setting.reportSQL.user,
    password: setting.reportSQL.password,
    database: setting.reportSQL.database,
    connectionLimit: setting.reportSQL.connectionLimit,
    debug: false,
    waitForConnections: false
  })
}
let redisOptions = {
  host: setting.redis.host,
  port: setting.redis.port
};
if (setting.redis.password) {
  redisOptions.password = setting.redis.password;
}
global.redisPool = require('./util/redis_pool')(redisOptions,{max:200});

redisPool.pool.on('error',function(err){
    logger.error(err.message);
});

var app = express();


app.disable('x-powered-by');
app.use(function(req, res, next) {
  if(req.get('X-Forwarded-Proto') && req.get('X-Forwarded-Proto') !== 'https') {
    res.redirect('https://' + req.get('Host') + req.url);
  } else {
    next();
  }
});
app.use(requestIp.mw())
// app.use(function(req, res, next) {
//   var schema = req.headers["x-forwarded-proto"];
//   if (schema === "https") {
//     req.connection.encrypted = true;
//   }
//   next();
// });



//favicon
app.use(favicon(__dirname + '/public/favicon.ico'));

// page
if (process.env.NODE_ENV === "development") {
  app.use("/js", express.static(__dirname + '/../Front/src/js'));
  app.use("/assets", express.static(__dirname + '/../Front/src/assets'));
  app.use("/tpl", express.static(__dirname + '/../Front/src/tpl'));
  app.use("/bower_components", express.static(__dirname +
    '/../Front/bower_components'));
  app.get('/', function (req, res) {
    res.sendFile('index.html', {
      root: __dirname + '/../Front/src'
    });
  });
} else {
  app.use("/assets", compression(), express.static(__dirname +
    '/../Front/dist/assets', {
      maxAge: 60 * 1000 * 60 * 24 * 365
    }));
  app.use("/tpl", compression(), express.static(__dirname +
    '/../Front/dist/tpl'));
}

//log4js
app.use(log4js.connectLogger(log4js.getLogger("http"), {
  level: 'auto'
}));

app.use(cookiePareser());
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({
  extended: false
}))
// parse application/json
app.use(bodyParser.json())


app.get('/', function (req, res) {
  res.sendFile('index.html', {
    root: __dirname + '/../Front/dist'
  });
});


app.use(paypal, qrpayCallbackRouter);
app.use(compression());
app.all('/api/*', util.checkToken(), util.resetUserByClientId(), route_noplan,
  billing, plan, qrpayRouter, util.checkPlan(), user, network, offer, flow,
  report, campaign, lander, traffic, user_setting, event_log, traffictpl,
  networktpl, conversions, coupon, thirdParty, sudden_change, fraud_filter,
  ts_report);
app.use('/', auth, supplementRouter);

/// catch 404 and forward to error handler
app.use(function (req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

/// error handlers
app.use(function (err, req, res, next) {
  logger.error("Something went wrong:", err);
  res.status(err.status || 500);
  res.json({
    status: err.code ? err.code : 0,
    message: err.message,
    data: {}
  });
});
module.exports = app;
