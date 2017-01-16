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
 * @api {post} /api/campaign/:id  编辑campaign
 * @apiName 编辑campaign
 * @apiGroup campaign
 *
 * @apiParam {Number} id
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
        id: Joi.number.optional(),
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
    req.body.userId = req.userId;

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
                //Campaign
                if (value.id) {
                    ParallelArray.campaign = updateCampaign(value, connection);
                } else {
                    ParallelArray.campaign = insertCampaign(value, connection);
                }


                //Flow
                if (value.flow && !value.flow.id) {
                    ParallelArray.flow = insertFlow(value, connection)
                } else if (value.flow && value.flow.id) {
                    ParallelArray.flow = updateFlow(value, connection)
                }


                //并发
                async.parallel(ParallelArray, function (err, results) {
                    if (err) {
                        return connection.rollback(function () {
                            return next(err);
                        });
                    }

                    var campaignId = value.id ? value.id : (results.campaign[0].insertId ? results.campaign[0].insertId : 0 );

                    if (!campaignId) {
                        return next(new Error('Campaign ID Lost'));
                    }
                    //campaignId
                    value.id = campaignId;


                    var flowId = value.flow.id ? value.flow.id : (results.flow ? results.flow[0].insertId : 0);

                    if (!flowId) {
                        return next(new Error('Flow ID Lost'));
                    }
                    //flowId
                    value.flow.id = flowId;

                    var parallelNext = [];

                    //删除所有tags
                    parallelNext.push(updateTags(value.userId, campaignId, 1, connection));

                    //campain Tags
                    if (value.tags && value.tags.length > 0) {
                        if (value.tags && value.tags.length > 0) {
                            for (let index = 0; index < value.tags.length; index++) {
                                parallelNext.push(insertTags(value.userId, campaignId, value.tags[index], 1, connection));
                            }
                        }
                    }


                    if (value.flow.rules && value.flow.rules.length > 0) {

                        for (let i = 0; i < value.flow.rules.length; i++) {
                            if (!value.flow.rules[i].id) {
                                //Rule
                                parallelNext.push(function (callback) {
                                    insetRule(value.userId, value.flow.rules[i], connection, function (err, ruleResult) {
                                        if (err) {
                                            return callback(err);
                                        }
                                        //ruleId
                                        value.flow.rules[i].id = ruleResult.insertId;

                                        var parallelRuleNext = [];

                                        if (value.flow.rules[i].paths && value.flow.rules[i].paths.length > 0) {
                                            for (let j = 0; j < value.flow.rules[i].paths.length; j++) {
                                                if (!value.flow.rules[i].paths.id) {
                                                    //paths
                                                    parallelRuleNext.push(function (ck) {
                                                        insertPath(value.userId, value.flow.rules[i].paths[j], connection, function (err, pathResult) {
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

                                                                        parallelPathNextLander.push(function (cb) {
                                                                            insertLander(value.userId, value.flow.rules[i].paths[j].landers[k], connection, function (err, landersResult) {
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
                                                                                    insertLander2Path(landersResult.insertId, pathResult.insertId, value.flow.rules[i].paths[j].landers[k].weight, connection, back)
                                                                                });

                                                                                if (parallelPathNextLanderTags.length) {

                                                                                    async.parallel(parallelPathNextLanderTags, cb)
                                                                                } else {
                                                                                    cb(err, landersResult);
                                                                                }

                                                                            });
                                                                        });
                                                                    }else {

                                                                        parallelPathNextLander.push(function (cb) {
                                                                            updateLander(value.userId, value.flow.rules[i].paths[j].landers[k], connection, function (err) {
                                                                                if (err) {
                                                                                    return cb(err);
                                                                                }


                                                                                var parallelPathNextLanderTags = [];
                                                                                //删除所有tags
                                                                                var sqldeleteTags = "update `Tags` set `deleted`=1 where `userId`= ?  and `targetId`=? and `type`= 2 ";

                                                                                parallelPathNextLanderTags.push(function (callback) {
                                                                                    connection.query(sqldeleteTags, [value.userId, value.flow.rules[i].paths[j].landers[k].id], callback)
                                                                                });


                                                                                //tags
                                                                                if (value.flow.rules[i].paths[j].landers[k].tags && value.flow.rules[i].paths[j].landers[k].tags.length > 0) {
                                                                                    var sqlTags = "insert into `Tags` (`userId`,`name`,`type`,`targetId`) values (?,?,?,?)"
                                                                                    for (let q = 0; q < value.flow.rules[i].paths[j].landers[k].tags.length; q++) {

                                                                                        parallelPathNextLanderTags.push(function (back) {
                                                                                            connection.query(sqlTags, [value.userId, value.flow.rules[i].paths[j].landers[k].tags[q], 2, value.flow.rules[i].paths[j].landers[k].id], back)
                                                                                        });
                                                                                    }
                                                                                }

                                                                                //lander2path

                                                                                parallelPathNextLanderTags.push(function (back) {
                                                                                    var sqllander2path = "update  Lander2Path set `weight`= ? where `landerId` =? and `pathId`=?"
                                                                                    connection.query(sqllander2path, [value.flow.rules[i].paths[j].landers[k].weight, value.flow.rules[i].paths[j].landers[k].id, value.flow.rules[i].paths[j].id], back)
                                                                                });

                                                                                if (parallelPathNextLanderTags.length) {

                                                                                    async.parallel(parallelPathNextLanderTags, cb)
                                                                                } else {
                                                                                    cb(err);
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
                                                                            offer_val += ",'" + countrycode + "'"
                                                                        }
                                                                        if (value.flow.rules[i].paths[j].offers[z].postbackUrl) {
                                                                            offer_col += ",`postbackUrl`"
                                                                            offer_val += ",'" + value.flow.rules[i].paths[j].offers[z].postbackUrl + "'"
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
                                                                    }else {
                                                                        parallelPathNextOffer.push(function (cb) {
                                                                            updateOffer(value.userId, value.flow.rules[i].paths[j].offers[z], connection, function (err) {
                                                                                if (err) {
                                                                                    return cb(err);
                                                                                }

                                                                                var parallelPathNextOfferTags = [];

                                                                                //删除所有tags
                                                                                var sqldeleteTags = "update `Tags` set `deleted`=1 where `userId`= ?  and `targetId`=? and `type`= 3 ";

                                                                                parallelPathNextOfferTags.push(function (callback) {
                                                                                    connection.query(sqldeleteTags, [value.userId, value.flow.rules[i].paths[j].offers[z].id], callback)
                                                                                });


                                                                                //tags
                                                                                if (value.flow.rules[i].paths[j].offers[z].tags && value.flow.rules[i].paths[j].offers[z].tags.length > 0) {
                                                                                    var sqlTags = "insert into `Tags` (`userId`,`name`,`type`,`targetId`) values (?,?,?,?)"
                                                                                    for (let p = 0; p < value.flow.rules[i].paths[j].offers[z].tags.length; p++) {
                                                                                        parallelPathNextOfferTags.push(function (back) {
                                                                                            connection.query(sqlTags, [value.userId, value.flow.rules[i].paths[j].offers[z].tags[p], 3, value.flow.rules[i].paths[j].offers[z].id], back)
                                                                                        });
                                                                                    }
                                                                                }

                                                                                //offer2path

                                                                                parallelPathNextOfferTags.push(function (back) {
                                                                                    updateOffer2Path(value.flow.rules[i].paths[j].offers[z].id, value.flow.rules[i].paths[j].id, value.flow.rules[i].paths[j].offers[z].weight, connection, back)
                                                                                });

                                                                                if (parallelPathNextOfferTags.length) {
                                                                                    async.parallel(parallelPathNextOfferTags, cb)
                                                                                } else {
                                                                                    cb(err);
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
                                                } else {
                                                    parallelRuleNext.push(function (ck) {
                                                        updatePath(value.userId, value.flow.rules[i].paths[j], connection, function (err) {
                                                            if (err) {
                                                                return ck(err);
                                                            }

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
                                                                            lander_val += ",'" + countryCode + "'"
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
                                                                    } else {

                                                                        parallelPathNextLander.push(function (cb) {
                                                                            updateLander(value.userId, value.flow.rules[i].paths[j].landers[k], connection, function (err) {
                                                                                if (err) {
                                                                                    return cb(err);
                                                                                }


                                                                                var parallelPathNextLanderTags = [];
                                                                                //删除所有tags
                                                                                var sqldeleteTags = "update `Tags` set `deleted`=1 where `userId`= ?  and `targetId`=? and `type`= 2 ";

                                                                                parallelPathNextLanderTags.push(function (callback) {
                                                                                    connection.query(sqldeleteTags, [value.userId, value.flow.rules[i].paths[j].landers[k].id], callback)
                                                                                });


                                                                                //tags
                                                                                if (value.flow.rules[i].paths[j].landers[k].tags && value.flow.rules[i].paths[j].landers[k].tags.length > 0) {
                                                                                    var sqlTags = "insert into `Tags` (`userId`,`name`,`type`,`targetId`) values (?,?,?,?)"
                                                                                    for (let q = 0; q < value.flow.rules[i].paths[j].landers[k].tags.length; q++) {

                                                                                        parallelPathNextLanderTags.push(function (back) {
                                                                                            connection.query(sqlTags, [value.userId, value.flow.rules[i].paths[j].landers[k].tags[q], 2, value.flow.rules[i].paths[j].landers[k].id], back)
                                                                                        });
                                                                                    }
                                                                                }

                                                                                //lander2path

                                                                                parallelPathNextLanderTags.push(function (back) {
                                                                                    var sqllander2path = "update  Lander2Path set `weight`= ? where `landerId` =? and `pathId`=?"
                                                                                    connection.query(sqllander2path, [value.flow.rules[i].paths[j].landers[k].weight, value.flow.rules[i].paths[j].landers[k].id, value.flow.rules[i].paths[j].id], back)
                                                                                });

                                                                                if (parallelPathNextLanderTags.length) {

                                                                                    async.parallel(parallelPathNextLanderTags, cb)
                                                                                } else {
                                                                                    cb(err);
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
                                                                            offer_val += ",'" + countrycode + "'"
                                                                        }
                                                                        if (value.flow.rules[i].paths[j].offers[z].postbackUrl) {
                                                                            offer_col += ",`postbackUrl`"
                                                                            offer_val += ",'" + value.flow.rules[i].paths[j].offers[z].postbackUrl + "'"
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
                                                                    } else {


                                                                        parallelPathNextOffer.push(function (cb) {
                                                                            updateOffer(value.userId, value.flow.rules[i].paths[j].offers[z], connection, function (err) {
                                                                                if (err) {
                                                                                    return cb(err);
                                                                                }

                                                                                var parallelPathNextOfferTags = [];

                                                                                //删除所有tags
                                                                                var sqldeleteTags = "update `Tags` set `deleted`=1 where `userId`= ?  and `targetId`=? and `type`= 3 ";

                                                                                parallelPathNextOfferTags.push(function (callback) {
                                                                                    connection.query(sqldeleteTags, [value.userId, value.flow.rules[i].paths[j].offers[z].id], callback)
                                                                                });


                                                                                //tags
                                                                                if (value.flow.rules[i].paths[j].offers[z].tags && value.flow.rules[i].paths[j].offers[z].tags.length > 0) {
                                                                                    var sqlTags = "insert into `Tags` (`userId`,`name`,`type`,`targetId`) values (?,?,?,?)"
                                                                                    for (let p = 0; p < value.flow.rules[i].paths[j].offers[z].tags.length; p++) {
                                                                                        parallelPathNextOfferTags.push(function (back) {
                                                                                            connection.query(sqlTags, [value.userId, value.flow.rules[i].paths[j].offers[z].tags[p], 3, value.flow.rules[i].paths[j].offers[z].id], back)
                                                                                        });
                                                                                    }
                                                                                }

                                                                                //offer2path

                                                                                parallelPathNextOfferTags.push(function (back) {
                                                                                    updateOffer2Path(value.flow.rules[i].paths[j].offers[z].id, value.flow.rules[i].paths[j].id, value.flow.rules[i].paths[j].offers[z].weight, connection, back)
                                                                                });

                                                                                if (parallelPathNextOfferTags.length) {
                                                                                    async.parallel(parallelPathNextOfferTags, cb)
                                                                                } else {
                                                                                    cb(err);
                                                                                }

                                                                            });
                                                                        });


                                                                    }
                                                                }

                                                            }


                                                            var Lander_Offer_Array = parallelPathNextLander.concat(parallelPathNextOffer);

                                                            //path2rule

                                                            Lander_Offer_Array.push(function (callback) {
                                                                updatePath2Rule(value.flow.rules[i].paths.id, value.flow.rules[i].id, value.flow.rules[i].paths[j].weight, value.flow.rules[i].paths[j].path2rule, connection, callback)
                                                            });

                                                            //并行处理 landers offers

                                                            async.parallel(Lander_Offer_Array, ck);

                                                        });
                                                    })

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
                            } else {
                                parallelNext.push(function (callback) {
                                    updateRule(value.userId, value.flow.rules[i], connection, function (err) {
                                        if (err) {
                                            return callback(err);
                                        }
                                        var parallelRuleNext = [];

                                        if (value.flow.rules[i].paths && value.flow.rules[i].paths.length > 0) {
                                            for (let j = 0; j < value.flow.rules[i].paths.length; j++) {
                                                if (!value.flow.rules[i].paths[j].id) {
                                                    //paths
                                                    parallelRuleNext.push(function (ck) {
                                                        insertPath(value.userId, value.flow.rules[i].paths[j], connection, function (err, pathResult) {
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

                                                                        parallelPathNextLander.push(function (cb) {
                                                                            insertLander(value.userId, value.flow.rules[i].paths[j].landers, connection, function (err, landersResult) {
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
                                                                            offer_val += ",'" + countrycode + "'"
                                                                        }
                                                                        if (value.flow.rules[i].paths[j].offers[z].postbackUrl) {
                                                                            offer_col += ",`postbackUrl`"
                                                                            offer_val += ",'" + value.flow.rules[i].paths[j].offers[z].postbackUrl + "'"
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
                                                } else {
                                                    //paths
                                                    parallelRuleNext.push(function (ck) {
                                                        updatePath(value.userId, value.flow.rules[i].paths[j], connection, function (err) {
                                                            if (err) {
                                                                return ck(err);
                                                            }

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
                                                                            lander_val += ",'" + countryCode + "'"
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
                                                                    } else {

                                                                        parallelPathNextLander.push(function (cb) {
                                                                            updateLander(value.userId, value.flow.rules[i].paths[j].landers[k], connection, function (err) {
                                                                                if (err) {
                                                                                    return cb(err);
                                                                                }


                                                                                var parallelPathNextLanderTags = [];
                                                                                //删除所有tags
                                                                                var sqldeleteTags = "update `Tags` set `deleted`=1 where `userId`= ?  and `targetId`=? and `type`= 2 ";

                                                                                parallelPathNextLanderTags.push(function (callback) {
                                                                                    connection.query(sqldeleteTags, [value.userId, value.flow.rules[i].paths[j].landers[k].id], callback)
                                                                                });


                                                                                //tags
                                                                                if (value.flow.rules[i].paths[j].landers[k].tags && value.flow.rules[i].paths[j].landers[k].tags.length > 0) {
                                                                                    var sqlTags = "insert into `Tags` (`userId`,`name`,`type`,`targetId`) values (?,?,?,?)"
                                                                                    for (let q = 0; q < value.flow.rules[i].paths[j].landers[k].tags.length; q++) {

                                                                                        parallelPathNextLanderTags.push(function (back) {
                                                                                            connection.query(sqlTags, [value.userId, value.flow.rules[i].paths[j].landers[k].tags[q], 2, value.flow.rules[i].paths[j].landers[k].id], back)
                                                                                        });
                                                                                    }
                                                                                }

                                                                                //lander2path

                                                                                parallelPathNextLanderTags.push(function (back) {
                                                                                    var sqllander2path = "update  Lander2Path set `weight`= ? where `landerId` =? and `pathId`=?"
                                                                                    connection.query(sqllander2path, [value.flow.rules[i].paths[j].landers[k].weight, value.flow.rules[i].paths[j].landers[k].id, value.flow.rules[i].paths[j].id], back)
                                                                                });

                                                                                if (parallelPathNextLanderTags.length) {

                                                                                    async.parallel(parallelPathNextLanderTags, cb)
                                                                                } else {
                                                                                    cb(err);
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
                                                                            offer_val += ",'" + countrycode + "'"
                                                                        }
                                                                        if (value.flow.rules[i].paths[j].offers[z].postbackUrl) {
                                                                            offer_col += ",`postbackUrl`"
                                                                            offer_val += ",'" + value.flow.rules[i].paths[j].offers[z].postbackUrl + "'"
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
                                                                    } else {


                                                                        parallelPathNextOffer.push(function (cb) {
                                                                            updateOffer(value.userId, value.flow.rules[i].paths[j].offers[z], connection, function (err) {
                                                                                if (err) {
                                                                                    return cb(err);
                                                                                }

                                                                                var parallelPathNextOfferTags = [];

                                                                                //删除所有tags
                                                                                var sqldeleteTags = "update `Tags` set `deleted`=1 where `userId`= ?  and `targetId`=? and `type`= 3 ";

                                                                                parallelPathNextOfferTags.push(function (callback) {
                                                                                    connection.query(sqldeleteTags, [value.userId, value.flow.rules[i].paths[j].offers[z].id], callback)
                                                                                });


                                                                                //tags
                                                                                if (value.flow.rules[i].paths[j].offers[z].tags && value.flow.rules[i].paths[j].offers[z].tags.length > 0) {
                                                                                    var sqlTags = "insert into `Tags` (`userId`,`name`,`type`,`targetId`) values (?,?,?,?)"
                                                                                    for (let p = 0; p < value.flow.rules[i].paths[j].offers[z].tags.length; p++) {
                                                                                        parallelPathNextOfferTags.push(function (back) {
                                                                                            connection.query(sqlTags, [value.userId, value.flow.rules[i].paths[j].offers[z].tags[p], 3, value.flow.rules[i].paths[j].offers[z].id], back)
                                                                                        });
                                                                                    }
                                                                                }

                                                                                //offer2path

                                                                                parallelPathNextOfferTags.push(function (back) {
                                                                                    updateOffer2Path(value.flow.rules[i].paths[j].offers[z].id, value.flow.rules[i].paths[j].id, value.flow.rules[i].paths[j].offers[z].weight, connection, back)
                                                                                });

                                                                                if (parallelPathNextOfferTags.length) {
                                                                                    async.parallel(parallelPathNextOfferTags, cb)
                                                                                } else {
                                                                                    cb(err);
                                                                                }

                                                                            });
                                                                        });


                                                                    }
                                                                }

                                                            }


                                                            var Lander_Offer_Array = parallelPathNextLander.concat(parallelPathNextOffer);

                                                            //path2rule

                                                            Lander_Offer_Array.push(function (callback) {
                                                                updatePath2Rule(value.flow.rules[i].paths.id, value.flow.rules[i].id, value.flow.rules[i].paths[j].weight, value.flow.rules[i].paths[j].path2rule, connection, callback)
                                                            });

                                                            //并行处理 landers offers

                                                            async.parallel(Lander_Offer_Array, ck);

                                                        });
                                                    })
                                                }
                                            }
                                        }

                                        //rule2flow


                                        parallelRuleNext.push(function (cb) {
                                            var sqlrule2flow = "update  Rule2Flow set `status`=? where  `ruleId`=?  and `flowId`=?"
                                            connection.query(sqlrule2flow, [value.flow.rules[i].rule2flow, value.flow.rules[i].id, flowId], cb);
                                        });

                                        if (parallelRuleNext.length) {
                                            async.parallel(parallelRuleNext, callback);
                                        } else {
                                            callback(err);
                                        }

                                    })
                                })
                            }
                        }
                    }

                    if (parallelNext.length) {
                        async.parallel(parallelNext, function (err) {

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
                                    data: {campaign: value}
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
                                data: {campaign: value}
                            })
                        });

                    }

                });

            });

        });
    });

});


// Campaign

function insertCampaign(value, connection) {

    //required
    var col = "`userId`";
    var val = value.userId

    col += ",`costModel`"
    val += "," + value.costModel

    col += ",`targetType`"
    val += "," + value.targetType

    col += ",`name`"
    val += ",'" + value.name + "'"

    col += ",`hash`"
    val += ",'" + uuidV4() + "'"

    col += ",`url`"
    val += ",'" + value.url + "'"

    col += ",`trafficSourceId`"
    val += "," + value.trafficSource.id

    col += ",`trafficSourceName`"
    val += ",'" + value.trafficSource.name + "'"

    col += ",`redirectMode`"
    val += "," + value.redirectMode

    col += ",`status`"
    val += "," + value.status

    //optional
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


    //flow targetType=1 &&  flow.id
    if (value.flow && value.flow.id) {
        col += ",`targetFlowId`"
        val += "," + value.flow.id
    }

    return function (callback) {
        connection.query("insert into TrackingCampaign (" + col + ") values (" + val + ")", callback)
    }


}

function updateCampaign(value, connection) {
    var sqlCampaign = "update TrackingCampaign set `id`=" + value.id;
    if (value.name) {
        sqlCampaign += ",`name`='" + value.name + "'"
    }
    if (value.url) {
        sqlCampaign += ",`url`='" + value.url + "'"
    }
    if (value.trafficSource && value.trafficSource.id) {
        sqlCampaign += ",`trafficSourceId`='" + value.trafficSource.id + "'"
    }
    if (value.trafficSource && value.trafficSource.name) {
        sqlCampaign += ",`trafficSourceName`='" + value.trafficSource.name + "'"
    }

    if (value.impPixelUrl) {
        sqlCampaign += ",`impPixelUrl`='" + value.impPixelUrl + "'"
    }
    if (value.cpc != undefined) {
        sqlCampaign += ",`cpcValue`=" + value.cpc
    }
    if (value.cpa != undefined) {
        sqlCampaign += ",`cpaValue`=" + value.cpa
    }
    if (value.cpm != undefined) {
        sqlCampaign += ",`cpmValue`=" + value.cpm
    }

    if (value.country) {
        var countryCode = value.country.alpha3Code ? value.country.alpha3Code : ""
        sqlCampaign += ",`country`='" + countryCode + "'"
    }

    if (value.costModel != undefined) {
        sqlCampaign += ",`costModel`=" + value.costModel
    }
    if (value.redirectMode != undefined) {
        sqlCampaign += ",`redirectMode`=" + value.redirectMode
    }
    if (value.status != undefined) {
        sqlCampaign += ",`status`=" + value.status
    }
    if (value.targetType != undefined) {
        sqlCampaign += ",`targetType`=" + value.targetType
    }


    //flow targetType=1 &&  flow.id
    if (value.flow && value.flow.id) {
        sqlCampaign += ",`targetFlowId`=" + value.flow.id
    }

    sqlCampaign += " where `id`=" + value.id + " and `userId`=" + value.userId

    return function (callback) {
        connection.query(sqlCampaign, callback);
    }

}


//Flow

function insertFlow(value, connection) {
    //required
    var col = "`userId`"
    var val = value.userId;

    col += ",`name`"
    val += ",'" + value.flow.name + "'"

    col += ",`hash`"
    val += ",'" + uuidV4() + "'"

    col += ",`type`"
    val += "," + value.flow.type

    col += ",`redirectMode`"
    val += "," + value.flow.redirectMode


    //optional
    if (value.flow.country) {
        var countryCode = value.flow.country.alpha3Code ? value.flow.country.alpha3Code : ""
        col += ",`country`"
        val += ",'" + countryCode + "'"
    }


    return function (callback) {
        connection.query("insert into Flow (" + col + ") values (" + val + ")", callback)
    }
}

function updateFlow(value, connection) {
    var sqlFlow = "update Flow set `id`=" + value.flow.id
    if (value.flow.name) {
        sqlFlow += ",`name`='" + value.flow.name + "'"
    }
    if (value.flow.country) {
        var countryCode = value.flow.country.alpha3Code ? value.flow.country.alpha3Code : ""
        sqlFlow += ",`country`='" + countryCode + "'"
    }
    if (value.flow.redirectMode != undefined) {
        sqlFlow += ",`redirectMode`=" + value.flow.redirectMode.redirectMode
    }
    if (value.flow.name) {
        sqlFlow += ",`name`='" + value.flow.name + "'"
    }
    if (value.flow.name) {
        sqlFlow += ",`name`='" + value.flow.name + "'"
    }
    sqlFlow += " where `id`=" + value.flow.id + " and `userId`=" + value.userId

    return function (callback) {
        connection.query(sqlFlow, callback)
    }
}


//Tags

function insertTags(userId, targetId, name, type, connection) {
    return function (callback) {
        connection.query("insert into `Tags` (`userId`,`name`,`type`,`targetId`) values (?,?,?,?)", [userId, name, type, targetId], callback)
    };
}

function updateTags(userId, targetId, type, connection) {
    //删除所有tags
    return function (callback) {
        connection.query("update `Tags` set `deleted`=1 where `userId`= ?  and `targetId`=? and `type`= ? ", [userId, targetId, type], callback)
    };

}


//Rule

function insetRule(userId, rule, connection, callback) {
    var sqlRule = "insert into `Rule` (`userId`,`name`,`hash`,`type`,`json`,`status`) values (?,?,?,?,?,?)";
    connection.query(sqlRule, [userId, rule.name, uuidV4(), rule.type, JSON.stringify(rule.json), rule.status], callback);
}

function updateRule(userId, rule, connection, callback) {
    var sqlRule = "update `Rule` set `id`=" + rule.id;
    if (rule.name) {
        sqlRule += ",`name`='" + rule.name + "'"
    }
    if (rule.type != undefined) {
        sqlRule += ",`type`=" + rule.type
    }
    if (rule.json) {
        sqlRule += ",`json`='" + JSON.stringify(rule.json) + "'"
    }
    if (rule.status != undefined) {
        sqlRule += ",`status`=" + rule.status
    }
    sqlRule += " where `userId`= ? and `id`= ? "

    connection.query(sqlRule, [userId, rule.id], callback);

}

//Path
function insertPath(userId, path, connection, callback) {
    var sqlpath = "insert into `Path` (`userId`,`name`,`hash`,`redirectMode`,`directLink`,`status`) values (?,?,?,?,?,?)"
    connection.query(sqlpath, [userId, path.name, uuidV4(), path.redirectMode, path.directLink, path.status], callback)
}

function updatePath(userId, path, connection, callback) {
    var sqlUpdatePath = "update `Path` set `id`=" + path.id;
    if (path.name) {
        sqlUpdatePath += ",`name`='" + path.name + "'"
    }
    if (path.redirectMode != undefined) {
        sqlUpdatePath += ",`redirectMode`=" + path.redirectMode
    }
    if (path.directLink != undefined) {
        sqlUpdatePath += ",`directLink`=" + path.directLink
    }
    if (path.status != undefined) {
        sqlUpdatePath += ",`status`=" + path.status
    }

    sqlUpdatePath += " where `id`=? and `userId`= ? ";

    connection.query(sqlUpdatePath, [path.id, userId], callback);

}


//Lander

function insertLander(userId, lander, connection, callback) {
    //required
    var col = "`userId`"

    var val = value.userId

    col += ",`name`"
    val += ",'" + lander.name + "'"

    col += ",`hash`"
    val += ",'" + uuidV4() + "'"

    col += ",`url`"
    val += ",'" + lander.url + "'"

    col += ",`numberOfOffers`"
    val += "," + lander.numberOfOffers

    //optional
    if (lander.country) {
        var countryCode = lander.country.alpha3Code ? lander.country.country.alpha3Code : ""
        col += ",`country`"
        val += ",'" + countryCode + "'"
    }

    connection.query("insert into Lander (" + col + ") values (" + val + ") ", callback)

}

function updateLander(userId, lander, connection, callback) {
    var sqlUpdateLander = "update Lander set `id`=" + lander.id;
    if (lander.country) {
        var countryCode = lander.country.alpha3Code ? lander.country.alpha3Code : ""
        sqlUpdateLander += ",`country`='" + countryCode + "'"
    }
    if (lander.name) {
        sqlUpdateLander += ",`name`='" + lander.name + "'"
    }
    if (lander.url) {
        sqlUpdateLander += ",`url`='" + lander.url + "'"
    }
    if (lander.numberOfOffers) {
        sqlUpdateLander += ",`numberOfOffers`=" + lander.numberOfOffers
    }

    sqlUpdateLander += " where `id`= ?  and `userId`= ? "

    connection.query(sqlUpdateLander, [lander.id, userId], callback)
}


//Lander2Path

function insertLander2Path(landerid, pathid, pathweight, connection, callback) {
    var sqllander2path = "insert into Lander2Path (`landerId`,`pathId`,`weight`) values (?,?,?)"
    connection.query(sqllander2path, [landerid, pathid, pathweight], callback);
}

function updateLander2Path(landerId, pathId, weight, connection, callback) {
    var sqllander2path = "update  Lander2Path set `weight`= ? where `landerId` =? and `pathId`=?"
    connection.query(sqllander2path, [weight, landerId, pathId], callback)

}

//Offer

function insertOffer(userId, offer, connection, callback) {

    //required
    var col = "`userId`"
    var val = value.userId

    col += ",`name`"
    val += ",'" + offer.name + "'"

    col += ",`hash`"
    val += ",'" + uuidV4() + "'"

    col += ",`url`"
    val += ",'" + offer.url + "'"

    col += ",`payoutMode`"
    val += "," + offer.payoutMode

    //optional

    if (offer.country) {
        var countrycode = offer.country.alpha3Code ? offer.country.alpha3Code : ""
        col += ",`country`"
        val += ",'" + countrycode + "'"
    }
    if (offer.postbackUrl) {
        col += ",`postbackUrl`"
        val += ",'" + offer.postbackUrl + "'"
    }
    if (offer.payoutValue != undefined) {
        col += ",`payoutValue`"
        val += "," + offer.payoutValue
    }
    if (offer.affiliateNetwork && offer.affiliateNetwork.id) {
        col += ",`AffiliateNetworkId`"
        val += "," + offer.affiliateNetwork.id
    }
    var sqloffer = "insert into Offer (" + col + ") values (" + val + ") ";
    connection.query(sqloffer, callback);
}

function updateOffer(userId, offer, connection, callback) {
    var sqlUpdateOffer = "update  Offer  set `id`=" + offer.id;
    if (offer.country) {
        var countrycode = offer.country.alpha3Code ? offer.country.alpha3Code : ""
        sqlUpdateOffer += ",`country`='" + countrycode + "'"
    }
    if (offer.postbackUrl) {
        sqlUpdateOffer += ",`postbackUrl`='" + offer.postbackUrl + "'"
    }
    if (offer.payoutValue != undefined) {
        sqlUpdateOffer += ",`payoutValue`=" + offer.payoutValue

    }
    if (offer.affiliateNetwork && offer.affiliateNetwork.id) {
        sqlUpdateOffer += ",`AffiliateNetworkId`=" + offer.affiliateNetwork.id
    }
    if (offer.name) {
        sqlUpdateOffer += ",`name`='" + offer.name + "'"
    }
    if (value.flow.rules[i].paths[j].offers[z].url) {
        sqlUpdateOffer += ",`url`='" + offer.url + "'"

    }
    if (offer.payoutMode != undefined) {
        sqlUpdateOffer += ",`payoutMode`=" + offer.payoutMode

    }
    sqlUpdateOffer += " where `userId`= ? and `id`= ? ";

    connection.query(sqlUpdateOffer, [userId, offer.id], callback);

}


//Offer2Path 

function insertOffer2Path(offerid, pathid, pathweight, connection, callback) {
    connection.query("insert into Offer2Path (`offerId`,`pathId`,`weight`) values (?,?,?)", [offerid, pathid, pathweight], callback)
}

function updateOffer2Path(offerId, pathId, weight, connection, callback) {
    var sqloffer2path = "update  Offer2Path set `weight`= ? where `offerId`=? and `pathId`=?";


    connection.query(sqloffer2path, [weight, offerId, pathId], callback)

}
//Path2Rule

function insertPath2Rule(pathId, ruleId, weight, status, connection, callback) {
    connection.query("insert into Path2Rule (`pathId`,`ruleId`,`weight`,`status`) values (?,?,?,?)", [pathId, ruleId, weight, status], callback);
}

function updatePath2Rule(pathId, ruleId, weight, status, connection, callback) {
    var sqlpath2rule = "update  Path2Rule set `weight`=?,`status`=? where `pathId`=? and `ruleId`=?"
    connection.query(sqlpath2rule, [weight, status, pathId, ruleId], callback);

}

//Rule2Flow

function insertRule2Flow(ruleId, flowId, status, connection, callback) {

    connection.query("insert into Rule2Flow (`ruleId`,`flowId`,`status`) values (?,?,?)", [ruleId, flowId, status], callback);
}

function updateRule2Flow(status, ruleId, flowId, connection, callback) {
    var sqlrule2flow = "update  Rule2Flow set `status`=? where  `ruleId`=?  and `flowId`=?"
    connection.query(sqlrule2flow, [status, ruleId, flowId], callback);

}

module.exports = router;
