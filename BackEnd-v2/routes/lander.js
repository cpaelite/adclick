/**
 * Created by Aedan on 11/01/2017.
 */

var express = require('express');
var router = express.Router();
var Joi = require('joi');
var common = require('./common');
var setting = require('../config/setting');
var _ = require('lodash');
var util = require('../util');

/**
 * @api {post} /api/landers  新增lander
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
router.post('/api/landers', async function (req, res, next) {
    var schema = Joi.object().keys({
        userId: Joi.number().required(),
        name: Joi.string().required(),
        hash: Joi.string().optional(),
        url: Joi.string().required().regex(util.regWebURL, 'url'),
        country: Joi.string().optional().allow(""),
        numberOfOffers: Joi.number().required(),
        tags: Joi.array().optional()
    });

    req.body.userId = req.parent.id
    let connection;
    try {
        let value = await common.validate(req.body, schema);
        connection = await common.getConnection();
        //check lander name exists
        if (await common.checkNameExists(value.userId, null, value.name, 2, connection)) {
            throw new Error("Lander name exists");
        }

        let landerResult = await common.insertLander(req.user.id, value.userId, value, connection);
        if (value.tags && value.tags.length) {
            for (let index = 0; index < value.tags.length; index++) {
                await common.insertTags(value.userId, landerResult.insertId, value.tags[index], 2, connection);
            }
        }

        delete value.userId;
        value.id = landerResult.insertId;
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
 * @api {post} /api/landers/:id  编辑lander
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
router.post('/api/landers/:id', async function (req, res, next) {
    var schema = Joi.object().keys({
        id: Joi.number().required(),
        userId: Joi.number().required(),
        name: Joi.string().optional(),
        url: Joi.string().optional().regex(util.regWebURL, 'url'),
        country: Joi.string().optional().allow(""),
        numberOfOffers: Joi.number().optional(),
        tags: Joi.array().optional(),
        hash: Joi.string().optional(),
        deleted: Joi.number().optional()
    });

    req.body.userId = req.parent.id
    req.body.id = req.params.id;
    let connection;
    try {
        let value = await common.validate(req.body, schema);
        connection = await common.getConnection();
        //check lander name exists
        if (await common.checkNameExists(value.userId, value.id, value.name, 2, connection)) {
            throw new Error("Lander name exists");
        }
        await common.updateLander(req.user.id, value.userId, value, connection);
        await common.updateTags(value.userId, value.id, 2, connection);
        if (value.tags && value.tags.length) {
            for (let index = 0; index < value.tags.length; index++) {
                await common.insertTags(value.userId, value.id, value.tags[index], 2, connection);
            }
        }


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
router.get('/api/landers/:id', async function (req, res, next) {
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
        let result = await common.getLanderDetail(value.id, value.userId, connection);
        res.json({
            status: 1,
            message: 'success',
            data: result ? result : {}
        });
    } catch (e) {
        next(err);
    } finally {
        if (connection) {
            connection.release();
        }

    }


})

/**
 * @api {get} /api/landers  user landers
 * @apiName user landers
 * @apiGroup lander
 * 
 * @apiParam columns
 * @apiParam [country]
 *
 * @apiSuccessExample {json} Success-Response:
 *   {
 *    status: 1,
 *    message: 'success',data:{}  }
 *
 */
router.get('/api/landers', function (req, res, next) {
    // userId from jwt, don't need validation
    var sql = "select id, name, country from Lander where userId = " + req.parent.id + " and deleted = 0 ";

    if (req.query.country) {
        sql += " and `country`=" + req.query.country;
    }
    pool['m1'].getConnection(function (err, connection) {
        if (err) {
            err.status = 303
            return next(err);
        }
        connection.query(sql, function (err, result) {
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
 * @api {delete} /api/lander/:id 删除lander
 * @apiName  删除lander
 * @apiGroup lander
 * 
 * @apiParam {String} name
 * @apiParam {String} hash
 * 
 */
router.delete('/api/landers/:id', async function (req, res, next) {
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
        //check lander used by 普通flow ?   
        let templeSql = `select  f.id as flowId,f.name as flowName from  Lander lander
                        right join Lander2Path p2 on lander.id = p2.landerId
                        right join Path p on p.id = p2.pathId
                        right join Path2Rule r2 on r2.pathId = p.id
                        right join Rule r on r.id= r2.ruleId
                        right join Rule2Flow f2 on f2.ruleId= r.id
                        right join Flow f on f.id = f2.flowId
                        where   f.deleted = 0
                        and lander.id= ${value.id} and lander.userId= ${value.userId} and f.type=1`;
        //check lander used by campaign 
        let userdByCampaign = `   select  cam.id as campaignId,cam.name as campaignName from  Lander lander
                        right join Lander2Path p2 on lander.id = p2.landerId
                        right join Path p on p.id = p2.pathId
                        right join Path2Rule r2 on r2.pathId = p.id
                        right join Rule r on r.id= r2.ruleId
                        right join Rule2Flow f2 on f2.ruleId= r.id
                        right join Flow f on f.id = f2.flowId
                         right join TrackingCampaign cam on cam.targetFlowId = f.id 
                        where   f.deleted = 0
                        and lander.id= ${value.id} and lander.userId= ${value.userId} and f.type= 0 and cam.deleted= 0`;

        let [flowResult, campaignResult] = await Promise.all([common.query(templeSql, [], connection), common.query(userdByCampaign, [], connection)]);
        if (flowResult.length) {
            res.json({
                status: 0,
                message: 'lander used by flow!',
                data: {
                    flows: flowResult
                }
            });
            return;
        }
        
        if (campaignResult.length) {
            res.json({
                status: 0,
                message: 'lander used by campaign!',
                data: {
                    campaigns: campaignResult
                }
            });
            return;
        }

        let result = await common.deleteLander(req.user.id, value.id, value.userId, connection);
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