import sequelize from 'sequelize';
import _ from 'lodash';
export const mapping = {
  campaign: {
    dbKey: "CampaignID",
    dbGroupBy: "UserID,CampaignID",
    listPage: true,
    table: "TrackingCampaign",
    dbFilter: "CampaignName",
    group: "campaign",
    attributes: [
      'UserID', ['CampaignID', 'campaignId']
    ]
  },
  flow: {
    attributes: [
      'UserID', ['FlowID', 'flowId']
    ],
    dbKey: "FlowID",
    dbGroupBy: "UserID,FlowID",
    listPage: true,
    table: "Flow",
    dbFilter: "FlowName",
    group: "flow"
  },
  lander: {
    attributes: [
      'UserID', ['LanderID', 'landerId']
    ],
    dbKey: "LanderID",
    dbGroupBy: "UserID,LanderID",
    listPage: true,
    table: "Lander",
    dbFilter: "LanderName",
    group: "lander"
  },
  offer: {
    attributes: [
      'UserID', ['OfferID', 'offerId']
    ],
    dbKey: "OfferID",
    dbGroupBy: "UserID,OfferID",
    listPage: true,
    table: "Offer",
    dbFilter: "OfferName",
    group: "offer"
  },
  affiliate: {
    attributes: [
      'UserID', ['AffiliateNetworkID', 'affiliateId']
    ],
    dbKey: "AffiliateNetworkID",
    dbGroupBy: "UserID,AffiliateNetworkID",
    listPage: true,
    table: "AffiliateNetwork",
    dbFilter: "AffiliateNetworkName",
    group: "affiliate"
  },
  traffic: {
    attributes: [
      'UserID', ['TrafficSourceID', 'trafficId']
    ],
    dbKey: "TrafficSourceID",
    dbGroupBy: "UserID,TrafficSourceID",
    listPage: true,
    table: "TrafficSource",
    dbFilter: "TrafficSourceName",
    group: "traffic"
  },
  language: {
    attributes: [
      ['Language', 'id'],
      ['Language', 'language']
    ],
    dbKey: "Language",
    dbGroupBy: "Language",
    listPage: false,
    dbFilter: 'Language'
  },
  model: {
    attributes: [
      ['model', 'id'],
      ['model', 'model']
    ],
    dbKey: "Model",
    dbGroupBy: "Model",
    listPage: false,
    dbFilter: 'Model'
  },
  country: {
    attributes: [
      ['Country', 'id'],
      ['Country', 'country']
    ],
    dbKey: "Country",
    dbGroupBy: "Country",
    listPage: false,
    dbFilter: 'Country'
  },
  city: {
    attributes: [
      ['City', 'id'],
      ['City', 'city']
    ],
    dbKey: "City",
    dbGroupBy: "City",
    listPage: false,
    dbFilter: 'City',
    dbFilter: 'City'
  },
  region: {
    attributes: [
      ['Region', 'id'],
      ['Region', 'region']
    ],
    dbKey: "Region",
    dbGroupBy: "Region",
    listPage: false,
    dbFilter: 'Region'
  },
  isp: {
    attributes: [
      ['ISP', 'id'],
      ['ISP', 'isp']
    ],
    dbKey: "ISP",
    dbGroupBy: "ISP",
    listPage: false,
    dbFilter: 'ISP'
  },
  mobileCarrier: {
    attributes: [
      ['MobileCarrier', 'id'],
      ['MobileCarrier', 'mobileCarrier']
    ],
    dbKey: "MobileCarrier",
    dbGroupBy: "MobileCarrier",
    listPage: false,
    dbFilter: 'MobileCarrier'
  },
  domain: {
    attributes: [
      ['Domain', 'id'],
      ['Domain', 'domain']
    ],
    dbKey: "Domain",
    dbGroupBy: "Domain",
    listPage: false,
    dbFilter: 'Domain'
  },
  deviceType: {
    attributes: [
      ['DeviceType', 'id'],
      ['DeviceType', 'deviceType']
    ],
    dbKey: "DeviceType",
    dbGroupBy: "DeviceType",
    listPage: false,
    dbFilter: 'DeviceType'
  },
  brand: {
    attributes: [
      ['Brand', 'id'],
      ['Brand', 'brand']
    ],
    dbKey: "Brand",
    dbGroupBy: "Brand",
    listPage: false,
    dbFilter: 'Brand'
  },
  os: {
    attributes: [
      ['OS', 'id'],
      ['OS', 'os']
    ],
    dbKey: "OS",
    dbGroupBy: "OS",
    listPage: false,
    dbFilter: 'OS'
  },
  osVersion: {
    attributes: [
      ['OSVersion', 'id'],
      ['OSVersion', 'osVersion'],
    ],
    dbKey: "OSVersion",
    dbGroupBy: "OSVersion",
    listPage: false,
    dbFilter: 'OSVersion'
  },
  browser: {
    attributes: [
      ['Browser', 'id'],
      ['Browser', 'browser']
    ],
    dbKey: "Browser",
    dbGroupBy: "Browser",
    listPage: false,
    dbFilter: 'Browser'
  },
  browserVersion: {
    attributes: [
      ['BrowserVersion', 'id'],
      ['BrowserVersion', 'browserVersion']
    ],
    dbKey: "BrowserVersion",
    dbGroupBy: "BrowserVersion",
    listPage: false,
    dbFilter: 'BrowserVersion'
  },
  connectionType: {
    attributes: [
      ['ConnectionType', 'id'],
      ['ConnectionType', 'connectionType']
    ],
    dbKey: "ConnectionType",
    dbGroupBy: "ConnectionType",
    listPage: false,
    dbFilter: 'ConnectionType'
  },
  timestamp: {
    dbKey: "Timestamp",
    dbGroupBy: "Timestamp",
    listPage: false
  },
  visits: {
    dbKey: "Visits",
    dbGroupBy: "Visits",
    listPage: false
  },
  clicks: {
    dbKey: "Clicks",
    dbGroupBy: "Clicks",
    listPage: false
  },
  conversions: {
    dbKey: "Conversions",
    dbGroupBy: "Conversions",
    listPage: false
  },
  cost: {
    dbKey: "Cost",
    dbGroupBy: "Cost",
    listPage: false
  },
  revenue: {
    dbKey: "Revenue",
    dbGroupBy: "Revenue",
    listPage: false
  },
  impressions: {
    dbKey: "Impressions",
    dbGroupBy: "Impressions",
    listPage: false
  },
  v1: {
    attributes: [
      ['V1', 'id'],
      ['V1', 'v1']
    ],
    dbKey: "V1",
    dbGroupBy: "V1",
    listPage: false,
    dbFilter: 'V1'
  },
  v2: {
    attributes: [
      ['V2', 'id'],
      ['V2', 'v2']
    ],
    dbKey: "V2",
    dbGroupBy: "V2",
    listPage: false,
    dbFilter: 'V2'
  },
  v3: {
    attributes: [
      ['V3', 'id'],
      ['V3', 'v3']
    ],
    dbKey: "V3",
    dbGroupBy: "V3",
    listPage: false,
    dbFilter: 'V3'
  },
  v4: {
    attributes: [
      ['V4', 'id'],
      ['V4', 'v4']
    ],
    dbKey: "V4",
    dbGroupBy: "V4",
    listPage: false,
    dbFilter: 'V4'
  },
  v5: {
    attributes: [
      ['V5', 'id'],
      ['V5', 'v5']
    ],
    dbKey: "V5",
    dbGroupBy: "V5",
    listPage: false,
    dbFilter: 'V5'
  },
  v6: {
    attributes: [
      ['V6', 'id'],
      ['V6', 'v6']
    ],
    dbKey: "V6",
    dbGroupBy: "V6",
    listPage: false,
    dbFilter: 'V6'
  },
  v7: {
    attributes: [
      ['V7', 'id'],
      ['V7', 'v7']
    ],
    dbKey: "V7",
    dbGroupBy: "V7",
    listPage: false,
    dbFilter: 'V7'
  },
  v8: {
    attributes: [
      ['V8', 'id'],
      ['V8', 'v8']
    ],
    dbKey: "V8",
    dbGroupBy: "V8",
    listPage: false,
    dbFilter: 'V8'
  },
  v9: {
    attributes: [
      ['V9', 'id'],
      ['V9', 'v9']
    ],
    dbKey: "V9",
    dbGroupBy: "V9",
    listPage: false,
    dbFilter: 'V9'
  },
  v10: {
    attributes: [
      ['V10', 'id'],
      ['V10', 'v10']
    ],
    dbKey: "V10",
    dbGroupBy: "V10",
    listPage: false,
    dbFilter: 'V10'
  },
  day: {
    attributes: [],
    dbKey: "day",
    dbGroupBy: "id,day",
    listPage: false,
    dbFilter: 'day'
  },
  hour: {
    attributes: [],
    dbKey: "hour",
    dbGroupBy: "id,hour",
    listPage: false,
    dbFilter: 'hour'
  },
  tsWebsiteId: {
    attributes: [
      ['tsWebsiteId', 'id'],
      ['tsWebsiteId', 'tsWebsiteId']
    ],
    dbKey: "tsWebsiteId",
    dbGroupBy: "tsWebsiteId",
    listPage: false,
    dbFilter: 'tsWebsiteId'
  },
}

export const sumShorts = {
  visits: [sequelize.fn('SUM', sequelize.col('Visits')), 'visits'],
  impressions: [sequelize.fn('SUM', sequelize.col('Impressions')), 'impressions'],
  revenue: [sequelize.fn('SUM', sequelize.col('Revenue')), 'revenue'],
  clicks: [sequelize.fn('SUM', sequelize.col('Clicks')), 'clicks'],
  conversions: [sequelize.fn('SUM', sequelize.col('Conversions')), 'conversions'],
  cost: [sequelize.fn('SUM', sequelize.col('AdStatisReport.Cost')), 'cost'],
  profit: [sequelize.fn('SUM', sequelize.literal('AdStatisReport.Revenue / 1000000 - AdStatisReport.Cost / 1000000')), 'profit'],
  cpv: [sequelize.literal('sum(AdStatisReport.Cost / 1000000) / sum(AdStatisReport.visits)'), 'cpv'],
  ictr: [sequelize.literal('sum(AdStatisReport.Visits)/sum(AdStatisReport.Impressions)'), 'ictr'],
  ctr: [sequelize.literal('sum(AdStatisReport.Clicks)/sum(AdStatisReport.Visits)'), 'ctr'],
  cr: [sequelize.literal('sum(AdStatisReport.Conversions)/sum(AdStatisReport.Clicks)'), 'cr'],
  cv: [sequelize.literal('sum(AdStatisReport.Conversions)/sum(AdStatisReport.Visits)'), 'cv'],
  roi: [sequelize.literal('(sum(AdStatisReport.Revenue) - sum(AdStatisReport.Cost))/sum(AdStatisReport.Cost)'), 'roi'],
  epv: [sequelize.literal('sum(AdStatisReport.Revenue)/ 1000000 / sum(AdStatisReport.Visits)'), 'epv'],
  epc: [sequelize.literal('sum(AdStatisReport.Revenue)/ 1000000 / sum(AdStatisReport.Clicks)'), 'epc'],
  ap: [sequelize.literal('sum(AdStatisReport.Revenue)/ 1000000 / sum(AdStatisReport.Conversions)'), 'ap']
}



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
    row.epc = +parseFloat(row.epc).toFixed(4);
    row.ap = +parseFloat(row.ap).toFixed(2);
    row = removeNanFromObject(row)
    return row;
  })
}

export function removeNanFromObject(o) {
  //for (var prop in o) {
  // if (o[prop] == null || o[prop] === 'null' || o[prop] === 'NaN' || o[prop] != o[prop]) {
  //   o[prop] = 0
  // }
  //}
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
    row.epc = +parseFloat(row.epc).toFixed(4);
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
          'id', ['id', 'campaignId'],
          ['name', 'campaignName'],
          ['hash', 'campaignHash'],
          ['url', 'campaignUrl'],
          [sequelize.literal('case country when \'ZZZ\' then \'GLOBAL\' else country end'), 'campaignCountry'],
          ['trafficSourceId', 'trafficId'],
          ['trafficSourceName', 'trafficName'],
          'deleted'
        ]
      }
      break;
    case 'flow':
      answer = {
        foreignKey: 'flowId',
        directlink: {
          flowName: "Direct Linking"
        },
        attributes: [
          'id', ['id', 'flowId'],
          ['name', 'flowName'],
          ['hash', 'flowHash'],
          'deleted'
        ]
      }
      break;
    case 'lander':
      answer = {
        foreignKey: 'landerId',
        directlink: {
          landerName: "Direct Linking"
        },
        attributes: [
          'id', ['id', 'landerId'],
          ['name', 'landerName'],
          ['hash', 'landerHash'],
          [sequelize.literal('case country when \'ZZZ\' then \'GLOBAL\' else country end'), 'landerCountry'],
          ['url', 'landerUrl'],
          'deleted'
        ]
      }
      break;
    case 'offer':
      answer = {
        foreignKey: 'offerId',
        directlink: {
          offerName: "Direct Linking"
        },
        attributes: [
          'id', ['id', 'offerId'],
          ['name', 'offerName'],
          ['hash', 'offerHash'],
          ['url', 'offerUrl'],
          [sequelize.literal('case country when \'ZZZ\' then \'GLOBAL\' else country end'), 'offerCountry'],
          ['payoutValue', 'offerPayout'],
          'deleted'
        ]
      }
      break;
    case 'traffic':
      answer = {
        foreignKey: 'trafficId',
        directlink: {
          trafficName: "Direct Linking"
        },
        attributes: [
          'id', ['id', 'trafficId'],
          ['name', 'trafficName'],
          ['hash', 'trafficHash'],
          'deleted'
        ]
      }
      break;
    case 'affiliate':
      answer = {
        foreignKey: 'affiliateId',
        attributes: [
          'id', ['id', 'affiliateId'],
          ['name', 'affiliateName'],
          ['hash', 'affiliateHash'],
          'deleted'
        ]
      }
      break;
  }

  return answer;
}


export function csvextraConfig(groupBy) {
  let answer;
  switch (groupBy) {
    case 'campaign':
      answer = {
        foreignKey: 'campaignId',
        attributes: [
          'id', ['id', 'campaignId'],
          ['name', 'campaignName'],
          ['hash', 'campaignHash'],
          ['trafficSourceId', 'trafficId'],
          ['trafficSourceName', 'trafficName'],
        ]
      }
      break;
    case 'flow':
      answer = {
        foreignKey: 'flowId',
        attributes: [
          'id', ['id', 'flowId'],
          ['name', 'flowName'],
          ['hash', 'flowHash'],
        ]
      }
      break;
    case 'lander':
      answer = {
        foreignKey: 'landerId',
        attributes: [
          'id', ['id', 'landerId'],
          ['name', 'landerName'],
          ['hash', 'landerHash']
        ]
      }
      break;
    case 'offer':
      answer = {
        foreignKey: 'offerId',
        attributes: [
          'id', ['id', 'offerId'],
          ['name', 'offerName'],
          ['hash', 'offerHash'],
          ['payoutValue', 'offerPayout'],
        ]
      }
      break;
    case 'traffic':
      answer = {
        foreignKey: 'trafficId',
        attributes: [
          'id', ['id', 'trafficId'],
          ['name', 'trafficName'],
          ['hash', 'trafficHash']
        ]
      }
      break;
    case 'affiliate':
      answer = {
        foreignKey: 'affiliateId',
        attributes: [
          'id', ['id', 'affiliateId'],
          ['name', 'affiliateName'],
          ['hash', 'affiliateHash'],
        ]
      }
      break;
  }

  return answer;
}

export function csvCloums(groupBy) {
  let answer;
  switch (groupBy) {
    case 'campaign':
      answer = ['campaignId', 'campaignName', 'campaignHash', 'trafficId', 'trafficName'];

      break;
    case 'flow':
      answer = ['flowId', 'flowName', 'flowHash'];

      break;
    case 'lander':
      answer = ['landerId', 'landerName', 'landerHash'];


      break;
    case 'offer':
      answer = ['offerId', 'offerName', 'offerHash', 'offerPayout'];


      break;
    case 'traffic':
      answer = ['trafficId', 'trafficName', 'trafficHash'];

      break;
    case 'affiliate':
      answer = ['affiliateId', 'affiliateName', 'affiliateHash'];
      break;
    default:
      answer = [groupBy];
      break;
  }

  return answer;
}