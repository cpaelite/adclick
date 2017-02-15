var express = require('express');
var bodyParser = require('body-parser');

var app = express();
app.use(bodyParser.json());

app.use("/js", express.static(__dirname + '/src/js'));
app.use("/assets", express.static(__dirname + '/src/assets'));
app.use("/tpl", express.static(__dirname + '/src/tpl'));
app.use("/bower_components", express.static(__dirname + '/bower_components'));

app.get('/', function (req, res) {
    res.sendFile('index.html', {root: __dirname + '/src'});
});

function createJWT() {
    var payload = 'eyJ1aWQiOiIxMjM0NTY3ODkwIiwibmlja25hbWUiOiJKb2huIFB1YiIsInJvbGUiOiJwdWJsaXNoZXIifQ';
    //return 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.' + payload + '.TJVA95OrM7E2cBab30RMHrHDcEfxjoYZgeFONFh7HgQ';
    return 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOjksImV4cCI6MTQ4NzIxMTI4MTkzMiwiZmlyc3RuYW1lIjoiQmluIiwiaWRUZXh0IjoiNnBnOHFjIn0.V8yR-8ytOm0Dqm900QBiaYImZ8MbgD7JlL-EoC7ubIs';
}

function delayResponse(res, data) {
    //console.log(data);
    setTimeout(function () {
        res.send(data);
    }, 1000);
}

app.use(function (req, res, next) {
    console.log('*** Request Method : ' + req.method + ', Request Url : ' + req.originalUrl);
    return next();
});

/**
 * @apiName 登录
 *
 * shang@v2
 */
app.post('/auth/login', function (req, res) {
    /**
     * post data: { email: string, password: string }
     * result:
     *   { token: 'the JWT token' } on success
     *   401 error code on failure
     */
    var email = req.body.email;
    var password = req.body.password;
    if (email && password == 'abc') {
        delayResponse(res, {token: createJWT()});
    } else {
        res.status(401).send({message: 'Invalid email and/or password!'});
    }
});

// /**
//  * @apiName 修改密码
//  *
//  *  ask wilson, 小于
//  */
// app.post('/auth/changepwd', function (req, res) {
//     req.body = {
//         oldPassword: "",
//         newPassword: ""
//     }
//     let success = true;
//     if (success) {
//         res.status(200)
//     } else {
//         res.status(401).json({message: "password error"})
//     }
// });

// /**
//  * @apiName 修改邮箱
//  *
//  * ask wilson, xiaoyu
//  */
// app.post('/auth/login', function (req, res) {
//     req.body = {
//         oldPassword: "",
//         newPassword: ""
//     }
//     let success = true;
//     if (success) {
//         res.status(200)
//     } else {
//         res.status(401).json({message: "password error"})
//     }
//     var email = req.body.email;
//     var password = req.body.password;
//     if (email && password == 'abc') {
//         delayResponse(res, {token: createJWT()});
//     } else {
//         res.status(401).send({message: 'Invalid email and/or password!'});
//     }
// });


/**
 * @apiName referral report
 *
 */
app.get('/api/referral', function (req, res) {
    req.query = {
        page: 0,
        sort: "created",
        dir: "desc"
    }
    let r = {
        "referrals": [{
            "id": "2a7670c7",
            "created": "2017-01-06T09:58:51",
            "state": "NEW",
            "lastMonthCommissions": 0,
            "lifeTimeCommissions": 0,
            "plan": "No Plan"
        }, {
            "id": "85de82a2",
            "created": "2017-01-05T07:57:09",
            "state": "ACTIVATED",
            "lastLogin": "2017-01-05T07:58:52",
            "lastMonthCommissions": 0,
            "lifeTimeCommissions": 0,
            "plan": "No Plan"
        }],
        "totals": {
            "lastMonthCommissions": 0,
            "lifeTimeCommissions": 0,
            "count": 2
        }
    }
    delayResponse(res, r);
});


/**
 * @apiName 注册
 *
 * shang@v2
 */
app.post('/auth/signup', function (req, res) {
    var emailExist = Math.random() > 0.5;
    var saveError = Math.random() < 0.3;
    if (emailExist) {
        res.status(409).send({message: 'Email is already taken'});
    } else if (saveError) {
        res.status(500).send({message: 'Internal error when saving user'});
    } else {
        res.send({token: createJWT()});
    }
});

/**
 * @apiName 验证用户是否已注册
 *
 * @apiParam {String} email
 */
app.post('/account/check', function (req, res) {
    var result = {
        status: 1,
        message: "success",
        data: {
            exists: false        // true:存在；false:不存在
        }
    };
    res.send(result);
});

/**
 * @apiName 获取tags
 *
 * @apiParam {number} type 1:campaign; 2:lander; 3:offer
 *
 */
app.get('/api/tags', function (req, res) {
    var result = {
        "status": 1,
        "message": "",
        "data": {
            "tags": [
                {
                    id: 1,
                    name: "tag1"
                }
            ]
        }
    };
    res.send(result);
});


/**
 * @apiName 获取用户配置
 *
 */
app.get('/api/preferences', function (req, res) {
    var result = {
        "status": 1,
        "message": "",
        data: JSON.stringify({
            "reportViewLimit": 500,
            "entityType": 1,    //0:停止;1:运行;2全部
            "reportViewOrder": "-visits",
            "reportTimeZone": "+08:00",
            /*
             // todo: use array for visible columns
             "reportVisibleColumns": [
             "visits", "clicks", "impressions", "conversions", "revenue", "cost", "profit",
             "cpv", "ictr", "ctr", "cr", "cv", "roi", "epv", "epc", "ap"
             ],
             */
            "reportViewColumns": {
                "campaignName": {
                    "visible": true
                },
                "campaignHash": {
                    "visible": true
                },
                "campaignUrl": {
                    "visible": false
                },
                "campaignCountry": {
                    "visible": false
                },
                "flowName": {
                    "visible": true
                },
                "flowHash": {
                    "visible": true
                },
                "landerName": {
                    "visible": true
                },
                "landerHash": {
                    "visible": false
                },
                "landerUrl": {
                    "visible": false
                },
                "landerCountry": {
                    "visible": false
                },
                "numberOfOffers": {
                    "visible": false
                },
                "offerName": {
                    "visible": true
                },
                "offerHash": {
                    "visible": true
                },
                "offerUrl": {
                    "visible": false
                },
                "offerCountry": {
                    "visible": false
                },
                "payout": {
                    "visible": true
                },
                "trafficName": {
                    "visible": true
                },
                "trafficHash": {
                    "visible": true
                },
                "costArgument": {
                    "visible": false
                },
                "affiliateName": {
                    "visible": true
                },
                "affiliateHash": {
                    "visible": true
                },
                "appendClickId": {
                    "visible": false
                },
                "whitelistedIP": {
                    "visible": false
                },
                "impressions": {
                    "visible": true
                },
                "visits": {
                    "visible": true
                },
                "clicks": {
                    "visible": true
                },
                "conversions": {
                    "visible": true
                },
                "revenue": {
                    "visible": true
                },
                "cost": {
                    "visible": true
                },
                "profit": {
                    "visible": true
                },
                "cpv": {
                    "visible": true
                },
                "ictr": {
                    "visible": true
                },
                "ctr": {
                    "visible": true
                },
                "cr": {
                    "visible": true
                },
                "cv": {
                    "visible": true
                },
                "roi": {
                    "visible": true
                },
                "epv": {
                    "visible": true
                },
                "epc": {
                    "visible": true
                },
                "ap": {
                    "visible": true
                },
                "errors": {
                    "visible": true
                },
                "postbackUrl": {
                    "visible": false
                },
                "redirect": {
                    "visible": false
                },
                "costModel": {
                    "visible": false
                },
                "cpa": {
                    "visible": false
                },
                "cpc": {
                    "visible": false
                },
                "cpm": {
                    "visible": false
                },
                "clickId": {
                    "visible": false
                },
                "variable1": {
                    "visible": false
                },
                "variable2": {
                    "visible": false
                },
                "variable3": {
                    "visible": false
                },
                "variable4": {
                    "visible": false
                },
                "variable5": {
                    "visible": false
                },
                "variable6": {
                    "visible": false
                },
                "variable7": {
                    "visible": false
                },
                "variable8": {
                    "visible": false
                },
                "variable9": {
                    "visible": false
                },
                "variable10": {
                    "visible": false
                }
            }
        })
    };
    delayResponse(res, result);
});

/**
 * @apiName 保存用户配置信息
 *
 */
app.post('/api/preferences', function (req, res) {
    var result = {
        "status": 1,
        "message": "",
        data: {
            "reportViewLimit": 500,
            "entityType": 1,    //0:停止;1:运行;2全部
            "reportViewOrder": "-visit",
            "reportTimeZone": "+08:00",
            "reportViewColumns": {
                "campaignName": {
                    "visible": true
                },
                "campaignHash": {
                    "visible": true
                },
                "campaignUrl": {
                    "visible": false
                },
                "campaignCountry": {
                    "visible": false
                },
                "flowName": {
                    "visible": true
                },
                "flowHash": {
                    "visible": true
                },
                "landerName": {
                    "visible": true
                },
                "landerHash": {
                    "visible": false
                },
                "landerUrl": {
                    "visible": false
                },
                "landerCountry": {
                    "visible": false
                },
                "numberOfOffers": {
                    "visible": false
                },
                "offerName": {
                    "visible": true
                },
                "offerHash": {
                    "visible": true
                },
                "offerUrl": {
                    "visible": false
                },
                "offerCountry": {
                    "visible": false
                },
                "payout": {
                    "visible": true
                },
                "trafficName": {
                    "visible": true
                },
                "trafficHash": {
                    "visible": true
                },
                "costArgument": {
                    "visible": false
                },
                "affiliateName": {
                    "visible": true
                },
                "affiliateHash": {
                    "visible": true
                },
                "appendClickId": {
                    "visible": false
                },
                "whitelistedIP": {
                    "visible": false
                },
                "impressions": {
                    "visible": true
                },
                "visits": {
                    "visible": true
                },
                "clicks": {
                    "visible": true
                },
                "conversions": {
                    "visible": true
                },
                "revenue": {
                    "visible": true
                },
                "cost": {
                    "visible": true
                },
                "profit": {
                    "visible": true
                },
                "cpv": {
                    "visible": true
                },
                "ictr": {
                    "visible": true
                },
                "ctr": {
                    "visible": true
                },
                "cr": {
                    "visible": true
                },
                "cv": {
                    "visible": true
                },
                "roi": {
                    "visible": true
                },
                "epv": {
                    "visible": true
                },
                "epc": {
                    "visible": true
                },
                "ap": {
                    "visible": true
                },
                "errors": {
                    "visible": true
                },
                "postbackUrl": {
                    "visible": false
                },
                "redirect": {
                    "visible": false
                },
                "costModel": {
                    "visible": false
                },
                "cpa": {
                    "visible": false
                },
                "cpc": {
                    "visible": false
                },
                "cpm": {
                    "visible": false
                },
                "clickId": {
                    "visible": false
                },
                "variable1": {
                    "visible": false
                },
                "variable2": {
                    "visible": false
                },
                "variable3": {
                    "visible": false
                },
                "variable4": {
                    "visible": false
                },
                "variable5": {
                    "visible": false
                },
                "variable6": {
                    "visible": false
                },
                "variable7": {
                    "visible": false
                },
                "variable8": {
                    "visible": false
                },
                "variable9": {
                    "visible": false
                },
                "variable10": {
                    "visible": false
                }
            }
        }
    };
    res.send(result);
});

/**
 * @apiName 获取Report
 *
 * @apiParam {String} from:2017-01-11T00:00:00Z
 * @apiParam {String} to:2017-01-12T00:00:00Z
 * @apiParam {String} tz:America/New_York
 * @apiParam {String} tags: 123 or filter: 123
 * @apiParam {String} sort:visits
 * @apiParam {String} direction:desc
 * @apiParam {String} groupBy:campaign
 * @apiParam {Number} page:1
 * @apiParam {Number} limit:500
 * @apiParam {Number} status:1      //0:停止；1:运行; 2:All
 *
 */
app.get('/api/report', function (req, res) {
    var groupBy = req.query.groupBy;
    var result = {
        "status": 1,
        "messages": "",
        data: {
            "totalRows": 37,
            "totals": {
                "ap": 0.0,
                "bids": 0,
                "clicks": 4368,
                "conversions": 1,
                "cost": 0.0,
                "cpv": 0.0,
                "cr": 0.022894,
                "ctr": 122.28,
                "cv": 0.027996,
                "epc": 0.0,
                "epv": 0.0,
                "errors": 0,
                "ictr": 0.0,
                "impressions": 0,
                "profit": 0.0,
                "revenue": 0.0,
                "roi": 0.0,
                "visits": 3572
            },
            rows: [
                {
                    [groupBy + "Name"]: groupBy + " 1",
                    [groupBy + "Id"]: "1",
                    [groupBy + "Hash"]: "78991c6c-52ec-4cc8-a1c6-d968ef64a741",
                    "ap": 0.0,
                    "bids": 0,
                    "clicks": 4368,
                    "conversions": 1,
                    "cost": 0.0,
                    "cpv": 0.0,
                    "cr": 0.022894,
                    "ctr": 122.28,
                    "cv": 0.027996,
                    "epc": 0.0,
                    "epv": 0.0,
                    "errors": 0,
                    "ictr": 0.0,
                    "impressions": 13430,
                    "profit": 0.0,
                    "revenue": 0.0,
                    "roi": 0.0,
                    "visits": 3572
                }, {
                    [groupBy + "Name"]: groupBy + " 2",
                    [groupBy + "Id"]: "2",
                    [groupBy + "Hash"]: "78991c6c-52ec-4cc8-a1c6-d968ef64a741",
                    "ap": 0.0,
                    "bids": 0,
                    "clicks": 4368,
                    "conversions": 1,
                    "cost": 0.0,
                    "cpv": 0.0,
                    "cr": 0.022894,
                    "ctr": 122.28,
                    "cv": 0.027996,
                    "epc": 0.0,
                    "epv": 0.0,
                    "errors": 0,
                    "ictr": 0.0,
                    "impressions": 0,
                    "profit": 0.0,
                    "revenue": 0.0,
                    "roi": 0.0,
                    "visits": 3572
                }, {
                    [groupBy + "Name"]: groupBy + " 3",
                    [groupBy + "Id"]: "3",
                    [groupBy + "Hash"]: "78991c6c-52ec-4cc8-a1c6-d968ef64a741",
                    "ap": 0.0,
                    "bids": 0,
                    "clicks": 4368,
                    "conversions": 1,
                    "cost": 0.0,
                    "cpv": 0.0,
                    "cr": 0.022894,
                    "ctr": 122.28,
                    "cv": 0.027996,
                    "epc": 0.0,
                    "epv": 0.0,
                    "errors": 0,
                    "ictr": 0.0,
                    "impressions": 0,
                    "profit": 0.0,
                    "revenue": 0.0,
                    "roi": 0.0,
                    "visits": 3572
                }
            ]
        }
    };
    res.send(result);
});

/**
 * @apiName 根据ID获取Campaign信息
 *
 */
app.get('/api/campaigns/:campaignId', function (req, res) {
    var result = {
        "status": 1,
        "message": "success",
        "data": {
            "id": 18,
            "name": "campaign.1",
            "hash": "campaign.1.hash",
            "url": "http://zhanchenxing.newbidder.com/campaign.1/",
            "impPixelUrl": "http://zhanchenxing.newbidder.com/impression/campaign.1/",
            "trafficSourceId": 10,
            "trafficSourceName": "TrafficSource.1",
            "country": "CHN",
            "costModel": 1,
            "cpcValue": 1.1,
            "cpaValue": 1.2,
            "cpmValue": 1.3,
            "redirectMode": 0,
            "targetType": 1,
            "targetFlowId": 1,
            "targetUrl": "",
            "status": 1,
            "tags": ['123', '234']
        }
    };
    res.send(result);
});

/**
 * @apiName 新增Campaign
 *
 */
app.post('/api/campaigns', function (req, res) {
    var result = {
        status: 1,
        message: "",
        data: {
            "id": 1,
            "name": "PropellerAds - Canada - yoshop-benson-Android-0104",   //TODO Traffic source + country + name
            "url": "http://zx1jg.voluumtrk.com/fcb78739-e306-466a-86a5-792481e1cf48?bannerid={bannerid}&campaignid={campaignid}&zoneid={zoneid}",
            "impPixelUrl": "http://zx1jg.voluumtrk.com/impression/fcb78739-e306-466a-86a5-792481e1cf48",
            "trafficSource": {
                "id": 1,
                "name": "PropellerAds",
                "cost": 0.1,
                "impTracking": "",
                "params": ""
            },
            "country": "CHN",
            "status": 1,
            "costModel": 1,     //0:Do not;1:cpc; 2:cpa; 3:cpm; 4:Auto
            "cpc": 0.6,
            "flow": {
                "id": 1,
                "name": "Global - yoshop-Android-benson",
                "hash": "1e5ac21f-50a5-412a-8bc1-2569b76f78b4",
                "type": 0, //0: 匿名，1：普通
                "country": "",
                "redirectMode": 0, //0:302, 1:Mate, 2:Double meta
                "rules": [
                    {
                        id: 1,
                        name: "123",
                        hash: "1e5ac21f-50a5-412a-8bc1-2569b76f78b4",
                        type: 0,    //0: 匿名，1：普通
                        json: {},   // 规则
                        status: 0,  //0: 停止， 1：运行
                        paths: [
                            {
                                "id": 1,
                                "name": "Path 1",
                                "hash": "047bb73f-6787-4227-b51c-247f6db63a2a",
                                redirecMode: 0,
                                directLink: 0,  //0:No, 1:Yes
                                status: 0,
                                weight: 100,
                                landers: [
                                    {
                                        "id": 1,
                                        "name": "Path 1",
                                        "hash": "047bb73f-6787-4227-b51c-247f6db63a2a",
                                        url: "",
                                        country: "",
                                        numberOfOffers: 2,
                                        weight: 100,
                                        tags: []
                                    }
                                ],
                                offers: [
                                    {
                                        "id": 1,
                                        "name": "Path 1",
                                        "hash": "047bb73f-6787-4227-b51c-247f6db63a2a",
                                        url: "",
                                        country: "",
                                        AffiliateNetwork: {
                                            id: 1,
                                            name: ""
                                        },
                                        postbackUrl: "",
                                        payoutMode: 0,  //0:Auto; 1:Manual
                                        payoutValue: 0.8,
                                        tags: []
                                    }
                                ]
                            }
                        ]
                    }
                ]
            },
            "tags": []
        }
    };
    res.send(result);
});

/**
 * @apiName 修改Campaign
 *
 */
app.post('/api/campaigns/:campaignId', function (req, res) {
    var result = {
        status: 1,
        message: "",
        data: {
            "id": 1,
            "name": "PropellerAds - Canada - yoshop-benson-Android-0104",   //TODO Traffic source + country + name
            "url": "http://zx1jg.voluumtrk.com/fcb78739-e306-466a-86a5-792481e1cf48?bannerid={bannerid}&campaignid={campaignid}&zoneid={zoneid}",
            "impPixelUrl": "http://zx1jg.voluumtrk.com/impression/fcb78739-e306-466a-86a5-792481e1cf48",
            "trafficSource": {
                "id": 1,
                "name": "PropellerAds",
                "cost": 0.1,
                "impTracking": "",
                "params": ""
            },
            "country": "CHN",
            "status": 1,
            "costModel": 1,     //0:Do not;1:cpc; 2:cpa; 3:cpm; 4:Auto
            "cpc": 0.6,
            "flow": {
                "id": 1,
                "name": "Global - yoshop-Android-benson",
                "hash": "1e5ac21f-50a5-412a-8bc1-2569b76f78b4",
                "type": 0, //0: 匿名，1：普通
                "country": "",
                "redirectMode": 0, //0:302, 1:Mate, 2:Double meta
                "rules": [
                    {
                        id: 1,
                        name: "123",
                        hash: "1e5ac21f-50a5-412a-8bc1-2569b76f78b4",
                        type: 0,    //0: 匿名，1：普通
                        json: {},   // 规则
                        status: 0,  //0: 停止， 1：运行
                        paths: [
                            {
                                "id": 1,
                                "name": "Path 1",
                                "hash": "047bb73f-6787-4227-b51c-247f6db63a2a",
                                redirecMode: 0,
                                directLink: 0,  //0:No, 1:Yes
                                status: 0,
                                weight: 100,
                                landers: [
                                    {
                                        "id": 1,
                                        "name": "Path 1",
                                        "hash": "047bb73f-6787-4227-b51c-247f6db63a2a",
                                        url: "",
                                        country: "",
                                        numberOfOffers: 2,
                                        weight: 100,
                                        tags: []
                                    }
                                ],
                                offers: [
                                    {
                                        "id": 1,
                                        "name": "Path 1",
                                        "hash": "047bb73f-6787-4227-b51c-247f6db63a2a",
                                        url: "",
                                        country: "",
                                        AffiliateNetwork: {
                                            id: 1,
                                            name: ""
                                        },
                                        postbackUrl: "",
                                        payoutMode: 0,  //0:Auto; 1:Manual
                                        payoutValue: 0.8,
                                        tags: []
                                    }
                                ]
                            }
                        ]
                    }
                ]
            },
            "tags": []
        }
    };
    res.send(result);
});

/**
 * @apiName 删除Campaign
 *
 */
app.delete('/api/campaigns/:campaignId', function (req, res) {
    var result = {
        status: 1,
        message: 'success'
    };
    res.send(result);
});

/**
 * @apiName 根据ID获取Flow
 *
 * shang@v1
 */
app.get('/api/flows/:flowId', function (req, res) {
    var result = {
        status: 1,
        message: "",
        data: {
            "id": 1,
            "name": "Global - yoshop-Android-benson",
            "country": "us",
            "redirectMode": 0, //0:302, 1:Mate, 2:Double meta
            "rules": [{
                "id": 3,
                "name": "Default paths",
                "isDefault": true,
                "paths": [{
                    "id": 1,
                    "name": "path name 1",
                    "redirecMode": 0,
                    "directLinking": false,
                    "enabled": true,
                    "weight": 100,
                    "landers": [{
                        "id": "46",  // lander id
                        "weight": 100
                    }],
                    "offers": [{
                        "id": "22",  // offer id
                        "weight": 100
                    }]
                }]
            }, {
                "id": 4,
                "name": "the rule name",
                "isDefault": false,
                "enabled": true,   // is this rule enabled/disabled
                "conditions": [{
                    "id": "3434",    // condition id, refer to /api/conditions
                    "operand": "is", // is/isnt
                    "value": ["windows", "android4.5", "android7"]
                }, {
                    "id": "1234",
                    "operand": "isnt",
                    "tz": "+0800",
                    "weekday": ["tue", "fri"]
                }],
                "paths": [{
                    "id": 2,
                    "name": "path name 1",
                    "redirecMode": 0,
                    "directLinking": false,
                    "enabled": true,
                    "weight": 100,
                    "landers": [{
                        "id": "47",
                        "weight": 100
                    }, {
                        "id": "54",
                        "weight": 50
                    }],
                    "offers": [{
                        "id": "23",
                        "weight": 100
                    }, {
                        "id": "41",
                        "weight": 200
                    }]
                }, {
                    "id": 3,
                    "name": "path name 2",
                    "redirecMode": 0,
                    "directLinking": true,
                    "enabled": true,
                    "weight": 100,
                    "landers": [{
                        "id": "49",
                        "weight": 100
                    }, {
                        "id": "50",
                        "weight": 50
                    }]
                }]
            }]
        }
    };
    res.send(result);
});

/**
 * @apiName 获取Flow关联的Campaign
 *
 */
app.get('/api/flows/:flowId/campaigns', function (req, res) {
    var result = {
        status: 1,
        message: "",
        data: {
            campaigns: [{
                "id": "01b30fdd-18ff-4068-8868-878f08886799",
                "name": "Popads - Canada - yoshop-benson-Android-0104",
            }, {
                "id": "3026f98e-e755-4905-8011-af79f8547e72",
                "name": "Popads - Australia - yoshop-benson-Android-0104",
            }, {
                "id": "34695609-97cd-404e-a75a-c7c7d93a042d",
                "name": "Popads - United States - yoshop-benson-Android-0104",
            }, {
                "id": "6f0dbc5a-c844-4caf-b740-f773c8f11954",
                "name": "PropellerAds - United States - yoshop-benson-Android-0104",
            }, {
                "id": "e60e0072-99c1-4773-b525-1fad1ed06768",
                "name": "PropellerAds - Australia - yoshop-benson-Android-0104",
            }, {
                "id": "fcb78739-e306-466a-86a5-792481e1cf48",
                "name": "PropellerAds - Canada - yoshop-benson-Android-0104",
            }]
        }
    };
    res.send(result);
});

/**
 * @apiName 添加Flow
 *
 * the post data is the same as in `GET /api/flows/:flowId`, except that there
 * is no id for flow and rules
 *
 * shang@v1
 */
app.post('/api/flows', function (req, res) {
    console.log(JSON.stringify(req.body));
    var result = {
        status: 1,
        message: "",
        data: {
            "id": 1,
            "name": "Global - yoshop-Android-benson",
            "country": "us",
            "redirectMode": 0, //0:302, 1:Mate, 2:Double meta
            "rules": [{
                "id": 1,
                "name": "Default paths",
                "isDefault": true,
                "paths": [{
                    "id": 1,
                    "name": "path name 1",
                    "redirecMode": 0,
                    "directLinking": false,
                    "enabled": true,
                    "weight": 100,
                    "landers": [{
                        "id": "47",  // lander id
                        "weight": 100
                    }],
                    "offers": [{
                        "id": "23",  // offer id
                        "weight": 100
                    }]
                }]
            }, {
                "id": 2,
                "name": "the rule name",
                "isDefault": false,
                "enabled": true,   // is this rule enabled/disabled
                "conditions": [{
                    "id": "3434",    // condition id, refer to /api/conditions
                    "operand": "is", // is/isnt
                    "value": ["windows", "android4.5", "android7"]
                }, {
                    "id": "1234",
                    "operand": "isnt",
                    "tz": "+0800",
                    "weekday": ["tue", "fri"]
                }],
                "paths": [{
                    "id": 2,
                    "name": "path name 1",
                    "redirecMode": 0,
                    "directLinking": false,
                    "enabled": true,
                    "weight": 100,
                    "landers": [{
                        "id": "47",
                        "weight": 100
                    }, {
                        "id": "46",
                        "weight": 50
                    }],
                    "offers": [{
                        "id": "22",
                        "weight": 100
                    }, {
                        "id": "23",
                        "weight": 200
                    }]
                }, {
                    "id": 3,
                    "name": "path name 2",
                    "redirecMode": 0,
                    "directLinking": true,
                    "enabled": true,
                    "weight": 100,
                    "landers": [{
                        "id": "46",
                        "weight": 100
                    }, {
                        "id": "47",
                        "weight": 50
                    }]
                }]
            }]
        }
    };
    delayResponse(res, result);
});

/**
 * @apiName 修改Flow
 *
 * the post data is the same as in `GET /api/flows/:flowId`
 *
 * shang@v1
 */
app.post('/api/flows/:flowId', function (req, res) {
    console.log(JSON.stringify(req.body));
    var result = {
        "id": 1,
        "name": "Global - yoshop-Android-benson",
        "country": "us",
        "redirectMode": 0, //0:302, 1:Mate, 2:Double meta
        "rules": [{
            "id": 3,
            "isDefault": true,
            "paths": [{
                "id": 1,
                "name": "path name 1",
                "redirecMode": 0,
                "directLinking": false,
                "enabled": true,
                "weight": 100,
                "landers": [{
                    "id": "2343",  // lander id
                    "weight": 100
                }],
                "offers": [{
                    "id": "3432",  // offer id
                    "weight": 100
                }]
            }]
        }, {
            "id": 4,
            "name": "the rule name",
            "isDefault": false,
            "enabled": true,   // is this rule enabled/disabled
            "conditions": [{
                "id": "3434",    // condition id, refer to /api/conditions
                "operand": "is", // is/isnt
                "value": ["windows", "android4.5", "android7"]
            }, {
                "id": "1234",
                "operand": "isnt",
                "tz": "+0800",
                "weekday": ["tue", "fri"]
            }],
            "paths": [{
                "id": 1,
                "name": "path name 1",
                "redirecMode": 0,
                "directLinking": false,
                "enabled": true,
                "weight": 100,
                "landers": [{
                    "id": "2343",
                    "weight": 100
                }, {
                    "id": "3943",
                    "weight": 50
                }],
                "offers": [{
                    "id": "3432",
                    "weight": 100
                }, {
                    "id": "8923",
                    "weight": 200
                }]
            }, {
                "id": 2,
                "name": "path name 2",
                "redirecMode": 0,
                "directLinking": true,
                "enabled": true,
                "weight": 100,
                "landers": [{
                    "id": "4842",
                    "weight": 100
                }, {
                    "id": "7265",
                    "weight": 50
                }]
            }]
        }]
    };
    res.send(result);
});

/**
 * @apiName 删除Flow
 *
 */
app.delete('/api/flows/:flowId', function (req, res) {
    var result = {
        status: 1,
        message: 'success'
    };
    res.send(result);
});

/**
 * @apiName 根据ID获取Lander信息
 *
 */
app.get('/api/landers/:landerId', function (req, res) {
    var result = {
        status: 1,
        message: "",
        data: {
            "id": "44c1f491-a22b-455d-bcc9-5c1324a8885b",
            "name": "Global - SecurityAlert-en",
            "hash": "",
            "url": "http://s.ktrack.net/w/SecurityAlert.php",
            "country": "",
            "numberOfOffers": 1,
            "tags": []
        }
    };
    res.send(result);
});

/**
 * get list of landers
 * params:
 *  columns - needed columns, comma seperated, e.g. id,name
 * shang@v1
 */
app.get('/api/landers', function (req, res) {
    var result = [{"id": 46, "name": "Lander12", "country": "Canada"}, {
        "id": 47,
        "name": "Lander1",
        "country": "Canada"
    }, {"id": 49, "name": "Lander2", "country": "cn"}, {"id": 50, "name": "Lander3", "country": "us"}, {
        "id": 54,
        "name": "Lander3",
        "country": "CHN"
    }];
    delayResponse(res, result);
});

/**
 * @apiName 新增Lander信息
 *
 *
 * @apiParam namePostfix:"SecurityAlert-en"
 * @apiParam numberOfOffers:"1"
 * @apiParam tags:[]
 * @apiParam url:"http://s.ktrack.net/w/SecurityAlert.php"
 *
 */
app.post('/api/landers', function (req, res) {
    var result = {
        status: 1,
        message: "",
        data: {
            "name": "Global - SecurityAlert-en",
            "url": "http://s.ktrack.net/w/SecurityAlert.php",
            "country": "",
            "numberOfOffers": 1,
            "tags": []
        }
    };
    res.send(result);
});

/**
 * @apiName 修改Lander信息
 *
 */
app.post('/api/landers/:landerId', function (req, res) {
    var result = {
        status: 1,
        message: "",
        data: {
            "id": "44c1f491-a22b-455d-bcc9-5c1324a8885b",
            "name": "Global - SecurityAlert-en",
            "url": "http://s.ktrack.net/w/SecurityAlert.php",
            "country": "",
            "numberOfOffers": 1,
            "tags": []
        }
    };
    res.send(result);
});

/**
 * @apiName 删除Lander
 *
 */
app.delete('/api/landers/:landId', function (req, res) {
    var result = {
        status: 1,
        message: 'success'
    };
    res.send(result);
});

app.get('/api/flows', function (req, res) {
    var result = {
        status: 1,
        message: "",
        data: {
            flows: [
                {id: 1, name: 'flow1'},
                {id: 2, name: 'flow2'},
            ]
        }
    };
    res.send(result);
});

/**
 * @apiName 根据offerId获取Offer信息
 *
 */
app.get('/api/offers/:offerId', function (req, res) {
    var result = {
        "status": 1,
        "message": "success",
        "data": {
            "id": 22,
            "name": "Offer1",
            "hash": "03f1d070-9089-4502-842d-28101d83f474",
            "url": "http://adbund.com",
            "country": "CHN",
            "AffiliateNetworkId": 1,
            "AffiliateNetworkName": "AffiliateNetwork.test2",
            "postbackUrl": "http://2drvh2.newbidder.com/postBackRouter?cid=REPLACE&payout=OPTIONAL&txid=OPTIONAL",
            "payoutMode": 0,
            "payoutValue": 0,
            "tags": []
        }
    };
    res.send(result);
});

/**
 * get offers list
 * params:
 *  columns - needed columns, comma seperated, e.g. id,name
 * shang@v1
 */
app.get('/api/offers', function (req, res) {
    var result = [{"id": 22, "name": "Offer12", "country": "us"}, {
        "id": 23,
        "name": "Offer1",
        "country": "Canada"
    }, {"id": 41, "name": "Offer2", "country": "ca"}, {"id": 42, "name": "Offer3", "country": "cn"}, {
        "id": 43,
        "name": "Offer4",
        "country": "CHN"
    }];
    delayResponse(res, result);
});

/**
 * @apiName 新增Offer
 */
app.post('/api/offers', function (req, res) {
    var result = {
        status: 1,
        message: "",
        data: {
            "name": "hasoffer - Global - yoshop-Android-benson-CAUSAU",
            "url": "http://adbund.com",
            "country": "CHN",
            "payoutMode": 0,
            "payoutValue": 0.5,
            "affiliateNetwork": {
                "id": "fa4e2ce0-efc6-4523-8ad1-33a8c5739e1c",
                "name": "hasoffer"
            },
            "tags": []
        }
    };
    res.send(result);
});

/**
 * @apiName 修改Offer
 *
 */
app.post('/api/offers/:offerId', function (req, res) {
    var result = {
        status: 1,
        message: "",
        data: {
            "id": 1,
            "name": "hasoffer - Global - yoshop-Android-benson-CAUSAU",
            "url": "http://adbund.com",
            "country": "CHN",
            "payoutMode": 0,
            "payoutValue": 0.5,
            "affiliateNetwork": {
                "id": "fa4e2ce0-efc6-4523-8ad1-33a8c5739e1c",
                "name": "hasoffer"
            },
            "tags": []
        }
    };
    res.send(result);
});

/**
 * @apiName 删除Offer
 *
 */
app.delete('/api/offers/:offerId', function (req, res) {
    var result = {
        status: 1,
        message: 'success'
    };
    res.send(result);
});

/**
 * 获取用户所有TrafficSource
 *
 */
app.get('/api/traffics', function (req, res) {
    var result = {
        "status": 1,
        "message": "success",
        "data": {
            "trafficsources": [{
                "id": 10,
                "name": "TrafficSource1",
                "cost": "",
                "impTracking": 0,
                "params": "[{\"Parameter\":\"\",\"Placeholder\":\"\",\"Name\":\"\",\"Track\":\"\",\"$$hashKey\":\"object:438\"},{\"Parameter\":\"\",\"Placeholder\":\"\",\"Name\":\"\",\"Track\":\"\",\"$$hashKey\":\"object:439\"},{\"Parameter\":\"\",\"Placeholder\":\"\",\"Name\":\"\",\"Track\":\"\",\"$$hashKey\":\"object:440\"},{\"Parameter\":\"\",\"Placeholder\":\"\",\"Name\":\"\",\"Track\":\"\",\"$$hashKey\":\"object:441\"},{\"Parameter\":\"\",\"Placeholder\":\"\",\"Name\":\"\",\"Track\":\"\",\"$$hashKey\":\"object:442\"},{\"Parameter\":\"\",\"Placeholder\":\"\",\"Name\":\"\",\"Track\":\"\",\"$$hashKey\":\"object:443\"},{\"Parameter\":\"\",\"Placeholder\":\"\",\"Name\":\"\",\"Track\":\"\",\"$$hashKey\":\"object:444\"},{\"Parameter\":\"\",\"Placeholder\":\"\",\"Name\":\"\",\"Track\":\"\",\"$$hashKey\":\"object:445\"},{\"Parameter\":\"\",\"Placeholder\":\"\",\"Name\":\"\",\"Track\":\"\",\"$$hashKey\":\"object:446\"},{\"Parameter\":\"\",\"Placeholder\":\"\",\"Name\":\"\",\"Track\":\"\",\"$$hashKey\":\"object:447\"}]",
                "pixelRedirectUrl": "",
                "postbackUrl": "http://api.airpush.com/track/?guid={clickid}"
            }, {
                "id": 15,
                "name": "TrafficSource2",
                "cost": "",
                "impTracking": 1,
                "params": "[{\"Parameter\":\"WEBSITE\",\"Placeholder\":\"{WEBSITE}\",\"Name\":\"WEBSITE\",\"Track\":1,\"$$hashKey\":\"object:603\"},{\"Parameter\":\"\",\"Placeholder\":\"\",\"Name\":\"\",\"Track\":\"\",\"$$hashKey\":\"object:604\"},{\"Parameter\":\"\",\"Placeholder\":\"\",\"Name\":\"\",\"Track\":\"\",\"$$hashKey\":\"object:605\"},{\"Parameter\":\"\",\"Placeholder\":\"\",\"Name\":\"\",\"Track\":\"\",\"$$hashKey\":\"object:606\"},{\"Parameter\":\"\",\"Placeholder\":\"\",\"Name\":\"\",\"Track\":\"\",\"$$hashKey\":\"object:607\"},{\"Parameter\":\"\",\"Placeholder\":\"\",\"Name\":\"\",\"Track\":\"\",\"$$hashKey\":\"object:608\"},{\"Parameter\":\"\",\"Placeholder\":\"\",\"Name\":\"\",\"Track\":\"\",\"$$hashKey\":\"object:609\"},{\"Parameter\":\"\",\"Placeholder\":\"\",\"Name\":\"\",\"Track\":\"\",\"$$hashKey\":\"object:610\"},{\"Parameter\":\"\",\"Placeholder\":\"\",\"Name\":\"\",\"Track\":\"\",\"$$hashKey\":\"object:611\"},{\"Parameter\":\"\",\"Placeholder\":\"\",\"Name\":\"\",\"Track\":\"\",\"$$hashKey\":\"object:612\"}]",
                "pixelRedirectUrl": "",
                "postbackUrl": "http://api.airpush.com/track/?guid={clickid}"
            }, {
                "id": 17,
                "name": "TrafficSource1",
                "cost": "",
                "impTracking": 1,
                "params": "[{\"Parameter\":\"1\",\"Placeholder\":\"1\",\"Name\":\"1\",\"Track\":1,\"$$hashKey\":\"object:805\"},{\"Parameter\":\"\",\"Placeholder\":\"\",\"Name\":\"\",\"Track\":\"\",\"$$hashKey\":\"object:806\"},{\"Parameter\":\"\",\"Placeholder\":\"\",\"Name\":\"\",\"Track\":\"\",\"$$hashKey\":\"object:807\"},{\"Parameter\":\"\",\"Placeholder\":\"\",\"Name\":\"\",\"Track\":\"\",\"$$hashKey\":\"object:808\"},{\"Parameter\":\"\",\"Placeholder\":\"\",\"Name\":\"\",\"Track\":\"\",\"$$hashKey\":\"object:809\"},{\"Parameter\":\"\",\"Placeholder\":\"\",\"Name\":\"\",\"Track\":\"\",\"$$hashKey\":\"object:810\"},{\"Parameter\":\"\",\"Placeholder\":\"\",\"Name\":\"\",\"Track\":\"\",\"$$hashKey\":\"object:811\"},{\"Parameter\":\"\",\"Placeholder\":\"\",\"Name\":\"\",\"Track\":\"\",\"$$hashKey\":\"object:812\"},{\"Parameter\":\"\",\"Placeholder\":\"\",\"Name\":\"\",\"Track\":\"\",\"$$hashKey\":\"object:813\"},{\"Parameter\":\"\",\"Placeholder\":\"\",\"Name\":\"\",\"Track\":\"\",\"$$hashKey\":\"object:814\"}]",
                "pixelRedirectUrl": "",
                "postbackUrl": "http://api.airpush.com/track/?guid={clickid}"
            }, {
                "id": 18,
                "name": "123",
                "cost": "",
                "impTracking": 0,
                "params": "[{\"Parameter\":\"1\",\"Placeholder\":\"1\",\"Name\":\"1\",\"Track\":1,\"$$hashKey\":\"object:805\"},{\"Parameter\":\"\",\"Placeholder\":\"\",\"Name\":\"\",\"Track\":\"\",\"$$hashKey\":\"object:806\"},{\"Parameter\":\"\",\"Placeholder\":\"\",\"Name\":\"\",\"Track\":\"\",\"$$hashKey\":\"object:807\"},{\"Parameter\":\"\",\"Placeholder\":\"\",\"Name\":\"\",\"Track\":\"\",\"$$hashKey\":\"object:808\"},{\"Parameter\":\"\",\"Placeholder\":\"\",\"Name\":\"\",\"Track\":\"\",\"$$hashKey\":\"object:809\"},{\"Parameter\":\"\",\"Placeholder\":\"\",\"Name\":\"\",\"Track\":\"\",\"$$hashKey\":\"object:810\"},{\"Parameter\":\"\",\"Placeholder\":\"\",\"Name\":\"\",\"Track\":\"\",\"$$hashKey\":\"object:811\"},{\"Parameter\":\"\",\"Placeholder\":\"\",\"Name\":\"\",\"Track\":\"\",\"$$hashKey\":\"object:812\"},{\"Parameter\":\"\",\"Placeholder\":\"\",\"Name\":\"\",\"Track\":\"\",\"$$hashKey\":\"object:813\"},{\"Parameter\":\"\",\"Placeholder\":\"\",\"Name\":\"\",\"Track\":\"\",\"$$hashKey\":\"object:814\"}]",
                "pixelRedirectUrl": "",
                "postbackUrl": "http://api.airpush.com/track/?guid={clickid}"
            }]
        }
    };
    res.send(result);
});

/**
 * 获得Traffic Source 详细信息
 */
app.get('/api/traffics/:id', function (req, res) {
    var result = {
        "status": 1,
        "message": "success",
        "data": {
            "id": 15,
            "name": "TrafficSource2",
            "hash": "aa088269-5680-470c-a232-582e1dc68d21",
            "postbackUrl": "",
            "pixelRedirectUrl": "",
            "impTracking": 1,
            "externalId": "{\"Parameter\":\"1\",\"Placeholder\":\"1\"}",
            "cost": "",
            "params": "[{\"Parameter\":\"WEBSITE\",\"Placeholder\":\"{WEBSITE}\",\"Name\":\"WEBSITE\",\"Track\":1,\"$$hashKey\":\"object:603\"},{\"Parameter\":\"\",\"Placeholder\":\"\",\"Name\":\"\",\"Track\":\"\",\"$$hashKey\":\"object:604\"},{\"Parameter\":\"\",\"Placeholder\":\"\",\"Name\":\"\",\"Track\":\"\",\"$$hashKey\":\"object:605\"},{\"Parameter\":\"\",\"Placeholder\":\"\",\"Name\":\"\",\"Track\":\"\",\"$$hashKey\":\"object:606\"},{\"Parameter\":\"\",\"Placeholder\":\"\",\"Name\":\"\",\"Track\":\"\",\"$$hashKey\":\"object:607\"},{\"Parameter\":\"\",\"Placeholder\":\"\",\"Name\":\"\",\"Track\":\"\",\"$$hashKey\":\"object:608\"},{\"Parameter\":\"\",\"Placeholder\":\"\",\"Name\":\"\",\"Track\":\"\",\"$$hashKey\":\"object:609\"},{\"Parameter\":\"\",\"Placeholder\":\"\",\"Name\":\"\",\"Track\":\"\",\"$$hashKey\":\"object:610\"},{\"Parameter\":\"\",\"Placeholder\":\"\",\"Name\":\"\",\"Track\":\"\",\"$$hashKey\":\"object:611\"},{\"Parameter\":\"\",\"Placeholder\":\"\",\"Name\":\"\",\"Track\":\"\",\"$$hashKey\":\"object:612\"}]"
        }
    };
    res.send(result);
});

/**
 * Add new Traffic Source 详细信息 [warren] tested
 */
app.post('/api/traffics', function (req, res) {
    var result = {
        status: 1,
        message: 'success',
        data: {
            "name": "TrafficSource2",
            "postbackUrl": "",
            "pixelRedirectUrl": "",
            "impTracking": 1,
            "externalId": "",
            "cost": "",
            "params": ""
        }
    };
    res.send(result)
});

app.post('/api/traffics/:id', function (req, res) {
    var result = {
        status: 1,
        message: 'success',
        data: {
            "id": 1,
            "name": "TrafficSource2",
            "postbackUrl": "",
            "pixelRedirectUrl": "",
            "impTracking": 1,
            "externalId": "",
            "cost": "",
            "params": ""
        }
    };
    res.send(result);
});

/**
 * Delete Traffic Source [warren] tested
 */
app.delete('/api/traffics/:id', function (req, res) {
    var result = {
        status: 1,
        message: 'success'
    };
    res.send(result);
});

app.get('/api/traffic/tpl', function (req, res) {
    var result = {
        status: 1,
        message: 'success',
        data: {
            lists: [
                {
                    "id": 1,
                    "name": "TrafficSource1",
                    "postbackUrl": "",
                    "pixelRedirectUrl": "",
                    "impTracking": 1,
                    "externalId": "{\"Placeholder\":\"{1}\",\"Parameter\":\"1\"}",
                    "cost": "{\"Placeholder\":\"{2}\",\"Parameter\":\"2\"}",
                    "params": "[{\"Parameter\":\"3\",\"Placeholder\":\"{3}\",\"Name\":\"3\",\"Track\":\"\"},{\"Parameter\":\"4\",\"Placeholder\":\"{4}\",\"Name\":\"4\",\"Track\":\"\"},{\"Parameter\":\"\",\"Placeholder\":\"\",\"Name\":\"\",\"Track\":\"\"},{\"Parameter\":\"\",\"Placeholder\":\"\",\"Name\":\"\",\"Track\":\"\"},{\"Parameter\":\"\",\"Placeholder\":\"\",\"Name\":\"\",\"Track\":\"\"},{\"Parameter\":\"\",\"Placeholder\":\"\",\"Name\":\"\",\"Track\":\"\"},{\"Parameter\":\"\",\"Placeholder\":\"\",\"Name\":\"\",\"Track\":\"\"},{\"Parameter\":\"\",\"Placeholder\":\"\",\"Name\":\"\",\"Track\":\"\"},{\"Parameter\":\"\",\"Placeholder\":\"\",\"Name\":\"\",\"Track\":\"\"},{\"Parameter\":\"\",\"Placeholder\":\"\",\"Name\":\"\",\"Track\":\"\"}]"
                },
                {
                    "id": 2,
                    "name": "TrafficSource2",
                    "postbackUrl": "",
                    "pixelRedirectUrl": "",
                    "impTracking": 1,
                    "externalId": "{\"Placeholder\":\"{1}\",\"Parameter\":\"1\"}",
                    "cost": "{\"Placeholder\":\"{2}\",\"Parameter\":\"2\"}",
                    "params": "[{\"Parameter\":\"3\",\"Placeholder\":\"{3}\",\"Name\":\"3\",\"Track\":\"\"},{\"Parameter\":\"4\",\"Placeholder\":\"{4}\",\"Name\":\"4\",\"Track\":\"\"},{\"Parameter\":\"\",\"Placeholder\":\"\",\"Name\":\"\",\"Track\":\"\"},{\"Parameter\":\"\",\"Placeholder\":\"\",\"Name\":\"\",\"Track\":\"\"},{\"Parameter\":\"\",\"Placeholder\":\"\",\"Name\":\"\",\"Track\":\"\"},{\"Parameter\":\"\",\"Placeholder\":\"\",\"Name\":\"\",\"Track\":\"\"},{\"Parameter\":\"\",\"Placeholder\":\"\",\"Name\":\"\",\"Track\":\"\"},{\"Parameter\":\"\",\"Placeholder\":\"\",\"Name\":\"\",\"Track\":\"\"},{\"Parameter\":\"\",\"Placeholder\":\"\",\"Name\":\"\",\"Track\":\"\"},{\"Parameter\":\"\",\"Placeholder\":\"\",\"Name\":\"\",\"Track\":\"\"}]"
                }
            ]
        }
    };
    res.send(result);
});

/**
 * Get list of affiliates
 */
app.get('/api/affiliates', function (req, res) {
    var result = {
        status: 1,
        message: 'success',
        data: {
            affiliates: [
                {id: 1, name: "affilate1", postbackUrl: "affiliate1"},
                {id: 2, name: "affilate2", postbackUrl: "affilate2"},
                {id: 3, name: "affilate3", postbackUrl: ""}
            ]
        }
    };
    res.send(result);
});

/**
 * get affiliate network by id, [warren] checked, same format.
 */
app.get('/api/affiliates/:id', function (req, res) {
    var result = {
        status: 1,
        message: "",
        data: {
            affiliates: {
                id: 1,
                name: "affilate1",
                postbackUrl: "http://www.adbund.com",
                appendClickId: 1,
                duplicatedPostback: 1,
                ipWhiteList: '["1.1.1.1"]'
            }
        }
    };
    res.send(result);
});

/**
 * 新增Affiliate
 *
 */
app.post('/api/affiliates', function (req, res) {
    var result = {
        status: 1,
        message: "",
        data: {
            name: "affilate1",
            postbackUrl: "",
            appendClickId: 1,
            duplicatedPostback: 1,
            ipWhiteList: ""
        }
    };
    res.send(result);
});

/**
 * 编辑Affiliate
 *
 */
app.post('/api/affiliates/:id', function (req, res) {
    var result = {
        status: 1,
        message: "",
        data: {
            id: 1,
            name: "affilate1",
            postbackUrl: "",
            appendClickId: 1,
            duplicatedPostback: 1,
            ipWhiteList: ""
        }
    };
    res.send(result);
});

/**
 * 删除Affiliate
 *
 */
app.delete('/api/affiliates/:id', function (req, res) {
    var result = {
        status: 1,
        message: 'success'
    };
    res.send(result);
});

app.get('/api/affilate/tpl', function (req, res) {
    var result = {
        status: 1,
        message: 'success',
        data: {
            lists: [
                {
                    id: 1,
                    name: 'tpl1',
                    desc: '<div>tpl1</div>',
                    postbackurl: 'http://zx1jg.newbidder.com/postback?cid=%SUBID1%&p=%AMOUNT%'
                },
                {
                    id: 2,
                    name: 'tpl2',
                    desc: '<div>tpl2</div>',
                    postbackurl: 'http://zx1jg.newbidder.com/postback?cid=[dv1]&p=[conversion revenue]'
                }
            ]
        }
    };
    res.send(result);
});

/**
 * get list of conditions
 * shang@v1 [Warren] TODO
 */
app.get('/api/conditions', function (req, res) {
    var result = [{
        "id": "1234",
        "display": "Day of week",
        "operands": [{value: "is", display: "Is"}, {value: "isnt", display: "Isnt"}],
        "fields": [{
            "type": "checkbox", "name": "weekday", "options": [
                {"value": "mon", "display": "Monday"},
                {"value": "tue", "display": "Tuesday"},
                {"value": "wed", "display": "Wednesday"},
                {"value": "thu", "display": "Thursday"},
                {"value": "fri", "display": "Friday"},
                {"value": "sat", "display": "Saturday"},
                {"value": "sun", "display": "Sunday"}
            ]
        }, {
            "type": "select", "label": "Time zone", "name": "tz", "options": [
                {"value": "utc", "display": "UTC"},
                {"value": "-8", "display": "-8 PDT"},
                {"value": "+8", "display": "+8 Shanghai"},
                {"value": "-7", "display": "+7 Soul"},
                {"value": "+7", "display": "+7 Tokyo"}
            ]
        }]
    }, {
        "id": "2334",
        "display": "Country",
        "operands": [{value: "is", display: "Is"}, {value: "isnt", display: "Isnt"}],
        "fields": [{
            "type": "select", "name": "value", "options": [
                {"value": "us", "display": "American"},
                {"value": "ca", "display": "Canada"},
                {"value": "cn", "display": "China"},
                {"value": "jp", "display": "Japan"},
                {"value": "hk", "display": "Hongkong"}
            ]
        }]
    }, {
        "id": "3434",
        "display": "OS",
        "operands": [{value: "is", display: "Is"}, {value: "isnt", display: "Isnt"}],
        "fields": [{
            "type": "l2select", "name": "value", "options": [{
                "value": "linux", "display": "Linux", "suboptions": [
                    {"value": "ubuntu", "display": "Ubuntu"},
                    {"value": "debian", "display": "Debian"},
                    {"value": "centos", "display": "Centos"},
                    {"value": "redhat", "display": "Redhat"},
                    {"value": "gentoo", "display": "Gentoo"},
                    {"value": "lfs", "display": "LFS"}
                ]
            }, {
                "value": "windows", "display": "Windows", "suboptions": [
                    {"value": "winxp", "display": "Windows XP"},
                    {"value": "win7", "display": "Windows 7"},
                    {"value": "win8", "display": "Windows 8"},
                    {"value": "win10", "display": "Windows 10"}
                ]
            }, {
                "value": "android", "display": "Android", "suboptions": [
                    {"value": "android4.2", "display": "Android 4.2"},
                    {"value": "android4.3", "display": "Android 4.3"},
                    {"value": "android4.4", "display": "Android 4.4"},
                    {"value": "android4.5", "display": "Android 4.5"},
                    {"value": "android4.6", "display": "Android 4.6"},
                    {"value": "android5.0", "display": "Android 5.0"},
                    {"value": "android6.0", "display": "Android 6.0"},
                    {"value": "android7.0", "display": "Android 7.0"}
                ]
            }]
        }]
    }, {
        "id": "8334",
        "display": "Device type",
        "operands": [{value: "ctn", display: "Must Contain"}, {value: "nctn", display: "Not Contain"}],
        "fields": [{
            "type": "chips", "name": "value", "options": [
                {"value": "mobile", "display": "Mobile Phones"},
                {"value": "tablet", "display": "Tablet"},
                {"value": "pc", "display": "Desktops & Laptops"},
                {"value": "tv", "display": "Smart TV"}
            ]
        }]
    }, {
        "id": "3534",
        "display": "IP and IP ranges",
        "operands": [{value: "is", display: "Is"}, {value: "isnt", display: "Isnt"}],
        "fields": [{
            "type": "textarea", "name": "value",
            "desc": "Enter one IP address or subnet per line in the following format: 20.30.40.50 or 20.30.40.50/24"
        }]
    }, {
        "id": "4934",
        "display": "Time of day",
        "operands": [{value: "is", display: "Is"}, {value: "isnt", display: "Isnt"}],
        "fields": [{
            "type": "inputgroup",
            "inputs": [
                {"label": "Between", "name": "starttime", "placeholder": "00:00"},
                {"label": "and", "name": "endtime", "placeholder": "00:00"},
            ]
        }, {
            "type": "select", "label": "Time zone", "name": "tz", "options": [
                {"value": "utc", "display": "UTC"},
                {"value": "-8", "display": "-8 PDT"},
                {"value": "+8", "display": "+8 Shanghai"},
                {"value": "+7", "display": "+7 Soul"},
                {"value": "+9", "display": "+7 Tokyo"}
            ]
        }]
    }];
    delayResponse(res, result);
});


/**
 * get list of countries
 * shang@v1 [warren, modified]
 */
app.get('/api/countries', function (req, res) {
    var result = [
        {"value": "Canada", "display": "Canada"},
        {"value": "CHN", "display": "China"},
        {"value": "JPN", "display": "Japan"}
    ];
    delayResponse(res, result);
});

app.get('/api/postbackurl', function (req, res) {
    var result = {
        "status": 1,
        "message": "success",
        "data": {
            "defaultPostBackUrl": "http://12xhgo.nbtrk.com/postback?cid=REPLACE&payout=OPTIONAL&txid=OPTIONAL"
        }
    };
    res.send(result);
});

// Setting API
/**
 * @apiName 获取profile account
 *
 */
app.get('/api/profile', function (req, res) {
    var result = {
        status: 1,
        message: 'success',
        data: {
          firstname: 'test',
          lastname:'test',
          companyname: 'zheng',
          tel: '13120663670',
          timezone:'+08:00',
          homescreen: 'dashboard', // or campaignList
          referralToken: ""
        }
    };
    res.send(result);
});

/**
 * @apiName 保存profile account
 *
 */
app.post('/api/profile', function (req, res) {
    var result = {
        status: 1,
        message: 'success',
        data: {
            firstname: 'test',
            lastname:'test',
            companyname: 'zheng',
            tel: '13120663670',
            timezone:'+08:00',
            homescreen: 'dashboard', // or campaignList
            referralToken: ""
        }
    };
    res.send(result);
});

/**
 * @apiName 保存profile password change
 *
 *
 * @apiParam {String} oldpassword
 * @apiParam {String} newpassword
 *
 */
app.post('/api/password', function (req, res) {
    var result = {
        status: 1,
        message: 'success'
    };
    res.send(result);
});

/**
 * @apiName 获取profile email   进入页面后把所有的数据一次性取出来
 *
 */
app.get('/api/email', function (req, res) {
    var result = {
        status: 1,
        message: 'success',
    };
    res.send(result);
});

/**
 * @apiName 保存profile email change
 *
 *
 * @apiParam {String} password
 * @apiParam {String} email   (同注册一样，输入邮箱以后验证邮箱是否已存在)
 *
 */
app.post('/api/email', function (req, res) {
    var result = {
        status: 1,
        message: 'success'
    };
    res.send(result);
});

/**
 * @apiName 获取referral信息
 *
 *
 * @apiParam {String} sort:acquired(-acquired)
 * @apiParam {Number} page:1
 * @apiParam {Number} limit:500
 *
 */
app.get('/api/referrals', function (req, res) {
    var result = {
        status: 1,
        message: 'success',
        data: {
            totalRows: 37,
            totals: {
                count: "",
                recentCommission: "",
                totalCommission: ""
            },
            referrals: [
                {
                    userId: 1,
                    acquired: "",
                    status: "",
                    lastActivity: "",
                    recentCommission: "",
                    totalCommission: ""
                }
            ]
        }
    };
    res.send(result);
});

/**
 * @apiName 获取Subscription信息
 *
 *
 * @apiParam {String} timezone "+08:00"
 *
 */
app.get('/api/billing', function (req, res) {
    var result = {
        status: 1,
        message: 'success',
        data: {
            plan: {
                id: 1,
                name: "Agency",
                price: 399
            },
            statistic: {
                planCode: "NO PLAN",
                from: "19-01-2017",
                to: "19-02-2017",
                billedEvents: 1000,
                totalEvents: 1000,
                overageEvents:1,
                overageCost:0.999,
                includedEvents: 100000,
                remainEvents: 9999,
                freeEvents: 0,
            }
        }
    };
    res.send(result);
});

/**
 * @apiName 获取Domains信息
 *
 */
app.get('/api/domains', function (req, res) {
    var result = {
        status: 1,
        message: 'success',
        data: {
          internal: [
            {
              address: "www.newbidder1.com",
              main: false
            },
            {
              address: "www.newbidder2.com",
              main: true
            },
            {
              address: "www.newbidder1.com",
              main: false
            }],
          custom: [
            {
              address: "www.adbund.com",
              main: false
            }
          ]
        }
    };
    res.send(result)
});

/**
 * @apiName 验证Domain Adress
 *
 * @apiParam {String} adress {adress: 'www.adbund.com'}
 *
 */
app.get('/api/domains/validatecname', function (req, res) {
  var result = {
    status: 1,
    message: 'success',
    data: {
      domain: 'www.adbund.com',
      validateResult: "NOT_FOUND"
    }
  };
  res.send(result);
});

/**
 * @apiName 保存Domains信息
 *
 */
app.post('/api/domains', function (req, res) {
  var result = {
    status: 1,
    message: 'success',
    data: {
      internal: [
        {
          address: "www.newbidder1.com",
          main: false
        },
        {
          address: "www.newbidder2.com",
          main: true
        },
        {
          address: "www.newbidder1.com",
          main: false
        }],
      custom: [
        {
          address: "www.adbund.com",
          main: false
        }
      ]
    }
  };
  res.send(result)
});

/**
 * @apiName 获取Setup信息 TODO
 *
 */
app.get('/api/setup', function (req, res) {
  var result = {
    status: 1,
    message: 'success',
    data: {}
  };
  res.send(result);
});

/**
 * @apiName 获取Member信息
 *
 */
app.get('/api/member', function (req, res) {
  var result = {
    status: 1,
    message: 'success',
    data: {
      email: "test@qq.com",
      firstName: "test",
      lastName: "test",
      owner: true
    }
  };
  res.send(result);
});

/**
 * @apiName 获取Invitation信息
 *
 */
app.get('/api/invitation', function (req, res) {
  var result = {
    status: 1,
    message: 'success',
    data: {
      invitations: [
        {
          email: "111@qq.com",
          lastDate: "13-02-2017"
        }
      ]
    }
  };
  res.send(result);
});

/**
 * @apiName 保存Invitation信息
 *
 * @apiParam [String] invitationEmail ["111@qq.com","222.qq.com"]
 *
 */
app.post('/api/invitation', function (req, res) {
  var result = {
    status: 1,
    message: 'success',
    data: {
      invitations: [
        {
          email: "222@qq.com",
          lastDate: "13-02-2017"
        }
      ]
    }
  };
  res.send(result);
});

/**
 * @apiName 删除Invitation信息
 *
 */
app.delete('/api/invitation/:email', function (req, res) {
  var result = {
    status: 1,
    message: 'success'
  };
  res.send(result);
});

/**
 * @apiName 获取BlackList
 *
 */
app.get('/api/blacklist', function (req, res) {
  var result = {
    status: 1,
    message: 'success',
    data: {
      blacklist: [
        {
          id: 1,
          name: "test1",
          ipRules: [
            {
              ipRangeStart: "1.1.1.1",
              ipRangeEnd: "1.1.1.1"
            }
          ],
          userAgentRules: [
            {
              userAgent: "test1"
            }
          ]
        },
        {
          id: 2,
          name: "test2",
          ipRules: [
            {
              ipRangeStart: "1.1.1.1",
              ipRangeEnd: "1.1.1.1"
            }
          ],
          userAgentRules: [
            {
              userAgent: "test2"
            }
          ]
        }
      ]
    }
  };
  res.send(result);
});

/**
 * @apiName 保存BlackList
 *
 */
app.post('/api/blacklist', function (req, res) {
  var result = {
    status: 1,
    message: 'success',
    data: {
      blacklist: [
        {
          id: 1,
          name: "test1",
          ipRules: [
            {
              ipRangeStart: "1.1.1.1",
              ipRangeEnd: "1.1.1.1"
            }
          ],
          userAgentRules: [
            {
              userAgent: "test1"
            }
          ]
        },
        {
          id: 2,
          name: "test2",
          ipRules: [
            {
              ipRangeStart: "1.1.1.1",
              ipRangeEnd: "1.1.1.1"
            }
          ],
          userAgentRules: [
            {
              userAgent: "test2"
            }
          ]
        }
      ]
    }
  };
  res.send(result);
});

/**
 * @apiName 更新BlackList状态
 *
 */
app.put('/api/blacklist', function (req, res) {
  var result = {
    status: 1,
    message: 'success'
  };
  res.send(result);
});

/**
 * @apiName 获取EventLog信息
 *
 *
 * @apiParam {String} from: 2017-02-01
 * @apiParam {String} to: 2017-02-10
 * @apiParam {Number} page:1
 * @apiParam {Number} limit:500
 * @apiParam {String} userId:1  {option}
 * @apiParam {String} actionType: CREATE {option}
 * @apiParam {String} category: CAMPAIGN {option}
 *
 */
app.get('/api/eventlog', function (req, res) {
  var result = {
    status: 1,
    message: 'success',
    data: {
      totalRows: 37,
      rows: [
        {
          user: "zhengshuo@qq.com",
          entityType: "Offer",
          entityName: "Offer1",
          entityId: "c05cad45-fbe4-405c-9da4-cb3b5de1ca",
          action: "Create",
          changeAt: "2017-02-10"
        }
      ]
    }
  };
  res.send(result);
});

app.listen(5000, function () {
    console.log('server started success port : 5000');
});
