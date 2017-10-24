/**
 * Created by Aedan on 12/01/2017.
 */



var express = require('express');
var router = express.Router();
var Joi = require('joi');
var common = require('./common');
var setting = require('../config/setting');
const _ = require('lodash');

/**
 * @api {post} /api/preferences  编辑用户配置
 * @apiParam json string
 * @apiName  updates  user  preferences
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
router.post('/api/preferences', function(req, res, next) {
    var schema = Joi.object().keys({
        userId: Joi.number().required(),
        json: Joi.object().required()
    });
    req.body.userId = req.parent.id;
    Joi.validate(req.body, schema, function(err, value) {
        if (err) {
            return next(err);
        }
        pool['m1'].getConnection(function(err, connection) {
            if (err) {
                err.status = 303
                return next(err);
            }

            connection.query(
                "update  User set `json`=?   where `id` = ?", [
                    JSON.stringify(value.json), value.userId
                ],
                function(err) {
                    connection.release();
                    if (err) {
                        return next(err);
                    }
                    res.json({
                        status: 1,
                        message: "success",
                        data: value.json
                    });
                });
        });
    });
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
router.get('/api/tags', function(req, res, next) {
    var schema = Joi.object().keys({
        userId: Joi.number().required(),
        type: Joi.number().required()
    });
    req.query.userId = req.parent.id;
    Joi.validate(req.query, schema, function(err, value) {
        if (err) {
            return next(err);
        }
        pool['m1'].getConnection(function(err, connection) {
            if (err) {
                err.status = 303
                return next(err);
            }
            connection.query(
                "select `id`, `name`, `targetId` from Tags where `userId` = ? and `type`= ? and `deleted` = 0", [
                    value.userId, value.type
                ],
                function(err, result) {
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

/**
 * @api {post} /api/filters  获取filters
 * @apiName   user  page filters
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
router.get('/api/conditions-filters', function(req, res, next) {
    var schema = Joi.object().keys({
        userId: Joi.number().required()
    });
    req.query.userId = req.parent.id;
    Joi.validate(req.query, schema, function(err, value) {
        if (err) {
            return next(err);
        }
        pool['m1'].getConnection(function(err, connection) {
            if (err) {
                err.status = 303
                return next(err);
            }
            connection.query(
                "select `id`, `name`, `items` from Filters where `userId` = ? and `deleted` = 0", [
                    value.userId
                ],
                function(err, result) {
                    connection.release();
                    if (err) {
                        return next(err);
                    }
                    result.forEach((r) => {
                      r.items = JSON.parse(r.items);
                    });
                    res.json({
                        status: 1,
                        message: "success",
                        data: {
                            filters: result
                        }
                    });

                });
        });
    });
});

router.post('/api/conditions-filters', function(req, res, next) {
  var schema = Joi.object().keys({
      userId: Joi.number().required(),
      name: Joi.string().required(),
      items: Joi.string().required()
  });
  req.body.userId = req.parent.id;
  Joi.validate(req.body, schema, function(err, value) {
      if (err) {
        return next(err);
      }
      pool['m1'].getConnection(function(err, connection) {
        if (err) {
          err.status = 303
          return next(err);
        }
        connection.query(
          "insert into Filters(`name`, `items`, `userId`) values (?, ?, ?)", [
            value.name, value.items, value.userId
          ],
          function(err, result) {
            if (err) {
              return next(err);
            }
            connection.query(
              "select `id`, `name`, `items` from Filters where `userId` = ? and `deleted` = 0", [
                value.userId
              ],
              function(err, result) {
                connection.release();
                if (err) {
                  return next(err);
                }
                result.forEach((r) => {
                  r.items = JSON.parse(r.items);
                });
                res.json({
                    status: 1,
                    message: "success",
                    data: {
                      filters: result
                    }
                });
              }
            );
          }
        );
      });
  });
});

router.delete('/api/conditions-filters/:id', function(req, res, next) {
  var schema = Joi.object().keys({
    userId: Joi.number().required(),
    id: Joi.number().required()
  });
  req.body.userId = req.parent.id;
  req.body.id = req.params.id;
  Joi.validate(req.body, schema, function(err, value) {
      if (err) {
        return next(err);
      }
      pool['m1'].getConnection(function(err, connection) {
        if (err) {
          err.status = 303
          return next(err);
        }
        connection.query(
          "update Filters set `deleted` = 1 where id = ?", [
            value.id
          ],
          function(err, result) {
            if (err) {
              return next(err);
            }
            connection.query(
              "select `id`, `name`, `items` from Filters where `userId` = ? and `deleted` = 0", [
                value.userId
              ],
              function(err, result) {
                connection.release();
                if (err) {
                  return next(err);
                }
                result.forEach((r) => {
                  r.items = JSON.parse(r.items);
                });
                res.json({
                    status: 1,
                    message: "success",
                    data: {
                      filters: result
                    }
                });
              }
            );
          }
        );
      });
  });
});


/**
 * @api {post} /api/names  check name exists
 * @apiName    check name exists
 * @apiGroup User
 * @apiParam {String} name
 * @apiParam {Number} type  1:Campaign;2:Lander;3:Offer4:Flow
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "status": 1,
 *       "message": "success"
 *       "data":{
 *           exists:true
 *        }
 *     }
 *
 */
router.post('/api/names', async function(req, res, next) {
    var schema = Joi.object().keys({
        userId: Joi.number().required(),
        name: Joi.string().required().trim(),
        type: Joi.number().required(),
        id: Joi.number().optional()
    });
    req.body.userId = req.parent.id;
    let connection;
    try {
        let value = await common.validate(req.body, schema);
        connection = await common.getConnection();
        let responseData = await common.checkNameExists(value.userId, value.id ? value.id : null, value.name, value.type, connection);
        res.json({
            status: 1,
            message: 'succes',
            data: {
                exists: responseData
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


/**
 * @api {get} /api/postbackurl  获取offer默认postbackurl
 * @apiName   获取offer默认postbackurl
 * @apiGroup User
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "status": 1,
 *       "message": "success"
 *       "data":{
 *           defaultPostBackUrl:XXX
 *        }
 *     }
 *
 */

router.get('/api/postbackurl', async function(req, res, next) {
    let connection;
    try {
        var schema = Joi.object().keys({
            userId: Joi.number().required(),
            idText: Joi.string().required()
        });
        req.query.userId = req.parent.id;
        req.query.idText = req.parent.idText;
        let value = await common.validate(req.query, schema);
        let mainDomainsql = "select `domain`,`customize` from UserDomain where `userId`= ? and `main` = 1 and `deleted`= 0";
        connection = await common.getConnection();
        let domainResult = await common.query(mainDomainsql, [value.userId], connection);
        let defaultDomain;
        //如果自己定义了main domain 优先
        if (domainResult.length) {
            if (domainResult[0].customize == 1) {
                defaultDomain = domainResult[0].domain;
            } else {
                defaultDomain = value.idText + "." + domainResult[0].domain;
            }
        } else {
            //默认使用系统配置
            for (let index = 0; index < setting.domains.length; index++) {
                if (setting.domains[index].postBackDomain) {
                    defaultDomain = value.idText + "." + setting.domains[index].address;
                }
            }
        }

        return res.json({
            status: 1,
            message: 'success',
            data: {
                defaultPostBackUrl: setting.newbidder.httpPix + defaultDomain + setting.newbidder.postBackRouter + setting.newbidder.postBackRouterParam
            }
        })

    } catch (e) {
        next(e);
    } finally {
        if (connection) {
            connection.release();
        }
    }
});



module.exports = router;
