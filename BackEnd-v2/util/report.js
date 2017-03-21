import sequelize from 'sequelize';
import _ from 'lodash';
export const mapping = {
  campaign: {
    dbKey: "CampaignID",
    dbGroupBy: "CampaignID",
    listPage: true,
    table: "TrackingCampaign",
    dbFilter: "CampaignName",
    group:"campaign"
  },
  flow: {dbKey: "FlowID", dbGroupBy: "FlowID", listPage: true, table: "Flow", dbFilter: "FlowName",group:"flow"},
  lander: {dbKey: "LanderID", dbGroupBy: "LanderID", listPage: true, table: "Lander", dbFilter: "LanderName",group:"lander"},
  offer: {dbKey: "OfferID", dbGroupBy: "OfferID", listPage: true, table: "Offer", dbFilter: "OfferName",group:"offer"},
  affiliate: {
    dbKey: "AffiliateNetworkID",
    dbGroupBy: "AffiliateNetworkID",
    listPage: true,
    table: "AffiliateNetwork",
    dbFilter: "AffiliateNetworkName",
    group:"affiliate"
  },
  traffic: {
    dbKey: "TrafficSourceID",
    dbGroupBy: "TrafficSourceID",
    listPage: true,
    table: "TrafficSource",
    dbFilter: "TrafficSourceName",
    group:"traffic"
  },
  language: {dbKey: "Language", dbGroupBy: "Language", listPage: false},
  model: {dbKey: "Model", dbGroupBy: "Model", listPage: false},
  country: {dbKey: "Country", dbGroupBy: "Country", listPage: false},
  city: {dbKey: "City", dbGroupBy: "City", listPage: false},
  region: {dbKey: "Region", dbGroupBy: "Region", listPage: false},
  isp: {dbKey: "ISP", dbGroupBy: "ISP", listPage: false},
  mobileCarrier: {dbKey: "MobileCarrier", dbGroupBy: "MobileCarrier", listPage: false},
  domain: {dbKey: "Domain", dbGroupBy: "Domain", listPage: false},
  deviceType: {dbKey: "DeviceType", dbGroupBy: "DeviceType", listPage: false},
  brand: {dbKey: "Brand", dbGroupBy: "Brand", listPage: false},
  os: {dbKey: "OS", dbGroupBy: "OS", listPage: false},
  osVersion: {dbKey: "OSVersion", dbGroupBy: "OSVersion", listPage: false},
  browser: {dbKey: "Browser", dbGroupBy: "Browser", listPage: false},
  browserVersion: {dbKey: "BrowserVersion", dbGroupBy: "BrowserVersion", listPage: false},
  connectionType: {dbKey: "ConnectionType", dbGroupBy: "ConnectionType", listPage: false},
  timestamp: {dbKey: "Timestamp", dbGroupBy: "Timestamp", listPage: false},
  visits: {dbKey: "Visits", dbGroupBy: "Visits", listPage: false},
  clicks: {dbKey: "Clicks", dbGroupBy: "Clicks", listPage: false},
  conversions: {dbKey: "Conversions", dbGroupBy: "Conversions", listPage: false},
  cost: {dbKey: "Cost", dbGroupBy: "Cost", listPage: false},
  revenue: {dbKey: "Revenue", dbGroupBy: "Revenue", listPage: false},
  impressions: {dbKey: "Impressions", dbGroupBy: "Impressions", listPage: false},
  v1: {dbKey: "V1", dbGroupBy: "V1", listPage: false},
  v2: {dbKey: "V2", dbGroupBy: "V2", listPage: false},
  v3: {dbKey: "V3", dbGroupBy: "V3", listPage: false},
  v4: {dbKey: "V4", dbGroupBy: "V4", listPage: false},
  v5: {dbKey: "V5", dbGroupBy: "V5", listPage: false},
  v6: {dbKey: "V6", dbGroupBy: "V6", listPage: false},
  v7: {dbKey: "V7", dbGroupBy: "V7", listPage: false},
  v8: {dbKey: "V8", dbGroupBy: "V8", listPage: false},
  v9: {dbKey: "V9", dbGroupBy: "V9", listPage: false},
  v10: {dbKey: "V10", dbGroupBy: "V10", listPage: false},
  day: {dbKey: "day", dbGroupBy: "day", listPage: false},
  tsWebsiteId: {dbKey: "tsWebsiteId", dbGroupBy: "tsWebsiteId", listPage: false},
}

export const sumShorts = {
  visits: [sequelize.fn('SUM', sequelize.col('Visits')), 'visits'],
  impressions: [sequelize.fn('SUM', sequelize.col('Impressions')), 'impressions'],
  revenue: [sequelize.fn('SUM', sequelize.col('Revenue')), 'revenue'],
  clicks: [sequelize.fn('SUM', sequelize.col('Clicks')), 'clicks'],
  conversions: [sequelize.fn('SUM', sequelize.col('Conversions')), 'conversions'],
  cost: [sequelize.fn('SUM', sequelize.col('AdStatis.Cost')), 'cost'],
  profit: [sequelize.fn('SUM', sequelize.literal('AdStatis.Revenue / 1000000 - AdStatis.Cost / 1000000')), 'profit'],
  cpv: [sequelize.literal('sum(AdStatis.Cost / 1000000) / sum(AdStatis.visits)'), 'cpv'],
  ictr: [sequelize.literal('sum(AdStatis.Visits)/sum(AdStatis.Impressions)'), 'ictr'],
  ctr: [sequelize.literal('sum(AdStatis.Clicks)/sum(AdStatis.Visits)'), 'ctr'],
  cr: [sequelize.literal('sum(AdStatis.Conversions)/sum(AdStatis.Clicks)'), 'cr'],
  cv: [sequelize.literal('sum(AdStatis.Conversions)/sum(AdStatis.Visits)'), 'cv'],
  roi: [sequelize.literal('(sum(AdStatis.Revenue) - sum(AdStatis.Cost))/sum(AdStatis.Cost)'), 'roi'],
  epv: [sequelize.literal('sum(AdStatis.Revenue)/ 1000000 / sum(AdStatis.Visits)'), 'epv'],
  epc: [sequelize.literal('sum(AdStatis.Revenue)/ 1000000 / sum(AdStatis.Clicks)'), 'epc'],
  ap: [sequelize.literal('sum(AdStatis.Revenue)/ 1000000 / sum(AdStatis.Conversions)'), 'ap']
}


export const attributes = [
  'UserID',
  'Language',
  ['model', 'model'],
  ['CampaignID', 'campaignId'],
  ['FlowID', 'flowId'],
  ['LanderID', 'landerId'],
  ['OfferID', 'offerId'],
  ['AffiliateNetworkID', 'affiliateId'],
  ['TrafficSourceID', 'trafficId'],
  ['Country', 'country'],
  ['City', 'city'],
  ['Region', 'region'],
  ['ISP', 'isp'],
  ['MobileCarrier', 'mobileCarrier'],
  ['Domain', 'domain'],
  ['DeviceType', 'deviceType'],
  ['Brand', 'brand'],
  ['OS', 'os'],
  ['OSVersion', 'osVersion'],
  ['Browser', 'browser'],
  ['BrowserVersion', 'browserVersion'],
  ['ConnectionType', 'connectionType'],
  ['V1', 'v1'],
  ['V2', 'v2'],
  ['V3', 'v3'],
  ['V4', 'v4'],
  ['V5', 'v5'],
  ['V6', 'v6'],
  ['V7', 'v7'],
  ['V8', 'v8'],
  ['V9', 'v9'],
  ['V10', 'v10'],
  ['tsWebsiteId', 'tsWebsiteId'],
  ...(_.values(sumShorts))
]

export const nunberColumnForListPage = [
  'visits', 'impressions', 'revenue', 'clicks', 'conversions', 'cost', 'profit', 'cpv', 'ictr', 'ctr', 'cr',
  'cv', 'roi', 'epv', 'epc', 'ap'
]

export function formatTotals(rows) {
  return rows.map((row) => {
    row.revenue = +(parseFloat(row.revenue)).toFixed(2);
    row.cost = +(parseFloat(row.cost)).toFixed(2);
    row.profit = +parseFloat(row.profit).toFixed(2);
    row.cpv = +parseFloat(row.cpv).toFixed(4);
    row.ictr = +parseFloat(row.ictr * 100).toFixed(2);
    row.ctr = +parseFloat(row.ctr * 100).toFixed(2);
    row.cr = +parseFloat(row.cr * 100).toFixed(4);
    row.cv = +parseFloat(row.cv * 100).toFixed(2);
    row.roi = +parseFloat(row.roi * 100).toFixed(2);
    row.epv = +parseFloat(row.epv).toFixed(4);
    row.epc = +parseFloat(row.epc).toFixed(2);
    row.ap = +parseFloat(row.ap).toFixed(2);
    row = removeNanFromObject(row)
    return row;
  })
}

export function removeNanFromObject(o) {
  for (var prop in o) {
    // console.log(o[prop])
    if (o[prop] == null || o[prop] === 'null' || o[prop] === 'NaN' || o[prop] != o[prop]) {
      o[prop] = 0
    }
  }
  return o
}

export function formatRows(rows) {
  return rows.map((row) => {
    row.revenue = +(parseFloat(row.revenue) / 1000000).toFixed(2);
    row.cost = +(parseFloat(row.cost) / 1000000).toFixed(2);
    row.profit = +parseFloat(row.profit).toFixed(2);
    row.cpv = +parseFloat(row.cpv).toFixed(4);
    row.ictr = +parseFloat(row.ictr * 100).toFixed(2);
    row.ctr = +parseFloat(row.ctr * 100).toFixed(2);
    row.cr = +parseFloat(row.cr * 100).toFixed(4);
    row.cv = +parseFloat(row.cv * 100).toFixed(2);
    row.roi = +parseFloat(row.roi * 100).toFixed(2);
    row.epv = +parseFloat(row.epv).toFixed(4);
    row.epc = +parseFloat(row.epc).toFixed(2);
    row.ap = +parseFloat(row.ap).toFixed(2);
    row = removeNanFromObject(row)
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
          ['trafficSourceId', 'trafficId'],
          ['trafficSourceName', 'trafficName'],
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
