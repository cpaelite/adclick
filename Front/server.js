var express = require('express');
var bodyParser = require('body-parser');

var app = express();
app.use(bodyParser.json());

app.use(function (req, res, next) {
    console.log('*** Request Method : ' + req.method + ', Request Url : ' + req.originalUrl);
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
            {id: 1, name: 'traffic1', token: '1', status: 1, budget: 0.5},
            {id: 2, name: 'traffic2', token: '1', status: 1, budget: 0.5},
            {id: 3, name: 'traffic3', token: '1', status: 1, budget: 0.5},
            {id: 4, name: 'traffic4', token: '1', status: 1, budget: 0.5},
            {id: 5, name: 'traffic5', token: '1', status: 1, budget: 0.5}
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

app.post('/traffic/source/status', function (req, res) {
    var item = req.body;
    res.send({item: item});
});

app.get('/traffic/source/campaign', function (req, res) {
    var result = {
        rows: [
            {id: 1, name: 'campaign1', group_name: '1', tsId: 1, default_cpc: 0.5, type: 'Direct Link', active: 1},
            {id: 2, name: 'campaign2', group_name: '1', tsId: 1, default_cpc: 0.5, type: 'Direct Link', active: 1},
            {id: 3, name: 'campaign3', group_name: '1', tsId: 1, default_cpc: 0.5, type: 'Direct Link', active: 1},
            {id: 4, name: 'campaign4', group_name: '1', tsId: 1, default_cpc: 0.5, type: 'Direct Link', active: 1},
            {id: 5, name: 'campaign5', group_name: '1', tsId: 1, default_cpc: 0.5, type: 'Direct Link', active: 1}
        ],
        count: 10
    };
    res.send(result);
});

app.post('/traffic/source/campaign', function (req, res) {
    var item = req.body;
    item.id = 123;
    res.send({item: item});
});

app.post('/traffic/source/campaign/:campaignId', function(req, res) {
    res.send({item: req.body});
});

app.delete('/traffic/source/campaign/:campaignId', function(req, res) {
    res.send({item: {id: req.params.campaignId}});
});

app.get('/track/campaign', function (req, res) {
    var result = {
        rows: [
            {id: 1, name: 'campaign1', ts_campaign_id: 1, active: 1},
            {id: 2, name: 'campaign2', ts_campaign_id: 1, active: 1},
            {id: 3, name: 'campaign3', ts_campaign_id: 1, active: 1},
            {id: 4, name: 'campaign4', ts_campaign_id: 1, active: 1},
            {id: 5, name: 'campaign5', ts_campaign_id: 1, active: 1}
        ],
        count: 10
    };
    res.send(result);
});

app.post('/track/campaign', function (req, res) {
    var item = req.body;
    item.id = 123;
    res.send({item: item});
});

app.post('/track/campaign/:campaignId', function(req, res) {
    res.send({item: req.body});
});

app.delete('/track/campaign/:campaignId', function(req, res) {
    res.send({item: {id: req.params.campaignId}});
});

app.get('/flow', function (req, res) {
    var result = {
        rows: [
            {id: 1, name: 'flow1'},
            {id: 2, name: 'flow2'},
            {id: 3, name: 'flow3'},
            {id: 4, name: 'flow4'},
            {id: 5, name: 'flow5'}
        ],
        count: 10
    };
    res.send(result);
});

app.post('/flow', function (req, res) {
    var item = req.body;
    item.id = 123;
    res.send({item: item});
});

app.post('/flow/:flowId', function(req, res) {
    res.send({item: req.body});
});

app.delete('/flow/:flowId', function(req, res) {
    res.send({item: {id: req.params.flowId}});
});

app.get('/landing/page', function (req, res) {
    var result = {
        rows: [
            {id: 1, name: 'page1', url: 'http://landing/page'},
            {id: 2, name: 'page2', url: 'http://landing/page'},
            {id: 3, name: 'page3', url: 'http://landing/page'},
            {id: 4, name: 'page4', url: 'http://landing/page'},
            {id: 5, name: 'page5', url: 'http://landing/page'}
        ],
        count: 10
    };
    res.send(result);
});

app.post('/landing/page', function (req, res) {
    var item = req.body;
    item.id = 123;
    res.send({item: item});
});

app.post('/landing/page/:landId', function(req, res) {
    res.send({item: req.body});
});

app.delete('/landing/page/:landId', function(req, res) {
    res.send({item: {id: req.params.landId}});
});

app.get('/rule', function (req, res) {
    var result = {
        rows: [
            {id: 1, name: 'rule1', url: 'http://rule'},
            {id: 2, name: 'rule2', url: 'http://rule'},
            {id: 3, name: 'rule3', url: 'http://rule'},
            {id: 4, name: 'rule4', url: 'http://rule'},
            {id: 5, name: 'rule5', url: 'http://rule'}
        ],
        count: 10
    };
    res.send(result);
});

app.post('/rule', function (req, res) {
    var item = req.body;
    item.id = 123;
    res.send({item: item});
});

app.post('/rule/:ruleId', function(req, res) {
    res.send({item: req.body});
});

app.delete('/rule/:ruleId', function(req, res) {
    res.send({item: {id: req.params.ruleId}});
});

app.listen(3000, function () {
    console.log('server started success port : 3000');
});