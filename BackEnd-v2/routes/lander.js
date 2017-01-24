'use strict';

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

/**
 * Created by Aedan on 11/01/2017.
 */

var express = require('express');
var router = express.Router();
var Joi = require('joi');
var common = require('./common');

/**
 * @api {post} /api/lander  新增lander
 * @apiName lander
 * @apiGroup lander
 *
 * @apiParam {String} name
 * @apiParam {String} url
 * @apiParam {Number} numberOfOffers
 * @apiParam {String} [country]
 * @apiParam {Array} [tags]
 *
 * @apiSuccessExample {json} Success-Response:
 *   {
 *    status: 1,
 *    message: 'success' *   }
 *
 */
router.post('/api/lander', function (req, res, next) {
    var _this = this;

    var schema = Joi.object().keys({
        userId: Joi.number().required(),
        name: Joi.string().required(),
        url: Joi.string().required(),
        country: Joi.string().optional(),
        numberOfOffers: Joi.number().required(),
        tags: Joi.array().optional()
    });

    req.body.userId = req.userId;
    var start = function () {
        var _ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee() {
            var value, connection, landerResult, index;
            return regeneratorRuntime.wrap(function _callee$(_context) {
                while (1) {
                    switch (_context.prev = _context.next) {
                        case 0:
                            _context.prev = 0;
                            _context.next = 3;
                            return common.validate(req.body, schema);

                        case 3:
                            value = _context.sent;
                            _context.next = 6;
                            return common.getConnection();

                        case 6:
                            connection = _context.sent;
                            _context.next = 9;
                            return common.insertLander(value.userId, value, connection);

                        case 9:
                            landerResult = _context.sent;

                            if (!(value.tags && value.tags.length)) {
                                _context.next = 18;
                                break;
                            }

                            index = 0;

                        case 12:
                            if (!(index < value.tags.length)) {
                                _context.next = 18;
                                break;
                            }

                            _context.next = 15;
                            return common.insertTags(value.userId, landerResult.insertId, value.tags[index], 2, connection);

                        case 15:
                            index++;
                            _context.next = 12;
                            break;

                        case 18:
                            delete value.userId;
                            value.id = landerResult.insertId;
                            connection.release();
                            res.json({
                                status: 1,
                                message: 'success',
                                data: value
                            });
                            _context.next = 27;
                            break;

                        case 24:
                            _context.prev = 24;
                            _context.t0 = _context['catch'](0);

                            next(_context.t0);

                        case 27:
                        case 'end':
                            return _context.stop();
                    }
                }
            }, _callee, _this, [[0, 24]]);
        }));

        return function start() {
            return _ref.apply(this, arguments);
        };
    }();
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
 * @apiParam {String} [country]
 * @apiParam {Array} [tags]
 *
 * @apiSuccessExample {json} Success-Response:
 *   {
 *    status: 1,
 *    message: 'success' *   }
 *
 */
router.post('/api/lander/:id', function (req, res, next) {
    var _this2 = this;

    var schema = Joi.object().keys({
        id: Joi.number().required(),
        userId: Joi.number().required(),
        name: Joi.string().required(),
        url: Joi.string().required(),
        country: Joi.string().optional(),
        numberOfOffers: Joi.number().required(),
        tags: Joi.array().optional(),
        hash: Joi.string().optional()
    });

    req.body.userId = req.userId;
    req.body.id = req.params.id;
    var start = function () {
        var _ref2 = _asyncToGenerator(regeneratorRuntime.mark(function _callee2() {
            var value, connection, index;
            return regeneratorRuntime.wrap(function _callee2$(_context2) {
                while (1) {
                    switch (_context2.prev = _context2.next) {
                        case 0:
                            _context2.prev = 0;
                            _context2.next = 3;
                            return common.validate(req.body, schema);

                        case 3:
                            value = _context2.sent;
                            _context2.next = 6;
                            return common.getConnection();

                        case 6:
                            connection = _context2.sent;
                            _context2.next = 9;
                            return common.updateLander(value.userId, value, connection);

                        case 9:
                            _context2.next = 11;
                            return common.updateTags(value.userId, value.id, 2, connection);

                        case 11:
                            if (!(value.tags && value.tags.length)) {
                                _context2.next = 19;
                                break;
                            }

                            index = 0;

                        case 13:
                            if (!(index < value.tags.length)) {
                                _context2.next = 19;
                                break;
                            }

                            _context2.next = 16;
                            return common.insertTags(value.userId, value.id, value.tags[index], 2, connection);

                        case 16:
                            index++;
                            _context2.next = 13;
                            break;

                        case 19:
                            delete value.userId;
                            connection.release();
                            res.json({
                                status: 1,
                                message: 'success',
                                data: value
                            });

                            _context2.next = 27;
                            break;

                        case 24:
                            _context2.prev = 24;
                            _context2.t0 = _context2['catch'](0);

                            next(_context2.t0);

                        case 27:
                        case 'end':
                            return _context2.stop();
                    }
                }
            }, _callee2, _this2, [[0, 24]]);
        }));

        return function start() {
            return _ref2.apply(this, arguments);
        };
    }();
    start();
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
    var _this3 = this;

    var schema = Joi.object().keys({
        id: Joi.number().required(),
        userId: Joi.number().required()
    });
    req.query.id = req.params.id;
    req.query.userId = req.userId;
    var start = function () {
        var _ref3 = _asyncToGenerator(regeneratorRuntime.mark(function _callee3() {
            var value, connection, result;
            return regeneratorRuntime.wrap(function _callee3$(_context3) {
                while (1) {
                    switch (_context3.prev = _context3.next) {
                        case 0:
                            _context3.prev = 0;
                            _context3.next = 3;
                            return common.validate(req.query, schema);

                        case 3:
                            value = _context3.sent;
                            _context3.next = 6;
                            return common.getConnection();

                        case 6:
                            connection = _context3.sent;
                            _context3.next = 9;
                            return common.getLanderDetail(value.id, value.userId, connection);

                        case 9:
                            result = _context3.sent;

                            connection.release();
                            res.json({
                                status: 1,
                                message: 'success',
                                data: result ? result : {}
                            });
                            _context3.next = 17;
                            break;

                        case 14:
                            _context3.prev = 14;
                            _context3.t0 = _context3['catch'](0);
                            return _context3.abrupt('return', next(err));

                        case 17:
                        case 'end':
                            return _context3.stop();
                    }
                }
            }, _callee3, _this3, [[0, 14]]);
        }));

        return function start() {
            return _ref3.apply(this, arguments);
        };
    }();
    start();
});

/**
 * @api {delete} /api/lander/:id 删除lander
 * @apiName  删除lander
 * @apiGroup lander
 */
router.delete('/api/lander/:id', function (req, res, next) {
    var _this4 = this;

    var schema = Joi.object().keys({
        id: Joi.number().required(),
        userId: Joi.number().required()
    });
    req.body.userId = req.userId;
    req.body.id = req.params.id;
    var start = function () {
        var _ref4 = _asyncToGenerator(regeneratorRuntime.mark(function _callee4() {
            var value, connection, result;
            return regeneratorRuntime.wrap(function _callee4$(_context4) {
                while (1) {
                    switch (_context4.prev = _context4.next) {
                        case 0:
                            _context4.prev = 0;
                            _context4.next = 3;
                            return common.validate(req.query, schema);

                        case 3:
                            value = _context4.sent;
                            _context4.next = 6;
                            return common.getConnection();

                        case 6:
                            connection = _context4.sent;
                            _context4.next = 9;
                            return common.deleteLander(value.id, value.userId, connection);

                        case 9:
                            result = _context4.sent;

                            connection.release();
                            res.json({
                                status: 1,
                                message: 'success'
                            });
                            _context4.next = 17;
                            break;

                        case 14:
                            _context4.prev = 14;
                            _context4.t0 = _context4['catch'](0);
                            return _context4.abrupt('return', next(_context4.t0));

                        case 17:
                        case 'end':
                            return _context4.stop();
                    }
                }
            }, _callee4, _this4, [[0, 14]]);
        }));

        return function start() {
            return _ref4.apply(this, arguments);
        };
    }();
    start();
});

module.exports = router;