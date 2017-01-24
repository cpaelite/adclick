function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

/**
 * Created by Aedan on 11/01/2017.
 */

var express = require('express');
var router = express.Router();
var Joi = require('joi');
var common = require('./common');

/**
 * @api {post} /api/offer  新增offer
 * @apiName 新增offer
 * @apiGroup offer
 *
 * @apiParam {String} name
 * @apiParam {String} url
 * @apiParam {Number} payoutMode
 * @apiParam {Object} affiliateNetwork {"id":1,name:""}
 * @apiParam {Number} [payoutValue]
 * @apiParam {String} country ""
 * @apiParam {Array}  [tags]
 *
 * @apiSuccessExample {json} Success-Response:
 *   {
 *    status: 1,
 *    message: 'success' *   }
 *
 */
router.post('/api/offer', function (req, res, next) {
    var schema = Joi.object().keys({
        userId: Joi.number().required(),
        idText: Joi.string().required(),
        name: Joi.string().required(),
        url: Joi.string().required(),
        country: Joi.string().required(),
        payoutMode: Joi.number().required(),
        affiliateNetwork: Joi.object().required().keys({
            id: Joi.number().required(),
            name: Joi.string().required()
        }),
        payoutValue: Joi.number().optional(),
        tags: Joi.array().optional()
    });

    req.body.userId = req.userId;
    req.body.idText = req.idText;
    const start = (() => {
        var _ref = _asyncToGenerator(function* () {
            try {
                let value = yield common.validate(req.body, schema);
                let connection = yield common.getConnection();
                let postbackUrl = setting.newbidder.httpPix + value.idText + "." + setting.newbidder.mainDomain + setting.newbidder.postBackRouter;
                value.postbackUrl = postbackUrl;
                let landerResult = yield common.insertOffer(value.userId, value.idText, value, connection);
                if (value.tags && value.tags.length) {
                    for (let index = 0; index < value.tags.length; index++) {
                        yield common.insertTags(value.userId, landerResult.insertId, value.tags[index], 3, connection);
                    }
                }
                delete value.userId;
                delete value.idText;
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
 * @api {post} /api/offer/:offerId  编辑offer
 * @apiName 编辑offer
 * @apiGroup offer
 *
 * @apiParam {Number} id
 * @apiParam {String} [name]
 * @apiParam {String} [url]
 * @apiParam {String} [postbackUrl]
 * @apiParam {Number} [payoutMode]
 * @apiParam {Number} [affiliateNetwork] {"id":1,name:""}
 * @apiParam {Number} [payoutValue]
 * @apiParam {String} [country]
 * @apiParam {Number} [deleted]
 * @apiParam {Array} [tags]
 *
 * @apiSuccessExample {json} Success-Response:
 *   {
 *    status: 1,
 *    message: 'success'
 *   }
 *
 */
router.post('/api/offer/:id', function (req, res, next) {
    var schema = Joi.object().keys({
        id: Joi.number().required(),
        hash: Joi.string().optional(),
        userId: Joi.number().required(),
        idText: Joi.string().required(),
        name: Joi.string().required(),
        url: Joi.string().required(),
        country: Joi.string().required(),
        payoutMode: Joi.number().required(),
        affiliateNetwork: Joi.object().required().keys({
            id: Joi.number().required(),
            name: Joi.string().required()
        }),
        payoutValue: Joi.number().optional(),
        tags: Joi.array().optional(),
        deleted: Joi.number().optional()
    });

    req.body.userId = req.userId;
    req.body.idText = req.idText;
    req.body.id = req.params.id;
    const start = (() => {
        var _ref2 = _asyncToGenerator(function* () {
            try {
                let value = yield common.validate(req.body, schema);
                let connection = yield common.getConnection();
                yield common.updateOffer(value.userId, value, connection);
                yield common.updateTags(value.userId, value.id, 3, connection);
                if (value.tags && value.tags.length) {
                    for (let index = 0; index < value.tags.length; index++) {
                        yield common.insertTags(value.userId, value.id, value.tags[index], 3, connection);
                    }
                }
                delete value.userId;
                delete value.idText;
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
 * @api {get} /api/offer/:id  offer detail
 * @apiName offer
 * @apiGroup offer
 *
 *
 *
 * @apiSuccessExample {json} Success-Response:
 *   {
 *    status: 1,
 *    message: 'success',data:{}  }
 *
 */
router.get('/api/offer/:id', function (req, res, next) {
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
                let result = yield common.getOfferDetail(value.id, value.userId, connection);
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
 * @api {get} /api/offers get offer list
 * @apiName offers
 * @apiGroup offer
 *
 *
 *
 * @apiSuccessExample {json} Success-Response:
 *   {
 *    status: 1,
 *    message: 'success',data:{}  }
 *
 */
router.get('/api/offers', function (req, res, next) {
    // var schema = Joi.object().keys({
    //     userId: Joi.number().required()
    // });
    // TODO: validate schema
    console.info(req.body);
    var sql = "select id, name from Offer where userId = " + req.userId;
    console.info(sql);
    pool.getConnection(function (err, connection) {
        if (err) {
            err.status = 303;
            return next(err);
        }
        connection.query(sql, function (err, result) {
            connection.release();
            if (err) {
                return next(err);
            }
            res.json(result);
        });
    });
});

/**
 * @api {delete} /api/offer/:id 删除offer
 * @apiName  删除offer
 * @apiGroup offer
 */
router.delete('/api/offer/:id', function (req, res, next) {
    var schema = Joi.object().keys({
        id: Joi.number().required(),
        userId: Joi.number().required()
    });
    req.body.userId = req.userId;
    req.body.id = req.params.id;
    const start = (() => {
        var _ref4 = _asyncToGenerator(function* () {
            try {
                let value = yield common.validate(req.query, schema);
                let connection = yield common.getConnection();
                let result = yield common.deleteOffer(value.id, value.userId, connection);
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