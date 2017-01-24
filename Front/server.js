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
  return 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.' + payload + '.TJVA95OrM7E2cBab30RMHrHDcEfxjoYZgeFONFh7HgQ';
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
    delayResponse(res, { token: createJWT() });
  } else {
    res.status(401).send({ message: 'Invalid email and/or password!' });
  }
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
    res.status(409).send({ message: 'Email is already taken' });
  } else if (saveError) {
    res.status(500).send({ message: 'Internal error when saving user' });
  } else {
    res.send({ token: createJWT() });
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
    data: {
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
        "name": {
          "visible": true
        },
        "offerName": {
          "visible": true
        },
        "offerId": {
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
        "affiliateNetworkName": {
          "visible": true
        },
        "campaignName": {
          "visible": true
        },
        "campaignId": {
          "visible": true
        },
        "campaignUrl": {
          "visible": false
        },
        "campaignCountry": {
          "visible": false
        },
        "pixelUrl": {
          "visible": false
        },
        "postbackUrl": {
          "visible": false
        },
        "trafficSourceName": {
          "visible": true
        },
        "clickRedirectType": {
          "visible": false
        },
        "costModel": {
          "visible": false
        },
        "cpa": {
          "visible": true
        },
        "cpc": {
          "visible": true
        },
        "cpm": {
          "visible": true
        },
        "city": {
          "visible": true
        },
        "flowName": {
          "visible": true
        },
        "landerName": {
          "visible": true
        },
        "landerId": {
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
        }
      }
    }
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
        "offerName": {
          "visible": true
        },
        "offerId": {
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
        "affiliateNetworkName": {
          "visible": true
        },
        "campaignName": {
          "visible": true
        },
        "campaignId": {
          "visible": true
        },
        "campaignUrl": {
          "visible": false
        },
        "campaignCountry": {
          "visible": false
        },
        "pixelUrl": {
          "visible": false
        },
        "postbackUrl": {
          "visible": false
        },
        "trafficSourceName": {
          "visible": true
        },
        "clickRedirectType": {
          "visible": false
        },
        "costModel": {
          "visible": false
        },
        "cpa": {
          "visible": true
        },
        "cpc": {
          "visible": true
        },
        "cpm": {
          "visible": true
        },
        "city": {
          "visible": true
        },
        "flowName": {
          "visible": true
        },
        "landerName": {
          "visible": true
        },
        "landerId": {
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
          "campaignName": "Campaign1",
          "campaignId": "1",
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
          "campaignName": "Campaign2",
          "campaignId": "2",
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
          "campaignName": "Campaign3",
          "campaignId": "3",
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
app.get('/api/campaign/:campaignId', function (req, res) {
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
      "targetFlowId": 34,
      "targetUrl": "",
      "status": 1,
      "tags": []
    }
  };
  res.send(result);
});

/**
 * @apiName 新增Campaign
 *
 */
app.post('/api/campaign', function (req, res) {
  var result = {
    status: 1,
    message: "",
    data: {
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
      "country": "AND",
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
app.post('/api/campaign/:campaignId', function (req, res) {
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
      "country": "AND",
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
app.delete('/api/campaign/:campaignId', function (req, res) {
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
    "id": 1,
    "name": "Global - yoshop-Android-benson",
    "country": "us",
    "redirectMode": 0, //0:302, 1:Mate, 2:Double meta
    "rules": [{
      "id": 3,
      "isDefault": true,
      "paths": [{
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
  var result = {
    "name": "Global - yoshop-Android-benson",
    "country": "us",
    "redirectMode": 0, //0:302, 1:Mate, 2:Double meta
    "rules": [{
      "isDefault": true,
      "paths": [{
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
 * @apiName 修改Flow
 *
 * the post data is the same as in `GET /api/flows/:flowId`
 *
 * shang@v1
 */
app.post('/api/flows/:flowId', function (req, res) {
  var result = {
    "id": 1,
    "name": "Global - yoshop-Android-benson",
    "country": "us",
    "redirectMode": 0, //0:302, 1:Mate, 2:Double meta
    "rules": [{
      "id": 3,
      "isDefault": true,
      "paths": [{
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
  var result = [{
    "id": "1234f491-a22b-455d-bcc9-5c1324a8885b",
    "name": "Global - AecurityAlert-en 1",
  }, {
    "id": "3456f491-a22b-455d-bcc9-5c1324a8885b",
    "name": "US - BecurityAlert-2",
  }, {
    "id": "5678f491-a22b-455d-bcc9-5c1324a8885b",
    "name": "JP - CrityAlert-en3",
  }, {
    "id": "6789f491-a22b-455d-bcc9-5c1324a8885b",
    "name": "CN - DecurityAlert-en4",
  }, {
    "id": "7890f491-a22b-455d-bcc9-5c1324a8885b",
    "name": "CA - EecityArt-en5",
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
      "country": "AND",
      "AffiliateNetworkId": 13,
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
  var result = [{
    "id": "1234f491-a22b-455d-bcc9-5c1324a8885b",
    "name": "Global - AecurityAlert-en 1",
  }, {
    "id": "3456f491-a22b-455d-bcc9-5c1324a8885b",
    "name": "US - BecurityAlert-2",
  }, {
    "id": "5678f491-a22b-455d-bcc9-5c1324a8885b",
    "name": "JP - CrityAlert-en3",
  }, {
    "id": "6789f491-a22b-455d-bcc9-5c1324a8885b",
    "name": "CN - DecurityAlert-en4",
  }, {
    "id": "7890f491-a22b-455d-bcc9-5c1324a8885b",
    "name": "CA - EecityArt-en5",
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
      "country": "AND",
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
      "country": "AND",
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
app.get('/api/traffic', function (req, res) {
  var result = {
    "status": 1,
    "message": "success",
    "data": {
      "trafficsources": [{
        "id": 10,
        "name": "TrafficSource1",
        "cost": "",
        "impTracking": 0,
        "params": "[{\"Parameter\":\"\",\"Placeholder\":\"\",\"Name\":\"\",\"Track\":\"\",\"$$hashKey\":\"object:438\"},{\"Parameter\":\"\",\"Placeholder\":\"\",\"Name\":\"\",\"Track\":\"\",\"$$hashKey\":\"object:439\"},{\"Parameter\":\"\",\"Placeholder\":\"\",\"Name\":\"\",\"Track\":\"\",\"$$hashKey\":\"object:440\"},{\"Parameter\":\"\",\"Placeholder\":\"\",\"Name\":\"\",\"Track\":\"\",\"$$hashKey\":\"object:441\"},{\"Parameter\":\"\",\"Placeholder\":\"\",\"Name\":\"\",\"Track\":\"\",\"$$hashKey\":\"object:442\"},{\"Parameter\":\"\",\"Placeholder\":\"\",\"Name\":\"\",\"Track\":\"\",\"$$hashKey\":\"object:443\"},{\"Parameter\":\"\",\"Placeholder\":\"\",\"Name\":\"\",\"Track\":\"\",\"$$hashKey\":\"object:444\"},{\"Parameter\":\"\",\"Placeholder\":\"\",\"Name\":\"\",\"Track\":\"\",\"$$hashKey\":\"object:445\"},{\"Parameter\":\"\",\"Placeholder\":\"\",\"Name\":\"\",\"Track\":\"\",\"$$hashKey\":\"object:446\"},{\"Parameter\":\"\",\"Placeholder\":\"\",\"Name\":\"\",\"Track\":\"\",\"$$hashKey\":\"object:447\"}]"
      }, {
        "id": 15,
        "name": "TrafficSource2",
        "cost": "",
        "impTracking": 1,
        "params": "[{\"Parameter\":\"WEBSITE\",\"Placeholder\":\"{WEBSITE}\",\"Name\":\"WEBSITE\",\"Track\":1,\"$$hashKey\":\"object:603\"},{\"Parameter\":\"\",\"Placeholder\":\"\",\"Name\":\"\",\"Track\":\"\",\"$$hashKey\":\"object:604\"},{\"Parameter\":\"\",\"Placeholder\":\"\",\"Name\":\"\",\"Track\":\"\",\"$$hashKey\":\"object:605\"},{\"Parameter\":\"\",\"Placeholder\":\"\",\"Name\":\"\",\"Track\":\"\",\"$$hashKey\":\"object:606\"},{\"Parameter\":\"\",\"Placeholder\":\"\",\"Name\":\"\",\"Track\":\"\",\"$$hashKey\":\"object:607\"},{\"Parameter\":\"\",\"Placeholder\":\"\",\"Name\":\"\",\"Track\":\"\",\"$$hashKey\":\"object:608\"},{\"Parameter\":\"\",\"Placeholder\":\"\",\"Name\":\"\",\"Track\":\"\",\"$$hashKey\":\"object:609\"},{\"Parameter\":\"\",\"Placeholder\":\"\",\"Name\":\"\",\"Track\":\"\",\"$$hashKey\":\"object:610\"},{\"Parameter\":\"\",\"Placeholder\":\"\",\"Name\":\"\",\"Track\":\"\",\"$$hashKey\":\"object:611\"},{\"Parameter\":\"\",\"Placeholder\":\"\",\"Name\":\"\",\"Track\":\"\",\"$$hashKey\":\"object:612\"}]"
      }, {
        "id": 17,
        "name": "TrafficSource1",
        "cost": "",
        "impTracking": 1,
        "params": "[{\"Parameter\":\"1\",\"Placeholder\":\"1\",\"Name\":\"1\",\"Track\":1,\"$$hashKey\":\"object:805\"},{\"Parameter\":\"\",\"Placeholder\":\"\",\"Name\":\"\",\"Track\":\"\",\"$$hashKey\":\"object:806\"},{\"Parameter\":\"\",\"Placeholder\":\"\",\"Name\":\"\",\"Track\":\"\",\"$$hashKey\":\"object:807\"},{\"Parameter\":\"\",\"Placeholder\":\"\",\"Name\":\"\",\"Track\":\"\",\"$$hashKey\":\"object:808\"},{\"Parameter\":\"\",\"Placeholder\":\"\",\"Name\":\"\",\"Track\":\"\",\"$$hashKey\":\"object:809\"},{\"Parameter\":\"\",\"Placeholder\":\"\",\"Name\":\"\",\"Track\":\"\",\"$$hashKey\":\"object:810\"},{\"Parameter\":\"\",\"Placeholder\":\"\",\"Name\":\"\",\"Track\":\"\",\"$$hashKey\":\"object:811\"},{\"Parameter\":\"\",\"Placeholder\":\"\",\"Name\":\"\",\"Track\":\"\",\"$$hashKey\":\"object:812\"},{\"Parameter\":\"\",\"Placeholder\":\"\",\"Name\":\"\",\"Track\":\"\",\"$$hashKey\":\"object:813\"},{\"Parameter\":\"\",\"Placeholder\":\"\",\"Name\":\"\",\"Track\":\"\",\"$$hashKey\":\"object:814\"}]"
      }, {
        "id": 18,
        "name": "123",
        "cost": "",
        "impTracking": 0,
        "params": "[{\"Parameter\":\"\",\"Placeholder\":\"\",\"Name\":\"\",\"Track\":\"\",\"$$hashKey\":\"object:1671\"},{\"Parameter\":\"\",\"Placeholder\":\"\",\"Name\":\"\",\"Track\":\"\",\"$$hashKey\":\"object:1672\"},{\"Parameter\":\"\",\"Placeholder\":\"\",\"Name\":\"\",\"Track\":\"\",\"$$hashKey\":\"object:1673\"},{\"Parameter\":\"\",\"Placeholder\":\"\",\"Name\":\"\",\"Track\":\"\",\"$$hashKey\":\"object:1674\"},{\"Parameter\":\"\",\"Placeholder\":\"\",\"Name\":\"\",\"Track\":\"\",\"$$hashKey\":\"object:1675\"},{\"Parameter\":\"\",\"Placeholder\":\"\",\"Name\":\"\",\"Track\":\"\",\"$$hashKey\":\"object:1676\"},{\"Parameter\":\"\",\"Placeholder\":\"\",\"Name\":\"\",\"Track\":\"\",\"$$hashKey\":\"object:1677\"},{\"Parameter\":\"\",\"Placeholder\":\"\",\"Name\":\"\",\"Track\":\"\",\"$$hashKey\":\"object:1678\"},{\"Parameter\":\"\",\"Placeholder\":\"\",\"Name\":\"\",\"Track\":\"\",\"$$hashKey\":\"object:1679\"},{\"Parameter\":\"\",\"Placeholder\":\"\",\"Name\":\"\",\"Track\":\"\",\"$$hashKey\":\"object:1680\"}]"
      }]
    }
  };
  res.send(result);
});

/**
 * 获得Traffic Source 详细信息
 */
app.get('/api/traffic/:id', function (req, res) {
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
      "externalId": "",
      "cost": "",
      "params": "[{\"Parameter\":\"WEBSITE\",\"Placeholder\":\"{WEBSITE}\",\"Name\":\"WEBSITE\",\"Track\":1,\"$$hashKey\":\"object:603\"},{\"Parameter\":\"\",\"Placeholder\":\"\",\"Name\":\"\",\"Track\":\"\",\"$$hashKey\":\"object:604\"},{\"Parameter\":\"\",\"Placeholder\":\"\",\"Name\":\"\",\"Track\":\"\",\"$$hashKey\":\"object:605\"},{\"Parameter\":\"\",\"Placeholder\":\"\",\"Name\":\"\",\"Track\":\"\",\"$$hashKey\":\"object:606\"},{\"Parameter\":\"\",\"Placeholder\":\"\",\"Name\":\"\",\"Track\":\"\",\"$$hashKey\":\"object:607\"},{\"Parameter\":\"\",\"Placeholder\":\"\",\"Name\":\"\",\"Track\":\"\",\"$$hashKey\":\"object:608\"},{\"Parameter\":\"\",\"Placeholder\":\"\",\"Name\":\"\",\"Track\":\"\",\"$$hashKey\":\"object:609\"},{\"Parameter\":\"\",\"Placeholder\":\"\",\"Name\":\"\",\"Track\":\"\",\"$$hashKey\":\"object:610\"},{\"Parameter\":\"\",\"Placeholder\":\"\",\"Name\":\"\",\"Track\":\"\",\"$$hashKey\":\"object:611\"},{\"Parameter\":\"\",\"Placeholder\":\"\",\"Name\":\"\",\"Track\":\"\",\"$$hashKey\":\"object:612\"}]"
    }
  };
  res.send(result);
});

/**
 * Add new Traffic Source 详细信息 [warren] tested
 */
app.post('/api/traffic', function (req, res) {
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

app.post('/api/traffic/:id', function (req, res) {
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
app.delete('/api/traffic/:id', function (req, res) {
  var result = {
    status: 1,
    message: 'success'
  };
  res.send(result);
});

/**
 * Get list of affiliates
 */
app.get('/api/affiliate', function (req, res) {
  var result = {
    status: 1,
    message: 'success',
    data: {
      networks: [
        {id: 1, name: "affilate1", postbackUrl: ""},
        {id: 2, name: "affilate2", postbackUrl: ""},
        {id: 3, name: "affilate3", postbackUrl: ""}
      ]
    }
  };
  res.send(result);
});

/**
 * get affiliate network by id, [warren] checked, same format.
 */
app.get('/api/affiliate/:id', function (req,res) {
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
 * 新增Affiliate
 *
 */
app.post('/api/affiliate', function (req, res) {
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
app.post('/api/affiliate/:id', function (req, res) {
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
app.delete('/api/affiliate/:id', function (req, res) {
  var result = {
    status: 1,
    message: 'success'
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
    "fields": [{
      "type": "checkbox", "name": "weekday", "options": [
        { "value": "mon", "display": "Monday" },
        { "value": "tue", "display": "Tuesday" },
        { "value": "wed", "display": "Wednesday" },
        { "value": "thu", "display": "Thursday" },
        { "value": "fri", "display": "Friday" },
        { "value": "sat", "display": "Saturday" },
        { "value": "sun", "display": "Sunday" }
      ]
    }, {
      "type": "select", "label": "Time zone", "name": "tz", "options": [
        { "value": "utc", "display": "UTC" },
        { "value": "-8", "display": "-8 PDT" },
        { "value": "+8", "display": "+8 Shanghai" },
        { "value": "-7", "display": "+7 Soul" },
        { "value": "+7", "display": "+7 Tokyo" }
      ]
    }]
  }, {
    "id": "2334",
    "display": "Country",
    "fields": [{
      "type": "select", "name": "value", "options": [
        { "value": "us", "display": "American" },
        { "value": "ca", "display": "Canada" },
        { "value": "cn", "display": "China" },
        { "value": "jp", "display": "Japan" },
        { "value": "hk", "display": "Hongkong" }
      ]
    }]
  }, {
    "id": "3434",
    "display": "OS",
    "fields": [{
      "type": "l2select", "name": "value", "options": [{
        "value": "linux", "display": "Linux", "suboptions": [
          { "value": "ubuntu", "display": "Ubuntu" },
          { "value": "debian", "display": "Debian" },
          { "value": "centos", "display": "Centos" },
          { "value": "redhat", "display": "Redhat" },
          { "value": "gentoo", "display": "Gentoo" },
          { "value": "lfs",    "display": "LFS" }
        ]
      }, {
        "value": "windows", "display": "Windows", "suboptions": [
          { "value": "winxp", "display": "Windows XP" },
          { "value": "win7", "display": "Windows 7" },
          { "value": "win8", "display": "Windows 8" },
          { "value": "win10", "display": "Windows 10" }
        ]
      }, {
        "value": "android", "display": "Android", "suboptions": [
          { "value": "android4.2", "display": "Android 4.2" },
          { "value": "android4.3", "display": "Android 4.3" },
          { "value": "android4.4", "display": "Android 4.4" },
          { "value": "android4.5", "display": "Android 4.5" },
          { "value": "android4.6", "display": "Android 4.6" },
          { "value": "android5.0", "display": "Android 5.0" },
          { "value": "android6.0", "display": "Android 6.0" },
          { "value": "android7.0", "display": "Android 7.0" }
        ]
      }]
    }]
  }, {
    "id": "8334",
    "display": "Device type",
    "fields": [{
      "type": "chips", "name": "value", "options": [
        { "value": "mobile", "display": "Mobile Phones" },
        { "value": "tablet", "display": "Tablet" },
        { "value": "pc", "display": "Desktops & Laptops" },
        { "value": "tv", "display": "Smart TV" }
      ]
    }]
  }, {
    "id": "3534",
    "display": "IP and IP ranges",
    "fields": [{
      "type": "textarea", "name": "value",
      "desc": "Enter one IP address or subnet per line in the following format: 20.30.40.50 or 20.30.40.50/24"
    }]
  }, {
    "id": "4934",
    "display": "Time of day",
    "fields": [{
      "type": "inputgroup",
      "inputs": [
        { "label": "Between", "name": "starttime", "placeholder": "00:00" },
        { "label": "and", "name": "endtime", "placeholder": "00:00" },
      ]
    }, {
      "type": "select", "label": "Time zone", "name": "tz", "options": [
        { "value": "utc", "display": "UTC" },
        { "value": "-8", "display": "-8 PDT" },
        { "value": "+8", "display": "+8 Shanghai" },
        { "value": "+7", "display": "+7 Soul" },
        { "value": "+9", "display": "+7 Tokyo" }
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
    { "value": "glb", "display": "Global" },
    { "value": "us", "display": "American" },
    { "value": "ca", "display": "Canada" },
    { "value": "cn", "display": "China" },
    { "value": "jp", "display": "Japan" },
    { "value": "hk", "display": "Hongkong" }
  ];
  delayResponse(res, result);
});

app.listen(5000, function () {
  console.log('server started success port : 5000');
});
