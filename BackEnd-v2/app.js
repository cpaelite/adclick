global.setting = require('./config/setting');
var mysql = require('mysql');
global.pool = mysql.createPool({
  host: setting.mysql.host,
  user: setting.mysql.user,
  password: setting.mysql.password,
  database: setting.mysql.database
});
var express = require('express');
var favicon = require('serve-favicon');
var log4js = require('log4js');
var logger = log4js.getLogger("app");
var bodyParser = require('body-parser');

var app = express();
var util = require('./util/index');

//router
var routes = require('./routes/user');
var networktpl = require('./routes/networktpl');
var network = require('./routes/network');
var offer = require('./routes/offer');

//favicon
app.use(favicon(__dirname + '/public/favicon.ico'));

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

app.all('/api/*', util.checkToken(), network, offer);

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
    message: err.message
  });
});


module.exports = app;
