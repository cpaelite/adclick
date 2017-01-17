function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

/**
 * Created by Aedan on 11/01/2017.
 */

var express = require('express');
var router = express.Router();
var Joi = require('joi');
var async = require('async');
var uuidV4 = require('uuid/v4');
var common = require('./common');

/**
 * @api {post} /api/lander  新增lander
 * @apiName lander
 * @apiGroup lander
 *
 * @apiParam {String} name
 * @apiParam {String} url
 * @apiParam {Number} numberOfOffers
 * @apiParam {Object} [country]
 * @apiParam {Array} [tags]
 *
 * @apiSuccessExample {json} Success-Response:
 *   {
 *    status: 1,
 *    message: 'success' *   }
 *
 */
router.post('/api/lander', function (req, res, next) {
    var schema = Joi.object().keys({
        userId: Joi.number().required(),
        name: Joi.string().required(),
        url: Joi.string().required(),
        country: Joi.object().optional(),
        numberOfOffers: Joi.number().required(),
        tags: Joi.array().optional()
    });

    req.body.userId = req.userId;
    const start = (() => {
        var _ref = _asyncToGenerator(function* () {
            try {
                let value = yield common.validate(req.body, schema);
                let connection = yield common.getConnection();
                let landerResult = yield common.insertLander(value.userId, value, connection);
                if (value.tags && value.tags.length) {
                    for (let index = 0; index < value.tags.length; index++) {
                        yield common.insertTags(value.userId, landerResult.insertId, value.tags[index], 2, connection);
                    }
                }
                delete value.userId;
                value.id = landerResult.insertId;
                connection.release();
                res.json({
                    status: 1,
                    message: 'success',
                    data: value
                });
            } catch (e) {
                next(e);
            }
        });

        return function start() {
            return _ref.apply(this, arguments);
        };
    })();
    start();
});

/**
 * @api {post} /api/lander/:id  编辑lander
 * @apiName lander
 * @apiGroup lander
 *
 *
 * @apiParam {String} name
 * @apiParam {String} url
 * @apiParam {Number} numberOfOffers
 * @apiParam {Object} [country]
 * @apiParam {Array} [tags]
 * @apiParam {Number} [deleted]
 *
 * @apiSuccessExample {json} Success-Response:
 *   {
 *    status: 1,
 *    message: 'success' *   }
 *
 */
router.post('/api/lander/:id', function (req, res, next) {
    var schema = Joi.object().keys({
        id: Joi.number().required(),
        userId: Joi.number().required(),
        name: Joi.string().required(),
        url: Joi.string().required(),
        country: Joi.object().optional(),
        numberOfOffers: Joi.number().required(),
        tags: Joi.array().optional(),
        deleted: Joi.number().optional(),
        hash: Joi.string().optional()
    });

    req.body.userId = req.userId;
    req.body.id = req.params.id;
    const start = (() => {
        var _ref2 = _asyncToGenerator(function* () {
            try {
                let value = yield common.validate(req.body, schema);
                let connection = yield common.getConnection();
                yield common.updateLander(value.userId, value, connection);
                yield common.updateTags(value.userId, value.id, 2, connection);
                if (value.tags && value.tags.length) {
                    for (let index = 0; index < value.tags.length; index++) {
                        yield common.insertTags(value.userId, value.id, value.tags[index], 2, connection);
                    }
                }
                delete value.userId;
                connection.release();
                res.json({
                    status: 1,
                    message: 'success',
                    data: value
                });
            } catch (e) {
                next(e);
            }
        });

        return function start() {
            return _ref2.apply(this, arguments);
        };
    })();
    start();

    // Joi.validate(req.body, schema, function (err, value) {
    //     if (err) {
    //         return next(err);
    //     }
    //     pool.getConnection(function (err, connection) {
    //         if (err) {
    //             err.status = 303
    //             return next(err);
    //         }
    //         var ParallelArray = []
    //         var sqlCampaign = "update Lander set `name`='" + value.name +
    //             "',`url`='" + value.url + "',`numberOfOffers`='" + value.numberOfOffers + "'";

    //         if (value.country) {
    //             var countryCode = value.country.alpha3Code ? value.country.alpha3Code: "";
    //             sqlCampaign += ",`country`='" + countryCode + "'"
    //         }

    //         if (value.deleted != undefined) {
    //             sqlCampaign += ",`deleted`='" + value.deleted + "'"
    //         }
    //         sqlCampaign += " where `userId`= " + value.userId + " and `id`=" + value.id

    //         connection.query(sqlCampaign, function (err) {
    //             if (err) {
    //                 return next(err);
    //             }


    //             if (value.tags && value.tags.length > 0) {
    //                 for (let i = 0; i < value.tags.length; i++) {
    //                     var sqlTags = "update `Tags` set  `name`='" + value.tags[i] + "'" + " where `userId`=" + value.userId +
    //                         " and `targetId`=" + value.id + " and  `type`=2"
    //                     ParallelArray.push(function (callback) {
    //                         connection.query(sqlTags, callback);
    //                     });
    //                 }
    //                 async.parallel(ParallelArray, function (err) {
    //                     if (err) {
    //                         return next(err);
    //                     }
    //                     connection.release();
    //                      delete value.userId;
    //                     res.json({
    //                         status: 1,
    //                         message: 'success',
    //                         data: value
    //                     });
    //                 });
    //             } else if (value.tags && value.tags.length == 0) {
    //                 var sqlTags = "update `Tags` set  `deleted`= 1" + " where `userId`=" + value.userId +
    //                     " and `targetId`=" + value.id + " and  `type`=2"
    //                 connection.query(sqlTags, function (err) {
    //                     if (err) {
    //                         return next(err);
    //                     }
    //                     connection.release();
    //                      delete value.userId;
    //                     res.json({
    //                         status: 1,
    //                         message: 'success',
    //                         data: value
    //                     });
    //                 });

    //             } else {
    //                 connection.release();
    //                  delete value.userId;
    //                 res.json({
    //                     status: 1,
    //                     message: 'success',
    //                     data: value
    //                 });
    //             }

    //         });

    //     });
    // });
});

/**
 * @api {get} /api/lander/:id  lander detail
 * @apiName lander
 * @apiGroup lander
 *
 *
 *
 * @apiSuccessExample {json} Success-Response:
 *   {
 *    status: 1,
 *    message: 'success',data:{}  }
 *
 */
router.get('/api/lander/:id', function (req, res, next) {
    var schema = Joi.object().keys({
        id: Joi.number().required(),
        userId: Joi.number().required()
    });
    req.query.id = req.params.id;
    req.query.userId = req.userId;
    const start = (() => {
        var _ref3 = _asyncToGenerator(function* () {
            try {
                let value = yield common.validate(req.query, schema);
                let connection = yield common.getConnection();
                let result = yield common.getLanderDetail(value.id, value.userId, connection);
                res.json({
                    status: 1,
                    message: 'success',
                    data: result
                });
            } catch (e) {
                return next(err);
            }
        });

        return function start() {
            return _ref3.apply(this, arguments);
        };
    })();
    start();
});

module.exports = router;