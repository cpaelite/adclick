var express = require('express');
var router = express.Router();
var Joi = require('joi');


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
                "select  `id`,`name` from AffiliateNetwork where `userId` = ? and `id` =? ", [
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
                            networks: result
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
                            networks: result
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
router.post('/api/affiliates/:id', function (req, res, next) {
    var schema = Joi.object().keys({
        id: Joi.number().required(),
        userId: Joi.number().required(),
        name: Joi.string().optional(),
        postbackUrl: Joi.string().optional(),
        appendClickId: Joi.number().optional(),
        duplicatedPostback: Joi.number().optional(),
        ipWhiteList: Joi.string().optional(),
        deleted: Joi.number().optional()
    });

    req.body.userId = req.userId
    req.body.id = req.params.id
    Joi.validate(req.body, schema, function (err, value) {
        if (err) {
            return next(err);
        }
        pool.getConnection(function (err, connection) {
            if (err) {
                err.status = 303
                return next(err);
            }
            var sql = "update AffiliateNetwork set `id`= " + value.id;
            if (value.deleted == 1) {
                sql += ",`deleted`=" + value.deleted
            }
            if (value.name) {
                sql += ",`name`='" + value.name + "'"
            }
            if (value.postbackUrl) {
                sql += ",`postbackUrl`='" + value.postbackUrl + "'"
            }
            if (value.appendClickId != undefined) {
                sql += ",`appendClickId`=" + value.appendClickId
            }
            if (value.duplicatedPostback != undefined) {
                sql += ",`duplicatedPostback`=" + value.duplicatedPostback
            }
            if (value.ipWhiteList) {
                sql += ",`ipWhiteList`='" + value.ipWhiteList + "'"
            }

            sql += " where `userId`=" + value.userId + " and `id`=" +
                value.id
            connection.query(sql,
                function (err, result) {
                    connection.release();
                    if (err) {
                        return next(err);
                    }
                    res.json({
                        status: 1,
                        message: 'success'
                    });
                });
        });
    });
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
router.post('/api/affiliates', function (req, res, next) {
    var schema = Joi.object().keys({
        userId: Joi.number().required(),
        name: Joi.string().required(),
        postbackUrl: Joi.string().required(),
        appendClickId: Joi.number().optional(),
        duplicatedPostback: Joi.number().optional(),
        ipWhiteList: Joi.string().optional()
    });
    req.body.userId = req.userId
    Joi.validate(req.body, schema, function (err, value) {
        if (err) {
            return next(err);
        }
        pool.getConnection(function (err, connection) {
            if (err) {
                err.status = 303
                return next(err);
            }
            var sql = "insert into AffiliateNetwork set `userId`= " +
                value.userId + ",`name`='" + value.name +
                "',`postbackUrl`='" +
                value.postbackUrl + "',`deleted`=0";
            if (value.appendClickId != undefined) {
                sql += ",`appendClickId`='" + value.appendClickId + "'"
            }
            if (value.duplicatedPostback != undefined) {
                sql += ",`duplicatedPostback`='" + value.duplicatedPostback +
                    "'"
            }
            if (value.ipWhiteList) {
                sql += ",`ipWhiteList`='" + value.ipWhiteList + "'"
            }
            connection.query(sql, function (err, result) {
                connection.release();
                if (err) {
                    return next(err);
                }
                delete value.userId;
                res.json({
                    status: 1,
                    message: 'success',
                    data: value
                });
            });
        });
    });
});


module.exports = router;
