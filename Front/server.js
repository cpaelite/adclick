var express = require('express');
var bodyParser = require('body-parser');

var app = express();
app.use(bodyParser.json());

app.use(function (req, res, next) {
    console.log('*** req url ' + req.originalUrl);
    return next();
});

app.get('/', function (req, res) {
    res.send('Hello');
});

app.post('/auth/login', function(req, res) {
    var username = req.body.username;
    var password = req.body.password;
    if (username && password == '123') {
        res.send({token: 'jalfjsjflsajflasjl'});
    } else {
        res.status(401).send({ message: 'Invalid email and/or password!' });
    }
});


app.get('/offer/netword', function (req, res) {
    var result = {
        rows: [
            {id: 1, name: 'offer1', offer_url: 'http://adclick/offer/netword'},
            {id: 2, name: 'offer2', offer_url: 'http://adclick/offer/netword'},
            {id: 3, name: 'offer3', offer_url: 'http://adclick/offer/netword'},
            {id: 4, name: 'offer4', offer_url: 'http://adclick/offer/netword'},
            {id: 5, name: 'offer5', offer_url: 'http://adclick/offer/netword'}
        ],
        count: 10
    };
    res.send(result);
});

app.post('/offer/netword', function (req, res) {
    var item = req.body;
    item.id = 123;
    res.send({item: item});
});

app.post('/offer/netword/:networdId', function(req, res) {
    res.send({item: req.body});
});

app.delete('/offer/netword/:networdId', function(req, res) {
    res.send({item: {id: req.params.networdIds}});
});

app.get('/offer/list', function (req, res) {
    var result = {
        rows: [
            {id: 1, name: 'offer1', user_id: '1', netword_id: '1,2,3,4'},
            {id: 2, name: 'offer2', user_id: '1', netword_id: '1,3,4'},
            {id: 3, name: 'offer3', user_id: '1', netword_id: '1,2,3'},
            {id: 4, name: 'offer4', user_id: '1', netword_id: '1,4,5'},
            {id: 5, name: 'offer5', user_id: '1', netword_id: '1,2,3,4'}
        ],
        count: 10
    };
    res.send(result);
});

app.get('/offer', function (req, res) {
    var result = {
        rows: [
            {id: 1, name: 'offer1', url: 'http://adclick/offer'},
            {id: 2, name: 'offer2', url: 'http://adclick/offer'},
            {id: 3, name: 'offer3', url: 'http://adclick/offer'},
            {id: 4, name: 'offer4', url: 'http://adclick/offer'},
            {id: 5, name: 'offer5', url: 'http://adclick/offer'}
        ],
        count: 10
    };
    res.send(result);
});

app.post('/offer', function (req, res) {
    var item = req.body;
    item.id = 123;
    res.send({item: item});
});

app.post('/offer/:offerId', function(req, res) {
    res.send({item: req.body});
});

app.delete('/offer/:offerId', function(req, res) {
    res.send({item: {id: req.params.offerId}});
});

app.get('/traffic/source', function (req, res) {
    var result = {
        rows: [
            {id: 1, name: 'traffic1', token: '1'},
            {id: 2, name: 'traffic2', token: '1'},
            {id: 3, name: 'traffic3', token: '1'},
            {id: 4, name: 'traffic4', token: '1'},
            {id: 5, name: 'traffic5', token: '1'}
        ],
        count: 10
    };
    res.send(result);
});

app.post('/traffic/source', function (req, res) {
    var item = req.body;
    item.id = 123;
    res.send({item: item});
});

app.post('/traffic/source/:tsId', function(req, res) {
    res.send({item: req.body});
});

app.delete('/traffic/source/:tsId', function(req, res) {
    res.send({item: {id: req.params.tsId}});
});

app.listen(3000, function () {
    console.log('server started success port : 3000');
});