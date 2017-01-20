function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

var express = require('express');
var router = express.Router();
var Joi = require('joi');
var common = require('./common');
var setting = require('../config/setting');

/**
 * @api {post} /api/flow/ 新增flow
 * @apiName 新增flow
 * @apiGroup flow
 * @apiParam {String} name
 * @apiParam {Object} country
 * @apiParam {Number} redirectMode
 */
router.post('/api/flow', function (req, res, next) {
    var schema = Joi.object().keys({
        userId: Joi.number().required(),
        idText: Joi.string().required(),
        rules: Joi.array().required().length(1),
        hash: Joi.string(),
        type: Joi.number(),
        id: Joi.number(),
        name: Joi.string(),
        country: Joi.object(),
        redirectMode: Joi.number()
    }).optionalKeys('id', 'hash', 'type', 'name', 'country', 'redirectMode');
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
 * @api {post} /api/flow/:id 编辑flow
 * @apiName  编辑flow
 * @apiGroup flow
 * @apiParam {String} name
 * @apiParam {Object} country
 * @apiParam {Number} redirectMode
 */
router.post('/api/flow/:id', function (req, res, next) {
    var schema = Joi.object().keys({
        rules: Joi.array().required().length(1),
        hash: Joi.string(),
        type: Joi.number(),
        id: Joi.number().required(),
        name: Joi.string(),
        country: Joi.object(),
        redirectMode: Joi.number(),
        userId: Joi.number().required(),
        idText: Joi.string().required()
    }).optionalKeys('hash', 'type', 'name', 'country', 'redirectMode', 'deleted');
    req.body.userId = req.userId;
    req.body.idText = req.idText;
    req.body.id = req.params.id;
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
 * @api {delete} /api/flow/:id 删除flow
 * @apiName  删除flow
 * @apiGroup flow
 */
router.delete('/api/flow/:id', function (req, res, next) {
    var schema = Joi.object().keys({
        id: Joi.number().required(),
        userId: Joi.number().required()
    });
    req.body.userId = req.userId;
    req.body.id = req.params.id;
    const start = (() => {
        var _ref = _asyncToGenerator(function* () {
            try {
                let value = yield common.validate(req.query, schema);
                let connection = yield common.getConnection();
                let result = yield common.deleteFlow(value.id, value.userId, connection);
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
            return _ref.apply(this, arguments);
        };
    })();
    start();
});

module.exports = router;

const start = (() => {
    var _ref2 = _asyncToGenerator(function* (data, schema) {
        let Result;
        let ResultError;
        try {
            let value = yield common.validate(data, schema);
            let connection = yield common.getConnection();
            yield common.beginTransaction(connection);
            try {

                let flowResult;
                //Flow
                if (!value.id) {
                    flowResult = yield common.insertFlow(value.userId, value, connection);
                } else if (value && value.id) {
                    yield common.updateFlow(value.userId, value, connection);
                }

                let flowId = value.id ? value.id : flowResult ? flowResult.insertId ? flowResult.insertId : 0 : 0;

                if (!flowId) {
                    throw new Error('Flow ID Lost');
                }
                //flowId
                value.id = flowId;

                if (value.rules && value.rules.length > 0) {
                    for (let i = 0; i < value.rules.length; i++) {
                        try {
                            let ruleResult;
                            //RULE
                            if (!value.rules[i].id) {
                                ruleResult = yield common.insetRule(value.userId, value.rules[i], connection);
                                yield common.insertRule2Flow(ruleResult.insertId, flowId, value.rules[i].rule2flow, connection);
                            } else {
                                yield common.updateRule(value.userId, value.rules[i], connection);
                                yield common.updateRule2Flow(value.rules[i].rule2flow, value.rules[i].id, flowId, connection);
                            }
                            let ruleId = value.rules[i].id ? value.rules[i].id : ruleResult ? ruleResult.insertId ? ruleResult.insertId : 0 : 0;
                            if (!ruleId) {
                                throw new Error('Rule ID Lost');
                            }
                            value.rules[i].id = ruleId;

                            //PATH
                            if (value.rules[i].paths && value.rules[i].paths.length > 0) {
                                for (let j = 0; j < value.rules[i].paths.length; j++) {
                                    let pathResult;
                                    if (!value.rules[i].paths[j].id) {
                                        pathResult = yield common.insertPath(value.userId, value.rules[i].paths[j], connection);
                                        yield common.insertPath2Rule(pathResult.insertId, ruleId, value.rules[i].paths[j].weight, value.rules[i].paths[j].path2rule, connection);
                                    } else {
                                        yield common.updatePath(value.userId, value.rules[i].paths[j], connection);
                                        yield common.updatePath2Rule(value.rules[i].paths[j].id, value.rules[i].id, value.rules[i].paths[j].weight, value.rules[i].paths[j].path2rule, connection);
                                    }

                                    let pathId = value.rules[i].paths[j].id ? value.rules[i].paths[j].id : pathResult ? pathResult.insertId ? pathResult.insertId : 0 : 0;
                                    if (!pathId) {
                                        throw new Error('Path ID Lost');
                                    }
                                    value.rules[i].paths[j].id = pathId;

                                    //Lander
                                    if (value.rules[i].paths[j].landers && value.rules[i].paths[j].landers.length > 0) {
                                        for (let k = 0; k < value.rules[i].paths[j].landers.length; k++) {
                                            let landerResult;
                                            if (!value.rules[i].paths[j].landers[k].id) {
                                                landerResult = yield common.insertLander(value.userId, value.rules[i].paths[j].landers[k], connection);
                                                yield common.insertLander2Path(landerResult.insertId, pathId, value.rules[i].paths[j].landers[k].weight, connection);
                                            } else {
                                                yield common.updateLander(value.userId, value.rules[i].paths[j].landers[k], connection);
                                                yield common.updateLander2Path(value.rules[i].paths[j].landers[k].id, pathId, value.rules[i].paths[j].landers[k].weight, connection);
                                            }

                                            let landerId = value.rules[i].paths[j].landers[k].id ? value.rules[i].paths[j].landers[k].id : landerResult ? landerResult.insertId ? landerResult.insertId : 0 : 0;
                                            if (!landerId) {
                                                throw new Error('Lander ID Lost');
                                            }
                                            value.rules[i].paths[j].landers[k].id = landerId;
                                            //Lander tags 
                                            //删除所有tags

                                            yield common.updateTags(value.userId, landerId, 2, connection);

                                            if (value.rules[i].paths[j].landers[k].tags && value.rules[i].paths[j].landers[k].tags.length > 0) {
                                                for (let q = 0; q < value.rules[i].paths[j].landers[k].tags.length; q++) {

                                                    yield common.insertTags(value.userId, landerId, value.rules[i].paths[j].landers[k].tags[q], 2, connection);
                                                }
                                            }
                                        }
                                    }

                                    //Offer
                                    if (value.rules[i].paths[j].offers && value.rules[i].paths[j].offers.length > 0) {
                                        for (let z = 0; z < value.rules[i].paths[j].offers.length; z++) {
                                            let offerResult;

                                            if (!value.rules[i].paths[j].offers[z].id) {
                                                let postbackUrl = setting.newbidder.httpPix + value.idText + "." + setting.newbidder.mainDomain + setting.newbidder.postBackRouter;
                                                value.rules[i].paths[j].offers[z].postbackUrl = postbackUrl;
                                                offerResult = yield common.insertOffer(value.userId, value.idText, value.rules[i].paths[j].offers[z], connection);
                                                yield common.insertOffer2Path(offerResult.insertId, pathId, value.rules[i].paths[j].offers[z].weight, connection);
                                            } else {

                                                yield common.updateOffer(value.userId, value.rules[i].paths[j].offers[z], connection);

                                                yield common.updateOffer2Path(value.rules[i].paths[j].offers[z].id, pathId, value.rules[i].paths[j].offers[z].weight, connection);
                                            }

                                            let offerId = value.rules[i].paths[j].offers[z].id ? value.rules[i].paths[j].offers[z].id : offerResult ? offerResult.insertId ? offerResult.insertId : 0 : 0;
                                            if (!offerId) {
                                                throw new Error('Offer ID Lost');
                                            }
                                            value.rules[i].paths[j].offers[z].id = offerId;
                                            //删除所有offer tags
                                            yield common.updateTags(value.userId, offerId, 3, connection);
                                            //offer tags 
                                            if (value.rules[i].paths[j].offers[z].tags && value.rules[i].paths[j].offers[z].tags.length > 0) {
                                                for (let p = 0; p < value.rules[i].paths[j].offers[z].tags.length; p++) {
                                                    yield common.insertTags(value.userId, offerId, value.rules[i].paths[j].offers[z].tags[p], 3, connection);
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        } catch (e) {
                            throw e;
                        }
                    }
                }
            } catch (err) {
                yield common.rollback(connection);
                throw err;
            }
            yield common.commit(connection);
            connection.release();
            delete value.userId;
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
        return _ref2.apply(this, arguments);
    };
})();