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
 * @apiParam {String} groupBy   表名
 * @apiParam {Number} offset
 * @apiParam {Number} limit
 * @apiParam {String} [filter]
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
        offset: Joi.number().required(),
        limit: Joi.number().required(),
        filter: Joi.string().optional(),
        sort: Joi.string().required()
    });
    req.body.userId = req.userId;
    const start = (() => {
        var _ref = _asyncToGenerator(function* () {
            try {
                let result;
                let value = yield common.validate(req.body, schema);
                let connection = yield common.getConnection();
                if (value.groupBy == "Campaign") {
                    result = yield campaignReport(value, connection);
                } else if (value.groupBy == "Offer") {
                    result = yield offerReport(value, connection);
                }
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
                    let sql = "select  t.`id`,t.`name` as `name`,t.`hash` as `hash` ,t.`url` ,t.`impPixelUrl` ,t.`country` ," + "t.`trafficSourceName` ,t.`costModel`,t.`cpcValue` as `cpc`,t.`cpaValue` as `cpa`,t.`cpmValue` as `cpm`," + "t.`redirectMode` as `redirect`," + "ifnull(sum(a.`Impressions`),0) as `impressions`," + "ifnull(sum(a.`Visits`),0) as `visits`," + "ifnull(sum(a.`Clicks`),0) as `clicks`," + "ifnull(sum(a.`Conversions`),0) as `conversions`," + "Round(ifnull(sum(a.`Revenue`/1000000),0),2) as `revenue`," + "Round(ifnull(sum(a.`Cost`/1000000),0),2)  as `cost`," + "Round(ifnull(sum(a.`Revenue`/1000000)-sum(a.`Cost`/1000000),0),2)  as `profit` ," + "Round(ifnull(sum(a.`Cost`/1000000)/sum(a.`Impressions`),0),4)  as `cpv`," + "Round(ifnull(sum(a.`Visits`)/sum(a.`Impressions`),0)*100,2) as `ictr`," + "Round(ifnull(sum(a.`Clicks`)/sum(a.`Visits`),0)*100,2) as `ctr`," + "Round(ifnull(sum(a.`Conversions`)/sum(a.`Clicks`),0)*100,2) as `cr`," + "Round(ifnull(sum(a.`Conversions`)/sum(a.`Visits`),0)*100,2) as `cv`," + "Round(ifnull(sum(a.`Revenue`/1000000)/sum(a.`Cost`/1000000),0)*100,2) as `roi`," + "Round(ifnull(sum(a.`Revenue`/1000000)/sum(a.`Visits`),0)*100,4) as `epv`," + "Round(ifnull(sum(a.`Revenue`/1000000)/sum(a.`Clicks`),0)*100,2) as `epc`," + "Round(ifnull(sum(a.`Revenue`/1000000)/sum(a.`Conversions`),0)*100,2) as `ap` " + "from `TrackingCampaign` t " + "left join  `AdStatis` a on a.`CampaignID`= t.`id` and a.`UserID`= t.`userId` ";

                    sql += " and a.`UserID`=" + value.userId + " where a.`Timestamp` >=" + "UNIX_TIMESTAMP(CONVERT_TZ('" + value.from + "', '+00:00','" + value.tz + "')) and a.`Timestamp` <=" + "UNIX_TIMESTAMP(CONVERT_TZ('" + value.to + "', '+00:00','" + value.tz + "'))";

                    if (value.filter) {
                        sql += " and t.`name` LIKE '%" + value.filter + "%'";
                    }
                    sql += " group by t.`id`";

                    if (value.sort) {
                        sql += " ORDER BY `" + value.sort + "` " + value.direction;
                    }

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

function offerReport(value, connection) {
    return new Promise(function (resolve, reject) {

        const start = (() => {
            var _ref3 = _asyncToGenerator(function* () {
                try {
                    let offset = (value.offset - 1) * value.limit;
                    let limit = value.limit;
                    let sql = "select  t.`id`,t.`name` as `name`,t.`hash` as `hash` ,t.`url` ,t.`postbackUrl` ,t.`country` ," + "t.`AffiliateNetworkName` ,t.`payoutValue`," + "ifnull(sum(a.`Impressions`),0) as `impressions`," + "ifnull(sum(a.`Visits`),0) as `visits`," + "ifnull(sum(a.`Clicks`),0) as `clicks`," + "ifnull(sum(a.`Conversions`),0) as `conversions`," + "Round(ifnull(sum(a.`Revenue`/1000000),0),2) as `revenue`," + "Round(ifnull(sum(a.`Cost`/1000000),0),2)  as `cost`," + "Round(ifnull(sum(a.`Revenue`/1000000)-sum(a.`Cost`/1000000),0),2)  as `profit` ," + "Round(ifnull(sum(a.`Cost`/1000000)/sum(a.`Impressions`),0),4)  as `cpv`," + "Round(ifnull(sum(a.`Visits`)/sum(a.`Impressions`),0)*100,2) as `ictr`," + "Round(ifnull(sum(a.`Clicks`)/sum(a.`Visits`),0)*100,2) as `ctr`," + "Round(ifnull(sum(a.`Conversions`)/sum(a.`Clicks`),0)*100,2) as `cr`," + "Round(ifnull(sum(a.`Conversions`)/sum(a.`Visits`),0)*100,2) as `cv`," + "Round(ifnull(sum(a.`Revenue`/1000000)/sum(a.`Cost`/1000000),0)*100,2) as `roi`," + "Round(ifnull(sum(a.`Revenue`/1000000)/sum(a.`Visits`),0)*100,4) as `epv`," + "Round(ifnull(sum(a.`Revenue`/1000000)/sum(a.`Clicks`),0)*100,2) as `epc`," + "Round(ifnull(sum(a.`Revenue`/1000000)/sum(a.`Conversions`),0)*100,2) as `ap` " + "from `Offer` t " + "left join  `AdStatis` a on a.`OfferID`= t.`id` and a.`UserID`= t.`userId` ";

                    sql += " and a.`UserID`=" + value.userId + " where a.`Timestamp` >=" + "UNIX_TIMESTAMP(CONVERT_TZ('" + value.from + "', '+00:00','" + value.tz + "')) and a.`Timestamp` <=" + "UNIX_TIMESTAMP(CONVERT_TZ('" + value.to + "', '+00:00','" + value.tz + "'))";

                    if (value.filter) {
                        sql += " and t.`name` LIKE '%" + value.filter + "%'";
                    }
                    sql += " group by t.`id`";

                    if (value.sort) {
                        sql += " ORDER BY `" + value.sort + "` " + value.direction;
                    }

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
                return _ref3.apply(this, arguments);
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