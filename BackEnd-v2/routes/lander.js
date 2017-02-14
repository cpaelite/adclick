/**
 * Created by Aedan on 11/01/2017.
 */

var express = require('express');
var router = express.Router();
var Joi = require('joi');
var common = require('./common');
var setting = require('../config/setting');
var Pub = require('./redis_sub_pub');

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
        url: Joi.string().required(),
        country: Joi.string().optional(),
        numberOfOffers: Joi.number().required(),
        tags: Joi.array().optional()
    });

    req.body.userId = req.userId
    let connection;
    try {
        let value = await common.validate(req.body, schema);
        connection = await common.getConnection();
        let landerResult = await common.insertLander(value.userId, value, connection);
        if (value.tags && value.tags.length) {
            for (let index = 0; index < value.tags.length; index++) {
                await common.insertTags(value.userId, landerResult.insertId, value.tags[index], 2, connection);
            }
        }

         //reids pub
        new Pub(true).publish(setting.redis.channel, value.userId,"landerAdd");

        delete value.userId;
        value.id = landerResult.insertId;

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
        name: Joi.string().required(),
        url: Joi.string().required(),
        country: Joi.string().optional(),
        numberOfOffers: Joi.number().required(),
        tags: Joi.array().optional(),
        hash: Joi.string().optional()
    });

    req.body.userId = req.userId
    req.body.id = req.params.id;
    let connection;
    try {
        let value = await common.validate(req.body, schema);
        connection = await common.getConnection();
        await common.updateLander(value.userId, value, connection);
        await common.updateTags(value.userId, value.id, 2, connection);
        if (value.tags && value.tags.length) {
            for (let index = 0; index < value.tags.length; index++) {
                await common.insertTags(value.userId, value.id, value.tags[index], 2, connection);
            }
        }
         //reids pub
        new Pub(true).publish(setting.redis.channel, value.userId,"landerUpdate");

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
    req.query.userId = req.userId;
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
    }
    finally {
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
    var sql = "select id, name from Lander where userId = " + req.userId;

    if(req.query.country){
        sql += " and `country`=" + req.query.country;
    }
    pool.getConnection(function (err, connection) {
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
        name: Joi.string().required(),
        hash: Joi.string().required()
    });
    req.query.userId = req.userId;
    req.query.id = req.params.id;
    let connection;
    try {
        let value = await common.validate(req.query, schema);
        connection = await common.getConnection();
        let result = await common.deleteLander(value.id, value.userId,value.name,value.hash, connection);
        res.json({
            status: 1,
            message: 'success'
        });
         //reids pub
        new Pub(true).publish(setting.redis.channel, value.userId,"landerDelete");
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
