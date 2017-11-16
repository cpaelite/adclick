var express = require('express');
var router = express.Router();
var Joi = require('joi');
var common = require('./common');
var setting = require('../config/setting');
var _ = require('lodash');

/**
 * @api {get} /api/affiliates/:id  获取用户所有affilatenetworks
 * @apiName  获取用户所有affilatenetworks
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
router.get('/api/affiliates/:id', async function (req, res, next) {
    let connection;
    try {
        var schema = Joi.object().keys({
            userId: Joi.number().required(),
            id: Joi.number().required()
        });
        req.query.userId = req.parent.id;
        req.query.id = req.params.id;

        let value = await common.validate(req.query, schema);
        connection = await common.getConnection();
        let mainDomain = common.query("select `domain`,`customize` from UserDomain where `userId`= ? and `main` = 1 and `deleted`= 0", [value.userId], connection);
        let resultsql = common.query("select  `id`,`name`,`hash`,`postbackUrl`,`appendClickId`,`duplicatedPostback`,`ipWhiteList`,`deleted` from AffiliateNetwork where `userId` = ? and `id` =? ", [value.userId, value.id], connection);
        let results = await Promise.all([resultsql, mainDomain]);
        let result = results[0];
        let domainResult = results[1];
        let defaultDomain;
        let affiliate = {};
        if (result.length) {
            //修改postbackurl
            //如果自己定义了main domain 优先
            if (domainResult.length) {
                if (domainResult[0].customize == 1) {
                    defaultDomain = domainResult[0].domain;
                } else {
                    defaultDomain = req.parent.idText + "." + domainResult[0].domain;
                }
            } else {
                //默认使用系统配置
                for (let index = 0; index < setting.domains.length; index++) {
                    if (setting.domains[index].postBackDomain) {
                        defaultDomain = req.parent.idText + "." + setting.domains[index].address;
                    }
                }
            }
            let index = result[0].postbackUrl.indexOf('?');
            if (result[0].postbackUrl && index >= 0) {
                result[0].postbackUrl = setting.newbidder.httpPix + defaultDomain + setting.newbidder.postBackRouter + result[0].postbackUrl.substring(index);
            }
            affiliate = result[0];
        }
        res.json({
            status: 1,
            message: "success",
            data: {
                affiliates: affiliate
            }
        });

    } catch (e) {
        next(e);
    } finally {
        if (connection) {
            connection.release();
        }
    }
});


/**
 * @api {get} /api/affiliates  获取用户所有affilatenetworks
 * @apiName  获取用户所有affilatenetworks
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
router.get('/api/affiliates', async function (req, res, next) {

    let connection;
    try {
        var schema = Joi.object().keys({
            userId: Joi.number().required()
        });
        req.query.userId = req.parent.id;
        let value = await common.validate(req.query, schema);
        connection = await common.getConnection();
        let mainDomain = common.query("select `domain`,`customize` from UserDomain where `userId`= ? and `main` = 1 and `deleted`= 0", [value.userId], connection);
        let resultsql = common.query("select  `id`,`name`,`postbackUrl` from AffiliateNetwork where `userId` = ? and `deleted` =0 ", [value.userId], connection);
        let results = await Promise.all([resultsql, mainDomain]);
        let result = results[0];
        let domainResult = results[1];
        let defaultDomain;
        let affiliates = [];
        if (result.length) {
            //修改postbackurl
            //如果自己定义了main domain 优先
            if (domainResult.length) {
                if (domainResult[0].customize == 1) {
                    defaultDomain = domainResult[0].domain;
                } else {
                    defaultDomain = req.parent.idText + "." + domainResult[0].domain;
                }
            } else {
                //默认使用系统配置
                for (let index = 0; index < setting.domains.length; index++) {
                    if (setting.domains[index].postBackDomain) {
                        defaultDomain = req.parent.idText + "." + setting.domains[index].address;
                    }
                }
            }
            for (let i = 0; i < result.length; i++) {
                let index = result[i].postbackUrl.indexOf('?');
                if (result[i].postbackUrl && index >= 0) {
                    result[i].postbackUrl = setting.newbidder.httpPix + defaultDomain + setting.newbidder.postBackRouter + result[i].postbackUrl.substring(index);
                }
                affiliates.push(result[i]);
            }

        }
        res.json({
            status: 1,
            message: "success",
            data: {
                affiliates: affiliates
            }
        });

    } catch (e) {
        next(e);
    } finally {
        if (connection) {
            connection.release();
        }
    }
});

/**
 * @api {post} /api/affiliates/:id  编辑affilate
 * @apiName 编辑affilate
 * @apiGroup network
 *
 * @apiParam {Number}  id
 * @apiParam {String} [name]
 * @apiParam {String} [postbackUrl]
 * @apiParam {Number} [appendClickId]
 * @apiParam {Number} [duplicatedPostback]
 * @apiParam {String} [ipWhiteList]
 * @apiParam {Number} [deleted]
 *
 * @apiSuccessExample {json} Success-Response:
 *   {
 *    status: 1,
 *    message: 'success'
 *   }
 *
 */
router.post('/api/affiliates/:id', async function (req, res, next) {
    var schema = Joi.object().keys({
        id: Joi.string().required(),
        userId: Joi.number().required(),
        name: Joi.string().optional(),
        postbackUrl: Joi.string().optional().empty(""),
        appendClickId: Joi.number().optional(),
        duplicatedPostback: Joi.number().optional(),
        ipWhiteList: Joi.string().optional().empty(""),
        hash: Joi.string().optional().empty(""),
        deleted: Joi.number().optional()
    });

    req.body.userId = req.parent.id;
    req.body.id = req.params.id;
    let connection;
    try {
        let value = await common.validate(req.body, schema);
        connection = await common.getConnection();
        var ids = value.id.split(','), p = [];
        if(value.name) {
          //check AffiliateNetwork name exists
          value.id = Number(value.id);
          if (await common.checkNameExists(value.userId, value.id, value.name, 6, connection)) {
            throw new Error("AffiliateNetwork name exists");
          }
        }
        ids.forEach((id) => {
          let v = _.clone(value, true);
          v.id = id;
          p.push(common.updateAffiliates(value.userId, req.user.id, v, connection));
        });
        await Promise.all(p);
        // await common.updateAffiliates(value.userId, req.user.id, value, connection);
        delete value.userId;
        res.json({
            status: 1,
            message: 'success',
            data: value
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
 * @api {post} /api/affiliates  新增affilate
 * @apiName 新增affilate
 * @apiGroup network
 *
 * @apiParam {String} name
 * @apiParam {String} postbackUrl
 * @apiParam {Number} [appendClickId]
 * @apiParam {Number} [duplicatedPostback]
 * @apiParam {String} [ipWhiteList]
 *
 * @apiSuccessExample {json} Success-Response:
 *   {
 *    status: 1,
 *    message: 'success'
 *   }
 *
 */
router.post('/api/affiliates', async function (req, res, next) {
    var schema = Joi.object().keys({
        userId: Joi.number().required(),
        name: Joi.string().required(),
        postbackUrl: Joi.string().optional().empty(""),
        appendClickId: Joi.number().optional(),
        duplicatedPostback: Joi.number().optional(),
        ipWhiteList: Joi.string().optional().empty("")
    });
    req.body.userId = req.parent.id;
    let connection;
    try {
        let value = await common.validate(req.body, schema);
        connection = await common.getConnection();
        //check AffiliateNetwork name exists
        if (await common.checkNameExists(value.userId, null, value.name, 6, connection)) {
            throw new Error("AffiliateNetwork name exists");
        }

        let affiliateResult = await common.insertAffiliates(value.userId, req.user.id, value, connection);

        delete value.userId;
        value.id = affiliateResult.insertId;
        value.deleted = 0;
        res.json({
            status: 1,
            message: 'success',
            data: value
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
 * @api {delete} /api/affiliates/:id 删除affiliates
 * @apiName  删除affiliates
 * @apiGroup network
 *
 * @apiParam {String} name
 * @apiParam {String} hash
 *
 */
router.delete('/api/affiliates/:id', async function (req, res, next) {
    var schema = Joi.object().keys({
        id: Joi.string().required(),
        userId: Joi.number().required(),
        name: Joi.string().optional(),
        hash: Joi.string().optional()
    });
    req.query.userId = req.parent.id;
    req.query.id = req.params.id;
    let connection;
    try {
        let value = await common.validate(req.query, schema);
        connection = await common.getConnection();
        var ids = value.id.split(','), p = [];
        ids.forEach((id) => {
          p.push(common.deleteAffiliate(id, value.userId, req.user.id, connection));
        });
        await Promise.all(p);
        // let result = await common.deleteAffiliate(value.id, value.userId, req.user.id, connection);

        res.json({
            status: 1,
            message: 'success'
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


module.exports = router;
