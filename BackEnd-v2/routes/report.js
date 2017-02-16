import express from 'express';
var router = express.Router();
var common = require('./common');
import moment from 'moment-timezone';
import _ from 'lodash';
import sequelize from 'sequelize';

var mapping = {
    UserID: "UserID",
    campaign: "CampaignID",
    CampaignName: "CampaignName",
    flow: "FlowID",
    FlowName: "FlowName",
    lander: "LanderID",
    LanderName: "LanderName",
    offer: "OfferID",
    OfferName: "OfferName",
    OfferUrl: "OfferUrl",
    OfferCountry: "OfferCountry",
    affiliate: "AffiliateNetworkID",
    AffilliateNetworkName: "AffilliateNetworkName",
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
    brand: "Brand",
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
    V10: "V10"
}

var groupByMapping = {
    campaign: 'campaignId',
    flow: 'flowId',
    lander: 'landerId',
    offer: 'offerId',
    traffic: 'TrafficSourceId',
    affiliate: 'affiliateId'
}

const groupByModel = {
    campaign: 'TrackingCampaign',
    flow: 'Flow',
    lander: 'Lander',
    offer: 'Offer',
    traffic: 'TrafficSource',
    affiliate: 'AffiliateNetwork'
}

const groupByTag = {
    campaign: [
        'campaignId', 'campaignName'
    ],
    flow: [
        'flowId', 'flowName'
    ],
    lander: [
        'landerId', 'landerName'
    ],
    offer: [
        'offerId', 'offerName'
    ],
    traffic: [
        'trafficId', 'trafficName'
    ],
    affiliate: ['affiliateId', 'affiliateName']
}
/**
 * @api {get} /api/report  报表
 * @apiName  报表
 * @apiGroup report
 * @apiDescription  报表
 *
 */

//from   to tz  sort  direction columns=[]  groupBy  offset   limit  filter1  filter1Value  filter2 filter2Value

router.get('/api/report', async function(req, res, next) {
    req.query.userId = req.userId;
    try {
        let result;
        result = await campaignReport(req.query);
        return res.json({status: 1, message: 'success', data: result});
    } catch (e) {
        return next(e);
    }

});

async function campaignReport(value) {
    let {
        groupBy,
        limit,
        page,
        from,
        to,
        tz,
        filter,
        order,
        status
    } = value;

    let sqlWhere = {};
    limit = parseInt(limit)
    if (limit < 0)
        limit = 10000
    page = parseInt(page)
    let offset = (page - 1) * limit;
    let attrs = Object.keys(value);
    _.forEach(attrs, (attr) => {
        if (mapping[attr]) {
            sqlWhere[mapping[attr]] = value[attr];
        }
    })
    let isListPageRequest = Object.keys(sqlWhere).length === 0 && groupByMapping[groupBy]
    if (isListPageRequest) {
        return listPageReport({
            userId: value.userId,
            where: sqlWhere,
            from,
            to,
            tz,
            groupBy,
            offset,
            limit,
            filter,
            order,
            status
        })
    } else {
        return normalReport(sqlWhere, from, to, tz, groupBy, offset, limit, filter)
    }

}

async function normalReport(sqlWhere, from, to, tz, groupBy, offset, limit, filter) {
    let sql = buildSql()({sqlWhere, from, to, tz, groupBy: mapping[groupBy]});
    sql += " limit " + offset + "," + limit;
    let countSql = "select COUNT(*) as `total` from ((" + sql + ") as T)";
    let sumSql = "select sum(`Impressions`) as `impressions`, sum(`Visits`) as `visits`,sum(`Clicks`) as `clicks`,sum(`Conversions`) as `conversions`,sum(`Revenue`) as `revenue`,sum(`Cost`) as `cost`,sum(`Profit`) as `profit`,sum(`Cpv`) as `cpv`,sum(`Ictr`) as `ictr`,sum(`Ctr`) as `ctr`,sum(`Cr`) as `cr`,sum(`Cv`) as `cv`,sum(`Roi`) as `roi`,sum(`Epv`) as `epv`,sum(`Epc`) as `epc`,sum(`Ap`) as `ap` from ((" + sql + ") as K)";
    let result = await Promise.all([query(sql), query(countSql), query(sumSql)]);
    return ({totalRows: result[1][0].total,
        totals: result[2][0],
        rows: result[0]
    });
}

async function listPageReport({
    userId,
    where,
    from,
    to,
    tz,
    groupBy,
    offset,
    limit,
    filter,
    order,
    status
}) {
    if (filter) {
        where.name = {
            $like: `%${filter}%`
        }
    }
    where.UserID = userId
    where.Timestamp = {
        $gte: moment(from).unix() * 1000,
        $lte: moment(to).unix() * 1000
    }
    let include = ['TrackingCampaign'].map(e => {
        let _r = {
            model: models[e],
            required: false
        }
        if (e === 'TrackingCampaign' && (status === "0" || status === "1")) {
            _r.where = {
                status
            }
        }
        return _r;
    })

    let sumShorts = {
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

    let orderBy = ['campaignId', 'ASC']

    if (order) {
        if (order[0] === '-1') {
            orderBy[1] = 'DESC'
            order = order.slice(1)
        }
        if (sumShorts[order]) {
            orderBy[0] = sumShorts[order][0]
        } else {
            orderBy[0] = order
        }
    }

    let attributes = [
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
    let rows = await models.AdStatis.findAll({
        where,
        limit,
        offset,
        include,
        attributes,
        group: `AdStatis.${mapping[groupBy]}`,
        order: [orderBy]
    })

    let totalsRows = await models[groupByModel[groupBy]].count()

    var placeholders = []

    if (limit > rows.length) {
        let keys = [
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

        let Tag = groupByTag[groupBy][0]
        let Name = groupByTag[groupBy][1]
        placeholders = await models[groupByModel[groupBy]].findAll({
            attributes: [
                [
                    'id', Tag
                ],
                ['name', Name]
            ],
            limit: (limit - rows.length),
            where: {
                id: {
                    $notIn: rows.length === 0
                        ? [-1]
                        : rows.map((e) => e.dataValues[Tag])
                },
                userId
            }
        })
        placeholders = placeholders.map((e) => {
          let obj = e.dataValues;
          keys.forEach(key => {
            if (key !== Tag && key !== Name) obj[key] = 0;
          });
          return obj;
        })

    }

    let totals = {
        impressions: rows.reduce((sum, row) => sum + row.dataValues.impressions, 0),
        clicks: rows.reduce((sum, row) => sum + row.dataValues.clicks, 0),
        visits: rows.reduce((sum, row) => sum + row.dataValues.visits, 0)
    }

    return {totals, totalsRows, rows: [...rows, ...placeholders]}
}

module.exports = router;
