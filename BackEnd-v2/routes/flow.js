var express = require('express');
var router = express.Router();
var Joi = require('joi');
var async = require('async');


/**
 * @api {post} /api/flow/add  新增flow
 * @apiName 新增flow
 * @apiGroup flow
 * @apiDescription  改api比较特别 ,新建默认flow和path
 *
 * @apiSuccessExample {json} Success-Response:
 *   {
 *    status: 1,
 *    message: 'success'
 *     data:[{"flow": {"id": 7}}, {"path": {"id": 7 }}]
 *   }
 *
 */

router.post('/api/flow/add', function(req, res, next) {
  var schema = Joi.object().keys({
    userId: Joi.number().required()
  });
  req.body.userId = req.userId
  Joi.validate(req.body, schema, function(err, value) {
    if (err) {
      return next(err);
    }
    var sqlparamsEntities = [];
    sqlparamsEntities.push({
      "sql": "insert into Flow (`userId`,`type`,`status`) values (?,?,?)",
      "params": [value.userId, 1, 1],
      "table": "flow"
    });
    sqlparamsEntities.push({
      "sql": "insert into Path (`userId`,`status`) values (?,?)",
      "params": [value.userId, 1],
      "table": "path"
    });
    execTrans(sqlparamsEntities, function(err, result) {
      if (err) {
        return next(err);
      }
      res.json({
        status: 1,
        message: "success",
        data: result
      });
    });
  });
});



function execTrans(sqlparamsEntities, callback) {
  pool.getConnection(function(err, connection) {
    if (err) {
      return callback(err, null);
    }
    connection.beginTransaction(function(err) {
      if (err) {
        return callback(err, null);
      }

      var funcAry = [];
      sqlparamsEntities.forEach(function(sql_param) {
        var temp = function(cb) {
          var sql = sql_param.sql;
          var param = sql_param.params;
          connection.query(sql, param, function(tErr, rows,
            fields) {
            if (tErr) {
              connection.rollback(function() {
                return cb(tErr);
              });
            } else {
              var result = {}
              result[sql_param.table] = {
                "id": rows.insertId
              }
              return cb(null, result);
            }
          })
        };
        funcAry.push(temp);
      });

      async.series(funcAry, function(err, result) {
        if (err) {
          connection.rollback(function(err) {

            connection.release();
            return callback(err, null);
          });
        } else {
          connection.commit(function(err, info) {
            if (err) {
              connection.rollback(function(err) {
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


/**
 * @api {post} /api/flow/edit  编辑flow
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
router.post('/api/flow/edit', function(req, res, next) {
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
  Joi.validate(req.body, schema, function(err, value) {
    if (err) {
      return next(err);
    }
    pool.getConnection(function(err, connection) {
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
        function(err, result) {
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
 * @api {get} /api/flow/list  flow list
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
router.get('/api/flow/list', function(req, res, next) {
  var schema = Joi.object().keys({
    userId: Joi.number().required()
  });
  req.query.userId = req.userId
  Joi.validate(req.query, schema, function(err, value) {
    if (err) {
      return next(err);
    }
    pool.getConnection(function(err, connection) {
      if (err) {
        err.status = 303
        return next(err);
      }

      connection.query(
        "select `id`,`name` from Flow where `status`= ? and `userId`= ? ", [
          1, value.userId
        ],
        function(err, result) {
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
