/**
 * Created by Aedan on 12/01/2017.
 */



var express = require('express');
var router = express.Router();
var Joi = require('joi');


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
    // var schema = Joi.object().keys({
    //     userId: Joi.number().required()
    // });
    // req.body.userId = req.userId;
    // Joi.validate(req.body, schema, function (err, value) {
    //     if (err) {
    //         return next(err);
    //     }
    //     pool.getConnection(function (err, connection) {
    //         if (err) {
    //             err.status = 303
    //             return next(err);
    //         }
    //         connection.query(
    //             "select  `json` from User where `id` = ? and `deleted` =0", [
    //                 value.userId
    //             ],
    //             function (err, result) {
    //                 connection.release();
    //                 if (err) {
    //                     return next(err);
    //                 }
    //                 res.json({
    //                     status: 1,
    //                     message: "success",
    //                     // data:JSON.parse(result.json)
    //                 });
    //
    //             });
    //     });
    // });
    var result = {
        "status": 1,
        "message": "",
        data: {
            "reportViewLimit": 500,
            "entityType": 1,    //0:停止;1:运行;2全部
            "reportViewOrder": "-visits",
            "reportTimeZone": "+08:00",
            /*
             // todo: use array for visible columns
             "reportVisibleColumns": [
             "visits", "clicks", "impressions", "conversions", "revenue", "cost", "profit",
             "cpv", "ictr", "ctr", "cr", "cv", "roi", "epv", "epc", "ap"
             ],
             */
            "reportViewColumns": {
                "name": {
                    "visible": true
                },
                "offerName": {
                    "visible": true
                },
                "offerId": {
                    "visible": true
                },
                "offerUrl": {
                    "visible": false
                },
                "offerCountry": {
                    "visible": false
                },
                "payout": {
                    "visible": true
                },
                "impressions": {
                    "visible": true
                },
                "visits": {
                    "visible": true
                },
                "clicks": {
                    "visible": true
                },
                "conversions": {
                    "visible": true
                },
                "revenue": {
                    "visible": true
                },
                "cost": {
                    "visible": true
                },
                "profit": {
                    "visible": true
                },
                "cpv": {
                    "visible": true
                },
                "ictr": {
                    "visible": true
                },
                "ctr": {
                    "visible": true
                },
                "cr": {
                    "visible": true
                },
                "cv": {
                    "visible": true
                },
                "roi": {
                    "visible": true
                },
                "epv": {
                    "visible": true
                },
                "epc": {
                    "visible": true
                },
                "ap": {
                    "visible": true
                },
                "affiliateNetworkName": {
                    "visible": true
                },
                "campaignName": {
                    "visible": true
                },
                "campaignId": {
                    "visible": true
                },
                "campaignUrl": {
                    "visible": false
                },
                "campaignCountry": {
                    "visible": false
                },
                "pixelUrl": {
                    "visible": false
                },
                "postbackUrl": {
                    "visible": false
                },
                "trafficSourceName": {
                    "visible": true
                },
                "clickRedirectType": {
                    "visible": false
                },
                "costModel": {
                    "visible": false
                },
                "cpa": {
                    "visible": true
                },
                "cpc": {
                    "visible": true
                },
                "cpm": {
                    "visible": true
                },
                "city": {
                    "visible": true
                },
                "flowName": {
                    "visible": true
                },
                "landerName": {
                    "visible": true
                },
                "landerId": {
                    "visible": false
                },
                "landerUrl": {
                    "visible": false
                },
                "landerCountry": {
                    "visible": false
                },
                "numberOfOffers": {
                    "visible": false
                }
            }
        }
    };
    res.json(result)
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











module.exports = router;