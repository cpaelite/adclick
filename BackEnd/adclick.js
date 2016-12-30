var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var log = require('./model/log').logger('app');

var app = express();
global.jwtTokenSecret = 'adbund_adclick_123';

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());

app.use("/assets", express.static(__dirname + '/../Front/dist/assets'));
app.use("/tpl", express.static(__dirname + '/../Front/dist/tpl'));

require('./routes')(app);

process.on('uncaughtException', function (err) {
    log.error('uncaughtException : ');
    log.error('Error Code : ' + err.code + ', ' + err);
});

app.use(function (req, res) {
    log.error('Not Found');
    res.status(404).send({message: 'Not Found'});
    return;
});

app.use(function (err, req, res, next) {
    if (err) {
        log.error('Internal error : ' + err);
        res.status(500).send({message: 'Internal error!'});
        return;
    }
    next;
});

app.listen(3000, function () {
    log.info('server started success port : 3000');
});
