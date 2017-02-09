var express = require('express');
var router = express.Router();
var Joi = require('joi');
var util = require('../util/index');
var log4js = require('log4js');
var log = log4js.getLogger('user');
var md5 = require('md5');
var moment = require('moment');
const dns = require('dns');
var common = require('./common');
var setting = require('../config/setting');


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
router.post('/auth/login', async function (req, res, next) {
    var schema = Joi.object().keys({
        email: Joi.string().trim().email().required(),
        password: Joi.string().required()
    });
    let connection;
    try {
        let value = await common.validate(req.body, schema);
        connection = await common.getConnection();

        let sql = "select  `id`,`idText`,`email`,`password`,`firstname` from User where `email` = ? and `deleted` =0";

        let rows = await query(sql, [value.email]);

        if (rows.length > 0) {
            if (rows[0].password == md5(value.password)) {
                var expires = moment().add(7, 'days').valueOf();
                res.json({ token: util.setToken(rows[0].id, expires, rows[0].firstname, rows[0].idText) });

                //更新登录时间
                let updateSql="update User set `lastLogon`= unix_timestamp(now()) where `id`= ? ";
                await query(updateSql,[rows[0].id]);

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
    } catch (e) {
        next(e);
    } finally {
        if (connection) {
            connection.release();
        }

    }
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
router.post('/auth/signup', async function (req, res, next) {
    var schema = Joi.object().keys({
        email: Joi.string().trim().email().required(),
        password: Joi.string().required(),
        firstname: Joi.string().required(),
        lastname: Joi.string().required(),
        json: Joi.object().optional()
    });
    let connection;
    try {
        let value = await common.validate(req.body, schema);
        connection = await common.getConnection();
        await common.beginTransaction(connection);
        let idtext = util.getRandomString(6);
        //User
        let sql = "insert into User(`firstname`,`lastname`,`email`,`password`,`idText`) values (?,?,?,?,?)";
        let params = [
            value.firstname, value.lastname, value.email,
            md5(value.password), idtext
        ]
        if (value.json) {
            sql = "insert into User(`firstname`,`lastname`,`email`,`password`,`idText`,`json`) values (?,?,?,?,?,?)";
            params.push(JSON.stringify(value.json))
        }
        let result = await query(sql, params);
        //系统默认domains
        for (let index = 0; index < setting.domains.length; index++) {
            await query("insert into `UserDomain`(`userId`,`domain`,`main`,`customize`) values (?,?,?,?)", [result.insertId, setting.domains[index].address, setting.domains[index].mainDomain ? 1 : 0, 0]);
        }
        await common.commit(connection);
        res.json({
            status: 1,
            message: 'success'
        });
    } catch (e) {
        await common.rollback(connection);
        next(e);
    } finally {
        if (connection) {
            connection.release();
        }

    }
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

/**
 * @api {post} /domains/validatecname   
 * @apiName  dns verify
 * @apiGroup Oauth
 * @apiParam address
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "status": 1,
 *       "message": "success"
 *       "data":{
  "domain" : "www.keepin.tv",
  "records" : [ {
    "name" : "www.keepin.tv.",
    "type" : "CNAME",
    "value" : "9cmzk.voluumtrk.com."
  }, {
    "name" : "9cmzk.voluumtrk.com.",
    "type" : "A",
    "value" : "23.22.158.20"
  }, {
    "name" : "9cmzk.voluumtrk.com.",
    "type" : "A",
    "value" : "52.22.161.45"
  }, {
    "name" : "9cmzk.voluumtrk.com.",
    "type" : "A",
    "value" : "52.44.151.120"
  } ],
  "validationResult" : "MATCHED",
  "expectedCName" : [ "9cmzk.voluumtrk2.com.", "9cmzk.voluumtrk.com.", "9cmzk.trackvoluum.com." ]
}
 *     }
 *
 */
router.post('/domains/validatecname', function (req, res, next) {
    dns.resolveCname(req.body.address, (err, addresses) => {
        console.log('addresses:', addresses);
    });

});


function query(sql, params) {
    return new Promise(function (resolve, reject) {
        pool.getConnection(function (err, connection) {
            if (err) {
                return reject(err)
            }
            connection.query(sql, params, function (err, result) {
                connection.release();
                if (err) {
                    reject(err)
                }
                resolve(result);
            });
        });
    })
}


module.exports = router;