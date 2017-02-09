var express = require('express');
var router = express.Router();
var Joi = require('joi');
var setting = require('../config/setting');
const querystring = require('querystring');

/**
 * @api {post} /affilate/tpl  networktpl add
 * @apiName networktpl add
 * @apiGroup networktpl
 *
 * @apiParam {String} name
 * @apiParam {String} postbackParams
 * @apiParam {String} desc
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "status": 1,
 *       "message": "success"
 *     }
 *
 */
router.post('/affiliate/tpl', function (req, res, next) {
    var schema = Joi.object().keys({
        name: Joi.string().required(),
        postbackParams: Joi.string().required(),
        desc: Joi.string().required(),
    });
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
                "insert into TemplateAffiliateNetwork (`name`,`postbackParams`,`desc`,`deleted`) values(?,?,?,?)", [
                    value.name, value.postbackParams, value.desc, 0
                ],
                function (err) {
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
 * @api {get} /affilate/tpl  networktpl list
 * @apiName networktpl list
 * @apiGroup networktpl
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
router.get('/api/affilate/tpl', function (req, res, next) {
    pool.getConnection(function (err, connection) {
        if (err) {
            err.status = 303
            return next(err);
        }
        connection.query(
            "select `id`,`name`,`postbackParams`,`desc` from TemplateAffiliateNetwork where `deleted`=?", [
                0
            ],
            function (err, results) {
                connection.release();
                if (err) {
                    return next(err);
                }
                try {
                    let result = [];

                    if (results.length) {
                        //获取默认postback domain 
                        let defaultDomain;
                        for (let index = 0; index < setting.domains.length; index++) {
                            if (setting.domains[index].postBackDomain) {
                                defaultDomain = setting.domains[index].address;
                            }
                        }

                        for (let i = 0; i < results.length; i++) {
                            if (results[i].postbackParams) {
                                let value = {
                                    id: results[i].id,
                                    name: results[i].name,
                                    desc: results[i].desc
                                }
                                let params = JSON.parse(results[i].postbackParams);
                                let param = "?" + querystring.stringify(params);
                                value.postbackurl = setting.newbidder.httpPix + req.idText + "." + defaultDomain + setting.newbidder.postBackRouter + param;
                                result.push(value);
                            }
                        }
                    }

                    res.json({
                        status: 1,
                        message: 'success',
                        data: {
                            lists: result
                        }
                    });
                } catch (e) {
                    next(e);
                }
            });
    });
});


module.exports = router;
