function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

var express = require('express');
var router = express.Router();
var Joi = require('joi');
var common = require('./common');
var Pub = require('./redis_sub_pub');
var setting = require('../config/setting');

//Request Example:
//  {
//     "name": "testcapm",
//     "url": "hddssds",
//     "redirectMode": 0,
//     "impPixelUrl": "idddsdsds",
//     "country": {
//         "id": 1,
//         "name": "Andorra",
//         "alpha2Code": "AD",
//         "alpha3Code": "AND",
//         "numCode": 20
//     },
//     "costModel": 0,
//     "cpc": 0.8,
//     "targetType": 0,
//     "status": 1,
//     "trafficSource": {
//         "id": 2,
//         "name": "trafficsource"
//     },
//     "tags": [
//         "tagstest",
//         "hhh"
//     ],
//     "flow": {
//         "type": 1,
//         "name": "flowtest",
//         "country": {
//             "id": 1,
//             "name": "Andorra",
//             "alpha2Code": "AD",
//             "alpha3Code": "AND",
//             "numCode": 20
//         },
//         "redirectMode": 0,
//         "rules": [
//             {
//                 "name": "ruletest",
//                 "type": 1,
//                 "json": {},
//                 "status": 1,
//                 "rule2flow": 1,
//                 "paths": [
//                     {
//                         "name": "pathtest",
//                         "redirectMode": 0,
//                         "directLink": 0,
//                         "status": 1,
//                         "path2rule": 1,
//                         "weight": 100,
//                         "landers": [
//                             {
//                                 "name": "landertest",
//                                 "url": "dddffd",
//                                 "country": {
//                                     "id": 1,
//                                     "name": "Andorra",
//                                     "alpha2Code": "AD",
//                                     "alpha3Code": "AND",
//                                     "numCode": 20
//                                 },
//                                 "numberOfOffers": 2,
//                                 "weight": 100,
//                                 "tags": [
//                                     "landertags",
//                                     "landertest2"
//                                 ],
//                                 "id": 8
//                             }
//                         ],
//                         "offers": [
//                             {
//                                 "name": "offertest",
//                                 "url": "eweewwe",
//                                 "weight": 100,
//                                 "country": {
//                                     "id": 1,
//                                     "name": "Andorra",
//                                     "alpha2Code": "AD",
//                                     "alpha3Code": "AND",
//                                     "numCode": 20
//                                 },
//                                 "affiliateNetwork": {
//                                     "id": 1,
//                                     "name": "appnext"
//                                 },
//                                 "postbackUrl": "dshshds",
//                                 "payoutMode": 0,
//                                 "payoutValue": 0.8,
//                                 "tags": [
//                                     "offertag1",
//                                     "offertag2"
//                                 ],
//                                 "id": 5
//                             }
//                         ],
//                         "id": 17
//                     }
//                 ],
//                 "id": 17
//             }
//         ],
//         "id": 21
//     },
//     "id": 21
// }


//Response Example
//  {
//   "status": 1,
//   "message": "success",
//   "data": {
//     "name": "testcapm",
//     "url": "hddssds",
//     "redirectMode": 0,
//     "impPixelUrl": "idddsdsds",
//     "country": {
//       "id": 1,
//       "name": "Andorra",
//       "alpha2Code": "AD",
//       "alpha3Code": "AND",
//       "numCode": 20
//     },
//     "costModel": 0,
//     "cpc": 0.8,
//     "targetType": 0,
//     "status": 1,
//     "trafficSource": {
//       "id": 2,
//       "name": "trafficsource"
//     },
//     "tags": [
//       "tagstest",
//       "hhh"
//     ],
//     "flow": {
//       "type": 1,
//       "name": "flowtest",
//       "country": {
//         "id": 1,
//         "name": "Andorra",
//         "alpha2Code": "AD",
//         "alpha3Code": "AND",
//         "numCode": 20
//       },
//       "redirectMode": 0,
//       "rules": [
//         {
//           "name": "ruletest",
//           "type": 1,
//           "json": {},
//           "status": 1,
//           "rule2flow": 1,
//           "paths": [
//             {
//               "name": "pathtest",
//               "redirectMode": 0,
//               "directLink": 0,
//               "status": 1,
//               "path2rule": 1,
//               "weight": 100,
//               "landers": [
//                 {
//                   "name": "landertest",
//                   "url": "dddffd",
//                   "country": {
//                     "id": 1,
//                     "name": "Andorra",
//                     "alpha2Code": "AD",
//                     "alpha3Code": "AND",
//                     "numCode": 20
//                   },
//                   "numberOfOffers": 2,
//                   "weight": 100,
//                   "tags": [
//                     "landertags",
//                     "landertest2"
//                   ],
//                   "id": 8
//                 }
//               ],
//               "offers": [
//                 {
//                   "name": "offertest",
//                   "url": "eweewwe",
//                   "weight": 100,
//                   "country": {
//                     "id": 1,
//                     "name": "Andorra",
//                     "alpha2Code": "AD",
//                     "alpha3Code": "AND",
//                     "numCode": 20
//                   },
//                   "affiliateNetwork": {
//                     "id": 1,
//                     "name": "appnext"
//                   },
//                   "postbackUrl": "dshshds",
//                   "payoutMode": 0,
//                   "payoutValue": 0.8,
//                   "tags": [
//                     "offertag1",
//                     "offertag2"
//                   ],
//                   "id": 5
//                 }
//               ],
//               "id": 17
//             }
//           ],
//           "id": 17
//         }
//       ],
//       "id": 21
//     },
//     "id": 21
//   }
// }

/**
 * @api {post} /api/campaign/ 新增campaign
 * @apiName 新增campaign
 * @apiGroup campaign
 *
 * @apiParam {String} name
 * @apiParam {String} [url]
 * @apiParam {String} [impPixelUrl]
 * @apiParam {Object} trafficSource {id:1,name:""}
 * @apiParam {Object} country  {"id": 1,"name": "Andorra", "alpha2Code": "AD","alpha3Code": "AND","numCode": 20}
 * @apiParam {Number} costModel  0:Do-not-track-costs;1:cpc;2:cpa;3:cpm;4:auto?
 * @apiParam {Number} [cpc]
 * @apiParam {Number} [cpa]
 * @apiParam {Number} [cpm]
 * @apiParam {Number} redirectMode 0:302;1:Meta refresh;2:Double meta refresh
 * @apiParam {Array} [tags]
 * @apiParam {Number} targetType 跳转类型 0:URL;1:Flow;2:Rule;3:Path;4:Lander;5:Offer
 * @apiParam {Number} [targetFlowId] targetType 为 1
 * @apiParam {String} [targetUrl]  targetType 为 0
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
        idText: Joi.string().required(),
        name: Joi.string().required(),
        trafficSource: Joi.object().required(),
        costModel: Joi.number().required(),
        redirectMode: Joi.number().required(),
        targetType: Joi.number().required(),
        status: Joi.number().required(),
        flow: Joi.object().optional().keys({
            rules: Joi.array(),
            hash: Joi.string(),
            type: Joi.number(),
            id: Joi.number(),
            name: Joi.string(),
            country: Joi.object(),
            redirectMode: Joi.number()
        }).optionalKeys('id', 'hash', 'type', 'name', 'country', 'redirectMode', 'rules'),
        url: Joi.string().optional(),
        country: Joi.object().optional(),
        impPixelUrl: Joi.string().optional(),
        cpc: Joi.number().optional(),
        cpa: Joi.number().optional(),
        cpm: Joi.number().optional(),
        tags: Joi.array().optional(),
        hash: Joi.string().optional(),
        targetUrl: Joi.string().optional(),
        targetFlowId: Joi.number().optional()
    });
    req.body.userId = req.userId;
    req.body.idText = req.idText;

    start(req.body, schema).then(function (data) {
        res.json({
            status: 1,
            message: 'success',
            data: data
        });
    }).catch(function (err) {
        next(err);
    });
});

/**
 * @api {post} /api/campaign/:id 编辑campaign
 * @apiName 编辑campaign
 * @apiGroup campaign
 *
 * @apiParam {Number} id
 * @apiParam {String} name
 * @apiParam {String} [url]
 * @apiParam {String} [impPixelUrl]
 * @apiParam {Object} trafficSource {id:1,name:""}
 * @apiParam {Object} country  {"id": 1,"name": "Andorra", "alpha2Code": "AD","alpha3Code": "AND","numCode": 20}
 * @apiParam {Number} costModel  0:Do-not-track-costs;1:cpc;2:cpa;3:cpm;4:auto?
 * @apiParam {Number} [cpc]
 * @apiParam {Number} [cpa]
 * @apiParam {Number} [cpm]
 * @apiParam {Number} redirectMode 0:302;1:Meta refresh;2:Double meta refresh
 * @apiParam {Array} [tags]
 * @apiParam {Number} targetType 跳转类型 0:URL;1:Flow;2:Rule;3:Path;4:Lander;5:Offer
 * @apiParam {Number} [targetFlowId] targetType 为 1
 * @apiParam {String} [targetUrl]  targetType 为 0
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
router.post('/api/campaign/:id', function (req, res, next) {
    var schema = Joi.object().keys({
        id: Joi.number().required(),
        userId: Joi.number().required(),
        idText: Joi.string().required(),
        name: Joi.string().required(),
        trafficSource: Joi.object().required(),
        costModel: Joi.number().required(),
        redirectMode: Joi.number().required(),
        targetType: Joi.number().required(),
        status: Joi.number().required(),
        flow: Joi.object().optional().keys({
            rules: Joi.array(),
            hash: Joi.string(),
            type: Joi.number(),
            id: Joi.number(),
            name: Joi.string(),
            country: Joi.object(),
            redirectMode: Joi.number()
        }).optionalKeys('id', 'hash', 'type', 'name', 'country', 'redirectMode', 'rules'),
        url: Joi.string().optional(),
        country: Joi.object().optional(),
        impPixelUrl: Joi.string().optional(),
        cpc: Joi.number().optional(),
        cpa: Joi.number().optional(),
        cpm: Joi.number().optional(),
        tags: Joi.array().optional(),
        hash: Joi.string().optional(),
        targetUrl: Joi.string().optional(),
        targetFlowId: Joi.number().optional()
    });
    req.body.userId = req.userId;
    req.body.id = req.params.id;
    req.body.idText = req.idText;

    start(req.body, schema).then(function (data) {
        res.json({
            status: 1,
            message: 'success',
            data: data
        });
    }).catch(function (err) {
        next(err);
    });
});

const start = (() => {
    var _ref = _asyncToGenerator(function* (data, schema) {
        let Result;
        let ResultError;
        try {
            let value = yield common.validate(data, schema);
            let connection = yield common.getConnection();
            yield common.beginTransaction(connection);
            try {
                //Campaign
                let campResult, flowResult;
                if (value.id) {
                    yield common.updateCampaign(value, connection);
                } else {
                    campResult = yield common.insertCampaign(value, connection);
                }

                //Flow
                if (value.flow && !value.flow.id) {
                    flowResult = yield common.insertFlow(value.userId, value.flow, connection);
                } else if (value.flow && value.flow.id) {
                    yield common.updateFlow(value.userId, value.flow, connection);
                }

                let campaignId = value.id ? value.id : campResult ? campResult.insertId ? campResult.insertId : 0 : 0;

                if (!campaignId) {
                    throw new Error('Campaign ID Lost');
                }

                //campaignId
                value.id = campaignId;

                let flowId = value.flow.id ? value.flow.id : flowResult ? flowResult.insertId ? flowResult.insertId : 0 : 0;

                if (!flowId) {
                    throw new Error('Flow ID Lost');
                }
                //flowId
                value.flow.id = flowId;

                //删除所有tags
                yield common.updateTags(value.userId, campaignId, 1, connection);

                //campain Tags
                if (value.tags && value.tags.length > 0) {
                    if (value.tags && value.tags.length > 0) {
                        for (let index = 0; index < value.tags.length; index++) {
                            yield common.insertTags(value.userId, campaignId, value.tags[index], 1, connection);
                        }
                    }
                }

                if (value.flow.rules && value.flow.rules.length > 0) {
                    for (let i = 0; i < value.flow.rules.length; i++) {
                        try {
                            let ruleResult;
                            //RULE
                            if (!value.flow.rules[i].id) {
                                ruleResult = yield common.insetRule(value.userId, value.flow.rules[i], connection);
                                yield common.insertRule2Flow(ruleResult.insertId, flowId, value.flow.rules[i].rule2flow, connection);
                            } else {
                                yield common.updateRule(value.userId, value.flow.rules[i], connection);
                                yield common.updateRule2Flow(value.flow.rules[i].rule2flow, value.flow.rules[i].id, flowId, connection);
                            }
                            let ruleId = value.flow.rules[i].id ? value.flow.rules[i].id : ruleResult ? ruleResult.insertId ? ruleResult.insertId : 0 : 0;
                            if (!ruleId) {
                                throw new Error('Rule ID Lost');
                            }
                            value.flow.rules[i].id = ruleId;

                            //PATH
                            if (value.flow.rules[i].paths && value.flow.rules[i].paths.length > 0) {
                                for (let j = 0; j < value.flow.rules[i].paths.length; j++) {
                                    let pathResult;
                                    if (!value.flow.rules[i].paths[j].id) {
                                        pathResult = yield common.insertPath(value.userId, value.flow.rules[i].paths[j], connection);
                                        yield common.insertPath2Rule(pathResult.insertId, ruleId, value.flow.rules[i].paths[j].weight, value.flow.rules[i].paths[j].path2rule, connection);
                                    } else {
                                        yield common.updatePath(value.userId, value.flow.rules[i].paths[j], connection);
                                        yield common.updatePath2Rule(value.flow.rules[i].paths[j].id, value.flow.rules[i].id, value.flow.rules[i].paths[j].weight, value.flow.rules[i].paths[j].path2rule, connection);
                                    }

                                    let pathId = value.flow.rules[i].paths[j].id ? value.flow.rules[i].paths[j].id : pathResult ? pathResult.insertId ? pathResult.insertId : 0 : 0;
                                    if (!pathId) {
                                        throw new Error('Path ID Lost');
                                    }
                                    value.flow.rules[i].paths[j].id = pathId;

                                    //Lander
                                    if (value.flow.rules[i].paths[j].landers && value.flow.rules[i].paths[j].landers.length > 0) {
                                        for (let k = 0; k < value.flow.rules[i].paths[j].landers.length; k++) {
                                            let landerResult;
                                            if (!value.flow.rules[i].paths[j].landers[k].id) {
                                                landerResult = yield common.insertLander(value.userId, value.flow.rules[i].paths[j].landers[k], connection);
                                                yield common.insertLander2Path(landerResult.insertId, pathId, value.flow.rules[i].paths[j].landers[k].weight, connection);
                                            } else {
                                                yield common.updateLander(value.userId, value.flow.rules[i].paths[j].landers[k], connection);
                                                yield common.updateLander2Path(value.flow.rules[i].paths[j].landers[k].id, pathId, value.flow.rules[i].paths[j].landers[k].weight, connection);
                                            }

                                            let landerId = value.flow.rules[i].paths[j].landers[k].id ? value.flow.rules[i].paths[j].landers[k].id : landerResult ? landerResult.insertId ? landerResult.insertId : 0 : 0;
                                            if (!landerId) {
                                                throw new Error('Lander ID Lost');
                                            }
                                            value.flow.rules[i].paths[j].landers[k].id = landerId;
                                            //Lander tags 
                                            //删除所有tags

                                            yield common.updateTags(value.userId, landerId, 2, connection);

                                            if (value.flow.rules[i].paths[j].landers[k].tags && value.flow.rules[i].paths[j].landers[k].tags.length > 0) {
                                                for (let q = 0; q < value.flow.rules[i].paths[j].landers[k].tags.length; q++) {

                                                    yield common.insertTags(value.userId, landerId, value.flow.rules[i].paths[j].landers[k].tags[q], 2, connection);
                                                }
                                            }
                                        }
                                    }

                                    //Offer
                                    if (value.flow.rules[i].paths[j].offers && value.flow.rules[i].paths[j].offers.length > 0) {
                                        for (let z = 0; z < value.flow.rules[i].paths[j].offers.length; z++) {
                                            let offerResult;

                                            if (!value.flow.rules[i].paths[j].offers[z].id) {
                                                let postbackUrl = setting.newbidder.httpPix + value.idText + "." + setting.newbidder.mainDomain + setting.newbidder.postBackRouter;
                                                value.flow.rules[i].paths[j].offers[z].postbackUrl = postbackUrl;
                                                offerResult = yield common.insertOffer(value.userId, value.idText, value.flow.rules[i].paths[j].offers[z], connection);
                                                yield common.insertOffer2Path(offerResult.insertId, pathId, value.flow.rules[i].paths[j].offers[z].weight, connection);
                                            } else {

                                                yield common.updateOffer(value.userId, value.flow.rules[i].paths[j].offers[z], connection);

                                                yield common.updateOffer2Path(value.flow.rules[i].paths[j].offers[z].id, pathId, value.flow.rules[i].paths[j].offers[z].weight, connection);
                                            }

                                            let offerId = value.flow.rules[i].paths[j].offers[z].id ? value.flow.rules[i].paths[j].offers[z].id : offerResult ? offerResult.insertId ? offerResult.insertId : 0 : 0;
                                            if (!offerId) {
                                                throw new Error('Offer ID Lost');
                                            }
                                            value.flow.rules[i].paths[j].offers[z].id = offerId;
                                            //删除所有offer tags
                                            yield common.updateTags(value.userId, offerId, 3, connection);
                                            //offer tags 
                                            if (value.flow.rules[i].paths[j].offers[z].tags && value.flow.rules[i].paths[j].offers[z].tags.length > 0) {
                                                for (let p = 0; p < value.flow.rules[i].paths[j].offers[z].tags.length; p++) {
                                                    yield common.insertTags(value.userId, offerId, value.flow.rules[i].paths[j].offers[z].tags[p], 3, connection);
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                            yield common.commit(connection);
                        } catch (e) {
                            throw e;
                        }
                    }
                }
            } catch (err) {
                yield common.rollback(connection);
                throw err;
            }
            connection.release();
            //redis pub
            new Pub(true).publish(setting.redis.channel, value.userId);
            delete value.userId;
            delete value.idText;
            Result = value;
        } catch (e) {
            ResultError = e;
        }

        return new Promise(function (resolve, reject) {
            if (ResultError) {
                reject(ResultError);
            }
            resolve(Result);
        });
    });

    return function start(_x, _x2) {
        return _ref.apply(this, arguments);
    };
})();

/**
* @api {get} /api/campaign/:id   campaign detail
 * @apiName  campaign detail
 * @apiGroup campaign
 */
router.get('/api/campaign/:id', function (req, res, next) {
    var schema = Joi.object().keys({
        id: Joi.number().required(),
        userId: Joi.number().required()
    });
    req.query.userId = req.userId;
    req.query.id = req.params.id;

    const start = (() => {
        var _ref2 = _asyncToGenerator(function* () {
            try {
                let value = yield common.validate(req.query, schema);
                let connection = yield common.getConnection();
                let result = yield common.getCampaign(value.id, value.userId, connection);
                connection.release();
                res.json({
                    status: 1,
                    message: 'success',
                    data: result ? result : {}
                });
            } catch (e) {
                return next(e);
            }
        });

        return function start() {
            return _ref2.apply(this, arguments);
        };
    })();
    start();
});

/**
* @api {delete} /api/campaign/:id   delete campaign
 * @apiName  delete campaign
 * @apiGroup campaign
 */
router.delete('/api/campaign/:id', function (req, res, next) {
    var schema = Joi.object().keys({
        id: Joi.number().required(),
        userId: Joi.number().required()
    });
    req.query.userId = req.userId;
    req.query.id = req.params.id;

    const start = (() => {
        var _ref3 = _asyncToGenerator(function* () {
            try {
                let value = yield common.validate(req.query, schema);
                let connection = yield common.getConnection();
                let result = yield common.deleteCampaign(value.id, value.userId, connection);
                connection.release();
                res.json({
                    status: 1,
                    message: 'success'
                });
            } catch (e) {
                return next(e);
            }
        });

        return function start() {
            return _ref3.apply(this, arguments);
        };
    })();
    start();
});

module.exports = router;