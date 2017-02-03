/**
 * Created by Aedan on 11/01/2017.
 */

var express = require('express');
var router = express.Router();
var Joi = require('joi');
var common = require('./common');


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
router.post('/api/traffics', async function (req, res, next) {
    var schema = Joi.object().keys({
        userId: Joi.number().required(),
        name: Joi.string().required(),
        postbackUrl: Joi.string().optional(),
        pixelRedirectUrl: Joi.string().optional(),
        impTracking: Joi.number().optional(),
        externalId: Joi.string().optional(),
        cost: Joi.string().optional(),
        params: Joi.string().optional()
    });

    req.body.userId = req.userId
    let connection;
    try {
        let value = await common.validate(req.body, schema);
        connection = await common.getConnection();
        let trafficResult = await common.insertTrafficSource(value.userId, value, connection);
        delete value.userId;
        value.id = trafficResult.insertId;

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
router.post('/api/traffics/:id', async function (req, res, next) {
    var schema = Joi.object().keys({
        id: Joi.number().required(),
        userId: Joi.number().required(),
        name: Joi.string().optional(),
        postbackUrl: Joi.string().optional(),
        pixelRedirectUrl: Joi.string().optional(),
        impTracking: Joi.number().optional(),
        externalId: Joi.string().optional(),
        cost: Joi.string().optional(),
        params: Joi.string().optional()
    });

    req.body.userId = req.userId
    req.body.id = req.params.id;
    let connection;

    try {
        let value = await common.validate(req.body, schema);
        let connection = await common.getConnection();
        await common.updatetraffic(value.userId, value, connection);

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
 * @api {get} /api/traffic/:id  traffic detail
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
router.get('/api/traffics/:id', async function (req, res, next) {
    var schema = Joi.object().keys({
        id: Joi.number().required(),
        userId: Joi.number().required()
    });
    req.query.id = req.params.id;
    req.query.userId = req.userId;
    let connection;

    try {
        let value = await common.validate(req.query, schema);
        connection = await common.getConnection();
        let result = await common.gettrafficDetail(value.id, value.userId, connection);
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
router.get('/api/traffics', function (req, res, next) {
    var schema = Joi.object().keys({
        userId: Joi.number().required()
    });
    req.query.userId = req.userId;
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
                "select  `id`,`name`,`cost`,`impTracking`,`params` from TrafficSource where `userId` = ? and `deleted` =0", [
                    value.userId
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
 */
router.delete('/api/traffics/:id', async function (req, res, next) {
    var schema = Joi.object().keys({
        id: Joi.number().required(),
        userId: Joi.number().required()
    });
    req.query.userId = req.userId;
    req.query.id = req.params.id;
    let connection;
    try {
        let value = await common.validate(req.query, schema);
        connection = await common.getConnection();
        let result = await common.deletetraffic(value.id, value.userId, connection);
        //connection.release();
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
