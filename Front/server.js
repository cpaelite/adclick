var express = require('express');
var bodyParser = require('body-parser');

var app = express();
app.use(bodyParser.json());

app.use("/js", express.static(__dirname + '/src/js'));
app.use("/assets", express.static(__dirname + '/src/assets'));
app.use("/tpl", express.static(__dirname + '/src/tpl'));
app.use("/bower_components", express.static(__dirname + '/bower_components'));

app.get('/', function (req, res) {
    res.sendFile('index.html', { root: __dirname + '/src' });
});

function createJWT(username) {
    var payload = 'eyJ1aWQiOiIxMjM0NTY3ODkwIiwibmlja25hbWUiOiJKb2huIFB1YiIsInJvbGUiOiJwdWJsaXNoZXIifQ';
    return 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.' + payload + '.TJVA95OrM7E2cBab30RMHrHDcEfxjoYZgeFONFh7HgQ';
}

app.use(function (req, res, next) {
    console.log('*** Request Method : ' + req.method + ', Request Url : ' + req.originalUrl);
    return next();
});

app.post('/auth/login', function(req, res) {
    var username = req.body.email;
    var password = req.body.password;
    if (username && password == '123') {
        res.send({token: createJWT(username)});
    } else {
        res.status(401).send({ message: 'Invalid email and/or password!' });
    }
});

app.get('/affiliate/network', function (req, res) {
    var result = {
        rows: [
            {id: 1, name: 'affiliate1', url: 'http://adclick/affiliate/network'},
            {id: 2, name: 'affiliate2', url: 'http://adclick/affiliate/network'},
            {id: 3, name: 'affiliate3', url: 'http://adclick/affiliate/network'},
            {id: 4, name: 'affiliate4', url: 'http://adclick/affiliate/network'},
            {id: 5, name: 'affiliate5', url: 'http://adclick/affiliate/network'}
        ],
        count: 10
    };
    res.send(result);
});

app.post('/affiliate/network', function (req, res) {
    var item = req.body;
    item.id = 123;
    res.send({item: item});
});

app.post('/affiliate/network/:networkId', function(req, res) {
    res.send({item: req.body});
});

app.delete('/affiliate/network/:networkId', function(req, res) {
    res.send({item: {id: req.params.networkIds}});
});

app.get('/offer/list', function (req, res) {
    var result = {
        rows: [
            {id: 1, name: 'offer1', user_id: '1', network_id: '1,2,3,4'},
            {id: 2, name: 'offer2', user_id: '1', network_id: '1,3,4'},
            {id: 3, name: 'offer3', user_id: '1', network_id: '1,2,3'},
            {id: 4, name: 'offer4', user_id: '1', network_id: '1,4,5'},
            {id: 5, name: 'offer5', user_id: '1', network_id: '1,2,3,4'}
        ],
        count: 10
    };
    res.send(result);
});

app.get('/offer', function (req, res) {
    var result = {
        rows: [
            {id: 1, name: 'offer1', url: 'http://adclick/offer', country: 'American', affiliateNetwork: 'EffectMobi', postbaclUrl: 'http://adclick/offer', payout: 0},
            {id: 2, name: 'offer2', url: 'http://adclick/offer', country: 'American', affiliateNetwork: 'EffectMobi', postbaclUrl: 'http://adclick/offer', payout: 0},
            {id: 3, name: 'offer3', url: 'http://adclick/offer', country: 'American', affiliateNetwork: 'EffectMobi', postbaclUrl: 'http://adclick/offer', payout: 0},
            {id: 4, name: 'offer4', url: 'http://adclick/offer', country: 'American', affiliateNetwork: 'EffectMobi', postbaclUrl: 'http://adclick/offer', payout: 0},
            {id: 5, name: 'offer5', url: 'http://adclick/offer', country: 'American', affiliateNetwork: 'EffectMobi', postbaclUrl: 'http://adclick/offer', payout: 0}
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
            {id: 1, name: 'campaign1', trafficSource: 'Adwords', country: 'American', status: 0},
            {id: 2, name: 'campaign2', trafficSource: 'Adwords', country: 'American', status: 0},
            {id: 3, name: 'campaign3', trafficSource: 'Adwords', country: 'American', status: 0},
            {id: 4, name: 'campaign4', trafficSource: 'Adwords', country: 'American', status: 0},
            {id: 5, name: 'campaign5', trafficSource: 'Adwords', country: 'American', status: 0}
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

app.get('/lander', function (req, res) {
    var result = {
        rows: [
            {id: 1, name: 'lander1', url: 'http://landing/page'},
            {id: 2, name: 'lander2', url: 'http://landing/page'},
            {id: 3, name: 'lander3', url: 'http://landing/page'},
            {id: 4, name: 'lander4', url: 'http://landing/page'},
            {id: 5, name: 'lander5', url: 'http://landing/page'}
        ],
        count: 10
    };
    res.send(result);
});

app.post('/lander', function (req, res) {
    var item = req.body;
    item.id = 123;
    res.send({item: item});
});

app.post('/lander/:landId', function(req, res) {
    res.send({item: req.body});
});

app.delete('/lander/:landId', function(req, res) {
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

app.listen(5000, function () {
    console.log('server started success port : 5000');
});