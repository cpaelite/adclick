/**
 * Created by Aedan on 11/01/2017.
 */

var express = require('express');
var router = express.Router();
var Joi = require('joi');
var async = require('async');
var uuidV4 = require('uuid/v4');


/**
 * @api {post} /api/lander  新增lander
 * @apiName lander
 * @apiGroup lander
 *
 * @apiParam {String} name
 * @apiParam {String} url
 * @apiParam {Number} numberOfOffers
 * @apiParam {String} {country}
 * @apiParam {Array} {tags}
 *
 * @apiSuccessExample {json} Success-Response:
 *   {
 *    status: 1,
 *    message: 'success' *   }
 *
 */
router.post('/api/lander', function (req, res, next) {
    var schema = Joi.object().keys({
        userId: Joi.number().required(),
        name: Joi.string().required(),
        url: Joi.string().required(),
        country: Joi.string().optional(),
        numberOfOffers: Joi.number().required(),
        tags: Joi.array().optional()
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
            var hash = uuidV4();
            var ParallelArray = []
            var sqlCampaign = "insert into Lander set `userId`= " +
                value.userId + ",`name`='" + value.name +
                "',`url`='" + value.url + "',`numberOfOffers`='" + value.numberOfOffers +
                "',`hash`='" +
                hash + "',`deleted`=0";

            if (value.country != undefined) {
                sqlCampaign += ",`country`='" + value.country + "'"
            }
            connection.query(sqlCampaign, function (err, results) {
                if (err) {
                    return next(err);
                }
                delete value.userId;
                value.id = results.insertId;
                value.hash = hash;
                if (value.tags && value.tags.length > 0) {
                    var sqlTags = "insert into `Tags` (`userId`,`name`,`type`,`targetId`,`deleted`) values (?,?,?,?,?)"
                    for (var i = 0; i < value.tags.length; i++) {
                        ParallelArray.push(function (callback) {
                            connection.query(sqlTags, [value.userId, value.tags[i], 2, value.id, 0], callback);
                        });
                    }
                    async.parallel(ParallelArray, function (err) {
                        if (err) {
                            return next(err);
                        }
                        connection.release();
                        res.json({
                            status: 1,
                            message: 'success',
                            data: value
                        });
                    });
                } else {
                    connection.release();
                    res.json({
                        status: 1,
                        message: 'success',
                        data: value
                    });

                }

            });

        });
    });
})


/**
 * @api {post} /api/lander/:id  编辑lander
 * @apiName lander
 * @apiGroup lander
 *
 *
 * @apiParam {String} name
 * @apiParam {String} url
 * @apiParam {Number} numberOfOffers
 * @apiParam {String} {country}
 * @apiParam {Array} {tags}
 * @apiParam {Number} {deleted}
 *
 * @apiSuccessExample {json} Success-Response:
 *   {
 *    status: 1,
 *    message: 'success' *   }
 *
 */
router.post('/api/lander/:id', function (req, res, next) {
    var schema = Joi.object().keys({
        id: Joi.number().required(),
        userId: Joi.number().required(),
        name: Joi.string().required(),
        url: Joi.string().required(),
        country: Joi.string().optional(),
        numberOfOffers: Joi.number().required(),
        tags: Joi.array().optional(),
        deleted: Joi.number().optional(),
        hash: Joi.string().optional()
    });

    req.body.userId = req.userId
    req.body.id = req.params.id;
    Joi.validate(req.body, schema, function (err, value) {
        if (err) {
            return next(err);
        }
        pool.getConnection(function (err, connection) {
            if (err) {
                err.status = 303
                return next(err);
            }
            var ParallelArray = []
            var sqlCampaign = "update Lander set `name`='" + value.name +
                "',`url`='" + value.url + "',`numberOfOffers`='" + value.numberOfOffers + "'";

            if (value.country != undefined) {
                sqlCampaign += ",`country`='" + value.country + "'"
            }

            if (value.deleted != undefined) {
                sqlCampaign += ",`deleted`='" + value.deleted + "'"
            }
            sqlCampaign += " where `userId`= " + value.userId + " and `id`=" + value.id

            connection.query(sqlCampaign, function (err) {
                if (err) {
                    return next(err);
                }
                delete value.userId;

                if (value.tags && value.tags.length > 0) {
                    for (var i = 0; i < value.tags.length; i++) {
                        var sqlTags = "update `Tags` set  `name`='" + value.tags[i] + "'" + " where `userId`=" + value.userId +
                            " and `targetId`=" + value.id + " and  `type`=2"
                        ParallelArray.push(function (callback) {
                            connection.query(sqlTags, callback);
                        });
                    }
                    async.parallel(ParallelArray, function (err) {
                        if (err) {
                            return next(err);
                        }
                        connection.release();
                        res.json({
                            status: 1,
                            message: 'success',
                            data: value
                        });
                    });
                } else if (value.tags && value.tags.length == 0) {
                    var sqlTags = "update `Tags` set  `deleted`= 1" + " where `userId`=" + value.userId +
                        " and `targetId`=" + value.id + " and  `type`=2"
                    connection.query(sqlTags, function (err) {
                        if (err) {
                            return next(err);
                        }
                        connection.release();
                        res.json({
                            status: 1,
                            message: 'success',
                            data: value
                        });
                    });

                } else {
                    connection.release();
                    res.json({
                        status: 1,
                        message: 'success',
                        data: value
                    });
                    ß
                }

            });

        });
    });

})

module.exports = router;
