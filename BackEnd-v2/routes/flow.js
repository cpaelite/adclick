var express = require('express');
var router = express.Router();
var Joi = require('joi');
var common = require('./common');
var setting = require('../config/setting');

/**
 * @api {get} /api/flows  获取用户所有flows
 * @apiName  get  user  flows
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
router.get('/api/flows', function (req, res, next) {
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
                "select  `id`,`name` from Flow where `userId` = ? and `deleted` =0 and `type`=1", [
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
                            flows: result
                        }
                    });

                });
        });
    });
});


/**
 * @api {get} /api/flows/:id/campaigns 获取flow相关的所有campaign
 * @apiName 获取flow相关的所有campaign
 * @apiGroup flow
 * @apiSuccessExample {json} Success-Response:
 *   {
 *    status: 1,
 *    message: 'success',
 *    data:{
 *        campaigns:[{id:,name:""}]
 *     }
 *
 *   }
 */

router.get('/api/flows/:id/campaigns', async function (req, res, next) {
    var schema = Joi.object().keys({
        userId: Joi.number().required(),
        id: Joi.number().required()
    });
    req.query.userId = req.userId;
    req.query.id = req.params.id;
    let connection;
    try {
        let value = await common.validate(req.query, schema);
        connection = await common.getConnection();
        let result = await  query("select `id`,`name`,`hash` from TrackingCampaign where `targetType`= 1 and `targetFlowId` = " + value.id + " and `userId`=" + value.userId, connection);
        res.json({
            status: 1,
            message: 'success',
            data: {
                campaigns: result.length ? result : []
            }
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
 * @api {get} /api/flows/:id 获取flow detail
 * @apiName 获取flow detail
 * @apiGroup flow
 * @apiSuccessExample {json} Success-Response:
 *   {
 *    status: 1,
 *    message: 'success',
 *    data:{
 *        campaigns:[{id:,name:""}]
 *     }
 *
 *   }
 */

router.get('/api/flows/:id', async function (req, res, next) {
    var schema = Joi.object().keys({
        userId: Joi.number().required(),
        id: Joi.number().required()
    });
    req.query.userId = req.userId;
    req.query.id = req.params.id;
    let connection;
    try {
        let Result = {};
        Result.rules = [];
        let value = await common.validate(req.query, schema);

        let flowSql = "select `id`,`name`,`hash`,`country`,`type`,`redirectMode` from Flow where  `id` = " + value.id + " and `userId`=" + value.userId;
        let ruleSql = "select  f.`id` as parentId, r.`id`,r.`name`,r.`json`,r.`status`,r.`type` " +
            "from Flow f " +
            "left join `Rule2Flow` f2 on f2.`flowId` = f.`id` " +
            "left join `Rule` r on r.`id` = f2.`ruleId` " +
            "where  f2.`status` = 1 and f2.`deleted`= 0 and r.`deleted` = 0  and f.`id` =" + value.id + " and f.`userId`= " + value.userId;

        let pathsql = "select  r.`id` as parentId, p.`id`,p.`name`, p.`directLink`,p.`redirectMode`,p.`status`,r2.`weight` " +
            "from Flow f " +
            "left join `Rule2Flow` f2 on f2.`flowId` = f.`id` " +
            "left join `Rule` r on r.`id` = f2.`ruleId`  " +
            "left join `Path2Rule` r2 on r2.`ruleId`= r.`id` " +
            "left join `Path` p on p.`id` = r2.`pathId` " +
            "where  f2.`status` = 1 and f2.`deleted`= 0 and r.`deleted` = 0  " +
            "and r2.`deleted`= 0 and p.`deleted` = 0 and r2.`status` = 1 " +
            "and f.`id` =" + value.id + " and f.`userId`= " + value.userId;

        let landerSql = "select  p.`id` as parentId, l.`id`,l.`name`,p2.`weight` " +
            "from Flow f " +
            "left join `Rule2Flow` f2 on f2.`flowId` = f.`id` " +
            "left join `Rule` r on r.`id` = f2.`ruleId`  " +
            "left join `Path2Rule` r2 on r2.`ruleId`= r.`id` " +
            "left join `Path` p on p.`id` = r2.`pathId` " +
            "left join `Lander2Path` p2 on p2.`pathId` = p.`id`  " +
            "left join `Lander` l on l.`id`= p2.`landerId` " +
            "where  f2.`status` = 1 and f2.`deleted`= 0 and r.`deleted` = 0  " +
            "and r2.`deleted`= 0 and p.`deleted` = 0 and r2.`status` = 1 " +
            "and p2.`deleted` = 0 and l.`deleted` = 0  " +
            "and f.`id` =" + value.id + " and f.`userId`= " + value.userId;

        let offerSql = "select  p.`id` as parentId, l.`id`,l.`name`,p2.`weight` " +
            "from Flow f " +
            "left join `Rule2Flow` f2 on f2.`flowId` = f.`id` " +
            "left join `Rule` r on r.`id` = f2.`ruleId`  " +
            "left join `Path2Rule` r2 on r2.`ruleId`= r.`id` " +
            "left join `Path` p on p.`id` = r2.`pathId` " +
            "left join `Offer2Path` p2 on p2.`pathId` = p.`id`  " +
            "left join `Offer` l on l.`id`= p2.`offerId` " +
            "where  f2.`status` = 1 and f2.`deleted`= 0 and r.`deleted` = 0  " +
            "and r2.`deleted`= 0 and p.`deleted` = 0 and r2.`status` = 1 " +
            "and p2.`deleted` = 0 and l.`deleted` = 0  " +
            "and f.`id` =" + value.id + " and f.`userId`= " + value.userId;


        connection = await common.getConnection();
        let PromiseResult = await  Promise.all([query(flowSql, connection), query(ruleSql, connection), query(pathsql, connection), query(landerSql, connection), query(offerSql, connection)]);

        if (PromiseResult.length) {
            //flow
            if (PromiseResult[0].length) {
                Object.assign(Result, PromiseResult[0][0]);
            }
            if (PromiseResult[1].length) {
                for (let i = 0; i < PromiseResult[1].length; i++) {
                    //Rule
                    if (PromiseResult[1][i].parentId == Result.id) {
                        Result.rules[i] = {};
                        Result.rules[i].paths = [];
                        delete PromiseResult[1][i].parentId;
                        Object.assign(Result.rules[i], PromiseResult[1][i])
                        for (let j = 0; j < PromiseResult[2].length; j++) {
                            //path
                            if (PromiseResult[2][j].parentId == PromiseResult[1][i].id) {
                                Result.rules[i].paths[j] = {};
                                Result.rules[i].paths[j].offers = [];
                                Result.rules[i].paths[j].landers = [];
                                delete PromiseResult[2][j].parentId
                                //Result.rules[i].paths.push(PromiseResult[2][j]);
                                Object.assign(Result.rules[i].paths[j], PromiseResult[2][j]);

                                //lander
                                for (let k = 0; k < PromiseResult[3].length; k++) {
                                    if (PromiseResult[3][k].parentId == PromiseResult[2][j].id) {
                                        Result.rules[i].paths[j].landers[k] = {};
                                        delete PromiseResult[3][k].parentId;
                                        //Result.rules[i].paths[j].landers.push(PromiseResult[3][k])
                                        Object.assign(Result.rules[i].paths[j].landers[k], PromiseResult[3][k])
                                    }
                                }

                                //offer
                                for (let m = 0; m < PromiseResult[4].length; m++) {
                                    if (PromiseResult[4][m].parentId == PromiseResult[2][j].id) {
                                        Result.rules[i].paths[j].offers[m] = {};
                                        delete PromiseResult[4][m].parentId;
                                        //Result.rules[i].paths[j].offers.push(PromiseResult[4][m])
                                        Object.assign(Result.rules[i].paths[j].offers[m], PromiseResult[4][m])
                                    }
                                }

                            }
                        }
                    }

                }
            }
        }

        res.json({
            status: 1,
            message: 'success',
            data: Result
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
 * @api {post} /api/flows/ 新增flow
 * @apiName 新增flow
 * @apiGroup flow
 * @apiParam {String} name
 * @apiParam {String} country
 * @apiParam {Number} redirectMode
 */
router.post('/api/flows', function (req, res, next) {
    var schema = Joi.object().keys({
        userId: Joi.number().required(),
        idText: Joi.string().required(),
        rules: Joi.array().required(),
        hash: Joi.string(),
        type: Joi.number().required(),
        id: Joi.string().optional(),
        name: Joi.string(),
        country: Joi.string(),
        redirectMode: Joi.number()
    }).optionalKeys('id', 'hash', 'name', 'country', 'redirectMode');
    req.body.userId = req.userId;
    req.body.idText = req.idText;
    req.body.type=1;
    start(req.body, schema).then(function (data) {
        res.json({
            status: 1,
            message: 'success',
            data: data
        })
    }).catch(function (err) {
        next(err);
    });
});


/**
 * @api {post} /api/flows/:id 编辑flow
 * @apiName  编辑flow
 * @apiGroup flow
 * @apiParam {String} name
 * @apiParam {String} country
 * @apiParam {Number} redirectMode
 */
router.post('/api/flows/:id', function (req, res, next) {
    var schema = Joi.object().keys({
        rules: Joi.array().required(),
        hash: Joi.string(),
        type: Joi.number(),
        id: Joi.number().required(),
        name: Joi.string(),
        country: Joi.string(),
        redirectMode: Joi.number(),
        userId: Joi.number().required(),
        idText: Joi.string().required()
    }).optionalKeys('hash', 'type', 'name', 'country', 'redirectMode', 'deleted');
    req.body.userId = req.userId;
    req.body.idText = req.idText;
    req.body.id = req.params.id;
    start(req.body, schema).then(function (data) {
        res.json({
            status: 1,
            message: 'success',
            data: data
        })
    }).catch(function (err) {
        next(err);
    });
});


/**
 * @api {delete} /api/flows/:id 删除flow
 * @apiName  删除flow
 * @apiGroup flow
 */
router.delete('/api/flows/:id', async function (req, res, next) {
    var schema = Joi.object().keys({
        id: Joi.number().required(),
        userId: Joi.number().required()
    });
    req.query.userId = req.userId;
    req.query.id = req.params.id;
    let connection;
    try {
        let value = await common.validate(req.query, schema);
        connection = await common.getConnection();
        let result = await common.deleteFlow(value.id, value.userId, connection);
        res.json({
            status: 1,
            message: 'success'
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


const start = async(data, schema) => {
    let Result;
    let ResultError;
    let connection;
    try {
        let value = await common.validate(data, schema);
        connection = await common.getConnection();
        await common.beginTransaction(connection);
        try {

            let flowResult;
            //Flow
            if (!value.id) {
                flowResult = await common.insertFlow(value.userId, value, connection)
            } else if (value && value.id) {
                await common.updateFlow(value.userId, value, connection)
            }

            let flowId = value.id ? value.id : (flowResult ? (flowResult.insertId ? flowResult.insertId : 0) : 0);


            if (!flowId) {
                throw new Error('Flow ID Lost');
            }
            //flowId
            value.id = flowId;

            if (value.rules && value.rules.length > 0) {
                for (let i = 0; i < value.rules.length; i++) {
                    try {
                        let ruleResult;
                        //RULE
                        if (!value.rules[i].id) {
                            ruleResult = await  common.insetRule(value.userId, value.rules[i], connection);
                            await common.insertRule2Flow(ruleResult.insertId, flowId, value.rules[i].enabled?1:0, connection);
                        } else {
                            await  common.updateRule(value.userId, value.rules[i], connection);
                            await  common.updateRule2Flow(value.rules[i].enabled?1:0, value.rules[i].id, flowId, connection);
                        }
                        let ruleId = value.rules[i].id ? value.rules[i].id : (ruleResult ? (ruleResult.insertId ? ruleResult.insertId : 0) : 0);
                        if (!ruleId) {
                            throw new Error('Rule ID Lost');
                        }
                        value.rules[i].id = ruleId;

                        //PATH
                        if (value.rules[i].paths && value.rules[i].paths.length > 0) {
                            for (let j = 0; j < value.rules[i].paths.length; j++) {
                                let pathResult;
                                if (!value.rules[i].paths[j].id) {
                                    pathResult = await common.insertPath(value.userId, value.rules[i].paths[j], connection);
                                    await common.insertPath2Rule(pathResult.insertId, ruleId, value.rules[i].paths[j].weight, value.rules[i].paths[j].enabled?1:0, connection);

                                } else {
                                    await common.updatePath(value.userId, value.rules[i].paths[j], connection);
                                    await common.updatePath2Rule(value.rules[i].paths[j].id, value.rules[i].id, value.rules[i].paths[j].weight, value.rules[i].paths[j].enabled?1:0, connection);
                                }

                                let pathId = value.rules[i].paths[j].id ? value.rules[i].paths[j].id : (pathResult ? (pathResult.insertId ? pathResult.insertId : 0) : 0);
                                if (!pathId) {
                                    throw new Error('Path ID Lost');
                                }
                                value.rules[i].paths[j].id = pathId;

                                //Lander
                                if (value.rules[i].paths[j].landers && value.rules[i].paths[j].landers.length > 0) {
                                    for (let k = 0; k < value.rules[i].paths[j].landers.length; k++) {
                                        let landerResult;
                                        if (!value.rules[i].paths[j].landers[k].id) {
                                            landerResult = await common.insertLander(value.userId, value.rules[i].paths[j].landers[k], connection);
                                            await common.insertLander2Path(landerResult.insertId, pathId, value.rules[i].paths[j].landers[k].weight, connection);
                                        } else {
                                            await common.updateLander(value.userId, value.rules[i].paths[j].landers[k], connection);
                                            await common.updateLander2Path(value.rules[i].paths[j].landers[k].id, pathId, value.rules[i].paths[j].landers[k].weight, connection);
                                        }

                                        let landerId = value.rules[i].paths[j].landers[k].id ? value.rules[i].paths[j].landers[k].id : (landerResult ? (landerResult.insertId ? landerResult.insertId : 0) : 0);
                                        if (!landerId) {
                                            throw new Error('Lander ID Lost');
                                        }
                                        value.rules[i].paths[j].landers[k].id = landerId;
                                        //Lander tags
                                        //删除所有tags

                                        await common.updateTags(value.userId, landerId, 2, connection);

                                        if (value.rules[i].paths[j].landers[k].tags && value.rules[i].paths[j].landers[k].tags.length > 0) {
                                            for (let q = 0; q < value.rules[i].paths[j].landers[k].tags.length; q++) {

                                                await common.insertTags(value.userId, landerId, value.rules[i].paths[j].landers[k].tags[q], 2, connection);
                                            }
                                        }
                                    }
                                }


                                //Offer
                                if (value.rules[i].paths[j].offers && value.rules[i].paths[j].offers.length > 0) {
                                    for (let z = 0; z < value.rules[i].paths[j].offers.length; z++) {
                                        let offerResult;

                                        if (!value.rules[i].paths[j].offers[z].id) {
                                            let postbackUrl = setting.newbidder.httpPix + value.idText + "." + setting.newbidder.mainDomain + setting.newbidder.postBackRouter;
                                            value.rules[i].paths[j].offers[z].postbackUrl = postbackUrl;
                                            offerResult = await common.insertOffer(value.userId, value.idText, value.rules[i].paths[j].offers[z], connection);
                                            await common.insertOffer2Path(offerResult.insertId, pathId, value.rules[i].paths[j].offers[z].weight, connection);
                                        } else {

                                            await  common.updateOffer(value.userId, value.rules[i].paths[j].offers[z], connection);

                                            await  common.updateOffer2Path(value.rules[i].paths[j].offers[z].id, pathId, value.rules[i].paths[j].offers[z].weight, connection);

                                        }

                                        let offerId = value.rules[i].paths[j].offers[z].id ? value.rules[i].paths[j].offers[z].id : (offerResult ? (offerResult.insertId ? offerResult.insertId : 0) : 0);
                                        if (!offerId) {
                                            throw new Error('Offer ID Lost');
                                        }
                                        value.rules[i].paths[j].offers[z].id = offerId;
                                        //删除所有offer tags
                                        await common.updateTags(value.userId, offerId, 3, connection);
                                        //offer tags
                                        if (value.rules[i].paths[j].offers[z].tags && value.rules[i].paths[j].offers[z].tags.length > 0) {
                                            for (let p = 0; p < value.rules[i].paths[j].offers[z].tags.length; p++) {
                                                await common.insertTags(value.userId, offerId, value.rules[i].paths[j].offers[z].tags[p], 3, connection);
                                            }
                                        }
                                    }
                                }


                            }
                        }

                    } catch (e) {
                        throw e;
                    }
                }
            }

        } catch (err) {
            await common.rollback(connection);
            throw err;
        }
        await common.commit(connection);

        delete value.userId;
        Result = value;
    } catch (e) {
        ResultError = e;
    } finally {
        if (connection) {
            connection.release();
        }
    }

    return new Promise(function (resolve, reject) {
        if (ResultError) {
            reject(ResultError);
        }
        resolve(Result);
    });
};


/**
 * get list of conditions
 * shang@v1 [Warren] TODO
 */
router.get('/api/conditions', function (req, res) {
    var result = [{
        "id": "1234",
        "display": "Day of week",
        "fields": [{
            "type": "checkbox", "name": "weekday", "options": [
                {"value": "mon", "display": "Monday"},
                {"value": "tue", "display": "Tuesday"},
                {"value": "wed", "display": "Wednesday"},
                {"value": "thu", "display": "Thursday"},
                {"value": "fri", "display": "Friday"},
                {"value": "sat", "display": "Saturday"},
                {"value": "sun", "display": "Sunday"}
            ]
        }, {
            "type": "select", "label": "Time zone", "name": "tz", "options": [
                {"value": "utc", "display": "UTC"},
                {"value": "-8", "display": "-8 PDT"},
                {"value": "+8", "display": "+8 Shanghai"},
                {"value": "-7", "display": "+7 Soul"},
                {"value": "+7", "display": "+7 Tokyo"}
            ]
        }]
    }, {
        "id": "2334",
        "display": "Country",
        "fields": [{
            "type": "select", "name": "value", "options": [
                {"value": "us", "display": "American"},
                {"value": "ca", "display": "Canada"},
                {"value": "cn", "display": "China"},
                {"value": "jp", "display": "Japan"},
                {"value": "hk", "display": "Hongkong"}
            ]
        }]
    }, {
        "id": "3434",
        "display": "OS",
        "fields": [{
            "type": "l2select", "name": "value", "options": [{
                "value": "linux", "display": "Linux", "suboptions": [
                    {"value": "ubuntu", "display": "Ubuntu"},
                    {"value": "debian", "display": "Debian"},
                    {"value": "centos", "display": "Centos"},
                    {"value": "redhat", "display": "Redhat"},
                    {"value": "gentoo", "display": "Gentoo"},
                    {"value": "lfs", "display": "LFS"}
                ]
            }, {
                "value": "windows", "display": "Windows", "suboptions": [
                    {"value": "winxp", "display": "Windows XP"},
                    {"value": "win7", "display": "Windows 7"},
                    {"value": "win8", "display": "Windows 8"},
                    {"value": "win10", "display": "Windows 10"}
                ]
            }, {
                "value": "android", "display": "Android", "suboptions": [
                    {"value": "android4.2", "display": "Android 4.2"},
                    {"value": "android4.3", "display": "Android 4.3"},
                    {"value": "android4.4", "display": "Android 4.4"},
                    {"value": "android4.5", "display": "Android 4.5"},
                    {"value": "android4.6", "display": "Android 4.6"},
                    {"value": "android5.0", "display": "Android 5.0"},
                    {"value": "android6.0", "display": "Android 6.0"},
                    {"value": "android7.0", "display": "Android 7.0"}
                ]
            }]
        }]
    }, {
        "id": "8334",
        "display": "Device type",
        "fields": [{
            "type": "chips", "name": "value", "options": [
                {"value": "mobile", "display": "Mobile Phones"},
                {"value": "tablet", "display": "Tablet"},
                {"value": "pc", "display": "Desktops & Laptops"},
                {"value": "tv", "display": "Smart TV"}
            ]
        }]
    }, {
        "id": "3534",
        "display": "IP and IP ranges",
        "fields": [{
            "type": "textarea", "name": "value",
            "desc": "Enter one IP address or subnet per line in the following format: 20.30.40.50 or 20.30.40.50/24"
        }]
    }, {
        "id": "4934",
        "display": "Time of day",
        "fields": [{
            "type": "inputgroup",
            "inputs": [
                {"label": "Between", "name": "starttime", "placeholder": "00:00"},
                {"label": "and", "name": "endtime", "placeholder": "00:00"},
            ]
        }, {
            "type": "select", "label": "Time zone", "name": "tz", "options": [
                {"value": "utc", "display": "UTC"},
                {"value": "-8", "display": "-8 PDT"},
                {"value": "+8", "display": "+8 Shanghai"},
                {"value": "+7", "display": "+7 Soul"},
                {"value": "+9", "display": "+7 Tokyo"}
            ]
        }]
    }];
    res.json(result)
});