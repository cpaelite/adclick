function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

var express = require('express');
var router = express.Router();
var Joi = require('joi');
var common = require('./common');

/**
 * @api {post} /api/report  报表
 * @apiName  报表
 * @apiGroup report
 * @apiDescription  报表
 *
 * @apiParam {String} from 开始时间
 * @apiParam {String} to   截止时间
 * @apiParam {String} tz   timezone
 * @apiParam {String} sort  排序字段
 * @apiParam {String} direction  desc
 * @apiParam {String} groupBy
 * @apiParam {String} type
 * @apiParam {Number} offset
 * @apiParam {Number} limit
 * @apiParam {String} include    数据状态 all  traffic active 
 * @apiParam {String} [filter]
 * @apiParam {String} [filter1]
 * @apiParam {String} [filter1Value]
 * @apiParam {String} [filter2]
 * @apiParam {String} [filter2Value]
 * @apiParam {String} [filter3]
 * @apiParam {String} [filter3Value]
 * @apiParam {Number} active
 *
 *
 */

//from   to tz  sort  direction columns=[]  groupBy  offset   limit  filter1  filter1Value  filter2 filter2Value

router.post('/api/report', function (req, res, next) {
    var schema = Joi.object().keys({
        userId: Joi.number().required(),
        from: Joi.string().required(),
        to: Joi.string().required(),
        tz: Joi.string().required(), //+08:00
        direction: Joi.string().required(),
        groupBy: Joi.string().required(),
        type: Joi.string().required().empty(""),
        offset: Joi.number().required(),
        limit: Joi.number().required(),
        filter: Joi.string().optional(),
        sort: Joi.string().required(),
        active: Joi.number().required(),
        filter1: Joi.string().optional(),
        filter1Value: Joi.string().optional(),
        filter2: Joi.string().optional(),
        filter2Value: Joi.string().optional(),
        filter3: Joi.string().optional(),
        filter3Value: Joi.string().optional()

    });
    req.body.userId = req.userId;
    const start = (() => {
        var _ref = _asyncToGenerator(function* () {
            try {
                let result;
                let value = yield common.validate(req.body, schema);
                let connection = yield common.getConnection();
                result = yield campaignReport(value, connection);
                connection.release();
                res.json({
                    status: 1,
                    message: 'success',
                    data: result
                });
            } catch (e) {
                return next(e);
            }
        });

        return function start() {
            return _ref.apply(this, arguments);
        };
    })();
    start();
});

function campaignReport(value, connection) {
    return new Promise(function (resolve, reject) {

        const start = (() => {
            var _ref2 = _asyncToGenerator(function* () {
                try {
                    let offset = (value.offset - 1) * value.limit;
                    let limit = value.limit;
                    let sql;
                    sql = "select ads.UserID,ads.Language,ads.Model,ads.Country,ads.City,ads.Region,ads.ISP,ads.MobileCarrier,ads.Domain,ads.DeviceType,ads.Brand,ads.OS,ads.OSVersion,ads.Browser,ads.BrowserVersion,ads.ConnectionType,ads.Timestamp,sum(ads.Visits) as Visits,sum(ads.Clicks) as Clicks, sum(ads.Conversions) as Conversions, sum(ads.Cost) as Cost, sum(ads.Revenue) as Revenue,sum(ads.Impressions) as Impressions,ads.KeysMD5,ads.V1,ads.V2,ads.V3,ads.V4,ads.V5,ads.V6,ads.V7,ads.V8,ads.V9,ads.V10," + "c.id as CampaignId, c.name as CampaignName, c.url as CampaignUrl, c.country as CampaignCountry, " + "f.id as FlowId, f.name as FlowName, " + "l.id as LanderId, l.name as LanderName, l.url as LanderUrl, l.country as LanderCountry, " + "o.id as OfferId, o.name as OfferName, o.url as OfferUrl, o.country as OfferCountry, " + "t.id as TrafficSourceId, t.name as TrafficSourceName, " + "a.id as AffiliateNetworkId, a.name as AffiliateNetworkName, " + "sum(ads.`Revenue`/1000000)-sum(ads.`Cost`/1000000) as `profit`, " + "sum(ads.`Cost`/1000000)/sum(ads.`Impressions`) as `cpv`, " + "sum(ads.`Visits`)/sum(ads.`Impressions`) as `ictr`, " + "sum(ads.`Clicks`)/sum(ads.`Visits`) as `ctr`, " + "sum(ads.`Conversions`)/sum(ads.`Clicks`) as `cr`, " + "sum(ads.`Conversions`)/sum(ads.`Visits`) as `cv`, " + "sum(ads.`Revenue`/1000000)/sum(ads.`Cost`/1000000) as `roi`, " + "sum(ads.`Revenue`/1000000)/sum(ads.`Visits`) as `epv`, " + "sum(ads.`Revenue`/1000000)/sum(ads.`Clicks`) as `epc`, " + "sum(ads.`Revenue`/1000000)/sum(ads.`Conversions`) as `ap`" + "from AdStatis ads  " + "inner join TrackingCampaign c on c.id = ads.CampaignId " + "inner join Flow f on f.id = ads.FlowId " + "inner join Lander l on l.id = ads.LanderId " + "inner join Offer o on o.id = ads.OfferId " + "inner join TrafficSource t on t.id = ads.TrafficSourceId " + "inner join AffiliateNetwork a on a.id = ads.AffiliateNetworkId ";

                    sql += " where ads.UserID=" + value.userId + " and  ads.`Timestamp` >=" + "UNIX_TIMESTAMP(CONVERT_TZ('" + value.from + "', '+00:00','" + value.tz + "')) and ads.`Timestamp` <=" + "UNIX_TIMESTAMP(CONVERT_TZ('" + value.to + "', '+00:00','" + value.tz + "')) ";

                    if (value.filter1 && value.filter1Value) {
                        "and ads.`" + value.filter1 + "`='" + value.filter1Value + "'";
                    }
                    if (value.filter1 && value.filter1Value) {
                        "and ads.`" + value.filter1 + "`='" + value.filter1Value + "'";
                    }
                    if (value.filter1 && value.filter1Value) {
                        "and ads.`" + value.filter1 + "`='" + value.filter1Value + "'";
                    }

                    sql += "group by  ads.`" + value.groupBy + "`";

                    if (value.sort) {
                        sql += " ORDER BY `" + value.sort + "` " + value.direction;
                    }

                    console.log(sql);

                    let countsql = "select COUNT(*) as `total` from ((" + sql + ") as T)";

                    sql += " limit " + offset + "," + limit;

                    let sumSql = "select sum(`impressions`) as `impressions`, sum(`visits`) as `visits`,sum(`clicks`) as `clicks`,sum(`conversions`) as `conversions`,sum(`cost`) as `cost`,sum(`profit`) as `profit`,sum(`cpv`) as `cpv`,sum(`ictr`) as `ictr`,sum(`ctr`) as `ctr`,sum(`cr`) as `cr`,sum(`cv`) as `cv`,sum(`roi`) as `roi`,sum(`epv`) as `epv`,sum(`epc`) as `epc`,sum(`ap`) as `ap` from ((" + sql + ") as K)";

                    let result = yield Promise.all([query(sql, connection), query(countsql, connection), query(sumSql, connection)]);

                    resolve({
                        totalRows: result[1][0].total,
                        totals: result[2][0],
                        rows: result[0]
                    });
                } catch (e) {
                    reject(e);
                }
            });

            return function start() {
                return _ref2.apply(this, arguments);
            };
        })();
        start();
    });
}

function query(sql, connection) {
    return new Promise(function (resolve, reject) {
        connection.query(sql, function (err, result) {
            if (err) {
                reject(err);
            }
            resolve(result);
        });
    });
}

module.exports = router;