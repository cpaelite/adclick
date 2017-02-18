var express = require('express');
var router = express.Router();
var Joi = require('joi');
var common = require('./common');

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
router.get('/api/affiliates/:id', function (req, res, next) {
    var schema = Joi.object().keys({
        userId: Joi.number().required(),
        id: Joi.number().required()
    });
     
    req.query.userId = req.userId;
    req.query.id=req.params.id;
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
                "select  `id`,`name`,`hash`,`postbackUrl`,`appendClickId`,`duplicatedPostback`,`ipWhiteList` from AffiliateNetwork where `userId` = ? and `id` =? ", [
                    value.userId,value.id
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
                            affiliates: result.length?result[0]:{}
                        }
                    });

                });
        });
    });
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
router.get('/api/affiliates', function (req, res, next) {
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
                "select  `id`,`name` from AffiliateNetwork where `userId` = ? and `deleted` =0 ", [
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
                            affiliates: result
                        }
                    });

                });
        });
    });
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
        id: Joi.number().required(),
        userId: Joi.number().required(),
        name: Joi.string().optional(),
        postbackUrl: Joi.string().optional().empty(""),
        appendClickId: Joi.number().optional(),
        duplicatedPostback: Joi.number().optional(),
        ipWhiteList: Joi.string().optional().empty(""),
        hash: Joi.string().optional().empty("")
    });

    req.body.userId = req.userId;
    req.body.id = req.params.id;
    let connection;
    try {
        let value = await common.validate(req.body, schema);
        connection = await common.getConnection();
        await common.updateAffiliates(value.userId, value, connection);
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
    req.body.userId = req.userId;
    let connection;
    try {
        let value = await common.validate(req.body, schema);
        connection = await common.getConnection();
        let affiliateResult = await common.insertAffiliates(value.userId, value, connection);
        
        delete value.userId;
        value.id = affiliateResult.insertId;

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
        id: Joi.number().required(),
        userId: Joi.number().required(),
        name: Joi.string().optional(),
        hash: Joi.string().optional()
    });
    req.query.userId = req.userId;
    req.query.id = req.params.id;
    let connection;
    try {
        let value = await common.validate(req.query, schema);
        connection = await common.getConnection();
        let result = await common.deleteAffiliate(value.id, value.userId, connection);

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
