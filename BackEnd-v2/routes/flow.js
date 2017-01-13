var express = require('express');
var router = express.Router();
var Joi = require('joi');
var async = require('async');


/**
 * @api {post} /api/flow  新增flow
 * @apiName 新增flow
 * @apiGroup flow
 * @apiDescription  {flow: {},rule: [{path: [] }]}
 *
 * @apiSuccessExample {json} Success-Response:
 *   {
 *    status: 1,
 *    message: 'success'
 *   }
 *
 */

var data={
    "flow":{
        id:1,
        hash:"",
        type:0, //0:匿名;1:普通
        name:"",
        country:"",
        redirectMode:0,//0:302;1:Meta refresh;2:Double meta refresh
        rules:[{
            id:1,
            name:"",
            hash:"",
            type:0, //0:匿名;1:普通
            json:{},// TODO
            status:1, //0:停止;1:运行
            paths:[{
                id:1,
                name:"",
                hash:"",
                redirectMode:0, //0:302;1:Meta refresh;2:Double meta refresh
                directLink:0, //0:No;1:Yes
                status:0,//0:停止;1:运行
                weight:100, // TODO
                landers:[{
                    id:1,
                    name:"",
                    hash:"",
                    url:"",
                    country:"",
                    numberOfOffers:2,
                    weight:100,
                    tags:[]
                }],
                offers:[{
                    id:1,
                    name:"",
                    hash:"",
                    url:"",
                    country:"",
                    AffiliateNetwork:{
                        id:1,
                        name:""
                    },
                    postbackUrl:"",
                    payoutMode:0,//0:Auto;1:Manual
                    payoutValue:0.8,
                    tags:[]
                }]
            }]
        }]
    }
}


router.post('/api/flow', function (req, res, next) {
    var schema = Joi.object().keys({
        userId: Joi.number().required(),
        flow: Joi.object().required().keys({
            name: Joi.string().required(),
            country: Joi.string().optional().empty(''),
            redirectMode: Joi.number().required()
        }),
        rule: Joi.array().required().length(1).items(
            Joi.object().keys({
                path: Joi.array().required().length(1).items(Joi.object().keys({
                    name: Joi.string().required(),
                    redirectMode: Joi.number().required(),
                    directLink: Joi.number().required(),
                    status: Joi.number().required(),
                    weight: Joi.number().required().min(0)
                })),
                name: Joi.string().required(),
                status: Joi.number().required(),
                json: Joi.string().optional().empty(''),
                type: Joi.number().required()
            }))
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
            connection.query(
                "insert into Flow (`name`,`redirectMode`,`userId`,`type`,`country`,`deleted`) values (?,?,?,?,?,?)", [
                    value.flow.name, value.flow.redirectMode, value.userId,
                    1, value.flow.country ? value.flow.country : "", 0
                ],
                function (err, flowResult) {
                    connection.release();
                    if (err) {
                        return next(err);
                    }
                    var flowId = flowResult.insertId;

                    var parallelSevice = [];
                    var seriesService = [];
                    for (var i = 0; i < value.rule.length; i++) {
                        for (var j = 0; j < value.rule[i].path.length; j++) {
                            //value.rule[i].path[j]
                            //rule
                            seriesService.push({
                                "sql": "insert into Rule (`userId`,`name`,`type`,`json`,`status`,`deleted`) values (?,?,?,?,?,?)",
                                "params": [value.userId, value.rule[i].name,
                                    value.rule[i].type, value.rule[i].json ?
                                        value.rule[i].json : "", value.rule[i].status,
                                    0
                                ],
                                "table": "rule"
                            });
                            //path
                            seriesService.push({
                                "sql": "insert into Path (`userId`,`name`,`redirectMode`,`directLink`,`status`,`deleted`) values (?,?,?,?,?,?)",
                                "params": [value.userId, value.rule[i].path[j]
                                    .name,
                                    value.rule[i].path[j].redirectMode,
                                    value.rule[i].path[j].directLink, value.rule[
                                        i].path[j].status,
                                    0
                                ],
                                "table": "path",
                                "weight": value.rule[i].path[j].weight,
                                "status": value.rule[i].path[j].status
                            })
                            parallelSevice.push(function (callback) {
                                execTrans(seriesService, callback)
                            });
                        }
                    }
                    async.parallel(parallelSevice, function (err, results) {

                        var parallelSevice = [];
                        var resultsBak = [];

                        //change results [[rule:{},path:{},path:{}]] ===> [[{rule:{},path:[{}]}]]

                        for (var i = 0; i < results.length; i++) {
                            var json = {};
                            json.path = [];
                            for (var j = 0; j < results[i].length; j++) {
                                //rule2flow
                                if (results[i][j]["rule"]) {
                                    if (results[i][j]["rule"]) {
                                        json.rule = results[i][j]["rule"]
                                    }
                                    // parallelSevice.push({
                                    //   "sql": "insert into Rule2Flow (`ruleId`,`flowId`,`status`,`deleted`) values (?,?,?,?)",
                                    //   "params": [results[i][j]["rule"].id,
                                    //     flowId, 1, 0
                                    //   ],
                                    //   "table": "rule2flow"
                                    // })
                                } else if (results[i][j]["path"]) {  //path2rule
                                    json.path.push(results[i][j]["path"]);
                                    // parallelSevice.push({
                                    //   "sql": "insert into Path2Rule (`pathId`,`ruleId`,`weight`,`status`,`deleted`) values (?,?,?,?,?)",
                                    //   "params": [
                                    //     results[i][j]["path"].id,
                                    //     1, results[i][j]["path"].weight,
                                    //     results[i][j]["path"].status, 0
                                    //   ],
                                    //   "table": "path2rule"
                                    // })
                                }

                            }
                            resultsBak.push(json)
                        }


                        execParallelSevice(parallelSevice, function (err) {
                            if (err) {
                                return next(err);
                            }
                            res.json({
                                status: 1,
                                message: 'success'
                            })
                        })
                    });
                });
        });
    });
});


function execTrans(sqlparamsEntities, callback) {
    pool.getConnection(function (err, connection) {
        if (err) {
            err.status = 303
            return callback(err, null);
        }
        connection.beginTransaction(function (err) {
            if (err) {
                return callback(err, null);
            }

            var funcAry = [];
            sqlparamsEntities.forEach(function (sql_param) {
                var temp = function (cb) {
                    var sql = sql_param.sql;
                    var param = sql_param.params;
                    connection.query(sql, param, function (tErr, rows) {
                        if (tErr) {
                            connection.rollback(function () {
                                return cb(tErr);
                            });
                        } else {
                            var result = {}

                            result[sql_param.table] = {
                                "id": rows.insertId
                            }


                            if (sql_param.table == "path" && sql_param.weight !=
                                undefined) {
                                result.path.weight = sql_param.weight
                            }
                            if (sql_param.table == "path" && sql_param.status !=
                                undefined) {
                                result.path.status = sql_param.status
                            }

                            return cb(null, result);
                        }
                    })
                };
                funcAry.push(temp);
            });

            async.series(funcAry, function (err, result) {
                if (err) {
                    connection.rollback(function (err) {

                        connection.release();
                        return callback(err, null);
                    });
                } else {
                    connection.commit(function (err, info) {
                        if (err) {
                            connection.rollback(function (err) {
                                connection.release();
                                return callback(err, null);
                            });
                        } else {
                            connection.release();
                            return callback(null, result);
                        }
                    })
                }
            })
        });
    });
}


function execParallelSevice(sqlparamsEntities, callback) {
    pool.getConnection(function (err, connection) {
        if (err) {
            err.status = 303
            return callback(err);
        }
        var sqlarr = []
        sqlparamsEntities.forEach(function (entity) {
            sqlarr.push(function (callback) {
                connection.query(entity.sql, entity.params,
                    callback)
            })
        })

        async.parallel(sqlarr, function (err, doc) {
            connection.release();
            callback(err, doc);
        });
    })
}


/**
 * @api {post} /api/flow  编辑flow
 * @apiName 编辑flow
 * @apiGroup flow
 *
 * @apiParam {Number} id
 * @apiParam {String} [name]
 * @apiParam {String} [country]
 * @apiParam {Number} [type]
 * @apiParam {Number} [redirectMode]
 * @apiParam {Number} [status]
 *
 * @apiSuccessExample {json} Success-Response:
 *   {
 *    status: 1,
 *    message: 'success'
 *   }
 *
 */
router.post('/api/flow/:id', function (req, res, next) {
    var schema = Joi.object().keys({
        id: Joi.number().required(),
        userId: Joi.number().required(),
        name: Joi.string().optional(),
        country: Joi.string().optional(),
        type: Joi.number().optional(),
        redirectMode: Joi.number().optional(),
        status: Joi.number().optional()
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
            var sql = "update Flow set `id`= " + value.id;
            if (value.status == 0) {
                sql += ",`status`=" + value.status
            }
            if (value.name) {
                sql += ",`name`='" + value.name + "'"
            }
            if (value.country) {
                sql += ",`country`='" + value.country + "'"
            }

            if (value.type != undefined) {
                sql += ",`type`=" + value.type
            }
            if (value.redirectMode != undefined) {
                sql += ",`redirectMode`=" + value.redirectMode
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
 * @api {get} /api/flow  flow list
 * @apiName flow list
 * @apiGroup flow
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
router.get('/api/flow', function (req, res, next) {
    var schema = Joi.object().keys({
        userId: Joi.number().required()
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

            connection.query(
                "select `id`,`name` from Flow where `status`= ? and `userId`= ? ", [
                    1, value.userId
                ],
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

module.exports = router;
