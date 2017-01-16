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