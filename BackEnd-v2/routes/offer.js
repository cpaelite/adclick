var express = require('express');
var router = express.Router();
var Joi = require('joi');
var setting=require('../config/setting');


/**
 * @api {post} /api/offer  新增offer
 * @apiName 新增offer
 * @apiGroup offer
 *
 * @apiParam {String} name
 * @apiParam {String} url
 * @apiParam {Number} payoutMode
 * @apiParam {Object} affiliateNetwork {"id":1,name:""}
 * @apiParam {Number} [payoutValue]
 * @apiParam {Object} country  "country": {"id": 1,"name": "Andorra","alpha2Code": "AD", "alpha3Code": "AND", "numCode": 20 }
 *
 * @apiSuccessExample {json} Success-Response:
 *   {
 *    status: 1,
 *    message: 'success' *   }
 *
 */
router.post('/api/offer', function (req, res, next) {
    var schema = Joi.object().keys({
        userId: Joi.number().required(),
        idText:Joi.string().required(),
        name: Joi.string().required(),
        url: Joi.string().required(),
        country: Joi.object().required(),
        payoutMode: Joi.number().required(),
        affiliateNetwork: Joi.object().required().keys({
            id:Joi.number().required(),
            name:Joi.string().required()
        }),
        payoutValue: Joi.number().optional()
    });
    req.body.userId = req.userId;
    req.body.idText=req.idText;
    Joi.validate(req.body, schema, function (err, value) {
        if (err) {
            return next(err);
        }
        pool.getConnection(function (err, connection) {
            if (err) {
                err.status = 303
                return next(err);
            }
            var countryCode="";
            if (value.country) {
                countryCode = value.country.alpha3Code ? value.country.alpha3Code: "";
            }
            var postbackUrl= setting.newbidder.httpPix+value.idText+"."+setting.newbidder.mainDomain+setting.newbidder.postBackRouter
            //set postbackurl
            value.postbackUrl=postbackUrl;
            var sql = "insert into Offer set `userId`= " +
                value.userId + ",`name`='" + value.name +
                "',`url`='" + value.url + "',`country`='" + countryCode +
                "',`postbackUrl`='" +
                postbackUrl +
                "',`payoutMode`=" +
                value.payoutMode + ",`AffiliateNetworkId`=" +
                value.affiliateNetwork.id + ",`AffiliateNetworkName`='"+ value.affiliateNetwork.name +"'";

            if (value.payoutValue != undefined) {
                sql += ",`payoutValue`=" + value.payoutValue
            }
            connection.query(sql, function (err, result) {
                connection.release();
                if (err) {
                    return next(err);
                }
                delete value.userId;
                delete value.idText;
                res.json({
                    status: 1,
                    message: 'success',
                    data:value
                });
            });
        });
    });
});

/**
 * @api {get} /api/offer  offer list
 * @apiName offer list
 * @apiGroup offer
 * @apiParam {Number} page
 * @apiParam {Number} limit
 * @apiParam {String} order
 *
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "status": 1,
 *       "message": "success",
 *       "data":{"lists":[]}
 *     }
 *
 */
router.get('/api/offer', function (req, res, next) {
    var schema = Joi.object().keys({
        userId: Joi.number().required(),
        page: Joi.number().min(1).required(),
        limit: Joi.number().required(),
        order: Joi.string().required()
    });
    req.query.userId = req.userId
    Joi.validate(req.query, schema, function (err, value) {
        if (err) {
            return next(err);
        }
        pool.getConnection(function (err, connection) {
            if (err) {
                err.status = 303
                return next(err);
            }
            var page = parseInt(value.page);
            var limit = parseInt(value.limit);
            var offset = (page - 1) * limit;
            var order = 'asc';
            var sort = value.order;
            var sign = sort.charAt(0);
            if (sign == '-') {
                order = 'desc'
                sort = sort.substring(1);
            }

            var sql =
                "select a.`id` as `id`,a.`name` as `name`,a.`url` as `url`,a.`country` as `country`,a.`postbackUrl`as `postbackUrl` ,b.`name` as `AffiliateNetworkName`,a.`payoutValue` as `payoutValue` from Offer a " +
                "left  join AffiliateNetwork b  on   a.`AffiliateNetworkId` = b.`id` where a.`deleted`= ? and a.`userId`= ? order by " +
                sort + " " + order + " " + "limit " + offset + "," + limit

            console.log(sql)

            connection.query(sql, [0, value.userId],
                function (err, result) {
                    connection.release();
                    if (err) {
                        return next(err);
                    }
                    res.json({
                        status: 1,
                        message: 'success',
                        data: {
                            lists: result
                        }
                    });
                });
        });
    });
});

/**
 * @api {post} /api/offer/:offerId  编辑offer
 * @apiName 编辑offer
 * @apiGroup offer
 *
 * @apiParam {Number} id
 * @apiParam {String} [name]
 * @apiParam {String} [url]
 * @apiParam {String} [postbackUrl]
 * @apiParam {Number} [payoutMode]
 * @apiParam {Number} [affiliateNetwork] {"id":1,name:""}
 * @apiParam {Number} [payoutValue]
 * @apiParam {Object} [country]  "country": {"id": 1,"name": "Andorra","alpha2Code": "AD", "alpha3Code": "AND", "numCode": 20 }
 * @apiParam {Number} [deleted]
 *
 * @apiSuccessExample {json} Success-Response:
 *   {
 *    status: 1,
 *    message: 'success'
 *   }
 *
 */
router.post('/api/offer/:offerId', function (req, res, next) {
    var schema = Joi.object().keys({
        id: Joi.number().required(),
        userId: Joi.number().required(),
        name: Joi.string().optional(),
        url: Joi.string().optional(),
        country: Joi.object().optional(),
        postbackUrl: Joi.string().optional(),
        payoutMode: Joi.number().optional(),
        affiliateNetwork: Joi.object().optional().keys({
            id:Joi.number().required(),
            name:Joi.string().required()
        }),
        payoutValue: Joi.number().optional(),
        deleted: Joi.number().optional()
    });

    req.body.userId = req.userId
    req.body.id = req.params.offerId
    Joi.validate(req.body, schema, function (err, value) {
        if (err) {
            return next(err);
        }
        pool.getConnection(function (err, connection) {
            if (err) {
                err.status = 303
                return next(err);
            }
            var sql = "update Offer set `id`= " + value.id;
            if (value.deleted == 1) {
                sql += ",`deleted`=" + value.deleted
            }
            if (value.name) {
                sql += ",`name`='" + value.name + "'"
            }
            if (value.url) {
                sql += ",`url`='" + value.url + "'"
            }
            if (value.country) {
                var countryCode = value.country.alpha3Code ? value.country.alpha3Code: "";
                sql += ",`country`='" + countryCode + "'"
            }
            if (value.postbackUrl) {
                sql += ",`postbackUrl`='" + value.postbackUrl + "'"
            }
            if (value.payoutMode != undefined) {
                sql += ",`payoutMode`=" + value.payoutMode
            }
            if (value.affiliateNetwork) {
                sql += ",`AffiliateNetworkId`=" + value.affiliateNetwork.id
                sql += ",`AffiliateNetworkName`='" + value.affiliateNetwork.name +"'";
            }
            if (value.payoutValue != undefined) {
                sql += ",`payoutValue`=" + value.payoutValue
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


module.exports = router;
