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
    res.cookie("clientId", "70012cfe-9940-4ebb-8994-6d15195744cc1");
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
        },
        {
          id: 1,
          name: "123"
        },
        {
          id: 1,
          name: "234"
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
        },
        "conversion_PostbackTimestamp": {
          "visible": true
        },
        "conversion_VisitTimestamp": {
          "visible": true
        },
        "conversion_ExternalID": {
          "visible": true
        },
        "conversion_ClickID": {
          "visible": true
        },
        "conversion_TransactionID": {
          "visible": true
        },
        "conversion_Revenue": {
          "visible": true
        },
        "conversion_Cost": {
          "visible": true
        },
        "conversion_CampaignID": {
          "visible": true
        },
        "conversion_CampaignName": {
          "visible": true
        },
        "conversion_LanderName": {
          "visible": true
        },
        "conversion_LanderID": {
          "visible": true
        },
        "conversion_OfferName": {
          "visible": true
        },
        "conversion_OfferID": {
          "visible": true
        },
        "conversion_Country": {
          "visible": true
        },
        "conversion_CountryCode": {
          "visible": true
        },
        "conversion_TrafficSourceName": {
          "visible": true
        },
        "conversion_TrafficSourceID": {
          "visible": true
        },
        "conversion_AffiliateNetworkName": {
          "visible": true
        },
        "conversion_AffiliateNetworkID": {
          "visible": true
        },
        "conversion_Device": {
          "visible": true
        },
        "conversion_OS": {
          "visible": true
        },
        "conversion_OSVersion": {
          "visible": true
        },
        "conversion_Brand": {
          "visible": true
        },
        "conversion_Model": {
          "visible": true
        },
        "conversion_Browser": {
          "visible": true
        },
        "conversion_BrowserVersion": {
          "visible": true
        },
        "conversion_ISP": {
          "visible": true
        },
        "conversion_MobileCarrier": {
          "visible": true
        },
        "conversion_ConnectionType": {
          "visible": true
        },
        "conversion_VisitorIP": {
          "visible": false
        },
        "conversion_VisitorReferrer": {
          "visible": false
        },
        "conversion_V1": {
          "visible": false
        },
        "conversion_V2": {
          "visible": false
        },
        "conversion_V3": {
          "visible": false
        },
        "conversion_V4": {
          "visible": false
        },
        "conversion_V5": {
          "visible": false
        },
        "conversion_V6": {
          "visible": false
        },
        "conversion_V7": {
          "visible": false
        },
        "conversion_V8": {
          "visible": false
        },
        "conversion_V9": {
          "visible": false
        },
        "conversion_V10": {
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
 * @api {post} /api/names  check name exists
 * @apiName    check name exists
 * @apiGroup User
 * @apiParam {String} name
 * @apiParam {Number} type  1:Campaign;2:Lander;3:Offer4:Flow
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "status": 1,
 *       "message": "success"
 *       "data":{
 *           exists:true
 *        }
 *     }
 *
 */
app.post('/api/names', function (req, res) {
  var result = {
    "status": 1,
    "message": "success",
    "data":{
      exists: true
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
      "totalRows": 3700,
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
          "conversions": 1000,
          "cost": 0.5,
          "cpv": 0.0,
          "cr": 0.022894,
          "ctr": 122.28,
          "cv": 0.027996,
          "epc": 0.0,
          "epv": 0.0,
          "errors": 0,
          "ictr": 0.0,
          "impressions": 13430,
          "profit": 1.1,
          "revenue": 3.5,
          "roi": 0.0,
          "visits": 3072,
          "date": "2017-02-20"
        }, {
          [groupBy + "Name"]: groupBy + " 2",
          [groupBy + "Id"]: "2",
          [groupBy + "Hash"]: "78991c6c-52ec-4cc8-a1c6-d968ef64a741",
          "ap": 0.0,
          "bids": 0,
          "clicks": 4868,
          "conversions": 2000,
          "cost": 0.7,
          "cpv": 0.0,
          "cr": 0.022894,
          "ctr": 122.28,
          "cv": 0.027996,
          "epc": 0.0,
          "epv": 0.0,
          "errors": 0,
          "ictr": 0.0,
          "impressions": 0,
          "profit": 0.6,
          "revenue": 2.6,
          "roi": 0.0,
          "visits": 1572,
          "date": "2017-02-21"
        }, {
          [groupBy + "Name"]: groupBy + " 3",
          [groupBy + "Id"]: "3",
          [groupBy + "Hash"]: "78991c6c-52ec-4cc8-a1c6-d968ef64a741",
          "ap": 0.0,
          "bids": 0,
          "clicks": 5135,
          "conversions": 3000,
          "cost": 0.9,
          "cpv": 0.0,
          "cr": 0.022894,
          "ctr": 122.28,
          "cv": 0.027996,
          "epc": 0.0,
          "epv": 0.0,
          "errors": 0,
          "ictr": 0.0,
          "impressions": 0,
          "profit": 3.2,
          "revenue": 6.1,
          "roi": 0.0,
          "visits": 5572,
          "date": "2017-02-22"
        }
      ]
    }
  };
  res.send(result);
});

/**
 * @apiName 获取Conversions
 *
 * @apiParam {String} from:2017-01-11T00:00:00Z
 * @apiParam {String} to:2017-01-12T00:00:00Z
 * @apiParam {String} tz:America/New_York
 * @apiParam {String} sort:visits
 * @apiParam {Number} page:1
 * @apiParam {Number} limit:500
 *
 */
app.get('/api/conversions', function (req, res) {
  var groupBy = req.query.groupBy;
  var result = {
    "status": 1,
    "messages": "",
    data: {
      "totalRows": 3700,
      "totals": {
        "Cost" : 0.0,
        "Revenue" : 10.0
      },
      rows: [
        {
          "PostbackTimestamp": "2017-02-21 01:12:07 AM",
          "VisitTimestamp": "1970-01-01 12:00:00 AM",
          "ExternalID": "18171201102",
          "ClickID": "b1692e08fb1e121e742e5576393ecced",
          "TransactionID": "OPTIONAL",
          "Revenue": 0.96,
          "Cost": 0.001,
          "CampaignName": "popads - Thailand - SexyPhoto1-Adult-TH-AIS",
          "CampaignID": 58,
          "LanderName": "Global - jp",
          "LanderID": 33,
          "OfferName": "mobvista - Thailand - SexyPhoto1-Adult-TH-AIS",
          "OfferID": 32,
          "Country": "THA",
          "CountryCode": "TH",
          "TrafficSourceName": "popads",
          "TrafficSourceID": 40,
          "AffiliateNetworkName": "mobvista",
          "AffiliateNetworkID": 23,
          "Device": "",
          "OS": "Android 6.0",
          "OSVersion": "6.0",
          "Brand": "Unknown",
          "Model": "P500",
          "Browser": "Android",
          "BrowserVersion": "4.0",
          "ISP": "Advanced Info Service",
          "MobileCarrier": "AIS",
          "ConnectionType": "",
          "VisitorIP": "49.230.230.38",
          "VisitorReferrer": "",
          "V1": "{ADBLOCK}",
          "V2": "{BROWSERID}",
          "V3": "{BROWSERNAME}",
          "V4": "{CAMPAIGNID}",
          "V5": "{CAMPAIGNNAME}",
          "V6": "{CATEGORYID}",
          "V7": "{CATEGORYNAME}",
          "V8": "TH",
          "V9": "{DEVICEID}",
          "V10": "{DEVICENAME}"
        }, {
          "PostbackTimestamp": "2017-02-21 01:12:07 AM",
          "VisitTimestamp": "1970-01-01 12:00:00 AM",
          "ExternalID": "18171201102",
          "ClickID": "b1692e08fb1e121e742e5576393ecced",
          "TransactionID": "OPTIONAL",
          "Revenue": 0.96,
          "Cost": 0.001,
          "CampaignName": "popads - Thailand - SexyPhoto1-Adult-TH-AIS",
          "CampaignID": 58,
          "LanderName": "Global - jp",
          "LanderID": 33,
          "OfferName": "mobvista - Thailand - SexyPhoto1-Adult-TH-AIS",
          "OfferID": 32,
          "Country": "THA",
          "CountryCode": "TH",
          "TrafficSourceName": "popads",
          "TrafficSourceID": 40,
          "AffiliateNetworkName": "mobvista",
          "AffiliateNetworkID": 23,
          "Device": "",
          "OS": "Android 6.0",
          "OSVersion": "6.0",
          "Brand": "Unknown",
          "Model": "P500",
          "Browser": "Android",
          "BrowserVersion": "4.0",
          "ISP": "Advanced Info Service",
          "MobileCarrier": "AIS",
          "ConnectionType": "",
          "VisitorIP": "49.230.230.38",
          "VisitorReferrer": "",
          "V1": "{ADBLOCK}",
          "V2": "{BROWSERID}",
          "V3": "{BROWSERNAME}",
          "V4": "{CAMPAIGNID}",
          "V5": "{CAMPAIGNNAME}",
          "V6": "{CATEGORYID}",
          "V7": "{CATEGORYNAME}",
          "V8": "TH",
          "V9": "{DEVICEID}",
          "V10": "{DEVICENAME}"
        }, {
          "PostbackTimestamp": "2017-02-21 01:12:07 AM",
          "VisitTimestamp": "1970-01-01 12:00:00 AM",
          "ExternalID": "18171201102",
          "ClickID": "b1692e08fb1e121e742e5576393ecced",
          "TransactionID": "OPTIONAL",
          "Revenue": 0.96,
          "Cost": 0.001,
          "CampaignName": "popads - Thailand - SexyPhoto1-Adult-TH-AIS",
          "CampaignID": 58,
          "LanderName": "Global - jp",
          "LanderID": 33,
          "OfferName": "mobvista - Thailand - SexyPhoto1-Adult-TH-AIS",
          "OfferID": 32,
          "Country": "THA",
          "CountryCode": "TH",
          "TrafficSourceName": "popads",
          "TrafficSourceID": 40,
          "AffiliateNetworkName": "mobvista",
          "AffiliateNetworkID": 23,
          "Device": "",
          "OS": "Android 6.0",
          "OSVersion": "6.0",
          "Brand": "Unknown",
          "Model": "P500",
          "Browser": "Android",
          "BrowserVersion": "4.0",
          "ISP": "Advanced Info Service",
          "MobileCarrier": "AIS",
          "ConnectionType": "",
          "VisitorIP": "49.230.230.38",
          "VisitorReferrer": "",
          "V1": "{ADBLOCK}",
          "V2": "{BROWSERID}",
          "V3": "{BROWSERNAME}",
          "V4": "{CAMPAIGNID}",
          "V5": "{CAMPAIGNNAME}",
          "V6": "{CATEGORYID}",
          "V7": "{CATEGORYNAME}",
          "V8": "TH",
          "V9": "{DEVICEID}",
          "V10": "{DEVICENAME}"
        }
      ]
    }
  };
  delayResponse(res, result);
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
      "name": "TrafficSource1 - China - campaign.1",
      "hash": "campaign.1.hash",
      "url": "http://zhanchenxing.newbidder.com/campaign.1/",
      "impPixelUrl": "http://zhanchenxing.newbidder.com/impression/campaign.1/",
      "trafficSourceId": 19,
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
        "id": 19,
        "name": "TrafficSource1",
        "cost": "{\"Parameter\":\"bid\",\"Placeholder\":\"{bid}\"}",
        "externalId": "{\"Parameter\":\"click_id\",\"Placeholder\":\"{click_id}\"}",
        "hash": "dba9cb56-8e0b-4935-9b69-b1ae049128c4",
        "postbackUrl": "http://www.traffic.com",
        "pixelRedirectUrl": "",
        "impTracking": 1,
        "params": "[{\"Parameter\":\"WEBSITE\",\"Placeholder\":\"{WEBSITE}\",\"Name\":\"WEBSITE\",\"Track\":1},{\"Parameter\":\"\",\"Placeholder\":\"\",\"Name\":\"\",\"Track\":0},{\"Parameter\":\"\",\"Placeholder\":\"\",\"Name\":\"\",\"Track\":0},{\"Parameter\":\"\",\"Placeholder\":\"\",\"Name\":\"\",\"Track\":0},{\"Parameter\":\"\",\"Placeholder\":\"\",\"Name\":\"\",\"Track\":0},{\"Parameter\":\"\",\"Placeholder\":\"\",\"Name\":\"\",\"Track\":0},{\"Parameter\":\"\",\"Placeholder\":\"\",\"Name\":\"\",\"Track\":0},{\"Parameter\":\"\",\"Placeholder\":\"\",\"Name\":\"\",\"Track\":0},{\"Parameter\":\"\",\"Placeholder\":\"\",\"Name\":\"\",\"Track\":0},{\"Parameter\":\"\",\"Placeholder\":\"\",\"Name\":\"\",\"Track\":0}]"
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
      "country": "CHN",
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
          "id": "8584",
          "operand": "isnt",
          "city": "xiamen",
          "_city": {"xiamen":"Xiamen"}
        }, {
          "id": "8588",
          "operand": "is",
          "region": ["xiamen", "shanghai"],
          "_region": {"xiamen":"Xiamen", "shanghai":"Shanghai"}
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
    status: 1,
    message: "",
    data: {
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
    }
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
      "name": "Japan - SecurityAlert-en",
      "hash": "",
      "url": "http://s.ktrack.net/w/SecurityAlert.php",
      "country": "JPN",
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
  var result = [{"id": 46, "name": "Lander12", "country": "us"}, {
    "id": 47,
    "name": "Lander1",
    "country": "us"
  }, {"id": 49, "name": "Lander2", "country": "cn"}, {"id": 50, "name": "Lander3", "country": "us"}, {
    "id": 54,
    "name": "Lander4",
    "country": "ca"
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
      "id": 3245,
      "name": "Global - SecurityAlert-en",
      "url": "http://s.ktrack.net/w/SecurityAlert.php",
      "country": "us",
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
      "id": 49,
      "name": "Global - SecurityAlert-en",
      "url": "http://s.ktrack.net/w/SecurityAlert.php",
      "country": "us",
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
      "name": "affilate1 - China - Offer1",
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
    "country": "cn"
  }, {"id": 41, "name": "Offer2", "country": "ca"}, {"id": 42, "name": "Offer3", "country": "cn"}, {
    "id": 43,
    "name": "Offer4",
    "country": "us"
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
      "id": 3,
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
    status: 0,
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
      "trafficsources": [
        {
          "id": 19,
          "name": "TrafficSource1",
          "cost": "{\"Parameter\":\"bid\",\"Placeholder\":\"{bid}\"}",
          "externalId": "{\"Parameter\":\"click_id\",\"Placeholder\":\"{click_id}\"}",
          "campaignId": "{}",
          "websiteId": "{}",
          "hash": "dba9cb56-8e0b-4935-9b69-b1ae049128c4",
          "postbackUrl": "http://www.traffic.com",
          "pixelRedirectUrl": "",
          "impTracking": 1,
          "params": "[{\"Parameter\":\"WEBSITE\",\"Placeholder\":\"{WEBSITE}\",\"Name\":\"WEBSITE\",\"Track\":1},{\"Parameter\":\"\",\"Placeholder\":\"\",\"Name\":\"\",\"Track\":0},{\"Parameter\":\"\",\"Placeholder\":\"\",\"Name\":\"\",\"Track\":0},{\"Parameter\":\"\",\"Placeholder\":\"\",\"Name\":\"\",\"Track\":0},{\"Parameter\":\"\",\"Placeholder\":\"\",\"Name\":\"\",\"Track\":0},{\"Parameter\":\"\",\"Placeholder\":\"\",\"Name\":\"\",\"Track\":0},{\"Parameter\":\"\",\"Placeholder\":\"\",\"Name\":\"\",\"Track\":0},{\"Parameter\":\"\",\"Placeholder\":\"\",\"Name\":\"\",\"Track\":0},{\"Parameter\":\"\",\"Placeholder\":\"\",\"Name\":\"\",\"Track\":0},{\"Parameter\":\"\",\"Placeholder\":\"\",\"Name\":\"\",\"Track\":0}]"
        },
        {
          "id": 20,
          "name": "TrafficSource2",
          "cost": "{}",
          "campaignId": "{}",
          "websiteId": "{}",
          "hash": "b247e517-4811-4c4a-801c-2d86b3a7a0cb",
          "postbackUrl": "www.traffic.com",
          "pixelRedirectUrl": "",
          "impTracking": 0,
          "params": "[{\"Parameter\":\"WEBSITE\",\"Placeholder\":\"{WEBSITE}\",\"Name\":\"WEBSITE\",\"Track\":0},{\"Parameter\":\"\",\"Placeholder\":\"\",\"Name\":\"\",\"Track\":0},{\"Parameter\":\"\",\"Placeholder\":\"\",\"Name\":\"\",\"Track\":0},{\"Parameter\":\"\",\"Placeholder\":\"\",\"Name\":\"\",\"Track\":0},{\"Parameter\":\"\",\"Placeholder\":\"\",\"Name\":\"\",\"Track\":0},{\"Parameter\":\"\",\"Placeholder\":\"\",\"Name\":\"\",\"Track\":0},{\"Parameter\":\"\",\"Placeholder\":\"\",\"Name\":\"\",\"Track\":0},{\"Parameter\":\"\",\"Placeholder\":\"\",\"Name\":\"\",\"Track\":0},{\"Parameter\":\"\",\"Placeholder\":\"\",\"Name\":\"\",\"Track\":0},{\"Parameter\":\"\",\"Placeholder\":\"\",\"Name\":\"\",\"Track\":0}]"
        }
      ]
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
      "campaignId": "{}",
      "websiteId": "{}",
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
      "campaignId": "{}",
      "websiteId": "{}",
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
      "campaignId": "{}",
      "websiteId": "{}",
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
  var result = {"status":1,"message":"success","data":{"lists":[{"id":1,"name":"AirPush.com","postbackUrl":"http://api.airpush.com/track/?guid={clickid}","pixelRedirectUrl":"","externalId":"{\"Parameter\":\"guid\",\"Placeholder\":\"%guid%\",\"Name\":\"guid\"}","cost":"{}","params":"[{\"Track\": 1, \"Placeholder\": \"%carrier%\", \"Parameter\": \"carrier\", \"Name\": \"carrier\"}, {\"Track\": 1, \"Placeholder\": \"%d%\", \"Parameter\": \"d\", \"Name\": \"d\"}, {\"Track\": 1, \"Placeholder\": \"%device%\", \"Parameter\": \"device\", \"Name\": \"device\"}, {\"Track\": 1, \"Placeholder\": \"%manufacturer%\", \"Parameter\": \"manufacturer\", \"Name\": \"manufacturer\"}, {\"Track\": 1, \"Placeholder\": \"%creativeid%\", \"Parameter\": \"creativeid\", \"Name\": \"creativeid\"}, {\"Track\": 1, \"Placeholder\": \"%ip%\", \"Parameter\": \"ip\", \"Name\": \"ip\"}, {\"Track\": 1, \"Placeholder\": \"%dapp%\", \"Parameter\": \"dapp\", \"Name\": \"dapp\"}, {\"Track\": 1, \"Placeholder\": \"%city%\", \"Parameter\": \"city\", \"Name\": \"city\"}, {\"Track\": 1, \"Placeholder\": \"%state%\", \"Parameter\": \"state\", \"Name\": \"state\"}, {\"Track\": 1, \"Placeholder\": \"%androidid%\", \"Parameter\": \"androidid\", \"Name\": \"androidid\"}]","campaignId":"{\"Parameter\":\"campaignid\",\"Placeholder\":\"%campaignid%\",\"Name\":\"campaignid\"}","websiteId":"{\"Parameter\":\"pubid\",\"Placeholder\":\"%pubid%\",\"Name\":\"pubid\"}"},{"id":2,"name":"popads.com","postbackUrl":"http://serve.popads.net/cpixel.php?s2s=1&aid=b18b7ac1b27b01fdada779adf1b51fdb&id=impressionId&value=conversionValue","pixelRedirectUrl":"","externalId":"{\"Parameter\":\"IMPRESSIONID\",\"Placeholder\":\"[IMPRESSIONID]\",\"Name\":\"IMPRESSIONID\"}","cost":"{\"Parameter\":\"BID\",\"Placeholder\":\"[BID]\",\"Name\":\"BID\"}","params":"[{\"Track\": 1, \"Placeholder\": \"[ADBLOCK]\", \"Parameter\": \"ADBLOCK\", \"Name\": \"ADBLOCK\"}, {\"Track\": 1, \"Placeholder\": \"[BROWSERID]\", \"Parameter\": \"BROWSERID\", \"Name\": \"BROWSERID\"}, {\"Track\": 1, \"Placeholder\": \"[BROWSERNAME]\", \"Parameter\": \"BROWSERNAME\", \"Name\": \"BROWSERNAME\"}, {\"Track\": 1, \"Placeholder\": \"[CAMPAIGNNAME]\", \"Parameter\": \"CAMPAIGNNAME\", \"Name\": \"CAMPAIGNNAME\"}, {\"Track\": 1, \"Placeholder\": \"[CATEGORYID]\", \"Parameter\": \"CATEGORYID\", \"Name\": \"CATEGORYID\"}, {\"Track\": 1, \"Placeholder\": \"[CATEGORYNAME]\", \"Parameter\": \"CATEGORYNAME\", \"Name\": \"CATEGORYNAME\"}, {\"Track\": 1, \"Placeholder\": \"[COUNTRY]\", \"Parameter\": \"COUNTRY\", \"Name\": \"COUNTRY\"}, {\"Track\": 1, \"Placeholder\": \"[DEVICEID]\", \"Parameter\": \"DEVICEID\", \"Name\": \"DEVICEID\"}, {\"Track\": 1, \"Placeholder\": \"[DEVICENAME]\", \"Parameter\": \"DEVICENAME\", \"Name\": \"DEVICENAME\"}, {\"Track\": 1, \"Placeholder\": \"[FORMFACTORID]\", \"Parameter\": \"FORMFACTORID\", \"Name\": \"FORMFACTORID\"}]","campaignId":"{\"Parameter\":\"CAMPAIGNID\",\"Placeholder\":\"[CAMPAIGNID]\",\"Name\":\"CAMPAIGNID\"}","websiteId":"{\"Parameter\":\"WEBSITEID\",\"Placeholder\":\"[WEBSITEID]\",\"Name\":\"WEBSITEID\"}"},{"id":3,"name":"PropellerAds.com","postbackUrl":"http://ad.propellerads.com/conversion.php?aid=45412&pid=&tid=11006&visitor_id=[[c4]]","pixelRedirectUrl":"","externalId":"{\"Parameter\":\"SUBID\",\"Placeholder\":\"${SUBID}\",\"Name\":\"SUBID\"}","cost":"{}","params":"[{\"Track\": 1, \"Placeholder\": \"{bannerid}\", \"Parameter\": \"bannerid\", \"Name\": \"bannerid\"}]","campaignId":"{\"Parameter\":\"campaignid\",\"Placeholder\":\"{campaignid}\",\"Name\":\"campaignid\"}","websiteId":"{\"Parameter\":\"zoneid\",\"Placeholder\":\"{zoneid}\",\"Name\":\"zoneid\"}"},{"id":4,"name":"JuicyAds.com","postbackUrl":"","pixelRedirectUrl":"","externalId":"{}","cost":"{}","params":"[{\"Track\": 1, \"Placeholder\": \"{dynamicCON}\", \"Parameter\": \"dynamicCON\", \"Name\": \"dynamicCON\"}, {\"Track\": 1, \"Placeholder\": \"{dynamicDATE}\", \"Parameter\": \"dynamicDATE\", \"Name\": \"dynamicDATE\"}, {\"Track\": 1, \"Placeholder\": \"{dynamicDOS}\", \"Parameter\": \"dynamicDOS\", \"Name\": \"dynamicDOS\"}, {\"Track\": 1, \"Placeholder\": \"{dynamicDTY}\", \"Parameter\": \"dynamicDTY\", \"Name\": \"dynamicDTY\"}, {\"Track\": 1, \"Placeholder\": \"{dynamicGEO}\", \"Parameter\": \"dynamicGEO\", \"Name\": \"dynamicGEO\"}, {\"Track\": 1, \"Placeholder\": \"{dynamicHOUR}\", \"Parameter\": \"dynamicHOUR\", \"Name\": \"dynamicHOUR\"}, {\"Track\": 1, \"Placeholder\": \"{dynamicIMG}\", \"Parameter\": \"dynamicIMG\", \"Name\": \"dynamicIMG\"}, {\"Track\": 1, \"Placeholder\": \"{dynamicPUB}\", \"Parameter\": \"dynamicPUB\", \"Name\": \"dynamicPUB\"}, {\"Track\": 1, \"Placeholder\": \"{dynamicZNE}\", \"Parameter\": \"dynamicZNE\", \"Name\": \"dynamicZNE\"}]","campaignId":"{\"Parameter\":\"dynamicCMP\",\"Placeholder\":\"{dynamicCMP}\",\"Name\":\"dynamicCMP\"}","websiteId":"{\"Parameter\":\"dynamicSITE\",\"Placeholder\":\"{dynamicSITE}\",\"Name\":\"dynamicSITE\"}"},{"id":5,"name":"RevContent.com","postbackUrl":"","pixelRedirectUrl":"","externalId":"{}","cost":"{}","params":"[{\"Track\": 1, \"Placeholder\": \"{adv_targets}\", \"Parameter\": \"adv_targets\", \"Name\": \"adv_targets\"}, {\"Track\": 1, \"Placeholder\": \"{boost_id}\", \"Parameter\": \"boost_id\", \"Name\": \"boost_id\"}, {\"Track\": 1, \"Placeholder\": \"{widget_id}\", \"Parameter\": \"widget_id\", \"Name\": \"widget_id\"}]","campaignId":"{\"Parameter\":\"boost_id\",\"Placeholder\":\"{boost_id}\",\"Name\":\"boost_id\"}","websiteId":"{\"Parameter\":\"content_id\",\"Placeholder\":\"{content_id}\",\"Name\":\"content_id\"}"},{"id":6,"name":"TrafficJunky.com","postbackUrl":"","pixelRedirectUrl":"","externalId":"{}","cost":"{\"Parameter\":\"BidValue\",\"Placeholder\":\"{BidValue}\",\"Name\":\"BidValue\"}","params":"[{\"Track\": 1, \"Placeholder\": \"{AdID}\", \"Parameter\": \"AdID\", \"Name\": \"AdID\"}, {\"Track\": 1, \"Placeholder\": \"{BanID}\", \"Parameter\": \"BanID\", \"Name\": \"BanID\"}, {\"Track\": 1, \"Placeholder\": \"{BanName}\", \"Parameter\": \"BanName\", \"Name\": \"BanName\"}, {\"Track\": 1, \"Placeholder\": \"{Location}\", \"Parameter\": \"Location\", \"Name\": \"Location\"}, {\"Track\": 1, \"Placeholder\": \"{SiteName}\", \"Parameter\": \"SiteName\", \"Name\": \"SiteName\"}]","campaignId":"{\"Parameter\":\"CampaignID\",\"Placeholder\":\"{CampaignID}\",\"Name\":\"CampaignID\"}","websiteId":"{\"Parameter\":\"SpotName\",\"Placeholder\":\"{SpotName}\",\"Name\":\"SpotName\"}"},{"id":7,"name":"taboola.com","postbackUrl":"","pixelRedirectUrl":"","externalId":"{}","cost":"{}","params":"[{\"Track\": 1, \"Placeholder\": \"{thumbnail}\", \"Parameter\": \"thumbnail\", \"Name\": \"thumbnail\"}, {\"Track\": 1, \"Placeholder\": \"{title}\", \"Parameter\": \"title\", \"Name\": \"title\"}]","campaignId":"{\"Parameter\":\"campaign\",\"Placeholder\":\"{campaign}\",\"Name\":\"campaign\"}","websiteId":"{\"Parameter\":\"site\",\"Placeholder\":\"{site}\",\"Name\":\"site\"}"},{"id":8,"name":"TrafficFactory.biz","postbackUrl":"","pixelRedirectUrl":"","externalId":"{}","cost":"{}","params":"[{\"Track\": 1, \"Placeholder\": \"{target.bid}\", \"Parameter\": \"target.bid\", \"Name\": \"target.bid\"}, {\"Track\": 1, \"Placeholder\": \"{banner.id}\", \"Parameter\": \"banner.id\", \"Name\": \"banner.id\"}, {\"Track\": 1, \"Placeholder\": \"{banner.name}\", \"Parameter\": \"banner.name\", \"Name\": \"banner.name\"}, {\"Track\": 1, \"Placeholder\": \"{banner.size}\", \"Parameter\": \"banner.size\", \"Name\": \"banner.size\"}, {\"Track\": 1, \"Placeholder\": \"{categories}\", \"Parameter\": \"categories\", \"Name\": \"categories\"}, {\"Track\": 1, \"Placeholder\": \"{time.stamp}\", \"Parameter\": \"time.stamp\", \"Name\": \"time.stamp\"}, {\"Track\": 1, \"Placeholder\": \"{user.browser}\", \"Parameter\": \"user.browser\", \"Name\": \"user.browser\"}, {\"Track\": 1, \"Placeholder\": \"{user.country}\", \"Parameter\": \"user.country\", \"Name\": \"user.country\"}, {\"Track\": 1, \"Placeholder\": \"{user.browser}\", \"Parameter\": \"user.browser\", \"Name\": \"user.browser\"}, {\"Track\": 1, \"Placeholder\": \"{user.os}\", \"Parameter\": \"user.os\", \"Name\": \"user.os\"}]","campaignId":"{\"Parameter\":\"campaign.id\",\"Placeholder\":\"{campaign.id}\",\"Name\":\"campaign.id\"}","websiteId":"{\"Parameter\":\"target.name\",\"Placeholder\":\"{target.name}\",\"Name\":\"target.name\"}"},{"id":9,"name":"AdCash.com","postbackUrl":"","pixelRedirectUrl":"","externalId":"{\"Parameter\":\"clickid\",\"Placeholder\":\"[clickid]\",\"Name\":\"clickid\"}","cost":"{}","params":"[{\"Track\": 1, \"Placeholder\": \"[country]\", \"Parameter\": \"country\", \"Name\": \"country\"}, {\"Track\": 1, \"Placeholder\": \"[lang]\", \"Parameter\": \"lang\", \"Name\": \"lang\"}, {\"Track\": 1, \"Placeholder\": \"[time]\", \"Parameter\": \"time\", \"Name\": \"time\"}]","campaignId":"{\"Parameter\":\"campaign\",\"Placeholder\":\"[campaign]\",\"Name\":\"campaign\"}","websiteId":"{\"Parameter\":\"zone\",\"Placeholder\":\"[zone]\",\"Name\":\"zone\"}"},{"id":10,"name":"Ero-Advertising.com","postbackUrl":"","pixelRedirectUrl":"","externalId":"{\"Parameter\":\"tracking\",\"Placeholder\":\"[tracking]\",\"Name\":\"tracking\"}","cost":"{}","params":"[{\"Track\": 1, \"Placeholder\": \"[adid]\", \"Parameter\": \"adid\", \"Name\": \"adid\"}, {\"Track\": 1, \"Placeholder\": \"[country]\", \"Parameter\": \"country\", \"Name\": \"country\"}, {\"Track\": 1, \"Placeholder\": \"[domainid]\", \"Parameter\": \"domainid\", \"Name\": \"domainid\"}, {\"Track\": 1, \"Placeholder\": \"[timestamp]\", \"Parameter\": \"timestamp\", \"Name\": \"timestamp\"}, {\"Track\": 1, \"Placeholder\": \"[spaceid]\", \"Parameter\": \"spaceid\", \"Name\": \"spaceid\"}]","campaignId":"{\"Parameter\":\"campaignid\",\"Placeholder\":\"[campaignid]\",\"Name\":\"campaignid\"}","websiteId":"{\"Parameter\":\"spaceid\",\"Placeholder\":\"[spaceid]\",\"Name\":\"spaceid\"}"},{"id":11,"name":"ExoClick.com","postbackUrl":"","pixelRedirectUrl":"","externalId":"{\"Parameter\":\"conversions_tracking\",\"Placeholder\":\"{conversions_tracking}\",\"Name\":\"conversions_tracking\"}","cost":"{\"Parameter\":\"cost\",\"Placeholder\":\"{cost}\",\"Name\":\"cost\"}","params":"[{\"Track\": 1, \"Placeholder\": \"{category_id}\", \"Parameter\": \"category_id\", \"Name\": \"category_id\"}, {\"Track\": 1, \"Placeholder\": \"{country}\", \"Parameter\": \"country\", \"Name\": \"country\"}, {\"Track\": 1, \"Placeholder\": \"{format}\", \"Parameter\": \"format\", \"Name\": \"format\"}, {\"Track\": 1, \"Placeholder\": \"{site_id}\", \"Parameter\": \"site_id\", \"Name\": \"site_id\"}, {\"Track\": 1, \"Placeholder\": \"{src_hostname}\", \"Parameter\": \"src_hostname\", \"Name\": \"src_hostname\"}, {\"Track\": 1, \"Placeholder\": \"{time}\", \"Parameter\": \"time\", \"Name\": \"time\"}, {\"Track\": 1, \"Placeholder\": \"{variation_id}\", \"Parameter\": \"variation_id\", \"Name\": \"variation_id\"}]","campaignId":"{\"Parameter\":\"campaign_id\",\"Placeholder\":\"{campaign_id}\",\"Name\":\"campaign_id\"}","websiteId":"{\"Parameter\":\"zone_id\",\"Placeholder\":\"{zone_id}\",\"Name\":\"zone_id\"}"},{"id":12,"name":"Go2Mobi.com","postbackUrl":"","pixelRedirectUrl":"","externalId":"{\"Parameter\":\"clickid\",\"Placeholder\":\"{clickid}\",\"Name\":\"clickid\"}","cost":"{}","params":"[{\"Track\": 1, \"Placeholder\": \"{agent}\", \"Parameter\": \"agent\", \"Name\": \"agent\"}, {\"Track\": 1, \"Placeholder\": \"{cc}\", \"Parameter\": \"cc\", \"Name\": \"cc\"}, {\"Track\": 1, \"Placeholder\": \"{city}\", \"Parameter\": \"city\", \"Name\": \"city\"}, {\"Track\": 1, \"Placeholder\": \"{country}\", \"Parameter\": \"country\", \"Name\": \"country\"}, {\"Track\": 1, \"Placeholder\": \"{crid}\", \"Parameter\": \"crid\", \"Name\": \"crid\"}, {\"Track\": 1, \"Placeholder\": \"{device_model}\", \"Parameter\": \"device_model\", \"Name\": \"device_model\"}, {\"Track\": 1, \"Placeholder\": \"{device_vendor}\", \"Parameter\": \"device_vendor\", \"Name\": \"device_vendor\"}, {\"Track\": 1, \"Placeholder\": \"{imp}\", \"Parameter\": \"imp\", \"Name\": \"imp\"}, {\"Track\": 1, \"Placeholder\": \"{ip}\", \"Parameter\": \"ip\", \"Name\": \"ip\"}, {\"Track\": 1, \"Placeholder\": \"{isp}\", \"Parameter\": \"isp\", \"Name\": \"isp\"}]","campaignId":"{\"Parameter\":\"campaign\",\"Placeholder\":\"{campaign}\",\"Name\":\"campaign\"}","websiteId":"{\"Parameter\":\"plid\",\"Placeholder\":\"{plid}\",\"Name\":\"plid\"}"},{"id":13,"name":"OutBrain.com","postbackUrl":"http://www.yourdomain.com/article?utm_term={{origsrcid}}&utm_source={{ad_id}}","pixelRedirectUrl":"","externalId":"{}","cost":"{}","params":"[{\"Track\": 1, \"Placeholder\": \"{{ad_id}}\", \"Parameter\": \"ad_id\", \"Name\": \"ad_id\"}, {\"Track\": 1, \"Placeholder\": \"{{ad_title}}\", \"Parameter\": \"ad_title\", \"Name\": \"ad_title\"}, {\"Track\": 1, \"Placeholder\": \"{{doc_title}}\", \"Parameter\": \"doc_title\", \"Name\": \"doc_title\"}, {\"Track\": 1, \"Placeholder\": \"{{time_stamp}}\", \"Parameter\": \"time_stamp\", \"Name\": \"time_stamp\"}]","campaignId":"{}","websiteId":"{\"Parameter\":\"origsrcid\",\"Placeholder\":\"{{origsrcid}}\",\"Name\":\"origsrcid\"}"},{"id":14,"name":"PopCash.net","postbackUrl":"","pixelRedirectUrl":"","externalId":"{}","cost":"{}","params":"[{\"Track\": 1, \"Placeholder\": \"%category%\", \"Parameter\": \"category\", \"Name\": \"category\"}, {\"Track\": 1, \"Placeholder\": \"%cc%\", \"Parameter\": \"cc\", \"Name\": \"cc\"}, {\"Track\": 1, \"Placeholder\": \"%operatingsystem%\", \"Parameter\": \"operatingsystem\", \"Name\": \"operatingsystem\"}]","campaignId":"{}","websiteId":"{\"Parameter\":\"siteid\",\"Placeholder\":\"%siteid%\",\"Name\":\"siteid\"}"},{"id":15,"name":"reporo.com","postbackUrl":"","pixelRedirectUrl":"","externalId":"{\"Parameter\":\"rcid\",\"Placeholder\":\"{rcid}\",\"Name\":\"rcid\"}","cost":"{}","params":"[{\"Track\": 1, \"Placeholder\": \"{repBannerid}\", \"Parameter\": \"repBannerid\", \"Name\": \"repBannerid\"}, {\"Track\": 1, \"Placeholder\": \"{repCpcid}\", \"Parameter\": \"repCpcid\", \"Name\": \"repCpcid\"}]","campaignId":"{\"Parameter\":\"repCampaignid\",\"Placeholder\":\"{repCampaignid}\",\"Name\":\"repCampaignid\"}","websiteId":"{\"Parameter\":\"repZoneid\",\"Placeholder\":\"{repZoneid}\",\"Name\":\"repZoneid\"}"},{"id":16,"name":"POF.com","postbackUrl":"","pixelRedirectUrl":"","externalId":"{\"Parameter\":\"clickid\",\"Placeholder\":\"{clickid}\",\"Name\":\"clickid\"}","cost":"{}","params":"[{\"Track\": 1, \"Placeholder\": \"{age:}\", \"Parameter\": \"age\", \"Name\": \"age\"}, {\"Track\": 1, \"Placeholder\": \"{city:}\", \"Parameter\": \"city\", \"Name\": \"city\"}, {\"Track\": 1, \"Placeholder\": \"{creativeid:}\", \"Parameter\": \"creativeid\", \"Name\": \"creativeid\"}, {\"Track\": 1, \"Placeholder\": \"{gender:}\", \"Parameter\": \"gender\", \"Name\": \"gender\"}, {\"Track\": 1, \"Placeholder\": \"{state:}\", \"Parameter\": \"state\", \"Name\": \"state\"}]","campaignId":"{}","websiteId":"{}"},{"id":17,"name":"ZeroPark.com","postbackUrl":"http://postback.zeroredirect1.com/zppostback/XXXXXX-XXXX-XXXX-XXXX-XXXXXX?cid={clickid}","pixelRedirectUrl":"","externalId":"{\"Parameter\":\"cid\",\"Placeholder\":\"{cid}\",\"Name\":\"cid\"}","cost":"{}","params":"[{\"Track\": 1, \"Placeholder\": \"{campaign_name}\", \"Parameter\": \"campaign_name\", \"Name\": \"campaign_name\"}, {\"Track\": 1, \"Placeholder\": \"{geo}\", \"Parameter\": \"geo\", \"Name\": \"geo\"}, {\"Track\": 1, \"Placeholder\": \"{keyword}\", \"Parameter\": \"keyword\", \"Name\": \"keyword\"}, {\"Track\": 1, \"Placeholder\": \"{long_campaign_id}\", \"Parameter\": \"long_campaign_id\", \"Name\": \"long_campaign_id\"}, {\"Track\": 1, \"Placeholder\": \"{match}\", \"Parameter\": \"match\", \"Name\": \"match\"}, {\"Track\": 1, \"Placeholder\": \"{target_url}\", \"Parameter\": \"target_url\", \"Name\": \"target_url\"}, {\"Track\": 1, \"Placeholder\": \"{traffic_type}\", \"Parameter\": \"traffic_type\", \"Name\": \"traffic_type\"}, {\"Track\": 1, \"Placeholder\": \"{visitor_type}\", \"Parameter\": \"visitor_type\", \"Name\": \"visitor_type\"}]","campaignId":"{\"Parameter\":\"campaign_id\",\"Placeholder\":\"{campaign_id}\",\"Name\":\"campaign_id\"}","websiteId":"{\"Parameter\":\"target\",\"Placeholder\":\"{target}\",\"Name\":\"target\"}"},{"id":18,"name":"adxpansion.com","postbackUrl":"https://api.adxpansion.com/v1/conversions/ log?token=YOUR-API-TOKEN&id=transactionID","pixelRedirectUrl":"","externalId":"{\"Parameter\":\"transactionID\",\"Placeholder\":\"{transactionID}\",\"Name\":\"transactionID\"}","cost":"{}","params":"[{\"Track\": 1, \"Placeholder\": \"{adgroupID}\", \"Parameter\": \"adgroupID\", \"Name\": \"adgroupID\"}, {\"Track\": 1, \"Placeholder\": \"{carrier}\", \"Parameter\": \"carrier\", \"Name\": \"carrier\"}, {\"Track\": 1, \"Placeholder\": \"{connectiontype}\", \"Parameter\": \"connectiontype\", \"Name\": \"connectiontype\"}, {\"Track\": 1, \"Placeholder\": \"{country}\", \"Parameter\": \"country\", \"Name\": \"country\"}, {\"Track\": 1, \"Placeholder\": \"{creativeID}\", \"Parameter\": \"creativeID\", \"Name\": \"creativeID\"}, {\"Track\": 1, \"Placeholder\": \"{date}\", \"Parameter\": \"date\", \"Name\": \"date\"}, {\"Track\": 1, \"Placeholder\": \"{keyword}\", \"Parameter\": \"keyword\", \"Name\": \"keyword\"}]","campaignId":"{\"Parameter\":\"campaignID\",\"Placeholder\":\"{campaignID}\",\"Name\":\"campaignID\"}","websiteId":"{\"Parameter\":\"zone\",\"Placeholder\":\"{zone}\",\"Name\":\"zone\"}"},{"id":19,"name":"MGID.com","postbackUrl":"","pixelRedirectUrl":"","externalId":"{}","cost":"{}","params":"[{\"Track\": 1, \"Placeholder\": \"{teaser_id}\", \"Parameter\": \"teaser_id\", \"Name\": \"teaser_id\"}]","campaignId":"{}","websiteId":"{\"Parameter\":\"widget_id\",\"Placeholder\":\"{widget_id}\",\"Name\":\"widget_id\"}"},{"id":20,"name":"MobFox.com","postbackUrl":"http://my.mobfox.com/conversion.track.php?account_id=UNIQUEID&click_id={clickid}","pixelRedirectUrl":"","externalId":"{\"Parameter\":\"MFOXCLICKID\",\"Placeholder\":\"MFOXCLICKID\",\"Name\":\"MFOXCLICKID\"}","cost":"{}","params":"[{\"Track\": 1, \"Placeholder\": \"MFOXADID\", \"Parameter\": \"MFOXADID\", \"Name\": \"MFOXADID\"}, {\"Track\": 1, \"Placeholder\": \"MFOXAGID\", \"Parameter\": \"MFOXAGID\", \"Name\": \"MFOXAGID\"}, {\"Track\": 1, \"Placeholder\": \"MFOXGAID\", \"Parameter\": \"MFOXGAID\", \"Name\": \"MFOXGAID\"}, {\"Track\": 1, \"Placeholder\": \"MFOXIFA\", \"Parameter\": \"MFOXIFA\", \"Name\": \"MFOXIFA\"}, {\"Track\": 1, \"Placeholder\": \"MFOXUDID\", \"Parameter\": \"MFOXUDID\", \"Name\": \"MFOXUDID\"}, {\"Track\": 1, \"Placeholder\": \"MFOXTSTAMP\", \"Parameter\": \"MFOXTSTAMP\", \"Name\": \"MFOXTSTAMP\"}, {\"Track\": 1, \"Placeholder\": \"RANDOMNR\", \"Parameter\": \"RANDOMNR\", \"Name\": \"RANDOMNR\"}]","campaignId":"{\"Parameter\":\"MFOXCAID\",\"Placeholder\":\"MFOXCAID\",\"Name\":\"MFOXCAID\"}","websiteId":"{\"Parameter\":\"MFOXPUBID\",\"Placeholder\":\"MFOXPUBID\",\"Name\":\"MFOXPUBID\"}"},{"id":21,"name":"NativeAds.com","postbackUrl":"","pixelRedirectUrl":"","externalId":"{}","cost":"{}","params":"[{\"Track\": 1, \"Placeholder\": \"{ad_id}\", \"Parameter\": \"ad_id\", \"Name\": \"ad_id\"}, {\"Track\": 1, \"Placeholder\": \"{ad_title}\", \"Parameter\": \"ad_title\", \"Name\": \"ad_title\"}, {\"Track\": 1, \"Placeholder\": \"{campaign_name}\", \"Parameter\": \"campaign_name\", \"Name\": \"campaign_name\"}, {\"Track\": 1, \"Placeholder\": \"{device}\", \"Parameter\": \"device\", \"Name\": \"device\"}]","campaignId":"{\"Parameter\":\"campaign_ID\",\"Placeholder\":\"{campaign_ID}\",\"Name\":\"campaign_ID\"}","websiteId":"{\"Parameter\":\"widget_id\",\"Placeholder\":\"{widget_id}\",\"Name\":\"widget_id\"}"},{"id":22,"name":"AdWill.co","postbackUrl":"http://click.adwill.co/conversion?c1=[CLICKID]","pixelRedirectUrl":"","externalId":"{\"Parameter\":\"CLICKID\",\"Placeholder\":\"{CLICKID}\",\"Name\":\"CLICKID\"}","cost":"{}","params":"[]","campaignId":"{}","websiteId":"{}"},{"id":23,"name":"50onRed.com","postbackUrl":"","pixelRedirectUrl":"","externalId":"{\"Parameter\":\"click_id\",\"Placeholder\":\"{click_id}\",\"Name\":\"click_id\"}","cost":"{\"Parameter\":\"bid\",\"Placeholder\":\"{bid}\",\"Name\":\"bid\"}","params":"[{\"Track\": 1, \"Placeholder\": \"{keyword}\", \"Parameter\": \"keyword\", \"Name\": \"keyword\"}, {\"Track\": 1, \"Placeholder\": \"{keyword_id}\", \"Parameter\": \"keyword_id\", \"Name\": \"keyword_id\"}, {\"Track\": 1, \"Placeholder\": \"{creative_id}\", \"Parameter\": \"creative_id\", \"Name\": \"creative_id\"}, {\"Track\": 1, \"Placeholder\": \"{country}\", \"Parameter\": \"country\", \"Name\": \"country\"}]","campaignId":"{\"Parameter\":\"campaign_id\",\"Placeholder\":\"{campaign_id}\",\"Name\":\"campaign_id\"}","websiteId":"{}"},{"id":24,"name":"admoda.com","postbackUrl":"","pixelRedirectUrl":"","externalId":"{\"Parameter\":\"clickid\",\"Placeholder\":\"%clickid%\",\"Name\":\"clickid\"}","cost":"{\"Parameter\":\"cpc-usd\",\"Placeholder\":\"%cpc-usd%\",\"Name\":\"cpc-usd\"}","params":"[{\"Track\": 1, \"Placeholder\": \"%adid%\", \"Parameter\": \"adid\", \"Name\": \"adid\"}, {\"Track\": 1, \"Placeholder\": \"%cpc%\", \"Parameter\": \"cpc\", \"Name\": \"cpc\"}]","campaignId":"{\"Parameter\":\"campaignid\",\"Placeholder\":\"%campaignid%\",\"Name\":\"campaignid\"}","websiteId":"{\"Parameter\":\"zoneid\",\"Placeholder\":\"%zoneid%\",\"Name\":\"zoneid\"}"},{"id":25,"name":"LeadBolt.com","postbackUrl":"","pixelRedirectUrl":"","externalId":"{\"Parameter\":\"CLK_ID\",\"Placeholder\":\"[CLK_ID]\",\"Name\":\"CLK_ID\"}","cost":"{}","params":"[{\"Track\": 1, \"Placeholder\": \"[AD_GROUP_ID]\", \"Parameter\": \"AD_GROUP_ID\", \"Name\": \"AD_GROUP_ID\"}, {\"Track\": 1, \"Placeholder\": \"[AD_ID]\", \"Parameter\": \"AD_ID\", \"Name\": \"AD_ID\"}, {\"Track\": 1, \"Placeholder\": \"[CAT_ID]\", \"Parameter\": \"CAT_ID\", \"Name\": \"CAT_ID\"}, {\"Track\": 1, \"Placeholder\": \"[DEVICE_ID]\", \"Parameter\": \"DEVICE_ID\", \"Name\": \"DEVICE_ID\"}, {\"Track\": 1, \"Placeholder\": \"[DEVICE_ID_ANY]\", \"Parameter\": \"DEVICE_ID_ANY\", \"Name\": \"DEVICE_ID_ANY\"}, {\"Track\": 1, \"Placeholder\": \"[DEVICE_ID_MD5]\", \"Parameter\": \"DEVICE_ID_MD\", \"Name\": \"DEVICE_ID_MD\"}, {\"Track\": 1, \"Placeholder\": \"[DEVICE_ID_SHA1]\", \"Parameter\": \"DEVICE_ID_SHA\", \"Name\": \"DEVICE_ID_SHA\"}, {\"Track\": 1, \"Placeholder\": \"[DEVICE_AD_ID]\", \"Parameter\": \"DEVICE_AD_ID\", \"Name\": \"DEVICE_AD_ID\"}, {\"Track\": 1, \"Placeholder\": \"[DEVICE_AD_ID_ANY]\", \"Parameter\": \"DEVICE_AD_ID_ANY\", \"Name\": \"DEVICE_AD_ID_ANY\"}, {\"Track\": 1, \"Placeholder\": \"[DEVICE_AD_ID_MD5]\", \"Parameter\": \"DEVICE_AD_ID_MD\", \"Name\": \"DEVICE_AD_ID_MD\"}]","campaignId":"{\"Parameter\":\"CAMP_ID\",\"Placeholder\":\"[CAMP_ID]\",\"Name\":\"CAMP_ID\"}","websiteId":"{\"Parameter\":\"PUB_ID\",\"Placeholder\":\"[PUB_ID]\",\"Name\":\"PUB_ID\"}"},{"id":26,"name":"PopVertising.com","postbackUrl":"","pixelRedirectUrl":"","externalId":"{\"Parameter\":\"bid\",\"Placeholder\":\"-bid-\",\"Name\":\"bid\"}","cost":"{}","params":"[{\"Track\": 1, \"Placeholder\": \"-browser-\", \"Parameter\": \"browser\", \"Name\": \"browser\"}, {\"Track\": 1, \"Placeholder\": \"-catid-\", \"Parameter\": \"catid\", \"Name\": \"catid\"}, {\"Track\": 1, \"Placeholder\": \"-catname-\", \"Parameter\": \"catname\", \"Name\": \"catname\"}, {\"Track\": 1, \"Placeholder\": \"-country-\", \"Parameter\": \"country\", \"Name\": \"country\"}, {\"Track\": 1, \"Placeholder\": \"-device-\", \"Parameter\": \"device\", \"Name\": \"device\"}, {\"Track\": 1, \"Placeholder\": \"-ispid-\", \"Parameter\": \"ispid\", \"Name\": \"ispid\"}, {\"Track\": 1, \"Placeholder\": \"-ispn-\", \"Parameter\": \"ispn\", \"Name\": \"ispn\"}, {\"Track\": 1, \"Placeholder\": \"-source-\", \"Parameter\": \"source\", \"Name\": \"source\"}]","campaignId":"{}","websiteId":"{\"Parameter\":\"i\",\"Placeholder\":\"_i_\",\"Name\":\"i\"}"},{"id":27,"name":"BuzzCity.com","postbackUrl":"","pixelRedirectUrl":"","externalId":"{\"Parameter\":\"clickcode\",\"Placeholder\":\"{clickcode}\",\"Name\":\"clickcode\"}","cost":"{}","params":"[{\"Track\": 1, \"Placeholder\": \"{random}\", \"Parameter\": \"random\", \"Name\": \"random\"}, {\"Track\": 1, \"Placeholder\": \"{timestamp}\", \"Parameter\": \"timestamp\", \"Name\": \"timestamp\"}]","campaignId":"{}","websiteId":"{\"Parameter\":\"pubid\",\"Placeholder\":\"{pubid}\",\"Name\":\"pubid\"}"},{"id":28,"name":"RevMob","postbackUrl":"","pixelRedirectUrl":"","externalId":"{}","cost":"{}","params":"[{\"Track\": 1, \"Placeholder\": \"%{android_id}\", \"Parameter\": \"android_id\", \"Name\": \"android_id\"}, {\"Track\": 1, \"Placeholder\": \"%{idfa}\", \"Parameter\": \"idfa\", \"Name\": \"idfa\"}, {\"Track\": 1, \"Placeholder\": \"%{mac_address}\", \"Parameter\": \"mac_address\", \"Name\": \"mac_address\"}, {\"Track\": 1, \"Placeholder\": \"%{mobile_id}\", \"Parameter\": \"mobile_id\", \"Name\": \"mobile_id\"}]","campaignId":"{\"Parameter\":\"campaign_id\",\"Placeholder\":\"%{campaign_id}\",\"Name\":\"campaign_id\"}","websiteId":"{\"Parameter\":\"app_id\",\"Placeholder\":\"%{app_id}\",\"Name\":\"app_id\"}"},{"id":29,"name":"TrafficForce.com","postbackUrl":"","pixelRedirectUrl":"","externalId":"{\"Parameter\":\"CLICK_ID\",\"Placeholder\":\"{CLICK_ID}\",\"Name\":\"CLICK_ID\"}","cost":"{}","params":"[{\"Track\": 1, \"Placeholder\": \"{ad_id}\", \"Parameter\": \"ad_id\", \"Name\": \"ad_id\"}, {\"Track\": 1, \"Placeholder\": \"{channel_id}\", \"Parameter\": \"channel_id\", \"Name\": \"channel_id\"}, {\"Track\": 1, \"Placeholder\": \"{group_id}\", \"Parameter\": \"group_id\", \"Name\": \"group_id\"}, {\"Track\": 1, \"Placeholder\": \"{keywords}\", \"Parameter\": \"keywords\", \"Name\": \"keywords\"}, {\"Track\": 1, \"Placeholder\": \"{v_browser}\", \"Parameter\": \"v_browser\", \"Name\": \"v_browser\"}, {\"Track\": 1, \"Placeholder\": \"{v_country}\", \"Parameter\": \"v_country\", \"Name\": \"v_country\"}, {\"Track\": 1, \"Placeholder\": \"{v_language}\", \"Parameter\": \"v_language\", \"Name\": \"v_language\"}, {\"Track\": 1, \"Placeholder\": \"{v_os}\", \"Parameter\": \"v_os\", \"Name\": \"v_os\"}]","campaignId":"{\"Parameter\":\"campaign_id\",\"Placeholder\":\"{campaign_id}\",\"Name\":\"campaign_id\"}","websiteId":"{\"Parameter\":\"site_id\",\"Placeholder\":\"{site_id}\",\"Name\":\"site_id\"}"},{"id":30,"name":"Google AdWords","postbackUrl":"","pixelRedirectUrl":"","externalId":"{}","cost":"{}","params":"[]","campaignId":"{\"Parameter\":\"campid\",\"Placeholder\":\"{campid}\",\"Name\":\"campid\"}","websiteId":"{\"Parameter\":\"placement\",\"Placeholder\":\"{placement}\",\"Name\":\"placement\"}"}]}};
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

app.get('/api/cities', function (req, res) {
  var query = req.query.q;
  var cities = [
    {"value": "shanghai", "display": "Shanghai"},
    {"value": "beijing", "display": "Beijing"},
    {"value": "tianjin", "display": "Tianjin"},
    {"value": "xiamen", "display": "Xiamen"},
    {"value": "zhengzhou", "display": "Zhengzhou"},
    {"value": "taiyuan", "display": "Taiyuan"},
    {"value": "jinan", "display": "Jinan"},
    {"value": "luoyang", "display": "Luoyang"},
    {"value": "suzhou", "display": "Suzhou"},
    {"value": "shenyang", "display": "Shenyang"},
    {"value": "hangzhou", "display": "Hangzhou"},
    {"value": "fuzhou", "display": "Fuzhou"},
    {"value": "shenzhen", "display": "Shenzhen"},
    {"value": "guangzhou", "display": "Guangzhou"},
    {"value": "guiyang", "display": "Guiyang"},
    {"value": "sanya", "display": "Sanya"},
    {"value": "haikou", "display": "Haikou"},
  ];
  var result = cities.filter(item => item.value.indexOf(query) >= 0);
  delayResponse(res, result);
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
      "type": "input-select", "name": "value", "options": [
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
    "id": "8584",
    "display": "City",
    "operands": [{value: "ctn", display: "Must Contain"}, {value: "nctn", display: "Not Contain"}],
    "fields": [{
      "type": "async-select", "name": "city", "url": "/api/cities"
    }]
  }, {
    "id": "8588",
    "display": "Region",
    "operands": [{value: "ctn", display: "Must Contain"}, {value: "nctn", display: "Not Contain"}],
    "fields": [{
      "type": "async-chips", "name": "region", "url": "/api/cities"
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
  }, {
    "id": "custom1",
    "display": "Custom variable 1",
    "operands": [{value: "is", display: "Is"}, {value: "isnt", display: "Isnt"}],
    "fields": [{
      "type": "input", "name": "value", "placeholder": ""
    }]
  }, {
    "id": "custom2",
    "display": "Custom variable 2",
    "operands": [{value: "is", display: "Is"}, {value: "isnt", display: "Isnt"}],
    "fields": [{
      "type": "input", "name": "value", "placeholder": ""
    }]
  }, {
    "id": "custom3",
    "display": "Custom variable 3",
    "operands": [{value: "is", display: "Is"}, {value: "isnt", display: "Isnt"}],
    "fields": [{
      "type": "input", "name": "value", "placeholder": ""
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
    {"value": "ZZZ", "display": "Global"},
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

/**
 * @apiName 获取所有Timezone信息
 *
 */
app.get('/timezones', function (req, res) {
  var result = {
    "status": 1,
    "message": "success",
    "data": {
      "timezones": [
        {
          "id": 1,
          "name": "Dateline Standard Time",
          "detail": "(UTC-12:00) International Date Line West",
          "region": "Etc/GMT+12",
          "utcShift": "-12:00"
        },
        {
          "id": 2,
          "name": "UTC-11",
          "detail": "(UTC-11:00) Coordinated Universal Time-11",
          "region": "Etc/GMT+11",
          "utcShift": "-11:00"
        },
        {
          "id": 3,
          "name": "Hawaiian Standard Time",
          "detail": "(UTC-10:00) Hawaii",
          "region": "Pacific/Honolulu",
          "utcShift": "-10:00"
        },
        {
          "id": 4,
          "name": "Alaskan Standard Time",
          "detail": "(UTC-09:00) Alaska",
          "region": "America/Anchorage",
          "utcShift": "-09:00"
        },
        {
          "id": 5,
          "name": "Pacific Standard Time (Mexico)",
          "detail": "(UTC-08:00) Baja California",
          "region": "America/Santa_Isabel",
          "utcShift": "-08:00"
        }
      ]
    }
  };
  res.send(result);
});

/**
 * @api {get} /api/profile
 * @apiName
 * @apiGroup User
 *
 *
 * @apiSuccessExample {json} Success-Response:
 *   {
 *    status: 1,
 *    message: 'success',
 *    data:{
          idText:"",
          firstname: 'test',
          lastname:'test',
          companyname: 'zheng',
          tel: '13120663670',
          timezone:'+08:00',
          homescreen:'dashboard',  // or campaignList
          referralToken:"",
          status:0  //0:New;1:运行中;2:已过期
    }
 *
 *   }
 *
 */
app.get('/api/profile', function (req, res) {
  var result = {
    status: 1,
    message: 'success',
    data: {
      firstname: 'test',
      lastname: 'test',
      companyname: 'zheng',
      email: 'zhengshuo@qq.com',
      tel: '13120663670',
      timezone: '-08:00',
      homescreen: 'dashboard', // or campaignList
      referralToken: "wkllehZbEjXRk7nJfatdCWjjhKRKyo+jqdyL8ZHuIAZYrDTZ+0kW1A3BiAWGBrDZ",
    }
  };
  res.send(result);
});

/**
 * @api {post} /api/profile
 * @apiName
 * @apiGroup User
 *
 * @apiParam {String} firstname
 * @apiParam {String} lastname
 * @apiParam {String} companyname
 * @apiParam {String} tel
 * @apiParam {String} timezone
 * @apiParam {String} homescreen
 *
 * @apiSuccessExample {json} Success-Response:
 *   {
 *    status: 1,
 *    message: 'success',
 *    data:{
          firstname: 'test',
          lastname:'test',
          companyname: 'zheng',
          tel: "13120663670",
          timezone:'+08:00',
          homescreen:'dashboard',  // or campaignList
     }
 *
 *  }
 *
 */
app.post('/api/profile', function (req, res) {
  var result = {
    status: 1,
    message: 'success',
    data: {
      firstname: 'test',
      lastname: 'test',
      companyname: 'zheng',
      tel: '13120663670',
      timezone: '+08:00',
      homescreen: 'dashboard', // or campaignList
    }
  };
  res.send(result);
});

/**
 * @api {post} /api/password   用户修改密码
 * @apiName  用户修改密码
 * @apiGroup User
 *
 * @apiParam {String} oldpassword
 * @apiParam {String} newpassword
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "status": 1,
 *       "message": "success"
 *     }
 *
 * @apiErrorExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "status": 0,
 *       "message": "old password error"
 *     }
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
 * @api {get} /api/email   获取用户邮箱
 * @apiName   获取用户邮箱
 * @apiGroup User
 *
 *
 * 直接从Profile接口里获取数据,此接口不需要了
 */
app.get('/api/email', function (req, res) {
  var result = {
    status: 1,
    message: 'success',
    data: {
      email: 'zhengshou@qq.com'
    }
  };
  res.send(result);
});

/**
 * @api {post} /api/email   用户修改邮箱
 * @apiName   用户修改邮箱
 * @apiGroup User
 *
 * @apiParam {String} password
 * @apiParam {String} email
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "status": 1,
 *       "message": "success"
 *     }
 *
 * @apiErrorExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "status": 0,
 *       "message": "password error" // email exists
 *     }
 *
 */
app.post('/api/email', function (req, res) {
  var result = {"status": 0, "message": "email exists", "data": {}};
  res.send(result);
});

/**
 * @apiName 获取referral信息
 *
 *
 * @apiParam {String} order:acquired(-acquired)
 * @apiParam {Number} page:1
 * @apiParam {Number} limit:500
 *
 */
app.get('/api/referrals', function (req, res) {
  var result = {
    status: 1,
    message: 'success',
    data: {
      linkurl: "https://panel.voluum.com/link/?t=wkllehZbEjXRk7nJfatdCWjjhKRKyo+jqdyL8ZHuIAZYrDTZ+0kW1A3BiAWGBrDZ",
      totals: {
        count: "2",
        recentCommission: "$4.00",
        totalCommission: "$99.00"
      },
      referrals: [
        {
          userId: 1,
          acquired: "acquired",
          status: "0",
          plan: "plan",
          lastActivity: "lastActivity",
          recentCommission: "recentCommission",
          totalCommission: "totalCommission"
        },
        {
          userId: 2,
          acquired: "acquired",
          status: "0",
          plan: "plan",
          lastActivity: "lastActivity",
          recentCommission: "recentCommission",
          totalCommission: "totalCommission"
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
        overageEvents: 1,
        overageCost: 0.999,
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
    status: 0,
    message: '',
    data: {
      domain: 'www.adbund.com',
      validateResult: "NOT_FOUND" //SUCCESS or NOT_FOUND
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
    data: {
      clickUrl: "http://9cmzk.voluumtrk.com/click",
      mutiClickUrl: "http://9cmzk.voluumtrk.com/click/1",
      postBackUrl: "http://9cmzk.voluumtrk2.com/postback?cid=REPLACE&payout=OPTIONAL&txid=OPTIONAL",
      // securepostbackurl: "https://9cmzk.voluumtrk2.com/postback?cid=REPLACE&payout=OPTIONAL&txid=OPTIONAL",
      // trackingpixelurl: "https://9cmzk.voluumtrk.com/conversion.gif?cid=OPTIONAL&payout=OPTIONAL&txid=OPTIONAL",
      // trackingpixel: '<img src="https://9cmzk.voluumtrk.com/conversion.gif?cid=OPTIONAL&payout=OPTIONAL&txid=OPTIONAL" width="1" height="1"/>',
      // trackingscript: '<script type="text/javascript" src="https://9cmzk.voluumtrk.com/conversion.js?cid=OPTIONAL&payout=OPTIONAL&txid=OPTIONAL"/>'
    }
  };
  res.send(result);
});

/**
 * @apiName 获取Member信息
 *
 */
app.get('/api/members', function (req, res) {
  var result = {
    status: 1,
    message: 'success',
    data: {
      members: [
        {
          idText: "dji9012",
          email: "test1@qq.com",
        },
        {
          idText: "dji9013",
          email: "test2@qq.com",
        }
      ]
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
      invitations: [{"id":18,"email":"yuhuibin@adbund.com","lastDate":"25-02-2017","status":1}]
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
          id: 1,
          email: "222@qq.com",
          lastDate: "13-02-2017",
          status: 0
        },
        {
          id: 2,
          email: "111@qq.com",
          lastDate: "13-02-2017",
          status: 0
        },
        {
          id: 3,
          email: "333@qq.com",
          lastDate: "13-02-2017",
          status: 0
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
app.delete('/api/invitation/:id', function (req, res) {
  var result = {
    status: 1,
    message: 'success'
  };
  res.send(result);
});

app.get('/invitation', function (req, res) {
  res.cookie("token", createJWT());
  res.cookie("clientId", "70012cfe-9940-4ebb-8994-6d15195744cc1");
  res.redirect('http://localhost:5000');
});

/**
 * @apiName Invoices
 *
 */
app.get('/api/invoices', function (req, res) {
  var result = {
    status: 1,
    message: 'success',
    data: {
      email: '286005051@qq.com',
      accountbalance: '99.00'
    }
  };
  res.send(result);
});

/**
 * @apiName Payments
 *
 */
app.get('/api/payments', function (req, res) {
  var result = {
    status: 1,
    message: 'success',
    data: {
      payments: [
        {
          date: '286005051@qq.com',
          amount: '$99.00',
          tax: '$0.00',
          totals: '$99.00'
        },
        {
          date: '286005051@qq.com',
          amount: '$99.00',
          tax: '$0.00',
          totals: '$99.00'
        }
      ]
    }
  };
  res.send(result);
});

/**
 * @apiName billing/info
 *
 */
app.get('/api/billing/info', function (req, res) {
  var result = {
    status: 1,
    message: 'success',
    data: {
      billingname: 'zhengshuo',
      addressline1: 'pudong hangtou road 1027#6201',
      addressline2: '',
      city: '哈哈哈哈',
      postalcode: '200000',
      stateregion: 'shanghai',
      country: 'China',
      ssntaxvatid: ''
    }
  };
  res.send(result);
});

/**
 * @apiName billing/info
 *
 */
app.post('/api/billing/info', function (req, res) {
  var result = {
    status: 1,
    message: 'success',
    data: {
      billingname: 'zhengshuo',
      addressline1: 'pudong hangtou road 1027#6201',
      addressline2: '',
      city: '哈哈哈哈',
      postalcode: '200000',
      stateregion: 'shanghai',
      country: 'China',
      ssntaxvatid: ''
    }
  };
  res.send(result);
});

/**
 * @apiName paypal
 *
 */
app.post('/api/paypal', function (req, res) {
  var result = {
    status: 1,
    message: 'success',
    data: {
      cardnumber: '123456789',
      data: '2017-2-16',
      cvv: 'cvv'
    }
  };
  res.send(result);
});

/**
 * @apiName 获取BlackList
 *
 *
 * @apiParam
 * data: {
 *    enabled: true,
 *    blacklist: []
 * }
 *
 */
app.get('/api/blacklist', function (req, res) {
  var result = {
    status: 1,
    message: 'success',
    data: {
      enabled: false,
      blacklist: [
        {
          name: "test1",
          ipRules: ["1.1.1.1", "1.1.1.1-1.1.1.10"],
          userAgentRules: ["test1", "test2"]
        },
        {
          name: "test2",
          ipRules: ["192.168.0.1-192.168.0.100"],
          userAgentRules: ["test2"]
        }
      ]
    }
  };
  res.send(result);
});

/**
 * @apiName 更改BlackList
 *
 */
app.post('/api/blacklist', function (req, res) {
  var result = {
    status: 1,
    message: 'success',
    data: {
      enabled: true,
      blacklist: [
        {
          name: "test1",
          ipRules: ["1.1.1.1", "1.1.1.1-1.1.1.10"],
          userAgentRules: ["test1", "test2"]
        },
        {
          name: "test2",
          ipRules: ["192.168.0.1-192.168.0.100"],
          userAgentRules: ["test2"]
        }
      ]
    }
  };
  res.send(result);
});

/**
 * @apiName 更新BlackList状态
 *
 * @apiParam {String} enabled:0   //0:disabled;1:enabled
 *
 */
app.put('/api/blacklist', function (req, res) {
  var result = {
    status: 1,
    message: 'success',
    data: {
      enabled: true,
      blacklist: [
        {
          name: "test1",
          ipRules: ["1.1.1.1", "1.1.1.1-1.1.1.10"],
          userAgentRules: ["test1", "test2"]
        },
        {
          name: "test2",
          ipRules: ["192.168.0.1-192.168.0.100"],
          userAgentRules: ["test2"]
        }
      ]
    }
  };
  res.send(result);
});

/**
 * @apiName 获取EventLog信息
 *
 *
 * @apiParam {String} from: 2017-02-01
 * @apiParam {String} to: 2017-02-10
 * @apiParam {String} tz: +08:00
 * @apiParam {Number} page:1
 * @apiParam {Number} limit:500
 * @apiParam {String} userId:1  {option}
 * @apiParam {String} actionType: CREATE {option}
 * @apiParam {String} entityType: CAMPAIGN {option}
 *
 */
app.get('/api/eventlog', function (req, res) {
  var result = {
    status: 1,
    message: 'success',
    data: {
      totalRows: 100,
      rows: [
        {
          user: "zhengshuo@qq.com",
          entityType: "Campaign",
          entityName: "Campaign1",
          entityId: "c05cad45-fbe4-405c-9da4-cb3b5de1ca",
          action: "Create",
          changeAt: "2017-02-10",
          changes: {
            "fieldName": "Campaign",
            "simpleChanges": [{
              "fieldName": "Traffic source",
              "newEntityId": "05e5c2fa-83b6-4e21-89c1-ddcac6fbe6b4",
              "newValue": "AirPush",
              "category": "TRAFFIC_SOURCE"
            }, {
              "fieldName": "Cost model",
              "newValue": "Do not track costs"
            }, {
              "fieldName": "Destination",
              "newValue": "Flow"
            }, {
              "fieldName": "Flow",
              "newEntityId": "3964f3f9-bcbb-44d6-8030-94e1d9f11013",
              "newValue": "Global - New Flow-aedan22",
              "category": "FLOW"
            }, {
              "fieldName": "Name",
              "newValue": "AirPush - Global - aedan22222"
            }]
          }
        },
        {
          "changeAt": "2017-02-10",
          "entityType": "Campaign",
          "user": "zhengshuo@qq.com",
          "entityName": "Zeropark - Afghanistan - Campaign3",
          "entityId": "03cc35d9-2f48-4d48-9f2a-1b1f7764a411",
          "action": "Change",
          "changes": {
            "fieldName": "Campaign",
            "simpleChanges": [{
              "fieldName": "Traffic source",
              "oldEntityId": "4ff3746a-226a-4b77-a816-ce37675c55b7",
              "newEntityId": "983e371a-59ef-4eb9-a773-da2053d6fad1",
              "oldValue": "TrafficSource1",
              "newValue": "Zeropark",
              "category": "TRAFFIC_SOURCE"
            }, {
              "fieldName": "Name",
              "oldValue": "TrafficSource1 - Afghanistan - Campaign1",
              "newValue": "Zeropark - Afghanistan - Campaign3"
            }],
            "nestedChanges": []
          }
        }
      ]
    }
  };
  res.send(result);
});

/**
 * @apiName 获取用户Plan信息
 *
 *
 */
app.get('/api/plan', function (req, res) {
  var result = {
    status: 1,
    message: 'success',
    data: {
      plan: {
        id: 1,
        name: 'plan1',
        price: 399,
        eventsLimit: 100,
        overageCPM: 0.5,
        retentionLimit: 12,
        userLimit: 3,
        domainLimit: 5
      }
    }
  };
  res.send(result);
});

/**
 * @apiName 获取用户所在的用户组
 *
 */
app.get('/api/groups', function (req, res) {
  var result = {
    status: 1,
    message: 'success',
    data: {
      groups: [
        {
          groupId: "70012cfe-9940-4ebb-8994-6d15195744cc1",
          firstname: "FirstName1",
          lastname: "LastName1",
          email: "1@qq.com"
        },
        {
          groupId: "70012cfe-9940-4ebb-8994-6d15195744cc",
          firstname: "FirstName2",
          lastname: "LastName2",
          email: "2@qq.com"
        },
        {
          groupId: "70012cfe-9940-4ebb-8994-6d15195744cc2",
          firstname: "FirstName3",
          lastname: "LastName3",
          email: "3@qq.com"
        }
      ]
    }
  };
  res.send(result);
});

app.post('/api/conversions', function (req, res) {
  var result = {
    "status": 1,
    "message": "success",
    "data": [
      {
        "I": 0,
        "V": "c384EFV6JHQODRN70575OK6UG5, 10.0, abc1234",
        "E": "invalid data"
      },
      {
        "I": 1,
        "V": "c384EFV6JHQODRN70575OK6UG6, 11.0, abc1234",
        "E": "invalid data"
      }
    ]
  };
  res.send(result);
});

app.listen(5000, function () {
  console.log('server started success port : 5000');
});


