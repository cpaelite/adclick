/**
 * Created by Aedan on 11/01/2017.
 */

var express = require('express');
var router = express.Router();
var Joi = require('joi');
var common = require('./common');
var util = require('../util');


/**
 * @api {post} /api/traffics  新增traffic
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
router.post('/api/traffics', async function(req, res, next) {
    var schema = Joi.object().keys({
        userId: Joi.number().required(),
        name: Joi.string().required(),
        postbackUrl: Joi.string().optional().regex(util.regWebURL, 'postbackUrl').allow(""),
        pixelRedirectUrl: Joi.string().optional().regex(util.regWebURL, 'pixelRedirectUrl').allow(""),
        impTracking: Joi.number().optional(),
        externalId: Joi.string().optional().empty(""),
        campaignId: Joi.string().optional().empty(""),
        websiteId: Joi.string().optional().empty(""),
        cost: Joi.string().optional().empty(""),
        params: Joi.string().optional().empty("")
    });

    req.body.userId = req.parent.id
    let connection;
    try {
        let value = await common.validate(req.body, schema);
        connection = await common.getConnection();
        //check TrafficSource name exists
        if (await common.checkNameExists(value.userId, null, value.name, 5, connection)) {
            throw new Error("TrafficSource name exists");
        }
        let trafficResult = await common.insertTrafficSource(req.user.id, value.userId, value, connection);
        delete value.userId;
        value.id = trafficResult.insertId;
        value.deleted = 0;
        res.json({
            status: 1,
            message: 'success',
            data: value
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
 * @api {post} /api/traffics/:id  编辑traffic
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
 *
 * @apiSuccessExample {json} Success-Response:
 *   {
 *    status: 1,
 *    message: 'success',
 *    data:{}
 *  *   }
 *
 */
router.post('/api/traffics/:id', async function(req, res, next) {
    var schema = Joi.object().keys({
        id: Joi.number().required(),
        userId: Joi.number().required(),
        name: Joi.string().optional(),
        postbackUrl: Joi.string().regex(util.regWebURL, 'postbackUrl').optional().allow(""),
        pixelRedirectUrl: Joi.string().regex(util.regWebURL, 'pixelRedirectUrl').optional().allow(""),
        impTracking: Joi.number().optional(),
        externalId: Joi.string().optional().allow(""),
        cost: Joi.string().optional().allow(""),
        campaignId: Joi.string().optional().allow(""),
        websiteId: Joi.string().optional().allow(""),
        params: Joi.string().optional().allow(""),
        hash: Joi.string().optional(),
        deleted: Joi.number().optional()
    });

    req.body.userId = req.parent.id
    req.body.id = req.params.id;
    let connection;

    try {
        let value = await common.validate(req.body, schema);
        let connection = await common.getConnection();
        //check TrafficSource name exists
        if (await common.checkNameExists(value.userId, value.id, value.name, 5, connection)) {
            throw new Error("TrafficSource name exists");
        }
        await common.updatetraffic(req.user.id, value.userId, value, connection);

        delete value.userId;

        res.json({
            status: 1,
            message: 'success',
            data: value
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
 * @api {get} /api/traffics/:id  traffic detail
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
router.get('/api/traffics/:id', async function(req, res, next) {
    var schema = Joi.object().keys({
        id: Joi.number().required(),
        userId: Joi.number().required()
    });
    req.query.id = req.params.id;
    req.query.userId = req.parent.id;
    let connection;

    try {
        let value = await common.validate(req.query, schema);
        connection = await common.getConnection();
        let result = await common.gettrafficDetail(value.id, value.userId, connection);
        res.json({
            status: 1,
            message: 'success',
            data: result.length ? result[0] : {}
        });
    } catch (e) {
        next(err);
    } finally {
        if (connection) {
            connection.release();
        }
    }
});


/**
 * @api {get} /api/traffics  获取用户所有trafficsources
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
router.get('/api/traffics', function(req, res, next) {
    var schema = Joi.object().keys({
        userId: Joi.number().required()
    });
    req.query.userId = req.parent.id;
    Joi.validate(req.query, schema, function(err, value) {
        if (err) {
            return next(err);
        }
        pool.getConnection('m1', function(err, connection) {
            if (err) {
                err.status = 303
                return next(err);
            }
            connection.query(
                "select  `id`,`name`,`externalId`,`cost`,`hash`,`postbackUrl`,`pixelRedirectUrl`,`impTracking`,`params`,`campaignId`,`websiteId` from TrafficSource where `userId` = ? and `deleted` =0", [
                    value.userId
                ],
                function(err, result) {
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
 * @api {delete} /api/traffic/:id 删除traffic
 * @apiName  删除traffic
 * @apiGroup traffic
 * 
 * @apiParam {String} name
 * @apiParam {String} hash
 * 
 */
router.delete('/api/traffics/:id', async function(req, res, next) {
    var schema = Joi.object().keys({
        id: Joi.number().required(),
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
        let result = await common.deletetraffic(req.user.id, value.id, value.userId, connection);
        res.json({
            status: 1,
            message: 'success'
        });
    } catch (e) {
        next(e);
    } finally {
        if (connection) {
            connection.release();
        }
    }


});

module.exports = router;