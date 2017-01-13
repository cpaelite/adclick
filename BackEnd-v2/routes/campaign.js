var express = require('express');
var router = express.Router();
var Joi = require('joi');
var async = require('async');
var uuidV4 = require('uuid/v4')

// * @apiParam {String} from 开始时间
// * @apiParam {String} to   截止时间
// * @apiParam {String} tz   timezone
// * @apiParam {String} sort  排序字段
// * @apiParam {String} direction  desc
// * @apiParam {String} groupBy   表名
// * @apiParam {Number} offset
// * @apiParam {Number} limit
// * @apiParam {String} filter1
// * @apiParam {String} filter1Value
// * @apiParam {String} {filter2}
// * @apiParam {String} {filter2Value}
// * @apiParam {Array}  columns     列

function campaignList(values, callback) {
    pool.getConnection(function (err, connection) {
        if (err) {
            err.status = 303
            return next(err);
        }
        // var sql= "select t.`hash` as campaignId ,t.name` as campaignName,"+
        //  "t.`url` as campaignUrl,t.`country` as campaignCountry,t.`trafficSourceName` as trafficSourceName,t.`costModel` as costModel,"+
        //  "t.`costValue` as costValue,a.`Visits` as visits , a.`Clicks` as clicks,a.`Conversions` as conversions ,a.`Cost` as cost "+
        //  " from `TrackingCampaign` t left join `AdStatis` a  on  t.`hash`=a.`CampaignID`  where a.`userId`="+values.userId + "and a.`Timestamp` between " +
        //     "unix_timestamp(CONVERT_TZ("+values.from+","+values.tz+""+",'+08:00','+00:00'))"
        //
        //  connection.query()
    })
}


// select
// case
// when t.`costModel`= 1 then "cpc"
// when t.`costModel`= 2 then "cpa"
// when t.`costModel`= 3 then "cpm"
// else "Do-not-track-costs" end as costModel,
//     t.`costValue`,t.`country` as campaignCountry,t.`trafficSourceName` as trafficSourceName,
// t.`hash` as campaignId,t.`name` as campaignName,t.`url` as campaignUrl,
// a.`Clicks` as Clicks,a.`Conversions` as Conversions,0 as Impressions,a.`Visits` as Visits,a.`Payout` as Revenue,
// a.`Cost` as Cost,(a.`Payout`-a.`Cost`) as Profit,
//     from `TrackingCampaign` t left join `AdStatis` a where t.`userId`=1 and t.`hash` = a.`CampaignID`
// and a.`Timestamp` BETWEEN UNIX_TIMESTAMP(CONVERT_TZ('','+08:00','+00:00')) and UNIX_TIMESTAMP(CONVERT_TZ('','+08:00','+00:00'))


exports.campaignList = campaignList

//Request Example:

// {
//     "name": "testcapm",
//     "url": "hddssds",
//     "redirectMode": 0,
//     "impPixelUrl": "idddsdsds",
//     "country": {
//     "id": 1,
//         "name": "Andorra",
//         "alpha2Code": "AD",
//         "alpha3Code": "AND",
//         "numCode": 20
// },
//     "costModel": 0,
//     "cpc": 0.8,
//     "targetType": 0,
//     "status": 1,
//     "trafficSource": {
//     "id": 2,
//         "name": "trafficsource"
// },
//     "tags": [
//     "tagstest",
//     "hhh"
// ],
//     "flow": {
//     "type": 1,
//         "name": "flowtest",
//         "country": {
//         "id": 1,
//             "name": "Andorra",
//             "alpha2Code": "AD",
//             "alpha3Code": "AND",
//             "numCode": 20
//     },
//     "redirectMode": 0,
//         "rules": [
//         {
//             "name": "ruletest",
//             "type": 1,
//             "json": {},
//             "status": 1,
//             "rule2flow": 1,
//             "paths": [
//                 {
//                     "name": "pathtest",
//                     "redirectMode": 0,
//                     "directLink": 0,
//                     "status": 1,
//                     "path2rule": 1,
//                     "weight": 100,
//                     "landers": [
//                         {
//                             "name": "landertest",
//                             "url": "dddffd",
//                             "country": {
//                                 "id": 1,
//                                 "name": "Andorra",
//                                 "alpha2Code": "AD",
//                                 "alpha3Code": "AND",
//                                 "numCode": 20
//                             },
//                             "numberOfOffers": 2,
//                             "weight": 100,
//                             "tags": [
//                                 "landertags",
//                                 "landertest2"
//                             ]
//                         }
//                     ],
//                     "offers": [
//                         {
//                             "name": "offertest",
//                             "url": "eweewwe",
//                             "weight":100,
//                             "country": {
//                                 "id": 1,
//                                 "name": "Andorra",
//                                 "alpha2Code": "AD",
//                                 "alpha3Code": "AND",
//                                 "numCode": 20
//                             },
//                             "affiliateNetwork": {
//                                 "id": 1,
//                                 "name": "appnext"
//                             },
//                             "postbackUrl": "dshshds",
//                             "payoutMode": 0,
//                             "payoutValue": 0.8,
//                             "tags": [
//                                 "offertag1",
//                                 "offertag2"
//                             ]
//                         }
//                     ]
//                 }
//             ]
//         }
//     ]
// }
// }



//Response Example
//
// {
//     "status": 1,
//     "message": "success",
//     "data": {
//     "campaign": {
//         "name": "testcapm",
//             "url": "hddssds",
//             "redirectMode": 0,
//             "impPixelUrl": "idddsdsds",
//             "country": {
//             "id": 1,
//                 "name": "Andorra",
//                 "alpha2Code": "AD",
//                 "alpha3Code": "AND",
//                 "numCode": 20
//         },
//         "costModel": 0,
//             "cpc": 0.8,
//             "targetType": 0,
//             "status": 1,
//             "trafficSource": {
//             "id": 2,
//                 "name": "trafficsource"
//         },
//         "tags": [
//             "tagstest",
//             "hhh"
//         ],
//             "flow": {
//             "type": 1,
//                 "name": "flowtest",
//                 "country": {
//                 "id": 1,
//                     "name": "Andorra",
//                     "alpha2Code": "AD",
//                     "alpha3Code": "AND",
//                     "numCode": 20
//             },
//             "redirectMode": 0,
//                 "rules": [
//                 {
//                     "name": "ruletest",
//                     "type": 1,
//                     "json": {},
//                     "status": 1,
//                     "rule2flow": 1,
//                     "paths": [
//                         {
//                             "name": "pathtest",
//                             "redirectMode": 0,
//                             "directLink": 0,
//                             "status": 1,
//                             "path2rule": 1,
//                             "weight": 100,
//                             "landers": [
//                                 {
//                                     "name": "landertest",
//                                     "url": "dddffd",
//                                     "country": {
//                                         "id": 1,
//                                         "name": "Andorra",
//                                         "alpha2Code": "AD",
//                                         "alpha3Code": "AND",
//                                         "numCode": 20
//                                     },
//                                     "numberOfOffers": 2,
//                                     "weight": 100,
//                                     "tags": [
//                                         "landertags",
//                                         "landertest2"
//                                     ],
//                                     "id": 1
//                                 }
//                             ],
//                             "offers": [
//                                 {
//                                     "name": "offertest",
//                                     "url": "eweewwe",
//                                     "weight": 100,
//                                     "country": {
//                                         "id": 1,
//                                         "name": "Andorra",
//                                         "alpha2Code": "AD",
//                                         "alpha3Code": "AND",
//                                         "numCode": 20
//                                     },
//                                     "affiliateNetwork": {
//                                         "id": 1,
//                                         "name": "appnext"
//                                     },
//                                     "postbackUrl": "dshshds",
//                                     "payoutMode": 0,
//                                     "payoutValue": 0.8,
//                                     "tags": [
//                                         "offertag1",
//                                         "offertag2"
//                                     ],
//                                     "id": 1
//                                 }
//                             ],
//                             "id": 1
//                         }
//                     ],
//                     "id": 1
//                 }
//             ],
//                 "id": 1
//         },
//         "id": 1
//     }
// }
// }

/**
 * @api {post} /api/campaign  新增campaign
 * @apiName 新增campaign
 * @apiGroup campaign
 *
 * @apiParam {String} name
 * @apiParam {String} url
 * @apiParam {String} {impPixelUrl}
 * @apiParam {Object} trafficSource {id:1,name:""}
 * @apiParam {Object} country  {"id": 1,"name": "Andorra", "alpha2Code": "AD","alpha3Code": "AND","numCode": 20}
 * @apiParam {Number} costModel  0:Do-not-track-costs;1:cpc;2:cpa;3:cpm;4:auto?
 * @apiParam {Number} {cpc}
 * @apiParam {Number} {cpa}
 * @apiParam {Number} {cpm}
 * @apiParam {Number} redirectMode 0:302;1:Meta refresh;2:Double meta refresh
 * @apiParam {Array} {tags}
 * @apiParam {Number} targetType 跳转类型 0:URL;1:Flow;2:Rule;3:Path;4:Lander;5:Offer
 * @apiParam {Number} {targetFlowId} targetType 为 1
 * @apiParam {String} {targetUrl}  targetType 为 0
 * @apiParam {Number} status
 *
 * @apiSuccessExample {json} Success-Response:
 *   {
 *    status: 1,
 *    message: 'success',
 *    data:{}
 *
 *   }

 *
 */
router.post('/api/campaign', function (req, res, next) {
    var schema = Joi.object().keys({
        userId: Joi.number().required(),
        name: Joi.string().required(),
        url: Joi.string().required(),
        trafficSource: Joi.object().required(),
        costModel: Joi.number().required(),
        redirectMode: Joi.number().required(),
        targetType: Joi.number().required(),
        status: Joi.number().required(),
        flow: Joi.object().required().keys({
            rules: Joi.array().required().length(1),
            hash: Joi.string(),
            type: Joi.number(),
            name: Joi.string(),
            country: Joi.object(),
            redirectMode: Joi.number()
        }).optionalKeys('hash', 'type', 'name', 'country', 'redirectMode'),
        country: Joi.object().optional(),
        impPixelUrl: Joi.string().optional(),
        cpc: Joi.number().optional(),
        cpa: Joi.number().optional(),
        cpm: Joi.number().optional(),
        tags: Joi.array().optional(),
        hash: Joi.string().optional()
    });
    req.body.userId = req.userId
    Joi.validate(req.body, schema, function (err, value) {

        if (err) {
            return next(err);
        }
        pool.getConnection(function (err, connection) {
            if (err) {

                err.status = 303
                return next(err);
            }
            connection.beginTransaction(function (err) {
                if (err) {
                    return next(err)
                }
                var ParallelArray = {}
                var col = "`userId`,`name`,`hash`,`url`,`trafficSourceId`,`trafficSourceName`,`redirectMode`,`status`"
                var val = value.userId + ",'" + value.name + "','" + uuidV4() + "','" + value.url + "'," + value.trafficSource.id + ",'" + value.trafficSource.name + "'," + value.redirectMode + "," + value.status;
                if (value.impPixelUrl != undefined) {
                    col += ",`impPixelUrl`"
                    val += ",'" + value.impPixelUrl + "'"
                }
                if (value.cpc != undefined) {
                    col += ",`cpcValue`"
                    val += "," + value.cpc
                }
                if (value.cpa != undefined) {
                    col += ",`cpaValue`"
                    val += "," + value.cpa
                }
                if (value.cpm != undefined) {
                    col += ",`cpmValue`"
                    val += "," + value.cpm
                }

                if (value.country) {
                    var countryCode = value.country.alpha3Code ? value.country.alpha3Code : ""
                    col += ",`country`"
                    val += ",'" + countryCode + "'"
                }
                //required
                col += ",`costModel`"
                val += "," + value.costModel

                col += ",`targetType`"
                val += "," + value.targetType


                // step 1 插入campaign主体表

                //flow targetType=1 &&  flow.id
                if (value.flow && value.flow.id) {
                    col += ",`targetFlowId`"
                    val += "," + value.flow.id
                }


                var sqlCampaign = "insert into TrackingCampaign (" + col + ") values (" + val + ")";


                ParallelArray.campaign = function (callback) {
                    connection.query(sqlCampaign, callback);
                }


                //flow targetType=1 &&  !flow.id
                if (value.flow && !value.flow.id) {
                    var flow_col = "`userId`,`name`,`hash`,`type`,`redirectMode`"
                    var flow_val = value.userId + ",'" + value.flow.name + "','" + uuidV4() + "'," + 1 + "," + value.flow.redirectMode
                    if (value.flow.country) {
                        var countryCode = value.flow.country.alpha3Code ? value.flow.country.alpha3Code : ""
                        flow_col += ",`country`"
                        flow_val += ",'" + countryCode + "'"
                    }
                    var sqlFlow = "insert into Flow (" + flow_col + ") values (" + flow_val + ")";

                    ParallelArray.flow = function (callback) {
                        connection.query(sqlFlow, callback);
                    }

                }


                async.parallel(ParallelArray, function (err, results) {
                    if (err) {
                        return connection.rollback(function () {
                            return next(err);
                        });
                    }

                    var campaignId = results.campaign[0].insertId;
                    //campaignId
                    value.id = campaignId;

                    var flowId = value.flow.id ? value.flow.id : (results.flow ? results.flow[0].insertId : "");

                    if (!flowId) {
                        return next(new Error('Flow ID Lost'));
                    }
                    //flowid
                    value.flow.id = flowId;

                    var parallelNext = [];

                    //campain 若存在tags 插入Tags表
                    if (value.tags && value.tags.length > 0) {

                        for (let index = 0; index < value.tags.length; index++) {
                            var sqlTags = "insert into `Tags` (`userId`,`name`,`type`,`targetId`) values (?,?,?,?)"

                            parallelNext.push(function (callback) {
                                connection.query(sqlTags, [value.userId, value.tags[index], 1, campaignId], callback)
                            });
                        }
                    }


                    if (value.flow.rules && value.flow.rules.length > 0) {

                        for (let i = 0; i < value.flow.rules.length; i++) {
                            if (!value.flow.rules[i].id) {
                                //rules
                                parallelNext.push(function (callback) {
                                    var sqlRule = "insert into `Rule` (`userId`,`name`,`hash`,`type`,`json`,`status`) values (?,?,?,?,?,?)"
                                    connection.query(sqlRule, [value.userId, value.flow.rules[i].name, uuidV4(), 1, JSON.stringify(value.flow.rules[i].json), value.flow.rules[i].status], function (err, ruleResult) {
                                        if (err) {
                                            return callback(err);
                                        }
                                        //ruleid
                                        value.flow.rules[i].id = ruleResult.insertId;

                                        var parallelRuleNext = [];

                                        if (value.flow.rules[i].paths && value.flow.rules[i].paths.length > 0) {
                                            for (let j = 0; j < value.flow.rules[i].paths.length; j++) {
                                                if (!value.flow.rules[i].paths.id) {
                                                    var sqlpath = "insert into `Path` (`userId`,`name`,`hash`,`redirectMode`,`directLink`,`status`) values (?,?,?,?,?,?)"

                                                    //paths
                                                    parallelRuleNext.push(function (ck) {
                                                        connection.query(sqlpath, [value.userId, value.flow.rules[i].paths[j].name, uuidV4(), value.flow.rules[i].paths[j].redirectMode, value.flow.rules[i].paths[j].directLink, value.flow.rules[i].paths[j].status], function (err, pathResult) {

                                                            if (err) {
                                                                return ck(err);
                                                            }

                                                            //pathid
                                                            value.flow.rules[i].paths[j].id = pathResult.insertId

                                                            var parallelPathNextLander = [];
                                                            var parallelPathNextOffer = [];


                                                            //landers
                                                            if (value.flow.rules[i].paths[j].landers && value.flow.rules[i].paths[j].landers.length > 0) {

                                                                for (let k = 0; k < value.flow.rules[i].paths[j].landers.length; k++) {
                                                                    if (!value.flow.rules[i].paths[j].landers[k].id) {
                                                                        var lander_col = "`userId`,`name`,`hash`,`url`,`numberOfOffers`"
                                                                        var lander_val = value.userId + ",'" + value.flow.rules[i].paths[j].landers[k].name + "','" + uuidV4() + "','" + value.flow.rules[i].paths[j].landers[k].url + "'," + value.flow.rules[i].paths[j].landers[k].numberOfOffers
                                                                        if (value.flow.rules[i].paths[j].landers[k].country) {
                                                                            var countryCode = value.flow.rules[i].paths[j].landers[k].country.alpha3Code ? value.flow.rules[i].paths[j].landers[k].country.alpha3Code : ""
                                                                            lander_col += ",`country`"
                                                                            lander_val += ",'" + countryCode +"'"
                                                                        }
                                                                        var sqllander = "insert into Lander (" + lander_col + ") values (" + lander_val + ") ";

                                                                        parallelPathNextLander.push(function (cb) {
                                                                            connection.query(sqllander, function (err, landersResult) {
                                                                                if (err) {
                                                                                    return cb(err);
                                                                                }
                                                                                //landerid
                                                                                value.flow.rules[i].paths[j].landers[k].id = landersResult.insertId

                                                                                var parallelPathNextLanderTags = [];
                                                                                //tags
                                                                                if (value.flow.rules[i].paths[j].landers[k].tags && value.flow.rules[i].paths[j].landers[k].tags.length > 0) {
                                                                                    var sqlTags = "insert into `Tags` (`userId`,`name`,`type`,`targetId`) values (?,?,?,?)"
                                                                                    for (let q = 0; q < value.flow.rules[i].paths[j].landers[k].tags.length; q++) {

                                                                                        parallelPathNextLanderTags.push(function (back) {
                                                                                            connection.query(sqlTags, [value.userId, value.flow.rules[i].paths[j].landers[k].tags[q], 2, landersResult.insertId], back)
                                                                                        });
                                                                                    }
                                                                                }

                                                                                //lander2path

                                                                                parallelPathNextLanderTags.push(function (back) {
                                                                                    var sqllander2path = "insert into Lander2Path (`landerId`,`pathId`,`weight`) values (?,?,?)"
                                                                                    connection.query(sqllander2path, [landersResult.insertId, pathResult.insertId, value.flow.rules[i].paths[j].landers[k].weight], back)
                                                                                });

                                                                                if (parallelPathNextLanderTags.length) {

                                                                                    async.parallel(parallelPathNextLanderTags, cb)
                                                                                } else {
                                                                                    cb(err, landersResult);
                                                                                }

                                                                            });
                                                                        });
                                                                    }
                                                                }
                                                            }


                                                            //offers
                                                            if (value.flow.rules[i].paths[j].offers && value.flow.rules[i].paths[j].offers.length > 0) {
                                                                for (let z = 0; z < value.flow.rules[i].paths[j].offers.length; z++) {
                                                                    if (!value.flow.rules[i].paths[j].offers[z].id) {
                                                                        var offer_col = "`userId`,`name`,`hash`,`url`,`payoutMode`"
                                                                        var offer_val = value.userId + ",'" + value.flow.rules[i].paths[j].offers[z].name + "','" + uuidV4() + "','" + value.flow.rules[i].paths[j].offers[z].url + "'," + value.flow.rules[i].paths[j].offers[z].payoutMode
                                                                        if (value.flow.rules[i].paths[j].offers[z].country) {
                                                                            var countrycode = value.flow.rules[i].paths[j].offers[z].country.alpha3Code ? value.flow.rules[i].paths[j].offers[z].country.alpha3Code : ""
                                                                            offer_col += ",`country`"
                                                                            offer_val += ",'" + countrycode+"'"
                                                                        }
                                                                        if (value.flow.rules[i].paths[j].offers[z].postbackUrl) {
                                                                            offer_col += ",`postbackUrl`"
                                                                            offer_val += ",'" + value.flow.rules[i].paths[j].offers[z].postbackUrl +"'"
                                                                        }
                                                                        if (value.flow.rules[i].paths[j].offers[z].payoutValue) {
                                                                            offer_col += ",`payoutValue`"
                                                                            offer_val += "," + value.flow.rules[i].paths[j].offers[z].payoutValue
                                                                        }
                                                                        if (value.flow.rules[i].paths[j].offers[z].affiliateNetwork && value.flow.rules[i].paths[j].offers[z].affiliateNetwork.id) {
                                                                            offer_col += ",`AffiliateNetworkId`"
                                                                            offer_val += "," + value.flow.rules[i].paths[j].offers[z].affiliateNetwork.id
                                                                        }
                                                                        var sqloffer = "insert into Offer (" + offer_col + ") values (" + offer_val + ") ";
                                                                        parallelPathNextOffer.push(function (cb) {
                                                                            connection.query(sqloffer, function (err, offerResult) {
                                                                                if (err) {
                                                                                    return cb(err);
                                                                                }
                                                                                //offerid
                                                                                value.flow.rules[i].paths[j].offers[z].id = offerResult.insertId;

                                                                                var parallelPathNextOfferTags = [];
                                                                                //tags
                                                                                if (value.flow.rules[i].paths[j].offers[z].tags && value.flow.rules[i].paths[j].offers[z].tags.length > 0) {
                                                                                    var sqlTags = "insert into `Tags` (`userId`,`name`,`type`,`targetId`) values (?,?,?,?)"
                                                                                    for (let p = 0; p < value.flow.rules[i].paths[j].offers[z].tags.length; p++) {
                                                                                        parallelPathNextOfferTags.push(function (back) {
                                                                                            connection.query(sqlTags, [value.userId, value.flow.rules[i].paths[j].offers[z].tags[p], 3, offerResult.insertId], back)
                                                                                        });
                                                                                    }
                                                                                }

                                                                                //offer2path
                                                                                var sqloffer2path = "insert into Offer2Path (`offerId`,`pathId`,`weight`) values (?,?,?)"

                                                                                parallelPathNextOfferTags.push(function (back) {
                                                                                    connection.query(sqloffer2path, [offerResult.insertId, pathResult.insertId, value.flow.rules[i].paths[j].offers[z].weight], back)
                                                                                });

                                                                                if (parallelPathNextOfferTags.length) {
                                                                                    async.parallel(parallelPathNextOfferTags, cb)
                                                                                } else {
                                                                                    cb(err, offerResult);
                                                                                }

                                                                            });
                                                                        });
                                                                    }
                                                                }

                                                            }


                                                            var Lander_Offer_Array = parallelPathNextLander.concat(parallelPathNextOffer);

                                                            //path2rule
                                                            var sqlpath2rule = "insert into Path2Rule (`pathId`,`ruleId`,`weight`,`status`) values (?,?,?,?)"

                                                            Lander_Offer_Array.push(function (callback) {
                                                                connection.query(sqlpath2rule, [pathResult.insertId, ruleResult.insertId, value.flow.rules[i].paths[j].weight, value.flow.rules[i].paths[j].path2rule], callback);
                                                            });


                                                            //并行处理 landers offers

                                                            async.parallel(Lander_Offer_Array, ck);


                                                        });
                                                    });
                                                }
                                            }
                                        }

                                        //rule2flow



                                        parallelRuleNext.push(function (cb) {
                                            var sqlrule2flow = "insert into Rule2Flow (`ruleId`,`flowId`,`status`) values (?,?,?)"
                                            connection.query(sqlrule2flow, [ruleResult.insertId, flowId, value.flow.rules[i].rule2flow], cb);
                                        });


                                        if (parallelRuleNext.length) {
                                            async.parallel(parallelRuleNext, callback);
                                        } else {
                                            callback(err, ruleResult);
                                        }
                                    })
                                });
                            }
                        }
                    }

                    if (parallelNext.length) {
                        async.parallel(parallelNext, function (err, doc) {

                            if (err) {
                                return connection.rollback(function () {
                                    return next(err);
                                });
                            }
                            connection.commit(function (err) {
                                if (err) {
                                    return connection.rollback(function () {
                                        return next(err);
                                    });
                                }
                                delete value.userId;
                                res.json({
                                    status: 1,
                                    message: 'success',
                                    data: {campaign:value}
                                })
                            })

                        });
                    } else {
                        connection.commit(function (err) {
                            if (err) {
                                return connection.rollback(function () {
                                    return next(err);
                                });
                            }
                            delete value.userId;
                            res.json({
                                status: 1,
                                message: 'success',
                                data: {campaign:value}
                            })
                        });

                    }

                });

            });

        });
    });
});


module.exports = router;




