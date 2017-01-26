/**
 * Created by Aedan on 11/01/2017.
 */

var express = require('express');
var router = express.Router();
var Joi = require('joi');
var common = require('./common');


/**
 * @api {post} /api/traffic  新增traffic
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
router.post('/api/traffic', function (req, res, next) {
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
    const start = async()=> {
        try {
            let value = await common.validate(req.body, schema);
            let connection = await common.getConnection();
            let trafficResult = await common.insertTrafficSource(value.userId, value, connection);
            delete value.userId;
            value.id = trafficResult.insertId;
            //connection.release();
            res.json({
                status: 1,
                message: 'success',
                data: value
            });
        } catch (e) {
            next(e);
        }
        finally{
               connection.release(); 
       } 

    }
    start();

});


/**
 * @api {post} /api/traffic/:id  编辑traffic
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
router.post('/api/traffic/:id', function (req, res, next) {
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
    const start = async()=> {
        try {
            let value = await common.validate(req.body, schema);
            let connection = await common.getConnection();
            await common.updatetraffic(value.userId, value, connection);

            delete value.userId;
            //connection.release();
            res.json({
                status: 1,
                message: 'success',
                data: value
            });


        } catch (e) {
            next(e);
        }
        finally{
               connection.release(); 
       } 
    }
    start();
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
router.get('/api/traffic/:id', function (req, res, next) {
    var schema = Joi.object().keys({
        id: Joi.number().required(),
        userId: Joi.number().required()
    });
    req.query.id = req.params.id;
    req.query.userId = req.userId;
    const start = async()=> {
        try {
            let value = await common.validate(req.query, schema);
            let connection = await common.getConnection();
            let result = await common.gettrafficDetail(value.id, value.userId, connection);
            //connection.release();
            res.json({
                status: 1,
                message: 'success',
                data: result ? result : {}
            });
        } catch (e) {
             next(err);
        }
        finally{
               connection.release(); 
       } 
    }
    start();

});


/**
 * @api {delete} /api/traffic/:id 删除traffic
 * @apiName  删除traffic
 * @apiGroup traffic
 */
router.delete('/api/traffic/:id', function (req, res, next) {
    var schema = Joi.object().keys({
        id: Joi.number().required(),
        userId: Joi.number().required()
    });
    req.query.userId = req.userId;
    req.query.id = req.params.id;
    const start = async()=> {
        try {
            let value = await common.validate(req.query, schema);
            let connection = await common.getConnection();
            let result = await common.deletetraffic(value.id, value.userId, connection);
            //connection.release();
            res.json({
                status: 1,
                message: 'success'
            });
        } catch (e) {
             next(e);
        }
        finally{
         connection.release(); 
       } 
    }
    start();

});

module.exports = router;
