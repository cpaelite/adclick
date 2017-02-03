var express = require('express');
var router = express.Router();
var Joi = require('joi');
var common = require('./common');
var md5 = require('md5');


/**
 * @api {get} /api/user/profile    用户信息
 * @apiName  用户信息
 * @apiGroup Setting
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "status": 1,
 *       "message": "success",
 *       "data":{
 *             "firstname":"",
 *             "lastname":"",
 *             "json":"",
 *             "status":1            
 *           }
 *     }
 *
 */
router.get('/api/user/profile', async function (req, res, next) {
    var schema = Joi.object().keys({
        userId: Joi.number().required()
    });
    req.query.userId = req.userId;
    let connection;
    try {
        let value = await common.validate(req.query, schema);
        connection = await common.getConnection();
        let result = await query("select `idText`,`firstname`,`lastname`,`status`,`json` from User where `deleted`= 0 and `id`= " + value.userId, connection);
        //connection.release();
        res.json({
            status: 1,
            message: 'succes',
            data: result.length ? result[0] : {}
        });
    } catch (e) {
        next(e);
    }
    finally {
        if (connection) {
            connection.release();
        }
    }

});

/**
 * @api {post} /api/user/profileChange   用户信息修改
 * @apiName  用户信息修改
 * @apiGroup Setting
 *
 * @apiParam {String} firstname
 * @apiParam {String} lastname
 * @apiParam {String} json   按照既定规则生成的User信息(CompanyName,Phone,DefaultTimeZone,DefaultHomeScreen)
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "status": 1,
 *       "message": "success"
 *     }
 *
 */
router.post('/api/user/profile', async function (req, res, next) {
    var schema = Joi.object().keys({
        userId: Joi.number().required(),
        firstname: Joi.string().optional(),
        lastname: Joi.string().optional(),
        json: Joi.string().optional()
    });
    req.body.userId = req.userId;
    let connection;
    try {
        let value = await common.validate(req.body, schema);
        connection = await common.getConnection();
        let sql = 'update User set ';
        if (value.firstname) {
            sql += "`firstname`='" + value.firstname + "'";
        }
        if (value.lastname) {
            sql += ",`lastname`='" + value.lastname + "'";
        }
        if (value.json) {
            sql += ",`json`='" + value.json + "'";
        }
        sql += " where `id`=" + value.userId
        await query(sql, connection);

        res.json({
            "status": 1,
            "message": "success"
        });
    } catch (e) {
        next(e);
    }
    finally {
        if (connection) {
            connection.release();
        }

    }

});

/**
 * @api {post} /api/user/passwordChange   用户修改密码
 * @apiName  用户修改密码
 * @apiGroup Setting
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
router.post('/api/user/passwordChange', async function (req, res, next) {
    var schema = Joi.object().keys({
        userId: Joi.number().required(),
        oldpwd: Joi.string().required(),
        pwd: Joi.string().required()
    });
    req.body.userId = req.userId;
    let connection;

    try {
        let value = await common.validate(req.body, schema);
        connection = await common.getConnection();
        let result = await query("select `password` from User where `id`= " + value.userId, connection);
        let message;
        if (result && result[0]) {
            if (md5(value.oldpwd) == result[0].password) {
                await query("update User set `password`= '" + md5(value.pwd) + "' where `id`=" + value.userId, connection);
                message = "success"
            } else {
                message = "old password error"
            }
        } else {
            message = "no user"
        }
        //connection.release();
        res.json({
            status: 1,
            message: message
        });
    } catch (e) {
        next(e);
    }
    finally {
        if (connection) {
            connection.release();
        }

    }

});


/**
 * @api {post} /api/user/emailChange   用户修改email
 * @apiName  用户修改email
 * @apiGroup Setting
 *
 * @apiParam {String} email
 * @apiParam {String} password
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "status": 1,
 *       "message": "success"
 *     }
 *
 */
router.post('/api/user/emailChange', async function (req, res, next) {
    var schema = Joi.object().keys({
        userId: Joi.number().required(),
        email: Joi.string().required(),
        password: Joi.string().required()
    });
    req.body.userId = req.userId;
    let connection;
    try {
        let value = await common.validate(req.body, schema);
        connection = await common.getConnection();
        let result = await query("select `password` from User where `id`= " + value.userId, connection);
        let message;
        if (result && result[0]) {
            if (md5(value.password) == result[0].password) {
                await query("update User set `email`= '" + value.email + "' where `id`=" + value.userId, connection);
                message = "success"
            } else {
                message = "password error"
            }
        } else {
            message = "no user"
        }
        //connection.release();
        res.json({
            status: 1,
            message: message
        });
    } catch (e) {
        next(e);
    }
    finally {
        if (connection) {
            connection.release();
        }

    }

});


/**
 * @api {get} /api/user/referrals   用户推广收益
 * @apiName  用户推广收益
 * @apiGroup Setting
 *
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "status": 1,
 *       "message": "success",
 *       "data":{
 *           referrals:[{"referredUserId":,
 *           "acquired":"",
 *           "status":,
 *            "recentCommission":"",
 *            "totalCommission":""}],
 *          "totals":{count:2,"lastMonthCommissions":"","lifeTimeCommissions":""}
 *        }
 *     }
 *
 */
router.get('/api/user/referrals', function (req, res, next) {

});


router.get('/api/user/billing', function (req, res, next) {

});

router.get('/api/user/domains', function (req, res, next) {

});


function query(sql, connection) {
    return new Promise(function (resolve, reject) {
        connection.query(sql, function (err, result) {
            if (err) {
                reject(err)
            }
            resolve(result);
        })
    })
}


module.exports = router;

