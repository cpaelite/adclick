/**
 * Created by Aedan on 12/01/2017.
 */



var express = require('express');
var router = express.Router();
var Joi = require('joi');
var common = require('./common');
var setting = require('../config/setting');
const _ = require('lodash');

/**
 * @api {post} /api/preferences  编辑用户配置
 * @apiParam json string
 * @apiName  updates  user  preferences
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
router.post('/api/preferences', function (req, res, next) {
    var schema = Joi.object().keys({
        userId: Joi.number().required(),
        json: Joi.object().required()
    });
    req.body.userId = req.parent.id;
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
                "update  User set `json`=?   where `id` = ?", [
                    JSON.stringify(value.json), value.userId
                ],
                function (err) {
                    connection.release();
                    if (err) {
                        return next(err);
                    }
                    res.json({
                        status: 1,
                        message: "success",
                        data: value.json
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

router.get('/api/tags', function (req, res, next) {
    var schema = Joi.object().keys({
        userId: Joi.number().required(),
        type: Joi.number().required()
    });
    req.query.userId = req.parent.id;
    Joi.validate(req.query, schema, function (err, value) {
        if (err) {
            return next(err);
        }
        pool.getConnection(function (err, connection) {
            if (err) {
                err.status = 303
                return next(err);
            }
            connection.query(
                "select  `id`,`name` from Tags where `userId` = ? and `type`= ? and `deleted` =0", [
                    value.userId, value.type
                ],
                function (err, result) {
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
 * @api {post} /api/names  check name exists                              
 * @apiName    check name exists
 * @apiGroup User
 * @apiParam {String} name  
 * @apiParam {Number} type  1:Campaign;2:Lander;3:Offer4:Flow
 * 
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "status": 1,
 *       "message": "success"
 *       "data":{
 *           exists:true
 *        }
 *     }
 *
 */
router.post('/api/names', async function (req, res, next) {
    var schema = Joi.object().keys({
        userId: Joi.number().required(),
        name: Joi.string().required().trim(),
        type: Joi.number().required(),
        id: Joi.number().optional()
    });
    req.body.userId = req.parent.id;
    let connection;
    try {
        let value = await common.validate(req.body, schema);
        connection = await common.getConnection();
        let responseData = await common.checkNameExists(value.userId, value.id ? value.id : null, value.name, value.type, connection);
        res.json({
            status: 1,
            message: 'succes',
            data: {
                exists: responseData
            }
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
 * @api {get} /api/postbackurl  获取offer默认postbackurl
 * @apiName   获取offer默认postbackurl   
 * @apiGroup User
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "status": 1,
 *       "message": "success"
 *       "data":{
 *           defaultPostBackUrl:XXX
 *        }
 *     }
 *
 */

router.get('/api/postbackurl', function (req, res, next) {
    var schema = Joi.object().keys({
        userId: Joi.string().required()
    });
    req.query.userId = req.parent.idText;
    Joi.validate(req.query, schema, function (err, value) {
        if (err) {
            return next(err);
        }
        try {
            let defaultDomain;
            for (let index = 0; index < setting.domains.length; index++) {
                if (setting.domains[index].postBackDomain) {
                    defaultDomain = setting.domains[index].address;
                }
            }
            res.json({
                status: 1,
                message: 'success',
                data: {
                    defaultPostBackUrl: setting.newbidder.httpPix + value.userId + "." + defaultDomain + setting.newbidder.postBackRouter + setting.newbidder.postBackRouterParam
                }
            })
        } catch (e) {
            next(e);
        }
    });
});



router.get('/api/permission', async function (req, res, next) {
    let connection;
    try {
        connection = await common.getConnection();
        let f = await common.query("select functions` from UserFunctions where `userId`= ?", [req.parent.id], connection);
        let privileges = JSON.parse(req.parent.privilege);
        //初始化
        if(_.has(privileges, "setting.domain")){
             privileges.setting.domain.domainLimit=0;
        }
        if(_.has(privileges, "setting.userManagement")){
             privileges.setting.userManagement.userLimit=0;
        }
        if(_.has(privileges, "report.tsReport")){
             privileges.report.tsReport.tsReportLimit=0;
        }
        if(_.has(privileges, "report")){
             privileges.report.retentionLimit=0;
        }
        if (f.length && req.parent.privilege) {
            let limits = JSON.parse(f[0]);
            if (_.has(limits, 'domainLimit') && _.has(privileges, "setting.domain")) {
                privileges.setting.domain.domainLimit = limits.domainLimit;
            }
            if (_.has(limits, 'userLimit') && _.has(privileges, "setting.userManagement")) {
                privileges.setting.userManagement.userLimit = limits.userLimit;
            }
            if (_.has(limits, 'tsReportLimit') && _.has(privileges, "report.tsReport")) {
                privileges.report.tsReport.tsReportLimit = limits.tsReportLimit;
            }
            if (_.has(limits, 'retentionLimit') && _.has(privileges, "report")) {
                privileges.report.retentionLimit = limits.retentionLimit;
            }
            return res.json({
                status: 1,
                message: 'success',
                data: privileges
            })
        } else {
            return res.json({
                status: 0,
                message: 'fail',
                data: {}
            })
        }
    } catch (e) {
        next(e);
    } finally {
        if (connection) {
            connection.release();
        }
    }
})





module.exports = router;