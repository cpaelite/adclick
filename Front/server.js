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

app.use(function (req, res, next) {
  console.log('*** Request Method : ' + req.method + ', Request Url : ' + req.originalUrl);
  return next();
});

/**
 * @apiName 登录
 *
 */
app.post('/auth/login', function (req, res) {
  var email = req.body.email;
  var password = req.body.password;
  if (email && password == '123@qq.com') {
    res.send({
      status: 1,
      message: "success",
      data: {
        token: createJWT()
      }
    });
  } else {
    res.send({
      status: 401,
      message: 'Invalid email and/or password!',
      data: {}
    });
  }
});

/**
 * @apiName 注册
 *
 */
app.post('/auth/signup', function (req, res) {
  var result = {
    status: 1,
    message: "success",
    data: {
      id: 1,
      email: "123@adbund.com",
      password: "111111",
      firstname: "123",
      lastname: "123"
    }
  };
  res.send(result);
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
      "reportViewSort": {
        "key": "visits",
        "direction": "desc"
      },
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
 * @apiName 保存用户配置信息
 *
 */
app.post('/preferences', function (req, res) {
  var result = {
    "status": 1,
    "message": "",
    data: {
      "reportViewLimit": 500,
      "entityType": 1,    //0:停止;1:运行;2全部
      "reportViewSort": {
        "key": "visits",
        "direction": "desc"
      },
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
 * @apiName 获取所有国家
 *
 */
app.get('/countries', function (req, res) {
  var result = {
    "status": 1,
    "message": "",
    "data": {
      countries: [{
        "id": 1,
        "name": "Andorra",
        "alpha2Code": "AD",
        "alpha3Code": "AND"
      }, {
        "id": 2,
        "name": "United Arab Emirates",
        "alpha2Code": "AE",
        "alpha3Code": "ARE"
      }, {
        "id": 3,
        "name": "Afghanistan",
        "alpha2Code": "AF",
        "alpha3Code": "AFG"
      }, {
        "id": 4,
        "name": "Antigua And Barbuda",
        "alpha2Code": "AG",
        "alpha3Code": "ATG"
      }, {
        "id": 5,
        "name": "China",
        "alpha2Code": "CN",
        "alpha3Code": "CHN"
      }]
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
 * @apiParam {Number} offset:1
 * @apiParam {Number} limit:500
 * @apiParam {Number} status:1      //0:停止；1:运行; 2:All
 *
 */
app.post('/api/report', function (req, res) {
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
          "impressions": 0,
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
    "id": 1,
    "hash": "fcb78739-e306-466a-86a5-792481e1cf48",
    "name": "PropellerAds - Canada - yoshop-benson-Android-0104",   //TODO Traffic source + country + name
    "url": "http://zx1jg.voluumtrk.com/fcb78739-e306-466a-86a5-792481e1cf48?bannerid={bannerid}&campaignid={campaignid}&zoneid={zoneid}",
    "impPixelUrl": "http://zx1jg.voluumtrk.com/impression/fcb78739-e306-466a-86a5-792481e1cf48",
    "trafficSource": {
      "id": 1,
      "name": "PropellerAds"
    },
    "country": "",
    "costModel": 0,     //0:Do not;1:cpc; 2:cpa; 3:cpm; 4:Auto
    "cpc": 0.6,
    "cpa": 0.4,
    "cpm": 0.3,
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
  };
  res.send(result);
});

/**
 * @apiName 修改Campaign
 *
 */
app.post('/api/campaign/:campaignId', function (req, res) {
  var result = {
    "id": 1,
    "hash": "fcb78739-e306-466a-86a5-792481e1cf48",
    "name": "PropellerAds - Canada - yoshop-benson-Android-0104",   //TODO Traffic source + country + name
    "url": "http://zx1jg.voluumtrk.com/fcb78739-e306-466a-86a5-792481e1cf48?bannerid={bannerid}&campaignid={campaignid}&zoneid={zoneid}",
    "impPixelUrl": "http://zx1jg.voluumtrk.com/impression/fcb78739-e306-466a-86a5-792481e1cf48",
    "trafficSource": {
      "id": 1,
      "name": "PropellerAds"
    },
    "country": "",
    "costModel": 0,     //0:Do not;1:cpc; 2:cpa; 3:cpm
    "cpc": 0.6,
    "cpa": 0.4,
    "cpm": 0.3,
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
  };
  res.send(result);
});

/**
 * @apiName 删除Campaign
 *
 */
app.delete('/api/campaign/:campaignId', function (req, res) {
  var result = {
    "status": "SUCCESSFUL",
    "items": [{
      "id": "0f11b450-27df-4d78-8ef2-285c286e6151",
      "name": "Test",
      "status": "SUCCESSFUL",
      "references": []
    }]
  };
  res.send(result);
});

/**
 * @apiName 根据ID获取Flow
 *
 */
app.get('/api/flow/:flowId', function (req, res) {
  var result = {
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
  };
  res.send(result);
});

/**
 * @apiName 获取Flow关联的Campaign
 *
 */
app.get('/api/flow/:flowId/campaigns', function (req, res) {
  var result = [{
    "id": "01b30fdd-18ff-4068-8868-878f08886799",
    "name": "Popads - Canada - yoshop-benson-Android-0104",
    "namePostfix": "yoshop-benson-Android-0104"
  }, {
    "id": "3026f98e-e755-4905-8011-af79f8547e72",
    "name": "Popads - Australia - yoshop-benson-Android-0104",
    "namePostfix": "yoshop-benson-Android-0104"
  }, {
    "id": "34695609-97cd-404e-a75a-c7c7d93a042d",
    "name": "Popads - United States - yoshop-benson-Android-0104",
    "namePostfix": "yoshop-benson-Android-0104"
  }, {
    "id": "6f0dbc5a-c844-4caf-b740-f773c8f11954",
    "name": "PropellerAds - United States - yoshop-benson-Android-0104",
    "namePostfix": "yoshop-benson-Android-0104"
  }, {
    "id": "e60e0072-99c1-4773-b525-1fad1ed06768",
    "name": "PropellerAds - Australia - yoshop-benson-Android-0104",
    "namePostfix": "yoshop-benson-Android-0104"
  }, {
    "id": "fcb78739-e306-466a-86a5-792481e1cf48",
    "name": "PropellerAds - Canada - yoshop-benson-Android-0104",
    "namePostfix": "yoshop-benson-Android-0104"
  }];
  res.send(result);
});

/**
 * @apiName 添加Flow
 *
 conditionalPathsGroups: [],
 countries: [],
 defaultOfferRedirectMode: "REGULAR",
 defaultPaths: [
 {
     active: true,
     id: "047bb73f-6787-4227-b51c-247f6db63a2a",
     landers: [
         {
             lander: {
                 id: "04fc2632-f637-4636-bd02-1f25e5a10672",
                 name: "Global - yoshop2-en"
             },
             weight: 100
         }
     ],
     name: "Path 1",
     offerRedirectMode: "REGULAR",
     offers: [
         {
             offer: {
                 id: "9f91a026-aa8e-437c-b202-cd23fe6f02de",
                 name: "hasoffer - Global - yoshop-Android-benson-CAUSAU"
             },
             weight: 100
         }
     ],
     realtimeRoutingApiState: "DISABLED",
     weight: 100
 }
 ],
 id: "1e5ac21f-50a5-412a-8bc1-2569b76f78b4",
 name: "Global - yoshop-Android-benson",
 realtimeRoutingApi: "DISABLED"
 *
 */
app.post('/api/flow/', function (req, res) {
  var result = {
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
  };
  res.send(result);
});

/**
 * @apiName 修改Flow
 *
 conditionalPathsGroups: [],
 countries: [],
 defaultOfferRedirectMode: "REGULAR",
 defaultPaths: [
 {
     active: true,
     id: "047bb73f-6787-4227-b51c-247f6db63a2a",
     landers: [
         {
             lander: {
                 id: "04fc2632-f637-4636-bd02-1f25e5a10672",
                 name: "Global - yoshop2-en"
             },
             weight: 100
         }
     ],
     name: "Path 1",
     offerRedirectMode: "REGULAR",
     offers: [
         {
             offer: {
                 id: "9f91a026-aa8e-437c-b202-cd23fe6f02de",
                 name: "hasoffer - Global - yoshop-Android-benson-CAUSAU"
             },
             weight: 100
         }
     ],
     realtimeRoutingApiState: "DISABLED",
     weight: 100
 }
 ],
 id: "1e5ac21f-50a5-412a-8bc1-2569b76f78b4",
 name: "Global - yoshop-Android-benson",
 realtimeRoutingApi: "DISABLED"
 *
 */
app.post('/api/flow/:flowId', function (req, res) {
  var result = {
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
  };
  res.send(result);
});

/**
 * @apiName 删除Flow
 *
 */
app.delete('/api/flow/:flowId', function (req, res) {
  var result = {
    "status": "SUCCESSFUL",
    "items": [{
      "id": "0f11b450-27df-4d78-8ef2-285c286e6151",
      "name": "Test",
      "status": "SUCCESSFUL",
      "references": []
    }]
  };
  res.send(result);
});

/**
 * @apiName 根据ID获取Lander信息
 *
 */
app.get('/api/lander/:landerId', function (req, res) {
  var result = {
    status: 1,
    message: "",
    data: {
      "id": "44c1f491-a22b-455d-bcc9-5c1324a8885b",
      "namePostfix": "SecurityAlert-en",
      "name": "Global - SecurityAlert-en",
      "updatedTime": "2017-01-10T08:16:53.050Z",
      "createdTime": "2017-01-10T08:16:53.050Z",
      "url": "http://s.ktrack.net/w/SecurityAlert.php",
      "numberOfOffers": 1,
      "tags": []
    }
  };
  res.send(result);
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
app.post('/api/lander', function (req, res) {
  var result = {
    "id": "44c1f491-a22b-455d-bcc9-5c1324a8885b",
    "namePostfix": "SecurityAlert-en",
    "name": "Global - SecurityAlert-en",
    "updatedTime": "2017-01-11T16:36:27.366Z",
    "createdTime": "2017-01-10T08:16:53.050Z",
    "url": "http://s.ktrack.net/w/SecurityAlert.php",
    "numberOfOffers": 1,
    "tags": []
  };
  res.send(result);
});

/**
 * @apiName 修改Lander信息
 *
 *
 * @apiParam namePostfix:"SecurityAlert-en"
 * @apiParam numberOfOffers:"1"
 * @apiParam tags:[]
 * @apiParam url:"http://s.ktrack.net/w/SecurityAlert.php"
 *
 */
app.post('/api/lander/:landerId', function (req, res) {
  var result = {
    "id": "44c1f491-a22b-455d-bcc9-5c1324a8885b",
    "namePostfix": "SecurityAlert-en",
    "name": "Global - SecurityAlert-en",
    "updatedTime": "2017-01-11T16:36:27.366Z",
    "createdTime": "2017-01-10T08:16:53.050Z",
    "url": "http://s.ktrack.net/w/SecurityAlert.php",
    "numberOfOffers": 1,
    "tags": []
  };
  res.send(result);
});

/**
 * @apiName 删除Lander
 *
 */
app.delete('/api/lander/:landId', function (req, res) {
  var result = {
    "status": "SUCCESSFUL",
    "items": [{
      "id": "0f11b450-27df-4d78-8ef2-285c286e6151",
      "name": "Test",
      "status": "SUCCESSFUL",
      "references": []
    }]
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
app.get('/api/offer/:offerId', function (req, res) {
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
 * @apiName 新增Offer
 *
 affiliateNetwork: {
            id: "fa4e2ce0-efc6-4523-8ad1-33a8c5739e1c"
        },
 country: {
        code: "AF"
 },
 namePostfix: "yoshop-Android-benson-CAUSAU",
 tags: [],
 url: "http://hasoffers.mobisummer.com/aff_c?offer_id=28270&aff_id=5598&aff_sub={clickid}&aff_sub2={campaign.id}"
 *
 */
app.post('/api/offer', function (req, res) {
  var result = {
    "id": "9f91a026-aa8e-437c-b202-cd23fe6f02de",
    "name": "hasoffer - Global - yoshop-Android-benson-CAUSAU",
    "namePostfix": "yoshop-Android-benson-CAUSAU",
    "updatedTime": "2017-01-11T17:00:21.546Z",
    "createdTime": "2016-12-30T09:57:24.493Z",
    "clientId": "be0500b7-0786-4b23-80e8-bb4d03ca868c",
    "affiliateNetwork": {
      "id": "fa4e2ce0-efc6-4523-8ad1-33a8c5739e1c",
      "name": "hasoffer"
    },
    "url": "http://hasoffers.mobisummer.com/aff_c?offer_id=28270&aff_id=5598&aff_sub={clickid}&aff_sub2={campaign.id}",
    "tags": []
  };
  res.send(result);
});

/**
 * @apiName 修改Offer
 *
 affiliateNetwork: {
            id: "fa4e2ce0-efc6-4523-8ad1-33a8c5739e1c"
        },
 namePostfix: "yoshop-Android-benson-CAUSAU",
 tags: [],
 url: "http://hasoffers.mobisummer.com/aff_c?offer_id=28270&aff_id=5598&aff_sub={clickid}&aff_sub2={campaign.id}"
 *
 */
app.post('/api/offer/:offerId', function (req, res) {
  var result = {
    "id": "53b87ca8-43fb-4911-95c6-0426292a4abe",
    "name": "Baidu - Afghanistan - TestTestTest",
    "namePostfix": "TestTestTest",
    "updatedTime": "2017-01-11T17:05:45.705Z",
    "createdTime": "2017-01-11T17:05:45.705Z",
    "clientId": "be0500b7-0786-4b23-80e8-bb4d03ca868c",
    "country": {
      "code": "AF",
      "name": "Afghanistan"
    },
    "affiliateNetwork": {
      "id": "001622f8-7ebc-4ab9-baf3-32353ba608b2",
      "name": "Baidu"
    },
    "url": "http://www.TestTestTest.com",
    "tags": []
  };
  res.send(result);
});

/**
 * @apiName 删除Offer
 *
 */
app.delete('/api/offer/:offerId', function (req, res) {
  var result = {
    "status": "SUCCESSFUL",
    "items": [{
      "id": "7178e781-09c7-477d-a3b3-032f2e01547c",
      "name": "TestTestTestTest",
      "status": "SUCCESSFUL",
      "references": []
    }]
  };
  res.send(result);
});

app.get('/api/trafficsources', function (req, res) {
  var result = {
    status: 1,
    message: "",
    data: {
      trafficsources: [
        {id: 10, name: 'traffic-source-1'},
        {id: 2, name: 'traffic-source-2'},
        {id: 3, name: 'traffic-source-3'}
      ]
    }
  };
  res.send(result);
});

app.post('/api/traffic', function (req, res) {
  var item = req.body;
  item.id = 123;
  res.send({item: item});
});

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

app.post('/api/traffic/:id', function (req, res) {
  var result = {
    status: 1,
    message: "",
    data: {
      id: 1,
      name: "traffic1",
      params: []
    }
  };
  res.send({item: req.body});
});

app.delete('/api/traffic/:id', function (req, res) {
  res.send({item: {id: req.params.tsId}});
});

app.post('/traffic/source/status', function (req, res) {
  var item = req.body;
  res.send({item: item});
});

app.get('/api/networks', function (req, res) {
  var result = {
    status: 1,
    message: "",
    data: {
      affiliatenetworks: [
        {id: 10, name: 'affiliate-network-1'},
        {id: 2, name: 'affiliate-network-2'},
        {id: 3, name: 'affiliate-network-3'}
      ]
    }
  };
  res.send(result);
});

app.listen(5000, function () {
  console.log('server started success port : 5000');
});