var express = require('express');
var router = express.Router();
var Joi = require('joi');
var util = require('../util/index');
var log4js = require('log4js');
var log = log4js.getLogger('user');
var md5 = require('md5');
var moment = require('moment');
/**
 * @api {post} /auth/login  登陆
 * @apiName Login
 * @apiGroup Oauth
 *
 * @apiParam {String} email
 * @apiParam {String} password
 *
 * @apiSuccessExample {json} Success-Response:
 *{
 * status: 1,
 *   message: 'success',
 *   data: {
 *    token: 'xxxxxx',firstname:"xxx"
 *     }
 *   }
 *
 */
router.post('/auth/login', function (req, res, next) {
    var schema = Joi.object().keys({
        email: Joi.string().trim().email().required(),
        password: Joi.string().required()
    });
    Joi.validate(req.body, schema, function (err, value) {
        if (err) {
            return next(err);
        }
        pool.getConnection(function (err, connection) {
            if (err) {
                err.status = 303
                return next(err);
            }
            connection.query(
                "select  `id`,`idText`,`email`,`password`,`firstname` from User where `email` = ? and `deleted` =0 ", [
                    value.email
                ],
                function (err, rows) {
                    connection.release();
                    if (err) {
                        return next(err);
                    }
                    if (rows.length > 0) {
                        if (rows[0].password == md5(value.password)) {
                            var expires = moment().add(7, 'days').valueOf();
                            /*res.json({
                             status: 1,
                             message: 'success',
                             data: {
                             token: util.setToken(rows[0].id,expires),
                             expires: expires,
                             firstname: rows[0].firstname
                             }
                             })*/
                            res.json({token: util.setToken(rows[0].id, expires, rows[0].firstname)});
                        } else {
                            res.json({
                                status: 1002,
                                message: "password error"
                            });
                        }
                    } else {
                        res.json({
                            status: 1001,
                            message: "account not exist"
                        });
                    }
                });
        });
    });
});
/**
 * @api {post} /auth/signup  注册
 * @apiName register
 * @apiGroup Oauth
 * @apiDescription make sure request '/account/check' for checking account exists or not first
 *
 * @apiParam {String} email
 * @apiParam {String} firstname
 * @apiParam {String} lastname
 * @apiParam {String} password
 * @apiParam {Object} json
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "status": 1,
 *       "message": "success"
 *     }
 *
 */
router.post('/auth/signup', function (req, res, next) {
    var schema = Joi.object().keys({
        email: Joi.string().trim().email().required(),
        password: Joi.string().required(),
        firstname: Joi.string().required(),
        lastname: Joi.string().required(),
        json: Joi.object().optional()
    });
    Joi.validate(req.body, schema, function (err, value) {
        if (err) {
            return next(err);
        }
        pool.getConnection(function (err, connection) {
            if (err) {
                err.status = 303
                return next(err);
            }
            var idtext = util.getRandomString(6)
            var sql =
                "insert into User(`firstname`,`lastname`,`email`,`password`,`idText`,`deleted`) values (?,?,?,?,?,0)";
            var params = [
                value.firstname, value.lastname, value.email,
                md5(value.password), idtext
            ]
            if (value.json) {
                sql =
                    "insert into User(`firstname`,`lastname`,`email`,`password`,`idText`,`deleted`,`json`) values (?,?,?,?,?,0,?)"
                params.push(JSON.stringify(value.json))
            }
            connection.query(sql, params, function (err) {
                connection.release();
                if (err) {
                    log.error("[register]error:", err);
                    return next(err);
                }
                res.json({
                    "status": 1,
                    "message": "success"
                });
            });
        });
    });
});
/**
 * @api {post} /account/check  检查用户是否存在
 * @apiName account check
 * @apiGroup Oauth
 * @apiParam {String} email
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "status": 1,
 *       "message": "success"
 *       "data":{"exists":true}
 *     }
 *
 */
router.post('/account/check', function (req, res, next) {
    var schema = Joi.object().keys({
        email: Joi.string().trim().email().required()
    });
    Joi.validate(req.body, schema, function (err, value) {
        if (err) {
            return next(err);
        }
        pool.getConnection(function (err, connection) {
            if (err) {
                err.status = 303
                return next(err);
            }
            connection.query("select id from User where `email`=?", [
                value.email
            ], function (err, result) {
                connection.release();
                if (err) {
                    return next(err);
                }
                var exist = false;
                if (result.length > 0) {
                    exist = true
                }
                res.json({
                    status: 1,
                    message: 'success',
                    data: {
                        exists: exist
                    }
                });
            });
        });
    });
});
/**
 * @api {get} /countries  获取所有国家
 * @apiName  get all countries
 * @apiGroup Oauth
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "status": 1,
 *       "message": "success"
 *       "data":{"countries":[]}
 *     }
 *
 */
router.get('/api/countries', function (req, res, next) {
    pool.getConnection(function (err, connection) {
        if (err) {
            err.status = 303
            return next(err);
        }
        connection.query(
            "select `id`,`name` as display,`alpha2Code`,`alpha3Code` as value,`numCode` from `Country` order by name asc",
            function (err, result) {
                connection.release();
                if (err) {
                    return next(err);
                }
                res.json(
                    result
                );
            });
    });
});
/**
 * @api {get} /timezones  获取所有timezones
 * @apiName  get all timezones
 * @apiGroup Oauth
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "status": 1,
 *       "message": "success"
 *       "data":{"timezones":[]}
 *     }
 *
 */
router.get('/timezones', function (req, res, next) {
    pool.getConnection(function (err, connection) {
        if (err) {
            err.status = 303
            return next(err);
        }
        connection.query(
            "select `id`,`name`,`detail`,`region`,`utcShift` from `TimeZones`",
            function (err, result) {
                connection.release();
                if (err) {
                    return next(err);
                }
                res.json({
                    status: 1,
                    message: 'success',
                    data: {
                        timezones: result
                    }
                });
            });
    });
});
module.exports = router;