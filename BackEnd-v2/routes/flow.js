var express = require('express');
var router = express.Router();
var Joi = require('joi');
var common = require('./common');
var setting = require('../config/setting');
var Pub = require('./redis_sub_pub');


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
        let result = await query("select `id`,`name`,`hash` from TrackingCampaign where `targetType`= 1 and `targetFlowId` = " + value.id + " and `userId`=" + value.userId, connection);
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
        let ruleSql = "select  f.`id` as parentId, r.`id`,case r.`type` when 0 then 'Default Paths' else r.`name` end as name, r.`object` as conditions ,case r.`status` when 1 then \"true\" else \"false\" end as enabled,r.`type`,case r.`type` when 0 then 'true' else 'false' end as isDefault " +
            "from Flow f " +
            "inner join `Rule2Flow` f2 on f2.`flowId` = f.`id` " +
            "inner join `Rule` r on r.`id` = f2.`ruleId` " +
            "where f2.`deleted`= 0 and r.`deleted` = 0  and f.`id` =" + value.id + " and f.`userId`= " + value.userId;

        let pathsql = "select  r.`id` as parentId, p.`id`,p.`name`, case p.`directLink` when 1 then \"true\" else \"false\" end as directLinking ,p.`redirectMode`," +
            "case p.`status` when 1 then \"true\" else \"false\" end as enabled,r2.`weight`  " +
            "from Flow f " +
            "inner join `Rule2Flow` f2 on f2.`flowId` = f.`id` " +
            "inner join `Rule` r on r.`id` = f2.`ruleId`  " +
            "inner join `Path2Rule` r2 on r2.`ruleId`= r.`id` " +
            "inner join `Path` p on p.`id` = r2.`pathId` " +
            "where f2.`deleted`= 0 and r.`deleted` = 0  " +
            "and r2.`deleted`= 0 and p.`deleted` = 0  " +
            "and f.`id` =" + value.id + " and f.`userId`= " + value.userId;

        let landerSql = "select  p.`id` as parentId, l.`id`,l.`name`,p2.`weight` " +
            "from Flow f " +
            "inner join `Rule2Flow` f2 on f2.`flowId` = f.`id` " +
            "inner join `Rule` r on r.`id` = f2.`ruleId`  " +
            "inner join `Path2Rule` r2 on r2.`ruleId`= r.`id` " +
            "inner join `Path` p on p.`id` = r2.`pathId` " +
            "inner join `Lander2Path` p2 on p2.`pathId` = p.`id`  " +
            "inner join `Lander` l on l.`id`= p2.`landerId` " +
            "where    f2.`deleted`= 0 and r.`deleted` = 0  " +
            "and r2.`deleted`= 0 and p.`deleted` = 0   " +
            "and p2.`deleted` = 0 and l.`deleted` = 0  " +
            "and f.`id` =" + value.id + " and f.`userId`= " + value.userId;

        let offerSql = "select  p.`id` as parentId, l.`id`,l.`name`,p2.`weight` " +
            "from Flow f " +
            "inner join `Rule2Flow` f2 on f2.`flowId` = f.`id` " +
            "inner join `Rule` r on r.`id` = f2.`ruleId`  " +
            "inner join `Path2Rule` r2 on r2.`ruleId`= r.`id` " +
            "inner join `Path` p on p.`id` = r2.`pathId` " +
            "inner join `Offer2Path` p2 on p2.`pathId` = p.`id`  " +
            "inner join `Offer` l on l.`id`= p2.`offerId` " +
            "where  f2.`deleted`= 0 and r.`deleted` = 0  " +
            "and r2.`deleted`= 0 and p.`deleted` = 0   " +
            "and p2.`deleted` = 0 and l.`deleted` = 0  " +
            "and f.`id` =" + value.id + " and f.`userId`= " + value.userId;


        connection = await common.getConnection();
        let PromiseResult = await Promise.all([query(flowSql, connection), query(ruleSql, connection), query(pathsql, connection), query(landerSql, connection), query(offerSql, connection)]);

        let flowResult = PromiseResult[0];
        let ruleResult = PromiseResult[1];
        let pathResult = PromiseResult[2];
        let landerResult = PromiseResult[3];
        let offerResult = PromiseResult[4];

        if (PromiseResult.length) {
            //flow
            if (flowResult.length) {
                Object.assign(Result, flowResult[0]);
            }

            if (ruleResult.length) {
                for (let i = 0; i < ruleResult.length; i++) {
                    //Rule
                    if (ruleResult[i].parentId == Result.id) {
                        ruleResult[i].paths = [];
                        delete ruleResult[i].parentId;
                        ruleResult[i].conditions= JSON.parse(ruleResult[i].conditions);
                        Result.rules.push(ruleResult[i])

                        for (let j = 0; j < pathResult.length; j++) {
                            //path
                            if (pathResult[j].parentId == ruleResult[i].id) {
                                pathResult[j].offers = [];
                                pathResult[j].landers = [];
                                delete pathResult[j].parentId;

                                //lander
                                for (let k = 0; k < landerResult.length; k++) {
                                    if (landerResult[k].parentId == pathResult[j].id) {
                                        delete landerResult[k].parentId;
                                        pathResult[j].landers.push(landerResult[k])
                                    }
                                }

                                //offer
                                for (let m = 0; m < offerResult.length; m++) {
                                    if (offerResult[m].parentId == pathResult[j].id) {
                                        delete offerResult[m].parentId;
                                        pathResult[j].offers.push(offerResult[m])
                                    }
                                }

                                Result.rules[i].paths.push(pathResult[j]);

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
router.post('/api/flows', async function (req, res, next) {
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
    req.body.type = 1;
    let connection;
    try {
        let value = await common.validate(req.body, schema);
        connection = await common.getConnection();
        let data = await saveOrUpdateFlow(value, connection);
        res.json({
            status: 1,
            message: 'success',
            data: data
        });
    } catch (e) {
        next(e);
    } finally {
        if (connection) {
            connection.release();
        }
    }
});


/**
 * @api {post} /api/flows/:id 编辑flow
 * @apiName  编辑flow
 * @apiGroup flow
 * @apiParam {String} name
 * @apiParam {String} country
 * @apiParam {Number} redirectMode
 */
router.post('/api/flows/:id', async function (req, res, next) {
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
    }).optionalKeys('hash', 'type', 'name', 'country', 'redirectMode');
    req.body.userId = req.userId;
    req.body.idText = req.idText;
    req.body.id = req.params.id;
    let connection;
    try {
        let value = await common.validate(req.body, schema);
        connection = await common.getConnection();
        let data = await saveOrUpdateFlow(value, connection);
        res.json({
            status: 1,
            message: 'success',
            data: data
        });
    } catch (e) {
        next(e);
    } finally {
        if (connection) {
            connection.release();
        }
    }
});


/**
 * @api {delete} /api/flows/:id 删除flow
 * @apiName  删除flow
 * @apiGroup flow
 */
router.delete('/api/flows/:id', async function (req, res, next) {
    var schema = Joi.object().keys({
        id: Joi.number().required(),
        userId: Joi.number().required(),
        name: Joi.string().optional().empty(""),
        hash: Joi.string().optional().empty("")
    });
    req.query.userId = req.userId;
    req.query.id = req.params.id;
    let connection;
    try {
        let value = await common.validate(req.query, schema);
        connection = await common.getConnection();
        //检查flow 是否绑定在某些 active campaign上
        let campaignResults = await common.query("select `id`,`name` from TrackingCampaign where deleted = ? and targetFlowId = ? ", [0, value.id], connection);
        if (campaignResults.length) {
            res.json({
                status: 0,
                message: "flow used by campaign!",
                data: {
                    campaigns: campaignResults
                }
            });
            return;
        }
        let result = await common.deleteFlow(value.id, value.userId, connection);
        res.json({
            status: 1,
            message: 'success'
        });
        //reids pub
        new Pub(true).publish(setting.redis.channel, value.userId, "flowDelete");
    } catch (e) {
        next(e);
    } finally {
        if (connection) {
            connection.release();
        }
    }
});


async function saveOrUpdateFlow(value, connection) {

    let updateMethod = false;
    try {
        let flowResult;
        await common.beginTransaction(connection);
        //Flow
        if (!value.id) {
            flowResult = await common.insertFlow(value.userId, value, connection)
        } else if (value && value.id) {
            updateMethod = true;
            await common.updateFlow(value.userId, value, connection)
        }

        let flowId = value.id ? value.id : (flowResult ? (flowResult.insertId ? flowResult.insertId : 0) : 0);
        if (!flowId) {
            throw new Error('Flow ID Lost');
        }
        //flowId
        value.id = flowId;

        //解除flow下的所有rules 
        await common.deleteRule2Flow(flowId, connection);

        if (value.rules && value.rules.length > 0) {
            for (let i = 0; i < value.rules.length; i++) {
                // parse conditions array
                let rule = value.rules[i]
                if (rule.conditions) {
                    rule.json = rule.conditions
                    rule.object = conditionFormat(rule.conditions)
                }
                try {
                    let ruleResult;
                    //RULE
                    if (!value.rules[i].id) {
                        ruleResult = await common.insetRule(value.userId, value.rules[i], connection);
                    } else {
                        await common.updateRule(value.userId, value.rules[i], connection);
                    }
                    let ruleId = value.rules[i].id ? value.rules[i].id : (ruleResult ? (ruleResult.insertId ? ruleResult.insertId : 0) : 0);
                    if (!ruleId) {
                        throw new Error('Rule ID Lost');
                    }
                    //新建rule 和 flow 关系
                    let c1 = common.insertRule2Flow(ruleId, flowId, value.rules[i].enabled ? 1 : 0, connection);

                    //解除rule下的所有path
                    let c2 = common.deletePath2Rule(ruleId, connection);

                    await Promise.all([c1, c2]);

                    value.rules[i].id = ruleId;

                    //PATH
                    if (value.rules[i].paths && value.rules[i].paths.length > 0) {
                        for (let j = 0; j < value.rules[i].paths.length; j++) {
                            let pathResult;
                            if (!value.rules[i].paths[j].id) {
                                pathResult = await common.insertPath(value.userId, value.rules[i].paths[j], connection);
                            } else {
                                await common.updatePath(value.userId, value.rules[i].paths[j], connection);
                            }
                            let pathId = value.rules[i].paths[j].id ? value.rules[i].paths[j].id : (pathResult ? (pathResult.insertId ? pathResult.insertId : 0) : 0);
                            if (!pathId) {
                                throw new Error('Path ID Lost');
                            }
                            await common.insertPath2Rule(pathId, ruleId, value.rules[i].paths[j].weight, value.rules[i].paths[j].enabled ? 1 : 0, connection);
                            value.rules[i].paths[j].id = pathId;

                            //解除path下的所有landers
                            let d1 = common.deleteLander2Path(pathId, connection);

                            //解除path下的所有offers
                            let d2 = common.deleteOffer2Path(pathId, connection);

                            await Promise.all([d1, d2]);

                            //Lander
                            let landersSlice = value.rules[i].paths[j].landers;
                            let offersSlice = value.rules[i].paths[j].offers;

                            if (!offersSlice || (offersSlice && offersSlice.length < 1)) {
                                let err = new Error("Path must contain an offer");
                                err.status = 200;
                                throw err;
                            }

                            let p1 = insertOrUpdateLanderAndLanderTags(value.userId, pathId, landersSlice, connection);
                            let p2 = insertOrUpdateOfferAndOfferTags(value.userId, value.idText, pathId, offersSlice, connection);

                            await Promise.all([p1, p2]);

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

    //reids pub
    new Pub(true).publish(setting.redis.channel, value.userId, updateMethod ? "flowUpdate" : "flowAdd");

    delete value.userId;
    return value;
};

async function insertOrUpdateLanderAndLanderTags(userId, pathId, landersSlice, connection) {
    if (landersSlice && landersSlice.length > 0) {
        for (let k = 0; k < landersSlice.length; k++) {
            let landerResult;
            if (!landersSlice[k].id) {
                landerResult = await common.insertLander(userId, landersSlice[k], connection);

            } else {
                await common.updateLander(userId, landersSlice[k], connection);
            }

            let landerId = landersSlice[k].id ? landersSlice[k].id : (landerResult ? (landerResult.insertId ? landerResult.insertId : 0) : 0);
            if (!landerId) {
                throw new Error('Lander ID Lost');
            }
            await common.insertLander2Path(landerId, pathId, landersSlice[k].weight, connection);
            landersSlice[k].id = landerId;

            //删除所有tags
            await common.updateTags(userId, landerId, 2, connection);

            if (landersSlice[k].tags && landersSlice[k].tags.length > 0) {
                for (let q = 0; q < landersSlice[k].tags.length; q++) {

                    await common.insertTags(userId, landerId, landersSlice[k].tags[q], 2, connection);
                }
            }
        }
    }
}

async function insertOrUpdateOfferAndOfferTags(userId, idText, pathId, offersSlice, connection) {
    if (offersSlice && offersSlice.length > 0) {
        for (let z = 0; z < offersSlice.length; z++) {
            let offerResult;

            if (!offersSlice[z].id) {
                let postbackUrl = setting.newbidder.httpPix + idText + "." + setting.newbidder.mainDomain + setting.newbidder.postBackRouter;
                offersSlice[z].postbackUrl = postbackUrl;
                offerResult = await common.insertOffer(userId, idText, offersSlice[z], connection);
            } else {
                await common.updateOffer(userId, offersSlice[z], connection);
            }

            let offerId = offersSlice[z].id ? offersSlice[z].id : (offerResult ? (offerResult.insertId ? offerResult.insertId : 0) : 0);
            if (!offerId) {
                throw new Error('Offer ID Lost');
            }
            await common.insertOffer2Path(offerId, pathId, offersSlice[z].weight, connection);
            offersSlice[z].id = offerId;

            //删除所有offer tags
            await common.updateTags(userId, offerId, 3, connection);
            //offer tags
            if (offersSlice[z].tags && offersSlice[z].tags.length > 0) {
                for (let p = 0; p < offersSlice[z].tags.length; p++) {
                    await common.insertTags(userId, offerId, offersSlice[z].tags[p], 3, connection);
                }
            }
        }
    }
}

router.get('/api/conditions', async function (req, res) {
    //production
    var result = [{
        "id": "model",
        "display": "Brand and model",
        "operands": [{value: "is", display: "Is"}, {value: "isnt", display: "Isnt"}],
        "fields": [{
            "type": "l2select", "name": "value", "options": []
        }]
    }, {
        "id": "browser",
        "display": "Browser and version",
        "operands": [{value: "is", display: "Is"}, {value: "isnt", display: "Isnt"}],
        "fields": [{
            "type": "l2select", "name": "value", "options": []
        }]
    }, {
        "id": "connection",
        "display": "Connection Type",
        "operands": [{value: "is", display: "Is"}, {value: "isnt", display: "Isnt"}],
        "fields": [{
            "type": "select", "name": "value", "options": []
        }]
    }, {
        "id": "country",
        "display": "Country",
        "operands": [{value: "is", display: "Is"}, {value: "isnt", display: "Isnt"}],
        "fields": [{
            "type": "select", "name": "value", "options": []
        }]
    }, {
        "id": "region",
        "display": "State / Region",
        "operands": [{value: "is", display: "Is"}, {value: "isnt", display: "Isnt"}],
        "fields": [{
            "type": "chips", "name": "value", "options": []
        }]
    }, {
        "id": "city",
        "display": "City",
        "operands": [{value: "is", display: "Is"}, {value: "isnt", display: "Isnt"}],
        "fields": [{
            "type": "chips", "name": "value", "options": []
        }]
    }, {
        "id": "weekday",
        "display": "Day of week",
        "operands": [{value: "is", display: "Is"}, {value: "isnt", display: "Isnt"}],
        "fields": [{
            "type": "checkbox", "name": "weekday", "options": [
                {"value": "0", "display": "Monday"},
                {"value": "1", "display": "Tuesday"},
                {"value": "2", "display": "Wednesday"},
                {"value": "3", "display": "Thursday"},
                {"value": "4", "display": "Friday"},
                {"value": "5", "display": "Saturday"},
                {"value": "6", "display": "Sunday"}
            ]
        }, {
            "type": "select", "label": "Time zone", "name": "tz", "options": [
                {"value": "+05:45", "display": "(UTC+05:45) Kathmandu"},
                {"value": "-03:30", "display": "(UTC-03:30) Newfoundland"},
                {"value": "+8:00", "display": "(UTC+08:00) Beijing, Chongqing, Hong Kong, Urumqi"},
                {"value": "-7:00", "display": "(UTC-07:00) Mountain Time (US & Canada)"},
                {"value": "+7:00", "display": "(UTC+07:00) Bangkok, Hanoi, Jakarta"}
            ]
        }]
    }, {
        "id": "device",
        "display": "Device type",
        "operands": [{value: "is", display: "Is"}, {value: "isnt", display: "Isnt"}],
        "fields": [{
            "type": "select", "name": "value", "options": []
        }]
    }, {
        "id": "iprange",
        "display": "IP and IP ranges",
        "operands": [{value: "is", display: "Is"}, {value: "isnt", display: "Isnt"}],
        "fields": [{
            "type": "textarea", "name": "value",
            "desc": "Enter one IP address or subnet per line in the following format: 20.30.40.50 or 20.30.40.50/24"
        }]
    }, {
        "id": "isp",
        "display": "ISP",
        "operands": [{value: "is", display: "Is"}, {value: "isnt", display: "Isnt"}],
        "fields": [{
            "type": "chips", "name": "value", "options": []
        }]
    }, {
        "id": "language",
        "display": "Language",
        "operands": [{value: "is", display: "Is"}, {value: "isnt", display: "Isnt"}],
        "fields": [{
            "type": "chips", "name": "value", "options": []
        }]
    }, {
        "id": "carrier",
        "display": "Mobile carrier",
        "operands": [{value: "is", display: "Is"}, {value: "isnt", display: "Isnt"}],
        "fields": [{
            "type": "chips", "name": "value", "options": []
        }]
    }, {
        "id": "os",
        "display": "Operating system and version",
        "operands": [{value: "is", display: "Is"}, {value: "isnt", display: "Isnt"}],
        "fields": [{
            "type": "l2select", "name": "value", "options": []
        }]
    }, {
        "id": "referrer",
        "display": "Referrer",
        "operands": [{value: "is", display: "Is"}, {value: "isnt", display: "Isnt"}],
        "fields": [{
            "type": "textarea", "name": "value",
            "desc": ""
        }]
    }, {
        "id": "time",
        "display": "Time of day",
        "operands": [{value: "is", display: "Is"}, {value: "isnt", display: "Isnt"}],
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
    }, {
        "id": "useragent",
        "display": "User Agent",
        "operands": [{value: "is", display: "Is"}, {value: "isnt", display: "Isnt"}],
        "fields": [{
            "type": "textarea", "name": "value",
            "desc": ""
        }]
    }];
    await fillConditions(result)
    res.json(result);

});


let loadCondition = async function (result) {
    let results = await fillConditions(result);
    return results;
}

//loadCondition
let init = function () {
    if (setting.env !== "development") {
        loadCondition(setting.conditionResult).then(function (data) {
            new Pub(true).set(setting.redis.conditionKey, JSON.stringify(data));
        });
    }
}

init();


async function fillConditions(r) {
    for (let i = 0; i < r.length; i++) {
        if (r[i].id == 'model') {
            r[i].fields[0].options = await loadBrandAndVersionFromDB()
        } else if (r[i].id == 'browser') {
            r[i].fields[0].options = await loadBowerAndVersionFromDB()
        } else if (r[i].id == 'connection') {
            r[i].fields[0].options = await loadConnectionType()
        } else if (r[i].id == 'country') {
            r[i].fields[0].options = await loadCountryFromDB()
        } else if (r[i].id == 'region') {
            r[i].fields[0].options = await loadStateRegionFromDB()
        } else if (r[i].id == 'city') {
            r[i].fields[0].options = await loadCityFromDB()
        } else if (r[i].id == 'varN') {
            //TODO: varN
        } else if (r[i].id == 'weekday') {
            r[i].fields[1].options = await loadTimezoneFromDB()
        } else if (r[i].id == 'device') {
            r[i].fields[0].options = await loadDeviceType()
        } else if (r[i].id == 'iprange') {
            // do nothing
        } else if (r[i].id == 'isp') {
            r[i].fields[0].options = await loadIspFromDB()
        } else if (r[i].id == 'language') {
            r[i].fields[0].options = await loadLanguageFromDB()
        } else if (r[i].id == 'carrier') {
            r[i].fields[0].options = await loadMobileCarrierFromDB()
        } else if (r[i].id == 'os') {
            r[i].fields[0].options = await loadOsFromDB()
        } else if (r[i].id == 'referrer') {
            // do nothing
        } else if (r[i].id == 'time') {
            r[i].fields[1].options = await loadTimezoneFromDB()
        } else if (r[i].id == 'useragent') {
            //do nothing
        } else {
            console.error("unsupported id type ", r[i].id)
        }
    }
    return r
}


// {
//     "value": "linux", "display": "Linux", "suboptions": [
//     {"value": "ubuntu", "display": "Ubuntu"},
//     {"value": "debian", "display": "Debian"},
//     {"value": "centos", "display": "Centos"},
//     {"value": "redhat", "display": "Redhat"},
//     {"value": "gentoo", "display": "Gentoo"},
//     {"value": "lfs", "display": "LFS"}
// ]
// }

async function loadBrandAndVersionFromDB() {
    var sql = "select id, category, name from BrandWithVersions"
    var connection = await common.getConnection();
    let r = {}
    var r2 = []
    try {
        let lines = await query(sql, connection);
        for (let i = 0; i < lines.length; i++) {
            var line = lines[i]
            if (!r[line.category]) {
                r[line.category] = {value: line.category, display: line.category, suboptions: []}
            }
            r[line.category].suboptions.push({value: line.name, display: line.name})
        }
        r2 = Object.values(r)
    } catch (err) {
        throw err
    } finally {
        connection.release()
    }
    return r2
}

async function loadOsFromDB() {
    var sql = "select id, category, name from OSWithVersions"
    var connection = await common.getConnection();
    let r = {}
    var r2 = []
    try {
        let lines = await query(sql, connection);
        for (let i = 0; i < lines.length; i++) {
            var line = lines[i]
            if (!r[line.category]) {
                r[line.category] = {value: line.category, display: line.category, suboptions: []}
            }
            r[line.category].suboptions.push({value: line.name, display: line.name})
        }
        r2 = Object.values(r)
    } catch (err) {
        throw err
    } finally {
        connection.release()
    }
    // console.info(r2)
    return r2
}

async function loadBowerAndVersionFromDB() {
    var sql = "select id, category, name from BrowserWithVersions"
    var connection = await common.getConnection();
    let r = {}
    var r2 = []
    try {
        let lines = await query(sql, connection);
        for (let i = 0; i < lines.length; i++) {
            var line = lines[i]
            if (!r[line.category]) {
                r[line.category] = {value: line.category, display: line.category, suboptions: []}
            }
            r[line.category].suboptions.push({value: line.name, display: line.name})
        }
        r2 = Object.values(r)
    } catch (err) {
        throw err
    } finally {
        connection.release()
    }
    return r2
}

async function loadCountryFromDB() {
    var sql = "select id, name as display, alpha3Code as value from Country"
    var connection = await common.getConnection();
    var r = []
    try {
        r = await query(sql, connection);
    } catch (err) {
        throw err
    } finally {
        connection.release()
    }
    return r
}

// TODO: change sql to City table
async function loadCityFromDB() {
    var sql = "select id, name as display, alpha3Code as value from Country"
    var connection = await common.getConnection();
    var r = []
    try {
        r = await query(sql, connection);
    } catch (err) {
        throw err
    } finally {
        connection.release()
    }
    return r
}

// TODO: change sql to Region table
async function loadStateRegionFromDB() {
    var sql = "select id, name as display, alpha3Code as value from Country"
    var connection = await common.getConnection();
    var r = []
    try {
        r = await query(sql, connection);
    } catch (err) {
        throw err
    } finally {
        connection.release()
    }
    return r
}

// TODO: change sql to Region table
async function loadIspFromDB() {
    var sql = "select id, name as display, alpha3Code as value from Country"
    var connection = await common.getConnection();
    var r = []
    try {
        r = await query(sql, connection);
    } catch (err) {
        throw err
    } finally {
        connection.release()
    }
    return r
}

async function loadLanguageFromDB() {
    var sql = "select id, name as display, code as value from Languages"
    var connection = await common.getConnection();
    var r = []
    try {
        r = await query(sql, connection);
    } catch (err) {
        throw err
    } finally {
        connection.release()
    }
    return r
}

//TODO: load mobile carrier table
async function loadMobileCarrierFromDB() {
    var sql = "select id, name as display, code as value from Languages"
    var connection = await common.getConnection();
    var r = []
    try {
        r = await query(sql, connection);
    } catch (err) {
        throw err
    } finally {
        connection.release()
    }
    return r
}

async function loadTimezoneFromDB() {
    var sql = "select utcShift as value, detail as display from Timezones"
    var connection = await common.getConnection();
    var r = []
    try {
        r = await query(sql, connection);
    } catch (err) {
        throw err
    } finally {
        connection.release()
    }
    return r
}

//TODO: update the values
async function loadConnectionType() {
    var r = [{value: "Broadband", display: "Broadband"},
        {value: "Cable", display: "Cable"},
        {value: "Mobile", display: "Mobile"},
        {value: "Satellite", display: "Satellite"},
        {value: "Unknown", display: "Unknown"},
        {value: "Wireless", display: "Wireless"},
        {value: "XDSL", display: "XDSL"}
    ]
    return r
}

async function loadDeviceType() {
    var r = [{value: "DesktopsLaptop", display: "Desktops & Laptops"},
        {value: "Cable", display: "Mobile Phones"},
        {value: "Mobile", display: "Smart TV"},
        {value: "Satellite", display: "Tablet"}
    ]
    return r
}

function query(sql, connection) {
    return new Promise(function (resolve, reject) {
        connection.query(sql, function (err, result) {
            if (err) {
                return reject(err);
            }
            //turn true false string to boolean
            result.forEach(function (r) {
                for (let key in r) {
                    if (r[key] == "true") {
                        r[key] = true
                    } else if (r[key] == "false") {
                        r[key] = false
                    }
                }
            });
            resolve(result);
        })
    });
}

function conditionFormat(c) {
    // console.info(c)
    var r = []
    c.forEach(function (v) {
            if (v.id == 'model') {
                r.push(formatThreeKeys(v.id, v.operand, v.value))
            } else if (v.id == 'browser') {
                r.push(formatThreeKeys(v.id, v.operand, v.value))
            } else if (v.id == 'connection') {
                r.push(formatThreeKeys(v.id, v.operand, v.value))
            } else if (v.id == 'country') {
                r.push(formatThreeKeys(v.id, v.operand, v.value))
            } else if (v.id == 'region') {
                r.push(formatThreeKeys(v.id, v.operand, v.value))
            } else if (v.id == 'city') {
                r.push(formatThreeKeys(v.id, v.operand, v.value))
            } else if (v.id == 'varN') {
                // r.push(formatThreeKeys(v.id, v.operand, v.value))
            } else if (v.id == 'weekday') {
                r.push(formatWeekDay(v.id, v.operand, v.tz, v.weekday))
            } else if (v.id == 'device') {
                r.push(formatThreeKeys(v.id, v.operand, v.value))
            } else if (v.id == 'iprange') {
                r.push(formatIPValue(v.id, v.operand, v.value))
            } else if (v.id == 'isp') {
                r.push(formatThreeKeys(v.id, v.operand, v.value))
            } else if (v.id == 'language') {
                r.push(formatThreeKeys(v.id, v.operand, v.value))
            } else if (v.id == 'carrier') {
                r.push(formatThreeKeys(v.id, v.operand, v.value))
            } else if (v.id == 'os') {
                r.push(formatThreeKeys(v.id, v.operand, v.value))
            } else if (v.id == 'referrer') {
                r.push(formatTextValue(v.id, v.operand, v.value))
            } else if (v.id == 'time') {
                r.push(formatTime(v.id, v.operand, v.tz, v.starttime, v.endtime))
            } else if (v.id == 'useragent') {
                r.push(formatTextValue(v.id, v.operand, v.value))
            } else {
                console.error("unsupported id type ", v.id)
            }
        }
    )
    return [r]
}

function formatThreeKeys(id, operand, values) {
    var r = []
    r.push(id)
    if (operand == 'is') {
        r.push("in")
    } else {
        r.push("not in")
    }
    if (isArray(values))
        values.forEach(function (v) {
            r.push(v)
        })
    else
        r.push(values)
    return r
}

function formatThreeKeysWithErrorFormat(id, operand, values) {
    var r = []
    r.push(id)
    if (operand == 'is') {
        r.push("in")
    } else {
        r.push("not in")
    }
    if (isArray(values))
        values.forEach(function (v) {
            r.push(v.value)
        })
    else
        r.push(values)
    return r
}


function isArray(o) {
    return Object.prototype.toString.call(o) == '[object Array]';
}

function formatWeekDay(id, operand, tz, weekday) {
    var r = []
    r.push(id)
    if (operand == 'is') {
        r.push("weekday in")
    } else {
        r.push("weekday not in")
    }
    r.push(tz)
    if (isArray(weekday))
        weekday.forEach(function (v) {
            r.push(v)
        })
    else
        console.error("weekday must be an array")
    return r
}

function formatTime(id, operand, tz, startTime, endTime) {
    var r = []
    r.push(id)
    if (operand == 'is') {
        r.push("time between")
    } else {
        r.push("time not between")
    }
    r.push(tz)
    r.push(startTime)
    r.push(endTime)
    return r
}

function formatTextValue(id, operand, value) {
    let r = [id]
    if (operand == 'is') {
        r.push("contain")
    } else {
        r.push("not contain")
    }
    let m = value.split(/\r?\n/)
    r = r.concat(m)
    return r
}

function formatIPValue(id, operand, value) {
    let r = [id]
    if (operand == 'is') {
        r.push("ip in")
    } else {
        r.push("ip not in ")
    }
    let m = value.split(/\r?\n/)
    r = r.concat(m)
    return r
}


exports.router = router;
exports.saveOrUpdateFlow = saveOrUpdateFlow;