var express = require('express');
var router = express.Router();
var Joi = require('joi');
var setting = require('../config/setting');
const querystring = require('querystring');
var common = require('./common');

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
 * @api {get} /api/affilate/tpl  networktpl list
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
router.get('/api/affilate/tpl', async function (req, res, next) {
    let connection;
    try {

        connection = await common.getConnection();
        let tpl;
        if (req.query.support && req.query.support) {
            tpl = common.query("select `id`,`name`,`postbackParams`,`desc`,`apiMode`,`apiParams` from TemplateAffiliateNetwork where `deleted`=? and apiOffer =?", [0, 1], connection);
        } else {
            tpl = common.query("select `id`,`name`,`postbackParams`,`desc`,`apiMode` from TemplateAffiliateNetwork where `deleted`=?", [0], connection);
        }
        let mainDomain = common.query("select `domain`,`customize` from UserDomain where `userId`= ? and `main` = 1 and `deleted`= 0", [req.parent.id], connection);
        let result = [];
        let resultsPro = await Promise.all([tpl, mainDomain]);
        let domainResult = resultsPro[1];
        let results = resultsPro[0]
        let defaultDomain;

        if (results.length) {
            //如果自己定义了main domain 优先
            if (domainResult.length) {
                if (domainResult[0].customize == 1) {
                    defaultDomain = domainResult[0].domain;
                } else {
                    defaultDomain = req.parent.idText + "." + domainResult[0].domain;
                }
            } else {
                //默认使用系统配置
                for (let index = 0; index < setting.domains.length; index++) {
                    if (setting.domains[index].postBackDomain) {
                        defaultDomain = req.parent.idText + "." + setting.domains[index].address;
                    }
                }
            }
            for (let i = 0; i < results.length; i++) {
                if (results[i].postbackParams) {
                    let value = {
                        id: results[i].id,
                        name: results[i].name,
                        desc: results[i].desc,
                        apiMode: results[i].apiMode
                    }
                    if(results[i].apiParams){
                        value.apiParams = JSON.parse(results[i].apiParams);
                    }
                    let params = JSON.parse(results[i].postbackParams);
                    let param = "?";
                    let sum = 0;
                    for (let i in params) {
                        param += `${i}=${params[i]}`
                        if (sum !== (Object.keys(params).length - 1)) {
                            param += "&"
                        }
                        sum++;
                    }
                    value.postbackurl = setting.newbidder.httpPix + defaultDomain + setting.newbidder.postBackRouter + param;
                    result.push(value);
                }
            }
        }

        return res.json({
            status: 1,
            message: 'success',
            data: {
                lists: result
            }
        });

    } catch (e) {
        next(e);
    } finally {
        if (connection) {
            connection.release();
        }
    }
});


module.exports = router;
