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
var Pub = require('./redis_sub_pub');

/**
 * @api {post} /auth/login  登陆
 * @apiName Login
 * @apiGroup auth
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
                var expires = moment().add(200, 'days').valueOf();
                res.json({ token: util.setToken(rows[0].id, expires, rows[0].firstname, rows[0].idText) });

                //更新登录时间
                let updateSql = "update User set `lastLogon`= unix_timestamp(now()) where `id`= ? ";
                await query(updateSql, [rows[0].id]);

            } else {
                res.status(401).json({
                    status: 1002,
                    message: "account/password error"
                });
            }
        } else {
            res.status(401).json({
                status: 1001,
                message: "account/password error"
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
 * @apiGroup auth
 * @apiDescription make sure request '/account/check' for checking account exists or not first
 *
 * @apiParam {String} email
 * @apiParam {String} firstname
 * @apiParam {String} lastname
 * @apiParam {String} password
 * @apiParam {Object} json
 * @apiParam {String} [refToken]
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
        json: Joi.object().optional(),
        refToken: Joi.string().optional().empty("")
    });
    let connection;
    try {
        let value = await common.validate(req.body, schema);
        connection = await common.getConnection();
        //check email exists
        let UserResult = await query("select id from User where `email`=?", [value.email]);
        if (UserResult.length > 0) throw new Error("account exists");
        //事务开始
        await common.beginTransaction(connection);
        let idtext = util.getRandomString(6);
        let reftoken = util.getUUID() + "." + idtext;
        //User
        let sql = "insert into User(`registerts`,`firstname`,`lastname`,`email`,`password`,`idText`,`referralToken`) values (unix_timestamp(now()),?,?,?,?,?,?)";
        let params = [
            value.firstname, value.lastname, value.email,
            md5(value.password), idtext, reftoken
        ];
        if (value.json) {
            sql = "insert into User(`registerts`,`firstname`,`lastname`,`email`,`password`,`idText`,`referralToken`,`json`) values (unix_timestamp(now()),?,?,?,?,?,?,?)";
            params.push(JSON.stringify(value.json))
        }
        let result = await query(sql, params);
        //系统默认domains
        for (let index = 0; index < setting.domains.length; index++) {
            await query("insert into `UserDomain`(`userId`,`domain`,`main`,`customize`) values (?,?,?,?)", [result.insertId, setting.domains[index].address, setting.domains[index].mainDomain ? 1 : 0, 0]);
        }
        //如果refToken 不为"" 说明是从推广链接过来的
        if (value.refToken) {
            let slice = value.refToken.split('.');
            let referreUserId = slice.length == 2 ? slice[1] : 0;
            if (referreUserId) {
                let USER=await query("select `id` from User where `idText` = ?",[referreUserId]);
                if(USER.length == 0){
                    throw new Error("refToken error");
                }
                await query("insert into `UserReferralLog` (`userId`,`referredUserId`,`acquired`,`status`) values (?,?,unix_timestamp(now()),0)", [USER[0].id, result.insertId]);
            }
        }
        
        await common.commit(connection);
        new Pub(true).publish(setting.redis.channel,result.insertId + ".add.user." + result.insertId, "userAdd");
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
 * @apiGroup auth
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
 * @apiGroup auth
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
 * @apiGroup auth
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
            "select `id`,`name`,`detail`,`region`,`utcShift` from `Timezones`",
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
 * @apiGroup auth
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