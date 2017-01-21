function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

/**
 * Created by Aedan on 12/01/2017.
 */

var express = require('express');
var router = express.Router();
var Joi = require('joi');
var common = require('./common');
var md5 = require('md5');

/**
 * @api {get} /api/preferences  获取用户配置
 * @apiName  get  user  preferences
 * @apiGroup User
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "status": 1,
 *       "message": "success"
 *       "data":{}
 *     }
 *
 */
router.get('/api/preferences', function (req, res, next) {
    var schema = Joi.object().keys({
        userId: Joi.number().required()
    });
    req.body.userId = req.userId;
    Joi.validate(req.body, schema, function (err, value) {
        if (err) {
            return next(err);
        }
        pool.getConnection(function (err, connection) {
            if (err) {
                err.status = 303;
                return next(err);
            }
            connection.query("select  `json` from User where `id` = ? and `deleted` =0", [value.userId], function (err, result) {
                connection.release();
                if (err) {
                    return next(err);
                }
                res.json({
                    status: 1,
                    message: "success",
                    data: JSON.parse(result.json)
                });
            });
        });
    });
});

/**
 * @api {post} /api/tags  获取tags
 * @apiName   user  page tags
 * @apiGroup User
 * @apiParam {Number} type  1:Campaign;2:Lander;3:Offer
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "status": 1,
 *       "message": "success"
 *       "data":{}
 *     }
 *
 */

router.post('/api/tags', function (req, res, next) {
    var schema = Joi.object().keys({
        userId: Joi.number().required(),
        type: Joi.number.required()
    });
    req.body.userId = req.userId;
    Joi.validate(req.body, schema, function (err, value) {
        if (err) {
            return next(err);
        }
        pool.getConnection(function (err, connection) {
            if (err) {
                err.status = 303;
                return next(err);
            }
            connection.query("select  `id`,`name` from User where `userId` = ? and `type`= ? and `deleted` =0", [value.userId, value.type], function (err, result) {
                connection.release();
                if (err) {
                    return next(err);
                }
                res.json({
                    status: 1,
                    message: "success",
                    data: {
                        tags: result
                    }
                });
            });
        });
    });
});

/**
 * @api {get} /api/trafficsources  获取用户所有trafficsources
 * @apiName  get  user  trafficsources
 * @apiGroup User
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "status": 1,
 *       "message": "success"
 *       "data":{}
 *     }
 *
 */
router.get('/api/trafficsources', function (req, res, next) {
    var schema = Joi.object().keys({
        userId: Joi.number().required()
    });
    req.body.userId = req.userId;
    Joi.validate(req.body, schema, function (err, value) {
        if (err) {
            return next(err);
        }
        pool.getConnection(function (err, connection) {
            if (err) {
                err.status = 303;
                return next(err);
            }
            connection.query("select  `id`,`name`,`cost`,`impTracking`,`params` from TrafficSource where `userId` = ? and `deleted` =0", [value.userId], function (err, result) {
                connection.release();
                if (err) {
                    return next(err);
                }
                res.json({
                    status: 1,
                    message: "success",
                    data: {
                        trafficsources: result
                    }
                });
            });
        });
    });
});

/**
 * @api {get} /api/flows  获取用户所有flows
 * @apiName  get  user  flows
 * @apiGroup User
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "status": 1,
 *       "message": "success"
 *       "data":{}
 *     }
 *
 */
router.get('/api/flows', function (req, res, next) {
    var schema = Joi.object().keys({
        userId: Joi.number().required()
    });
    req.body.userId = req.userId;
    Joi.validate(req.body, schema, function (err, value) {
        if (err) {
            return next(err);
        }
        pool.getConnection(function (err, connection) {
            if (err) {
                err.status = 303;
                return next(err);
            }
            connection.query("select  `id`,`name` from Flow where `userId` = ? and `deleted` =0 and `type`=1", [value.userId], function (err, result) {
                connection.release();
                if (err) {
                    return next(err);
                }
                res.json({
                    status: 1,
                    message: "success",
                    data: {
                        flows: result
                    }
                });
            });
        });
    });
});

/**
 * @api {get} /api/networks  获取用户所有affilatenetworks
 * @apiName  
 * @apiGroup User
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "status": 1,
 *       "message": "success"
 *       "data":{}
 *     }
 *
 */
router.get('/api/networks', function (req, res, next) {
    var schema = Joi.object().keys({
        userId: Joi.number().required()
    });
    req.body.userId = req.userId;
    Joi.validate(req.body, schema, function (err, value) {
        if (err) {
            return next(err);
        }
        pool.getConnection(function (err, connection) {
            if (err) {
                err.status = 303;
                return next(err);
            }
            connection.query("select  `id`,`name` from AffiliateNetwork where `userId` = ? and `deleted` =0 ", [value.userId], function (err, result) {
                connection.release();
                if (err) {
                    return next(err);
                }
                res.json({
                    status: 1,
                    message: "success",
                    data: {
                        networks: result
                    }
                });
            });
        });
    });
});

/**
 * @api {get} /api/password/reset   用户修改密码
 * @apiName  
 * @apiGroup User
 * 
 * @apiParam {String} oldpwd
 * @apiParam {String} pwd
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "status": 1,
 *       "message": "success"
 *     }
 *
 */
router.post('/api/password/reset', function (req, res, next) {
    var schema = Joi.object().keys({
        userId: Joi.number().required(),
        oldpwd: Joi.string().required(),
        pwd: Joi.string().required()
    });
    req.body.userId = req.userId;
    const start = (() => {
        var _ref = _asyncToGenerator(function* () {
            try {
                let value = yield common.validate(req.body, schema);
                let connection = yield common.getConnection();
                let result = yield query("select `password` from User where `id`= " + value.userId, connection);
                let message;
                if (result) {
                    if (md5(value.oldpwd) == result[0].password) {
                        yield query("update User set `password`= '" + value.pwd + "' where `id`=" + value.userId, connection);
                        message = "success";
                    } else {
                        message = "old password error";
                    }
                } else {
                    message = "no user";
                }
                connection.release();
                res.json({
                    status: 1,
                    message: message
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