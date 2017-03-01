import sequelize from 'sequelize';
import _ from 'lodash';

export const mapping = {
  UserID: "UserID",
  campaign: "CampaignID",
  flow: "FlowID",
  lander: "LanderID",
  offer: "OfferID",
  affiliate: "AffiliateNetworkID",
  traffic: "TrafficSourceID",
  TrafficSourceName: "TrafficSourceName",
  Language: "Language",
  Model: "Model",
  Country: "Country",
  City: "City",
  Region: "Region",
  ISP: "ISP",
  MobileCarrier: "MobileCarrier",
  Domain: "Domain",
  DeviceType: "DeviceType",
  Brand: "Brand",
  OS: "OS",
  OSVersion: "OSVersion",
  Browser: "Browser",
  BrowserVersion: "BrowserVersion",
  ConnectionType: "ConnectionType",
  Timestamp: "Timestamp",
  Visits: "Visits",
  Clicks: "Clicks",
  Conversions: "Conversions",
  Cost: "Cost",
  Revenue: "Revenue",
  Impressions: "Impressions",
  KeysMD5: "KeysMD5",
  V1: "V1",
  V2: "V2",
  V3: "V3",
  V4: "V4",
  V5: "V5",
  V6: "V6",
  V7: "V7",
  V8: "V8",
  V9: "V9",
  V10: "V10",
  day: "day",
  Day: "day"
}

export const groupByMapping = {
  campaign: 'campaignId',
  flow: 'flowId',
  lander: 'landerId',
  offer: 'offerId',
  traffic: 'TrafficSourceId',
  affiliate: 'affiliateId'
}

export const groupByModel = {
  campaign: 'TrackingCampaign',
  flow: 'Flow',
  lander: 'Lander',
  offer: 'Offer',
  traffic: 'TrafficSource',
  affiliate: 'AffiliateNetwork'
}

export const groupByTag = {
  campaign: ['campaignId', 'campaignName', 'CampaignName'],
  flow: ['flowId', 'flowName', 'FlowName'],
  lander: ['landerId', 'landerName', 'LanderName'],
  offer: ['offerId', 'offerName', 'OfferName'],
  traffic: ['trafficId', 'trafficName', 'TrafficSourceName'],
  affiliate: ['affiliateId', 'affiliateName', 'AffilliateNetworkName']
}

export const sumShorts = {
  visits: [
    sequelize.fn('SUM', sequelize.col('Visits')),
    'visits'
  ],
  impressions: [
    sequelize.fn('SUM', sequelize.col('Impressions')),
    'impressions'
  ],
  revenue: [
    sequelize.fn('SUM', sequelize.col('Revenue')),
    'revenue'
  ],
  clicks: [
    sequelize.fn('SUM', sequelize.col('Clicks')),
    'clicks'
  ],
  conversions: [
    sequelize.fn('SUM', sequelize.col('Conversions')),
    'conversions'
  ],
  cost: [
    sequelize.fn('SUM', sequelize.col('AdStatis.Cost')),
    'cost'
  ],
  profit: [
    sequelize.fn('SUM', sequelize.literal('AdStatis.Revenue / 1000000 - AdStatis.Cost / 1000000')),
    'profit'
  ],
  cpv: [
    sequelize.literal('sum(AdStatis.Cost / 1000000) / sum(AdStatis.impressions)'), 'cpv'
  ],
  ictr: [
    sequelize.literal('sum(AdStatis.Visits)/sum(AdStatis.Impressions)'), 'ictr'
  ],
  ctr: [
    sequelize.literal('sum(AdStatis.Clicks)/sum(AdStatis.Visits)'), 'ctr'
  ],
  cr: [
    sequelize.literal('sum(AdStatis.Conversions)/sum(AdStatis.Clicks)'), 'cr'
  ],
  cv: [
    sequelize.literal('sum(AdStatis.Conversions)/sum(AdStatis.Visits)'), 'cv'
  ],
  roi: [
    sequelize.literal('sum(AdStatis.Revenue)/sum(AdStatis.Cost)'), 'roi'
  ],
  epv: [
    sequelize.literal('sum(AdStatis.Revenue)/ 1000000 / sum(AdStatis.Visits)'), 'epv'
  ],
  epc: [
    sequelize.literal('sum(AdStatis.Revenue)/ 1000000 / sum(AdStatis.Clicks)'), 'epc'
  ],
  ap: [sequelize.literal('sum(AdStatis.Revenue)/ 1000000 / sum(AdStatis.Conversions)'), 'ap']
}


export const attributes = [
  'UserID',
  'Language',
  [
    'model', 'Model'
  ],
  [
    'CampaignID', 'campaignId'
  ],
  [
    'CampaignName', 'campaignName'
  ],
  [
    'FlowID', 'flowId'
  ],
  [
    'FlowName', 'flowName'
  ],
  [
    'LanderID', 'landerId'
  ],
  [
    'LanderName', 'landerName'
  ],
  [
    'OfferID', 'offerId'
  ],
  [
    'OfferName', 'offerName'
  ],
  [
    'AffiliateNetworkID', 'affiliateId'
  ],
  [
    'AffilliateNetworkName', 'affiliateName'
  ],
  [
    'TrafficSourceID', 'trafficId'
  ],
  [
    'TrafficSourceName', 'trafficName'
  ],
  'Country',
  'City',
  'Region',
  'ISP',
  'MobileCarrier',
  'Domain',
  'DeviceType',
  'Brand',
  'OS',
  'OSVersion',
  'Browser',
  'BrowserVersion',
  'ConnectionType',
  ...(_.values(sumShorts))
]

export const keys = [
  'visits',
  'impressions',
  'revenue',
  'clicks',
  'conversions',
  'cost',
  'profit',
  'cpv',
  'ictr',
  'ctr',
  'cr',
  'cv',
  'roi',
  'epv',
  'epc',
  'ap',
  'campaignId',
  'campaignName',
  'flowId',
  'flowName',
  'landerId',
  'landerName',
  'offerId',
  'offerName',
  'affiliateId',
  'affiliateName',
  'trafficId',
  'trafficName'
]

export function formatRows(rows) {
  return rows.map((row) => {
    row.revenue = (parseFloat(row.revenue) / 1000000).toFixed(2);
    row.cost = (parseFloat(row.cost) / 1000000).toFixed(2);
    row.profit = parseFloat(row.profit).toFixed(2);
    row.cpv = parseFloat(row.cpv).toFixed(4);
    row.ictr = parseFloat(row.ictr).toFixed(2);
    row.ctr = parseFloat(row.ctr).toFixed(2);
    row.cr = parseFloat(row.cr).toFixed(2);
    row.cv = parseFloat(row.cv).toFixed(2);
    row.roi = parseFloat(row.roi).toFixed(2);
    row.epv = parseFloat(row.epv).toFixed(4);
    row.epc = parseFloat(row.epc).toFixed(2);
    row.ap = parseFloat(row.ap).toFixed(2);
    return row;
  })
}

export function extraConfig(groupBy) {
  let answer;
  switch (groupBy) {
    case 'campaign':
      answer = {
        foreignKey: 'campaignId',
        attributes: [
          'id',
          ['id', 'campaignId'],
          ['name', 'campaignName'],
          ['hash', 'campaignHash'],
          ['url', 'campaignUrl'],
          ['country', 'campaignCountry'],
        ]
      }
      break;
    case 'flow':
      answer = {
        foreignKey: 'flowId',
        attributes: [
          'id',
          ['id', 'flowId'],
          ['name', 'flowName'],
          ['hash', 'flowHash'],
        ]
      }
      break;
    case 'lander':
      answer = {
        foreignKey: 'landerId',
        attributes: [
          'id',
          ['id', 'landerId'],
          ['name', 'landerName'],
          ['hash', 'landerHash'],
          ['country', 'landerCountry'],
          ['url', 'landerUrl'],
        ]
      }
      break;
    case 'offer':
      answer = {
        foreignKey: 'offerId',
        attributes: [
          'id',
          ['id', 'offerId'],
          ['name', 'offerName'],
          ['hash', 'offerHash'],
          ['url', 'offerUrl'],
          ['country', 'offerCountry'],
          ['payoutValue', 'offerPayout'],
        ]
      }
      break;
    case 'traffic':
      answer = {
        foreignKey: 'trafficId',
        attributes: [
          'id',
          ['id', 'trafficId'],
          ['name', 'trafficName'],
          ['hash', 'trafficHash']
        ]
      }
      break;
    case 'affiliate':
      answer = {
        foreignKey: 'affiliateId',
        attributes: [
          'id',
          ['id', 'affiliateId'],
          ['name', 'affiliateName'],
          ['hash', 'affiliateHash'],
        ]
      }
      break;
  }

  return answer;
}
