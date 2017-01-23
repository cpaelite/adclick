angular.module('app').value('columnDefinition', {
  campaign: [{
    key: 'campaignName',
    name: 'Campaign'
  },
    {
      key: 'campaignId',
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
      key: 'impressions',
      name: 'Impressions'
    }],
  flow: [{
    key: 'flowName',
    name: 'Flow'
  },
    {
      key: 'flowId',
      name: 'Flow ID'
    }],
  lander: [{
    key: 'landerName',
    name: 'Lander'
  },
    {
      key: 'landerId',
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
  offer: [{
    key: 'offerName',
    name: 'Offer'
  },
    {
      key: 'offerId',
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
    }],
  trafficSource: [{
    key: 'trafficSource',
    name: 'Traffic source'
  },
    {
      key: 'trafficSourceId',
      name: 'Traffic source ID'
    }],
  common: [{
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
    }]
});
angular.module('app').value('reportFilter', [
  {code: "campaign", name: "Campaign"},
  {code: "AffiliateNetwork", name: "Affiliate networks"},
  {code: "brand", name: "Brands"},
  {code: "BrowserVersion", name: "Browser versions"},
  {code: "Browser", name: "Browsers"},
  {code: "City", name: "City"},
  {code: "ConnectionType", name: "Connection type"},
  {code: "Conversions", name: "Conversions"},
  {code: "Country", name: "Country"},
  {code: "Day", name: "Day"},
  {code: "DayOfWeek", name: "Day of week"},
  {code: "DeviceType", name: "Device types"},
  {code: "HourOfDay", name: "Hour of day"},
  {code: "IP", name: "IP"},
  {code: "ISP", name: "ISP / Carrier"},
  {code: "Lander", name: "Landers"},
  {code: "Language", name: "Language"},
  {code: "MobileCarrier", name: "Mobile carrier"},
  {code: "Model", name: "Models"},
  {code: "Monty", name: "Month"},
  {code: "OS", name: "OS"},
  {code: "OSVersion", name: "OS versions"},
  {code: "Offer", name: "Offers"},
  {code: "Referrer", name: "Referrer"},
  {code: "ReferrerDomain", name: "Referrer domain"},
  {code: "Region", name: "State / Region"}
]);

angular.module('app').value('urlTokens', [

]);
