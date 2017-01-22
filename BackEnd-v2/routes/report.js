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
                if (value.type) {
                    result = yield campaignReport(value, connection);
                    // if(value.type == "TrackingCampaign"){
                    //     result = await campaignReport(value,connection);
                    // }else if(value.tye == "offer"){
                    //     result= await offerReport(value,connection);
                    // }else if(value.type == "lander"){
                    //     result= await landerReport(value,connection);
                    // }else if(value.type== "flow"){
                    //     result= await flowReport(value,connection);
                    // }else if(value.type== "affiliateNetwork"){
                    //     result= await affiliateReport(value,connection);
                    // }else if(value.type== "trafficSource"){
                    //     result= await trafficReport(value,connection);     
                    // }
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

function trafficReport(value, connection) {
    return new Promise(function (resolve, reject) {

        const start = (() => {
            var _ref2 = _asyncToGenerator(function* () {
                try {
                    let offset = (value.offset - 1) * value.limit;
                    let limit = value.limit;
                    let sql = "select   t.`id`,t.`name` as `name`,t.`hash` as `hash`, `postbackUrl`," + "ifnull(a.`Impressions`,0) as `impressions`," + "ifnull(a.`Visits`,0) as `visits`,ifnull(a.`Clicks`,0) as `clicks`," + "ifnull(a.`Conversions`,0) as `conversions`,Round(ifnull(a.`Revenue`,0),2) as `revenue`," + "Round(ifnull(a.`Cost`,0),2)  as `cost`," + "Round(ifnull(a.`profit`,0),2)  as `profit`," + "Round(ifnull(a.`cpv`,0),4) as `cpv`," + "Round(ifnull(a.`ictr`,0)*100,2) as `ictr`," + "Round(ifnull(a.`ctr`,0)*100,2) as `ctr`," + "Round(ifnull(a.`cr`,0)*100,2) as `cr`," + "Round(ifnull(a.`cv`,0)*100,2)  as `cv`," + "Round(ifnull(a.`roi`,0)*100,2) as `roi`," + "Round(ifnull(a.`epv`,0)*100,4) as `epv`," + "Round(ifnull(a.`epc`,0)*100,2) as `epc`," + "Round(ifnull(a.`ap`,0)*100,2) as `ap`, " + "a.`V1`,a.`V2`,a.`V3`,a.`V4`,a.`V5`,a.`V6`,a.`V7`,a.`V8`,a.`V9`,a.`V10`  " + "from `TrafficSource` t left join  " + "(select sum(`Impressions`) as `Impressions`,sum(`Visits`) as `Visits`,sum(`Clicks`) as `Clicks`,sum(`Conversions`) as `Conversions`,sum(`Revenue`/1000000) as `Revenue`,sum(`Cost`/1000000) as `Cost` ,`TrafficSourceID`," + "sum(`Revenue`/1000000)-sum(`Cost`/1000000) as `profit` , " + "sum(`Cost`/1000000)/sum(`Impressions`) as `cpv`," + "sum(`Visits`)/sum(`Impressions`) as `ictr`," + "sum(`Clicks`)/sum(`Visits`) as `ctr`," + "sum(`Conversions`)/sum(`Clicks`) as `cr`," + "sum(`Conversions`)/sum(`Visits`) as `cv`," + "sum(`Revenue`/1000000)/sum(`Cost`/1000000) as `roi`," + "sum(`Revenue`/1000000)/sum(`Visits`) as `epv`," + "sum(`Revenue`/1000000)/sum(`Clicks`) as `epc`," + "sum(`Revenue`/1000000)/sum(`Conversions`) as `ap`, " + "`V1`,`V2`,`V3`,`V4`,`V5`,`V6`,`V7`,`V8`,`V9`,`V10` " + " from  `AdStatis`";

                    sql += " where `UserID`=" + value.userId + " and  `Timestamp` >=" + "UNIX_TIMESTAMP(CONVERT_TZ('" + value.from + "', '+00:00','" + value.tz + "')) and `Timestamp` <=" + "UNIX_TIMESTAMP(CONVERT_TZ('" + value.to + "', '+00:00','" + value.tz + "')) group by `TrafficSourceID` ) a  on a.`TrafficSourceID`= t.`id` where t.`userId`= " + value.userId;

                    if (value.filter) {
                        sql += " and t.`name` LIKE '%" + value.filter + "%'";
                    }

                    if (value.active == 0) {
                        sql += " and t.`deleted` = 0";
                    } else if (value.active == 1) {
                        sql += " and t.`deleted` = 1";
                    }

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

function affiliateReport(value, connection) {
    return new Promise(function (resolve, reject) {

        const start = (() => {
            var _ref3 = _asyncToGenerator(function* () {
                try {
                    let offset = (value.offset - 1) * value.limit;
                    let limit = value.limit;
                    let sql = "select   t.`id`,t.`name` as `name`,t.`hash` as `hash`, t.`appendClickId`," + "ifnull(a.`Impressions`,0) as `impressions`," + "ifnull(a.`Visits`,0) as `visits`,ifnull(a.`Clicks`,0) as `clicks`," + "ifnull(a.`Conversions`,0) as `conversions`,Round(ifnull(a.`Revenue`,0),2) as `revenue`," + "Round(ifnull(a.`Cost`,0),2)  as `cost`," + "Round(ifnull(a.`profit`,0),2)  as `profit`," + "Round(ifnull(a.`cpv`,0),4) as `cpv`," + "Round(ifnull(a.`ictr`,0)*100,2) as `ictr`," + "Round(ifnull(a.`ctr`,0)*100,2) as `ctr`," + "Round(ifnull(a.`cr`,0)*100,2) as `cr`," + "Round(ifnull(a.`cv`,0)*100,2)  as `cv`," + "Round(ifnull(a.`roi`,0)*100,2) as `roi`," + "Round(ifnull(a.`epv`,0)*100,4) as `epv`," + "Round(ifnull(a.`epc`,0)*100,2) as `epc`," + "Round(ifnull(a.`ap`,0)*100,2) as `ap` " + "from `AffiliateNetwork` t left join  " + "(select sum(`Impressions`) as `Impressions`,sum(`Visits`) as `Visits`,sum(`Clicks`) as `Clicks`,sum(`Conversions`) as `Conversions`,sum(`Revenue`/1000000) as `Revenue`,sum(`Cost`/1000000) as `Cost` ,`AffiliateNetworkID`," + "sum(`Revenue`/1000000)-sum(`Cost`/1000000) as `profit` , " + "sum(`Cost`/1000000)/sum(`Impressions`) as `cpv`," + "sum(`Visits`)/sum(`Impressions`) as `ictr`," + "sum(`Clicks`)/sum(`Visits`) as `ctr`," + "sum(`Conversions`)/sum(`Clicks`) as `cr`," + "sum(`Conversions`)/sum(`Visits`) as `cv`," + "sum(`Revenue`/1000000)/sum(`Cost`/1000000) as `roi`," + "sum(`Revenue`/1000000)/sum(`Visits`) as `epv`," + "sum(`Revenue`/1000000)/sum(`Clicks`) as `epc`," + "sum(`Revenue`/1000000)/sum(`Conversions`) as `ap`  from  `AdStatis`";

                    sql += " where `UserID`=" + value.userId + " and  `Timestamp` >=" + "UNIX_TIMESTAMP(CONVERT_TZ('" + value.from + "', '+00:00','" + value.tz + "')) and `Timestamp` <=" + "UNIX_TIMESTAMP(CONVERT_TZ('" + value.to + "', '+00:00','" + value.tz + "')) group by `AffiliateNetworkID` ) a  on a.`AffiliateNetworkID`= t.`id` where t.`userId`= " + value.userId;

                    if (value.filter) {
                        sql += " and t.`name` LIKE '%" + value.filter + "%'";
                    }

                    if (value.active == 0) {
                        sql += " and t.`deleted` = 0";
                    } else if (value.active == 1) {
                        sql += " and t.`deleted` = 1";
                    }

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

function flowReport(value, connection) {
    return new Promise(function (resolve, reject) {

        const start = (() => {
            var _ref4 = _asyncToGenerator(function* () {
                try {
                    let offset = (value.offset - 1) * value.limit;
                    let limit = value.limit;
                    let sql = "select   t.`id`,t.`name` as `name`,t.`hash` as `hash`," + "ifnull(a.`Impressions`,0) as `impressions`," + "ifnull(a.`Visits`,0) as `visits`,ifnull(a.`Clicks`,0) as `clicks`," + "ifnull(a.`Conversions`,0) as `conversions`,Round(ifnull(a.`Revenue`,0),2) as `revenue`," + "Round(ifnull(a.`Cost`,0),2)  as `cost`," + "Round(ifnull(a.`profit`,0),2)  as `profit`," + "Round(ifnull(a.`cpv`,0),4) as `cpv`," + "Round(ifnull(a.`ictr`,0)*100,2) as `ictr`," + "Round(ifnull(a.`ctr`,0)*100,2) as `ctr`," + "Round(ifnull(a.`cr`,0)*100,2) as `cr`," + "Round(ifnull(a.`cv`,0)*100,2)  as `cv`," + "Round(ifnull(a.`roi`,0)*100,2) as `roi`," + "Round(ifnull(a.`epv`,0)*100,4) as `epv`," + "Round(ifnull(a.`epc`,0)*100,2) as `epc`," + "Round(ifnull(a.`ap`,0)*100,2) as `ap` " + "from `Flow` t left join  " + "(select sum(`Impressions`) as `Impressions`,sum(`Visits`) as `Visits`,sum(`Clicks`) as `Clicks`,sum(`Conversions`) as `Conversions`,sum(`Revenue`/1000000) as `Revenue`,sum(`Cost`/1000000) as `Cost` ,`FlowID`," + "sum(`Revenue`/1000000)-sum(`Cost`/1000000) as `profit` , " + "sum(`Cost`/1000000)/sum(`Impressions`) as `cpv`," + "sum(`Visits`)/sum(`Impressions`) as `ictr`," + "sum(`Clicks`)/sum(`Visits`) as `ctr`," + "sum(`Conversions`)/sum(`Clicks`) as `cr`," + "sum(`Conversions`)/sum(`Visits`) as `cv`," + "sum(`Revenue`/1000000)/sum(`Cost`/1000000) as `roi`," + "sum(`Revenue`/1000000)/sum(`Visits`) as `epv`," + "sum(`Revenue`/1000000)/sum(`Clicks`) as `epc`," + "sum(`Revenue`/1000000)/sum(`Conversions`) as `ap`  from  `AdStatis`";

                    sql += " where `UserID`=" + value.userId + " and  `Timestamp` >=" + "UNIX_TIMESTAMP(CONVERT_TZ('" + value.from + "', '+00:00','" + value.tz + "')) and `Timestamp` <=" + "UNIX_TIMESTAMP(CONVERT_TZ('" + value.to + "', '+00:00','" + value.tz + "')) group by `FlowID` ) a  on a.`FlowID`= t.`id` where t.`userId`= " + value.userId;

                    if (value.filter) {
                        sql += " and t.`name` LIKE '%" + value.filter + "%'";
                    }

                    if (value.active == 0) {
                        sql += " and t.`deleted` = 0";
                    } else if (value.active == 1) {
                        sql += " and t.`deleted` = 1";
                    }

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
                return _ref4.apply(this, arguments);
            };
        })();
        start();
    });
}

function landerReport(value, connection) {
    return new Promise(function (resolve, reject) {

        const start = (() => {
            var _ref5 = _asyncToGenerator(function* () {
                try {
                    let offset = (value.offset - 1) * value.limit;
                    let limit = value.limit;
                    let sql = "select   t.`id`,t.`name` as `name`,t.`hash` as `hash` ,t.`url` ,t.`country`," + "t.`numberOfOffers` ,ifnull(a.`Impressions`,0) as `impressions`," + "ifnull(a.`Visits`,0) as `visits`,ifnull(a.`Clicks`,0) as `clicks`," + "ifnull(a.`Conversions`,0) as `conversions`,Round(ifnull(a.`Revenue`,0),2) as `revenue`," + "Round(ifnull(a.`Cost`,0),2)  as `cost`," + "Round(ifnull(a.`profit`,0),2)  as `profit`," + "Round(ifnull(a.`cpv`,0),4) as `cpv`," + "Round(ifnull(a.`ictr`,0)*100,2) as `ictr`," + "Round(ifnull(a.`ctr`,0)*100,2) as `ctr`," + "Round(ifnull(a.`cr`,0)*100,2) as `cr`," + "Round(ifnull(a.`cv`,0)*100,2)  as `cv`," + "Round(ifnull(a.`roi`,0)*100,2) as `roi`," + "Round(ifnull(a.`epv`,0)*100,4) as `epv`," + "Round(ifnull(a.`epc`,0)*100,2) as `epc`," + "Round(ifnull(a.`ap`,0)*100,2) as `ap` " + "from `Lander` t left join  " + "(select sum(`Impressions`) as `Impressions`,sum(`Visits`) as `Visits`,sum(`Clicks`) as `Clicks`,sum(`Conversions`) as `Conversions`,sum(`Revenue`/1000000) as `Revenue`,sum(`Cost`/1000000) as `Cost` ,`LanderID`," + "sum(`Revenue`/1000000)-sum(`Cost`/1000000) as `profit` , " + "sum(`Cost`/1000000)/sum(`Impressions`) as `cpv`," + "sum(`Visits`)/sum(`Impressions`) as `ictr`," + "sum(`Clicks`)/sum(`Visits`) as `ctr`," + "sum(`Conversions`)/sum(`Clicks`) as `cr`," + "sum(`Conversions`)/sum(`Visits`) as `cv`," + "sum(`Revenue`/1000000)/sum(`Cost`/1000000) as `roi`," + "sum(`Revenue`/1000000)/sum(`Visits`) as `epv`," + "sum(`Revenue`/1000000)/sum(`Clicks`) as `epc`," + "sum(`Revenue`/1000000)/sum(`Conversions`) as `ap`  from  `AdStatis`";

                    sql += " where `UserID`=" + value.userId + " and  `Timestamp` >=" + "UNIX_TIMESTAMP(CONVERT_TZ('" + value.from + "', '+00:00','" + value.tz + "')) and `Timestamp` <=" + "UNIX_TIMESTAMP(CONVERT_TZ('" + value.to + "', '+00:00','" + value.tz + "')) group by `LanderID` ) a  on a.`LanderID`= t.`id` where t.`userId`= " + value.userId;

                    if (value.filter) {
                        sql += " and t.`name` LIKE '%" + value.filter + "%'";
                    }
                    if (value.active == 0) {
                        sql += " and t.`deleted` = 0";
                    } else if (value.active == 1) {
                        sql += " and t.`deleted` = 1";
                    }

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
                return _ref5.apply(this, arguments);
            };
        })();
        start();
    });
}

function campaignReport(value, connection) {
    return new Promise(function (resolve, reject) {

        const start = (() => {
            var _ref6 = _asyncToGenerator(function* () {
                try {
                    let offset = (value.offset - 1) * value.limit;
                    let limit = value.limit;
                    let sql;
                    if (value.type == "TrackingCampaign") {
                        sql = "select  t.`id`,t.`name` as `name`,t.`hash` as `hash` ,t.`url` ,t.`impPixelUrl` ,t.`country` ," + "t.`trafficSourceName` ,t.`costModel`,t.`cpcValue` as `cpc`,t.`cpaValue` as `cpa`,t.`cpmValue` as `cpm`," + "t.`redirectMode` as `redirect`,";
                    } else if (value.type == "Offer") {
                        sql = "select  t.`id`,t.`name` as `name`,t.`hash` as `hash` ,t.`url` ,t.`postbackUrl` ,t.`country` ," + "t.`AffiliateNetworkName` ,t.`payoutValue`,";
                    }

                    sql += "ifnull(a.`Impressions`,0) as `impressions`," + "ifnull(a.`Visits`,0) as `visits`,ifnull(a.`Clicks`,0) as `clicks`," + "ifnull(a.`Conversions`,0) as `conversions`,Round(ifnull(a.`Revenue`,0),2) as `revenue`," + "Round(ifnull(a.`Cost`,0),2)  as `cost`," + "Round(ifnull(a.`profit`,0),2)  as `profit`," + "Round(ifnull(a.`cpv`,0),4) as `cpv`," + "Round(ifnull(a.`ictr`,0)*100,2) as `ictr`," + "Round(ifnull(a.`ctr`,0)*100,2) as `ctr`," + "Round(ifnull(a.`cr`,0)*100,2) as `cr`," + "Round(ifnull(a.`cv`,0)*100,2)  as `cv`," + "Round(ifnull(a.`roi`,0)*100,2) as `roi`," + "Round(ifnull(a.`epv`,0)*100,4) as `epv`," + "Round(ifnull(a.`epc`,0)*100,2) as `epc`," + "Round(ifnull(a.`ap`,0)*100,2) as `ap` from `" + value.type + "`  t left join  " + "(select sum(`Impressions`) as `Impressions`,sum(`Visits`) as `Visits`,sum(`Clicks`) as `Clicks`," + "sum(`Conversions`) as `Conversions`,sum(`Revenue`/1000000) as `Revenue`,sum(`Cost`/1000000) as `Cost` ,`" + value.groupBy + "`," + "sum(`Revenue`/1000000)-sum(`Cost`/1000000) as `profit` , " + "sum(`Cost`/1000000)/sum(`Impressions`) as `cpv`," + "sum(`Visits`)/sum(`Impressions`) as `ictr`," + "sum(`Clicks`)/sum(`Visits`) as `ctr`," + "sum(`Conversions`)/sum(`Clicks`) as `cr`," + "sum(`Conversions`)/sum(`Visits`) as `cv`," + "sum(`Revenue`/1000000)/sum(`Cost`/1000000) as `roi`," + "sum(`Revenue`/1000000)/sum(`Visits`) as `epv`," + "sum(`Revenue`/1000000)/sum(`Clicks`) as `epc`," + "sum(`Revenue`/1000000)/sum(`Conversions`) as `ap`  from  `AdStatis`";

                    sql += " where `UserID`=" + value.userId + " and  `Timestamp` >=" + "UNIX_TIMESTAMP(CONVERT_TZ('" + value.from + "', '+00:00','" + value.tz + "')) and `Timestamp` <=" + "UNIX_TIMESTAMP(CONVERT_TZ('" + value.to + "', '+00:00','" + value.tz + "')) ";

                    if (value.filter1 && value.filter1Value) {
                        "and `" + value.filter1 + "`='" + value.filter1Value + "'";
                    }
                    if (value.filter1 && value.filter1Value) {
                        "and `" + value.filter1 + "`='" + value.filter1Value + "'";
                    }

                    if (value.filter1 && value.filter1Value) {
                        "and `" + value.filter1 + "`='" + value.filter1Value + "'";
                    }

                    sql += "group by  `" + value.groupBy + "` ) a  on a.`" + value.groupBy + "`= t.`id` where t.`userId`= " + value.userId;

                    if (value.filter) {
                        sql += " and t.`name` LIKE '%" + value.filter + "%'";
                    }

                    if (value.active == 0) {
                        sql += " and t.`deleted` = 0";
                    } else if (value.active == 1) {
                        sql += " and t.`deleted` = 1";
                    }

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
                return _ref6.apply(this, arguments);
            };
        })();
        start();
    });
}

function offerReport(value, connection) {
    return new Promise(function (resolve, reject) {

        const start = (() => {
            var _ref7 = _asyncToGenerator(function* () {
                try {
                    let offset = (value.offset - 1) * value.limit;
                    let limit = value.limit;
                    let sql = "select  t.`id`,t.`name` as `name`,t.`hash` as `hash` ,t.`url` ,t.`postbackUrl` ,t.`country` ," + "t.`AffiliateNetworkName` ,t.`payoutValue`," + "ifnull(a.`Impressions`,0) as `impressions`," + "ifnull(a.`Visits`,0) as `visits`,ifnull(a.`Clicks`,0) as `clicks`," + "ifnull(a.`Conversions`,0) as `conversions`,Round(ifnull(a.`Revenue`,0),2) as `revenue`," + "Round(ifnull(a.`Cost`,0),2)  as `cost`," + "Round(ifnull(a.`profit`,0),2)  as `profit`," + "Round(ifnull(a.`cpv`,0),4) as `cpv`," + "Round(ifnull(a.`ictr`,0)*100,2) as `ictr`," + "Round(ifnull(a.`ctr`,0)*100,2) as `ctr`," + "Round(ifnull(a.`cr`,0)*100,2) as `cr`," + "Round(ifnull(a.`cv`,0)*100,2)  as `cv`," + "Round(ifnull(a.`roi`,0)*100,2) as `roi`," + "Round(ifnull(a.`epv`,0)*100,4) as `epv`," + "Round(ifnull(a.`epc`,0)*100,2) as `epc`," + "Round(ifnull(a.`ap`,0)*100,2) as `ap` " + "from `Offer` t left join  " + "(select sum(`Impressions`) as `Impressions`,sum(`Visits`) as `Visits`,sum(`Clicks`) as `Clicks`,sum(`Conversions`) as `Conversions`,sum(`Revenue`/1000000) as `Revenue`,sum(`Cost`/1000000) as `Cost` ,`OfferID`," + "sum(`Revenue`/1000000)-sum(`Cost`/1000000) as `profit` , " + "sum(`Cost`/1000000)/sum(`Impressions`) as `cpv`," + "sum(`Visits`)/sum(`Impressions`) as `ictr`," + "sum(`Clicks`)/sum(`Visits`) as `ctr`," + "sum(`Conversions`)/sum(`Clicks`) as `cr`," + "sum(`Conversions`)/sum(`Visits`) as `cv`," + "sum(`Revenue`/1000000)/sum(`Cost`/1000000) as `roi`," + "sum(`Revenue`/1000000)/sum(`Visits`) as `epv`," + "sum(`Revenue`/1000000)/sum(`Clicks`) as `epc`," + "sum(`Revenue`/1000000)/sum(`Conversions`) as `ap`  from  `AdStatis`";

                    sql += " where `UserID`=" + value.userId + " and  `Timestamp` >=" + "UNIX_TIMESTAMP(CONVERT_TZ('" + value.from + "', '+00:00','" + value.tz + "')) and `Timestamp` <=" + "UNIX_TIMESTAMP(CONVERT_TZ('" + value.to + "', '+00:00','" + value.tz + "')) group by `OfferID` ) a  on a.`OfferID`= t.`id` where t.`userId`= " + value.userId;

                    if (value.filter) {
                        sql += " and t.`name` LIKE '%" + value.filter + "%'";
                    }

                    if (value.active == 0) {
                        sql += " and t.`deleted` = 0";
                    } else if (value.active == 1) {
                        sql += " and t.`deleted` = 1";
                    }

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
                return _ref7.apply(this, arguments);
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