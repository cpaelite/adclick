module.exports = {
  "env": "development",
  "mysql": {
    'development': {
      host: 'localhost',
      user: 'monty',
      password: 'monty',
      database: 'AdClickTool',
      connectionLimit: 10
    },
    staging: {
      host: 'dev02.cmjwzbzhppgn.us-west-1.rds.amazonaws.com',
      user: 'root',
      password: 'R%LKsIJF412',
      database: 'AdClickTool',
      connectionLimit: 10
    }
  },
  "redis": {
    host: "adclick-jp.082pif.ng.0001.apne1.cache.amazonaws.com",
    port: "6379",
    channel: "channel_campaign_changed_users",
    conditionKey: "conditionKey_new"
  },
  "jwtTokenSrcret": "&s4ha7$dj8",
  "newbidder": {
    "httpPix": "http://",
    "mainDomain": "nbtrk0.com",
    "impRouter": "/impression",
    "clickRouter": "/click",
    "mutiClickRouter": "/click/1",
    "postBackRouter": "/postback",
    "postBackRouterParam": "?cid=REPLACE&payout=OPTIONAL&txid=OPTIONAL"
  },
  domains: [{
    address: "nbtrk.com",
    mainDomain: false, //campaign mian domain
    postBackDomain: true //offer postback default domain
  }, {
    address: "nbtrk0.com",
    mainDomain: true,
    postBackDomain: false
  }, {
    address: "nbtrk1.com",
    mainDomain: false,
    postBackDomain: false
  }],
  invitationRouter: "http://localhost:5000/invitation",
  invitationredirect: "http://localhost:5000",
  defaultSetting: {
    "reportViewLimit": 500,
    "entityType": 1,
    "reportViewSort": {
      "key": "visits",
      "direction": "desc"
    },
    "reportTimeZone": "+08:00",
    "reportViewColumns": {
      "campaignName": {
        "visible": true
      },
      "campaignHash": {
        "visible": false
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
        "visible": false
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
        "visible": false
      },
      "offerUrl": {
        "visible": false
      },
      "offerCountry": {
        "visible": false
      },
      "payout": {
        "visible": false
      },
      "trafficName": {
        "visible": true
      },
      "trafficHash": {
        "visible": false
      },
      "costArgument": {
        "visible": false
      },
      "affiliateName": {
        "visible": true
      },
      "affiliateHash": {
        "visible": false
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

}
