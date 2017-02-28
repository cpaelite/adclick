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
  freetrialRedirect:"http://localhost:5000/#/access/signup",
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
      }, "conversion_PostbackTimestamp": {
        "visible": true
      },
      "conversion_VisitTimestamp": {
        "visible": true
      },
      "conversion_ExternalID": {
        "visible": false
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
        "visible": false
      },
      "conversion_CampaignName": {
        "visible": true
      },
      "conversion_LanderName": {
        "visible": true
      },
      "conversion_LanderID": {
        "visible": false
      },
      "conversion_OfferName": {
        "visible": true
      },
      "conversion_OfferID": {
        "visible": false
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
        "visible": false
      },
      "conversion_AffiliateNetworkName": {
        "visible": true
      },
      "conversion_AffiliateNetworkID": {
        "visible": false
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
  }
}
