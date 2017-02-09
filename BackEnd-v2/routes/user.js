/**
 * Created by Aedan on 12/01/2017.
 */



var express = require('express');
var router = express.Router();
var Joi = require('joi');
var setting =require('../config/setting');

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
        json:Joi.object().required()
    });
    req.body.userId = req.userId;
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
                    JSON.stringify(value.json),value.userId
                ],
                function (err) {
                    connection.release();
                    if (err) {
                        return next(err);
                    }
                    res.json({
                        status: 1,
                        message: "success",
                        data:value.json
                    });
                });
        });
    });
});


/**
 * @api {get} /api/preferences  获取用户配置
 * @apiName  get  user  preferences
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
router.get('/api/preferences', function (req, res, next) {
    var schema = Joi.object().keys({
        userId: Joi.number().required()
    });
    req.body.userId = req.userId;
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
                "select  `json` from User where `id` = ? and `deleted` =0", [
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
                        data:result[0].json
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

router.post('/api/tags', function (req, res, next) {
    var schema = Joi.object().keys({
        userId: Joi.number().required(),
        type: Joi.number.required()
    });
    req.body.userId = req.userId;
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
                "select  `id`,`name` from User where `userId` = ? and `type`= ? and `deleted` =0", [
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
    req.query.userId = req.idText;
    Joi.validate(req.query, schema, function (err, value) {
        if (err) {
            return next(err);
        }
        try{
        let defaultDomain;
        for(let index=0;index<setting.domains.length;index++){
            if(setting.domains[index].postBackDomain){
                defaultDomain= setting.domains[index].address;
            }
        }
        res.json({
            status:1,
            message:'success',
            data:{
                defaultPostBackUrl:setting.newbidder.httpPix+value.userId+"."+defaultDomain+setting.newbidder.postBackRouter
            }
        })
        }catch(e){
            next(e);
        }
    });
});






module.exports = router;