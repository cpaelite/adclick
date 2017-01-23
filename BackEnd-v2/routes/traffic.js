function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

/**
 * Created by Aedan on 11/01/2017.
 */

var express = require('express');
var router = express.Router();
var Joi = require('joi');
var common = require('./common');

/**
 * @api {post} /api/traffic  新增traffic
 * @apiName traffic
 * @apiGroup traffic
 *
 * @apiParam {String} name
 * @apiParam {String} [postbackUrl]
 * @apiParam {String} [pixelRedirectUrl]
 * @apiParam {Number} [impTracking]
 * @apiParam {String} [externalId]
 * @apiParam {String} [cost]
 * @apiParam {String} [params]
 *
 * @apiSuccessExample {json} Success-Response:
 *   {
 *    status: 1,
 *    message: 'success',
 *    data:{}
 *  *   }
 *
 */
router.post('/api/traffic', function (req, res, next) {
    var schema = Joi.object().keys({
        userId: Joi.number().required(),
        name: Joi.string().required(),
        postbackUrl: Joi.string().optional(),
        pixelRedirectUrl: Joi.string().optional(),
        impTracking: Joi.number().optional(),
        externalId: Joi.string().optional(),
        cost: Joi.string().optional(),
        params: Joi.string().optional()
    });

    req.body.userId = req.userId;
    const start = (() => {
        var _ref = _asyncToGenerator(function* () {
            try {
                let value = yield common.validate(req.body, schema);
                let connection = yield common.getConnection();
                let trafficResult = yield common.insertTrafficSource(value.userId, value, connection);
                delete value.userId;
                value.id = trafficResult.insertId;
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
 * @api {post} /api/traffic/:id  编辑traffic
 * @apiName traffic
 * @apiGroup traffic
 *
 *
 * @apiParam {String} [name]
 * @apiParam {String} [postbackUrl]
 * @apiParam {String} [pixelRedirectUrl]
 * @apiParam {Number} [impTracking]
 * @apiParam {String} [externalId]
 * @apiParam {String} [cost]
 * @apiParam {String} [params]
 * @apiParam {Number} [deleted]
 *
 * @apiSuccessExample {json} Success-Response:
 *   {
 *    status: 1,
 *    message: 'success',
 *    data:{}
 *  *   }
 *
 */
router.post('/api/traffic/:id', function (req, res, next) {
    var schema = Joi.object().keys({
        id: Joi.number().required(),
        userId: Joi.number().required(),
        name: Joi.string().optional(),
        postbackUrl: Joi.string().optional(),
        pixelRedirectUrl: Joi.string().optional(),
        impTracking: Joi.number().optional(),
        externalId: Joi.string().optional(),
        cost: Joi.string().optional(),
        params: Joi.string().optional(),
        deleted: Joi.number().optional()
    });

    req.body.userId = req.userId;
    req.body.id = req.params.id;
    const start = (() => {
        var _ref2 = _asyncToGenerator(function* () {
            try {
                let value = yield common.validate(req.body, schema);
                let connection = yield common.getConnection();
                yield common.updatetraffic(value.userId, value, connection);

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
});

/**
 * @api {get} /api/traffic/:id  traffic detail
 * @apiName traffic
 * @apiGroup traffic
 *
 *
 *
 * @apiSuccessExample {json} Success-Response:
 *   {
 *    status: 1,
 *    message: 'success',data:{}  }
 *
 */
router.get('/api/traffic/:id', function (req, res, next) {
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
                let result = yield common.gettrafficDetail(value.id, value.userId, connection);
                connection.release();
                res.json({
                    status: 1,
                    message: 'success',
                    data: result ? result : {}
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

/**
 * @api {delete} /api/traffic/:id 删除traffic
 * @apiName  删除traffic
 * @apiGroup traffic
 */
router.delete('/api/traffic/:id', function (req, res, next) {
    console.log("start");
    var schema = Joi.object().keys({
        id: Joi.number().required(),
        userId: Joi.number().required()
    });
    req.body.userId = req.userId;
    req.body.id = req.params.id;
    console.info(req);
    const start = (() => {
        var _ref4 = _asyncToGenerator(function* () {
            try {
                let value = yield common.validate(req.query, schema);
                let connection = yield common.getConnection();
                let result = yield common.deletetraffic(value.id, value.userId, connection);
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
            return _ref4.apply(this, arguments);
        };
    })();
    start();
});

module.exports = router;