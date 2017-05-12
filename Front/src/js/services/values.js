angular.module('app').value('columnDefinition', {
  campaign: [
    {
      key: 'campaignName',
      name: 'Campaign'
    },
    {
      key: 'campaignHash',
      name: 'Campaign ID'
    },
    {
      key: 'campaignUrl',
      name: 'Campaign URL'
    },
    {
      key: 'campaignCountry',
      name: 'Campaign country'
    },
    {
      key: 'postbackUrl',
      name: 'Postback URL'
    },
    {
      key: 'trafficName',
      name: 'Traffic source'
    },
    {
      key: 'redirect',
      name: 'Redirect'
    }, {
      key: 'costModel',
      name: 'Cost model'
    }
  ],
  flow: [
    {
      key: 'flowName',
      name: 'Flow'
    },
    {
      key: 'flowHash',
      name: 'Flow ID'
    }],
  lander: [
    {
      key: 'landerName',
      name: 'Lander'
    },
    {
      key: 'landerHash',
      name: 'Lander ID'
    },
    {
      key: 'landerUrl',
      name: 'Lander URL'
    },
    {
      key: 'landerCountry',
      name: 'Lander country'
    },
    {
      key: 'numberOfOffers',
      name: 'Number of offers'
    }],
  offer: [
    {
      key: 'offerName',
      name: 'Offer'
    },
    {
      key: 'offerHash',
      name: 'Offer ID'
    },
    {
      key: 'offerUrl',
      name: 'Offer URL'
    },
    {
      key: 'offerCountry',
      name: 'Offer country'
    },
    {
      key: 'payout',
      name: 'Payout'
    },
    {
      key: 'affiliateName',
      name: 'Affiliate network'
    }],
  traffic: [
    {
      key: 'trafficName',
      name: 'Traffic source'
    },
    {
      key: 'trafficHash',
      name: 'Traffic source ID'
    },
    {
      key: 'postbackUrl',
      name: 'Postback URL'
    },
    {
      key: 'clickId',
      name: 'Click ID'
    },
    {
      key: 'costArgument',
      name: 'Cost argument'
    },
    {
      key: 'variable1',
      name: 'Variable 1'
    },
    {
      key: 'variable2',
      name: 'Variable 2'
    },
    {
      key: 'variable3',
      name: 'Variable 3'
    },
    {
      key: 'variable4',
      name: 'Variable 4'
    },
    {
      key: 'variable5',
      name: 'Variable 5'
    },
    {
      key: 'variable6',
      name: 'Variable 6'
    },
    {
      key: 'variable7',
      name: 'Variable 7'
    },
    {
      key: 'variable8',
      name: 'Variable 8'
    },
    {
      key: 'variable9',
      name: 'Variable 9'
    },
    {
      key: 'variable10',
      name: 'Variable 10'
    }],
  affiliate: [
    {
      key: 'affiliateName',
      name: 'Affiliate Network'
    },
    {
      key: 'affiliateHash',
      name: 'Affiliate Network ID'
    },
    {
      key: 'appendClickId',
      name: 'Append click ID'
    },
    {
      key: 'whitelistedIP',
      name: 'Whitelisted IP'
    }],
  conversion: [
    {
      key: 'PostbackTimestamp',
      name: 'Postback timestamp'
    }, {
      key: 'VisitTimestamp',
      name: 'Visit timestamp'
    }, {
      key: 'ExternalID',
      name: 'External ID'
    }, {
      key: 'ClickID',
      name: 'Click ID'
    }, {
      key: 'TransactionID',
      name: 'Transaction ID'
    }, {
      key: 'Revenue',
      name: 'Revenue'
    }, {
      key: 'Cost',
      name: 'Cost'
    }, {
      key: 'CampaignID',
      name: 'Campaign ID'
    }, {
      key: 'CampaignName',
      name: 'Campaign'
    }, {
      key: 'LanderName',
      name: 'Lander'
    }, {
      key: 'LanderID',
      name: 'Lander ID'
    }, {
      key: 'OfferName',
      name: 'Offer'
    }, {
      key: 'OfferID',
      name: 'Offer ID'
    }, {
      key: 'Country',
      name: 'Country'
    }, {
      key: 'CountryCode',
      name: 'Country code'
    }, {
      key: 'TrafficSourceName',
      name: 'Traffic source'
    }, {
      key: 'TrafficSourceID',
      name: 'Traffic source ID'
    }, {
      key: 'AffiliateNetworkName',
      name: 'Affiliate network'
    }, {
      key: 'AffiliateNetworkID',
      name: 'Affiliate network ID'
    }, {
      key: 'Device',
      name: 'Device'
    }, {
      key: 'OS',
      name: 'Operating system'
    }, {
      key: 'OSVersion',
      name: 'OS version'
    }, {
      key: 'Brand',
      name: 'Brand'
    }, {
      key: 'Model',
      name: 'Model'
    }, {
      key: 'Browser',
      name: 'Browser'
    }, {
      key: 'BrowserVersion',
      name: 'Browser version'
    }, {
      key: 'ISP',
      name: 'ISP / Carrier'
    }, {
      key: 'MobileCarrier',
      name: 'Mobile carrier'
    }, {
      key: 'ConnectionType',
      name: 'Connection type'
    }, {
      key: 'VisitorIP',
      name: 'Visitor IP'
    }, {
      key: 'VisitorReferrer',
      name: 'Visitor Referrer'
    }, {
      key: 'V1',
      name: 'V1'
    }, {
      key: 'V2',
      name: 'V2'
    }, {
      key: 'V3',
      name: 'V3'
    }, {
      key: 'V4',
      name: 'V4'
    }, {
      key: 'V5',
      name: 'V5'
    }, {
      key: 'V6',
      name: 'V6'
    }, {
      key: 'V7',
      name: 'V7'
    }, {
      key: 'V8',
      name: 'V8'
    }, {
      key: 'V9',
      name: 'V9'
    }, {
      key: 'V10',
      name: 'V10'
    }],
  brand: [
    {
      key: 'brand',
      name: 'Brand'
    }
  ],
  browserVersion: [
    {
      key: 'browserVersion',
      name: 'Brower version'
    }
  ],
  browser: [
    {
      key: 'browser',
      name: 'Browser'
    }
  ],
  city: [
    {
      key: 'city',
      name: 'City'
    }
  ],
  connectionType: [
    {
      key: 'connectionType',
      name: 'Connection Type'
    }
  ],
  country: [
    {
      key: 'country',
      name: 'Country'
    }
  ],
  day: [
    {
      key: 'day',
      name: 'Day'
    }
  ],
  hour: [
    {
      key: 'hour',
      name: 'Hour'
    }
  ],
  deviceType: [
    {
      key: 'deviceType',
      name: 'DeviceType'
    }
  ],
  ip: [
    {
      key: 'ip',
      name: 'IP'
    }
  ],
  isp: [
    {
      key: 'isp',
      name: 'ISP'
    }
  ],
  language: [
    {
      key: 'language',
      name: 'Language'
    }
  ],
  mobileCarrier: [
    {
      key: 'mobileCarrier',
      name: 'MobileCarrier'
    }
  ],
  model: [
    {
      key: 'model',
      name: 'Model'
    }
  ],
  os: [
    {
      key: 'os',
      name: 'OS'
    }
  ],
  osVersion: [
    {
      key: 'osVersion',
      name: 'OSVersion'
    }
  ],
  domain: [
    {
      key: 'domain',
      name: 'Domain'
    }
  ],
  region: [
    {
      key: 'region',
      name: 'Region'
    }
  ],
  dayOfWeek: [
    {
      key: 'dayOfWeek',
      name: 'Day Of Week'
    }
  ],
  timeOfDay: [
    {
      key: 'timeOfDay',
      name: 'Time Of Day'
    }
  ],
  tsWebsiteId: [
    {key: 'tsWebsiteId', name: 'WebSite ID'}
  ],
  v1: [
    {key: 'v1', name: 'V1'}
  ],
  v2: [
    {key: 'v2', name: 'V2'}
  ],
  v3: [
    {key: 'v3', name: 'V3'}
  ],
  v4: [
    {key: 'v4', name: 'V4'}
  ],
  v5: [
    {key: 'v5', name: 'V5'}
  ],
  v6: [
    {key: 'v6', name: 'V6'}
  ],
  v7: [
    {key: 'v7', name: 'V7'}
  ],
  v8: [
    {key: 'v8', name: 'V8'}
  ],
  v9: [
    {key: 'v9', name: 'V9'}
  ],
  v10: [
    {key: 'v10', name: 'V10'}
  ],
  common: [
    {
      key: 'impressions',
      name: 'Impressions'
    },
    {
      key: 'visits',
      name: 'Visits'
    },
    {
      key: 'clicks',
      name: 'Clicks'
    },
    {
      key: 'conversions',
      name: 'Conversions'
    },
    {
      key: 'revenue',
      name: 'Revenue'
    },
    {
      key: 'cost',
      name: 'Cost'
    },
    {
      key: 'profit',
      name: 'Profit'
    },
    {
      key: 'cpv',
      name: 'CPV'
    },
    {
      key: 'ictr',
      name: 'ICTR'
    },
    {
      key: 'ctr',
      name: 'CTR'
    },
    {
      key: 'cr',
      name: 'CR'
    },
    {
      key: 'cv',
      name: 'CV'
    },
    {
      key: 'roi',
      name: 'ROI'
    },
    {
      key: 'epv',
      name: 'EPV'
    },
    {
      key: 'epc',
      name: 'EPC'
    },
    {
      key: 'ap',
      name: 'AP'
    },
    {
      key: 'cpa',
      name: 'CPA'
    },
    {
      key: 'cpc',
      name: 'CPC'
    },
    {
      key: 'cpm',
      name: 'CPM'
    },
    {
      key: 'errors',
      name: 'ERRORS'
    }
  ]
});
angular.module('app').value('groupByOptions', [
  {value: "tsWebsiteId", display: "WebSite ID", idKey: "tsWebsiteId", nameKey: "tsWebsiteId"},
  {value: "campaign", display: "Campaign", idKey: "campaignId", nameKey: "campaignName"},
  {value: "flow", display: "Flow", idKey: "flowId", nameKey: "flowName"},
  {value: "brand", display: "Brands", idKey: "brand", nameKey: "brand"},
  {value: "affiliate", display: "Affiliate networks", idKey: "affiliateId", nameKey: "affiliateName"},
  {value: "browserVersion", display: "Browser versions", idKey: "browserVersion", nameKey: "browserVersion"},
  {value: "browser", display: "Browsers", idKey: "browser", nameKey: "browser"},
  {value: "city", display: "City", idKey: "city", nameKey: "city"},
  {value: "connectionType", display: "Connection Type", idKey: "connectionType", nameKey: "connectionType"},
  // {value: "conversion", display: "Conversions", idKey: "conversionId", nameKey: "conversionName"},
  {value: "country", display: "Country", idKey: "country", nameKey: "country"},
  {value: "day", display: "Day", idKey: "day", nameKey: "day"},
  {value: "hour", display: "Hour", idKey: "hour", nameKey: "hour"},
  // {value: "dayOfWeek", display: "Day of week", idKey: "dowId", nameKey: "DayOfWeek"},
  {value: "deviceType", display: "Device Type", idKey: "deviceType", nameKey: "deviceType"},
  // {value: "HourOfDay", display: "Hour of day", idKey: "hodId", nameKey: "HourOfDay"},
  // {value: "timeOfDay", display: "Time of day", idKey: "todId", nameKey: "TimeOfDay"},
  {value: "ip", display: "IP", idKey: "ip", nameKey: "ip", role: 'ip'},
  {value: "isp", display: "ISP / Carrier", idKey: "isp", nameKey: "isp"},
  {value: "lander", display: "Landers", idKey: "landerId", nameKey: "landerName"},
  {value: "language", display: "Language", idKey: "language", nameKey: "language"},
  {value: "mobileCarrier", display: "Mobile carrier", idKey: "mobileCarrier", nameKey: "mobileCarrier"},
  {value: "model", display: "Models", idKey: "model", nameKey: "model"},
  // {value: "monty", display: "Month", idKey: "montyId", nameKey: "montyName"},
  {value: "os", display: "OS", idKey: "os", nameKey: "os"},
  {value: "osVersion", display: "OS versions", idKey: "osVersion", nameKey: "osVersion"},
  {value: "offer", display: "Offers", idKey: "offerId", nameKey: "offerName"},
  // {value: "referrer", display: "Referrer", idKey: "referrerId", nameKey: "referrerName"},
  {value: "domain", display: "Referrer domain", idKey: "domain", nameKey: "domain"},
  {value: "region", display: "State / Region", idKey: "region", nameKey: "region"},
  {value: "traffic", display: "Traffic Source", idKey: "trafficId", nameKey: "trafficName"},
  {value: "v1", display: "V1", idKey: "v1", nameKey: "v1", paramValue: "", role: 'campaign'},
  {value: "v2", display: "V2", idKey: "v2", nameKey: "v2", paramValue: "", role: 'campaign'},
  {value: "v3", display: "V3", idKey: "v3", nameKey: "v3", paramValue: "", role: 'campaign'},
  {value: "v4", display: "V4", idKey: "v4", nameKey: "v4", paramValue: "", role: 'campaign'},
  {value: "v5", display: "V5", idKey: "v5", nameKey: "v5", paramValue: "", role: 'campaign'},
  {value: "v6", display: "V6", idKey: "v6", nameKey: "v6", paramValue: "", role: 'campaign'},
  {value: "v7", display: "V7", idKey: "v7", nameKey: "v7", paramValue: "", role: 'campaign'},
  {value: "v8", display: "V8", idKey: "v8", nameKey: "v8", paramValue: "", role: 'campaign'},
  {value: "v9", display: "V9", idKey: "v9", nameKey: "v9", paramValue: "", role: 'campaign'},
  {value: "v10", display: "V10", idKey: "v10", nameKey: "v10", paramValue: "", role: 'campaign'}
]);

angular.module('app').value('urlParameter', {
  "campaign": [
    "{click.id}",
    "{campaign.id}",
    "{trafficsource.id}",
    "{trafficsource.name}",
    "{device}",
    "{brand}",
    "{model}",
    "{browser}",
    "{browserversion}",
    "{os}",
    "{osversion}",
    "{country}",
    "{countryname}",
    "{city}",
    "{region}",
    "{isp}",
    "{useragent}",
    "{ip}",
    "{var1}",
    "{var2}",
    "{var3}",
    "{var:variable name}",
    "{trackingdomain}",
    "{referrerdomain}",
    "{language}",
    "{connection.type}",
    "{carrier}"
  ],
  "lander": [
    "{campaign.id}",
    "{trafficsource.id}",
    "{trafficsource.name}",
    "{lander.id}",
    "{device}",
    "{brand}",
    "{model}",
    "{browser}",
    "{browserversion}",
    "{os}",
    "{osversion}",
    "{country}",
    "{countryname}",
    "{city}",
    "{region}",
    "{isp}",
    "{useragent}",
    "{ip}",
    "{var1}",
    "{var2}",
    "{var3}",
    "{var:variable name}",
    "{trackingdomain}",
    "{referrerdomain}",
    "{language}",
    "{connection.type}",
    "{carrier}"
  ],
  "offer": [
    "{click.id}",
    "{campaign.id}",
    "{trafficsource.id}",
    "{trafficsource.name}",
    "{lander.id}",
    "{device}",
    "{offer.id}",
    "{brand}",
    "{model}",
    "{browser}",
    "{browserversion}",
    "{os}",
    "{osversion}",
    "{country}",
    "{countryname}",
    "{city}",
    "{region}",
    "{isp}",
    "{useragent}",
    "{ip}",
    "{var1}",
    "{var2}",
    "{var3}",
    "{var:variable name}",
    "{trackingdomain}",
    "{referrerdomain}",
    "{language}",
    "{connection.type}",
    "{carrier}"
  ],
  "traffic": [
    "{externalid}",
    "{payout}",
    "{click.id}",
    "{campaign.id}",
    "{trafficsource.id}",
    "{lander.id}",
    "{device}",
    "{offer.id}",
    "{brand}",
    "{model}",
    "{browser}",
    "{browserversion}",
    "{os}",
    "{osversion}",
    "{country}",
    "{countryname}",
    "{city}",
    "{region}",
    "{isp}",
    "{ip}",
    "{var1}",
    "{var2}",
    "{var3}",
    "{var:variable name}",
    "{referrerdomain}",
    "{language}",
    "{connection.type}",
    "{carrier}",
    "{campaign.cpa}",
    "{transaction.id}"
  ]
});

angular.module('app').value('AutomatedRuleOptions', {
  "dimension": [
    {"key": "tsWebsiteId", "display": "WebSiteId"},
    {"key": "country", "display": "Country"},
    {"key": "mobileCarrier", "display": "Carrier"},
    {"key": "city", "display": "City"},
    {"key": "deviceType", "display": "Device"},
    {"key": "os", "display": "OS"},
    {"key": "osVersion", "display": "OSVersion"},
    {"key": "isp", "display": "ISP"},
    {"key": "offerId", "display": "Offer"},
    {"key": "landerId", "display": "Lander"},
    {"key": "brand", "display": "Brand"},
    {"key": "browser", "display": "Browser"},
    {"key": "browserVersion", "display": "BrowserVersion"}
  ],
  "timeSpan": [
    {"key": "last3hours", "display": "Last 3 Hours"},
    {"key": "last6hours", "display": "Last 6 Hours"},
    {"key": "last12hours", "display": "Last 12 Hours"},
    {"key": "last24hours", "display": "Last 24 Hours"},
    {"key": "last3days", "display": "Last 3 Days"},
    {"key": "last7days", "display": "Last 7 Days"},
    {"key": "previousDay", "display": "Previous Day"},
    {"key": "sameDay", "display": "Same Day"}
  ],
  "condition": [
    {"key": "sumImpressions","display": "Impressions","unit": ""},
    {"key": "sumVisits","display": "Visits","unit": ""},
    {"key": "sumClicks","display": "Clicks","unit": ""},
    {"key": "ctr","display": "CTR","unit": "%"},
    {"key": "cr","display": "CR","unit": "%"},
    {"key": "cpm","display": "CPM","unit": "USD"},
    {"key": "cpc","display": "CPC","unit": "USD"},
    {"key": "cpa","display": "CPA","unit": "USD"},
    {"key": "spent","display": "Spent","unit": "USD"},
  ],
  "frequency": [
    "Every 10 Minute",
    "Every 1 Hour",
    "Every 3 Hours",
    "Every 6 Hours",
    "Every 12 Hours",
    "Daily",
    "Weekly",
    "One Time"
  ]
});

angular.module('app').value('FraudFilterRuleOptions', {
  "condition": [
    {"key": "PV", "display": "PV", "unit": ""},
    {"key": "UserAgent", "display": "UserAgent", "unit": ""},
    {"key": "Clicks", "display": "Clicks", "unit": ""},
  ]
});

angular.module('app').factory('reportCache', ['$cacheFactory', function ($cacheFactory) {
  var cache = $cacheFactory.get('report-cache');
  if (!cache) {
    cache = $cacheFactory('report-cache', {capacity: 100});
  }
  return cache;
}]);

angular.module('app').factory('DateRangeUtil', ['$moment', function ($moment) {
  return {
    fromDate: function (datetype, timezone) {
      var fromDate = $moment().utcOffset(timezone).format('YYYY-MM-DD');
      switch (datetype) {
        case '2':
          fromDate = $moment().utcOffset(timezone).subtract(1, 'days').format('YYYY-MM-DD');
          break;
        case '3':
          fromDate = $moment().utcOffset(timezone).subtract(6, 'days').format('YYYY-MM-DD');
          break;
        case '4':
          fromDate = $moment().utcOffset(timezone).subtract(13, 'days').format('YYYY-MM-DD');
          break;
        case '5':
          fromDate = $moment().utcOffset(timezone).day(1).format('YYYY-MM-DD');
          break;
        case '6':
          fromDate = $moment().utcOffset(timezone).day(-6).format('YYYY-MM-DD');
          break;
        case '7':
          fromDate = $moment().utcOffset(timezone).startOf('month').format('YYYY-MM-DD');
          break;
        case '8':
          fromDate = $moment().utcOffset(timezone).subtract(1, 'months').startOf('month').format('YYYY-MM-DD');
          break;
        case '9':
          fromDate = $moment().utcOffset(timezone).startOf('year').format('YYYY-MM-DD');
          break;
        case '10':
          fromDate = $moment().utcOffset(timezone).subtract(1, 'year').startOf('year').format('YYYY-MM-DD');
          break;
      }
      return fromDate;
    },
    toDate: function (datetype, timezone) {
      var toDate = $moment().utcOffset(timezone).add(1, 'days').format('YYYY-MM-DD');
      switch (datetype) {
        case '2':
          toDate = $moment().utcOffset(timezone).format('YYYY-MM-DD');
          break;
        case '6':
          toDate = $moment().utcOffset(timezone).day(1).format('YYYY-MM-DD');
          break;
        case '8':
          toDate = $moment().utcOffset(timezone).startOf('month').format('YYYY-MM-DD');
          break;
        case '10':
          toDate = $moment().utcOffset(timezone).startOf('year').format('YYYY-MM-DD');
          break;
      }
      return toDate;
    },
    diffMonths: function(from, to) {
      var fromDate = $moment(from);
      var toDate = $moment(to);
      var diffYears = toDate.format("Y") - fromDate.format("Y");
      var diffMonths = toDate.format("M") - fromDate.format("M");
      if (diffYears > 0) {
        diffMonths += 12 * diffYears;
      }
      return diffMonths;
    },
    minFromDate: function(to, limit) {
      return $moment(to).subtract(limit, 'months').startOf('month').format('YYYY-MM-DD');
    }
  }
}]);

angular.module('app').factory('LocalStorageUtil', ['$localStorage', function($localStorage) {
  return {
    getValue: function() {
      return $localStorage.reportDate;
    },
    setValue: function(datetype, fromDate, fromTime, toDate, toTime) {
      $localStorage.reportDate.datetype = datetype;
      $localStorage.reportDate.fromDate = fromDate;
      $localStorage.reportDate.fromTime = fromTime;
      $localStorage.reportDate.toDate = toDate;
      $localStorage.reportDate.toTime = toTime;
    }
  }
}]);
