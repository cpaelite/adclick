var express = require('express');
var router = express.Router();
var Joi = require('joi');


/**
 * @api {post} /api/affilate/add  新增affilate
 * @apiName 新增affilate
 * @apiGroup network
 *
 * @apiParam {String} name
 * @apiParam {String} postbackUrl
 * @apiParam {Number} [appendClickId]
 * @apiParam {Number} [duplicatedPostback]
 * @apiParam {String} [ipWhiteList]
 *
 * @apiSuccessExample {json} Success-Response:
 *   {
 *    status: 1,
 *    message: 'success'
 *   }
 *
 */
router.post('/api/affilate/add', function(req, res, next) {
  var schema = Joi.object().keys({
    userId: Joi.number().required(),
    name: Joi.string().required(),
    postbackUrl: Joi.string().required(),
    appendClickId: Joi.number().optional(),
    duplicatedPostback: Joi.number().optional(),
    ipWhiteList: Joi.string().optional()
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
      var sql = "insert into AffiliateNetwork set `userId`= " +
        value.userId + ",`name`='" + value.name +
        "',`postbackUrl`='" +
        value.postbackUrl + "',`status`=1";
      if (value.appendClickId != undefined) {
        sql += ",`appendClickId`='" + value.appendClickId + "'"
      }
      if (value.duplicatedPostback != undefined) {
        sql += ",`duplicatedPostback`='" + value.duplicatedPostback +
          "'"
      }
      if (value.ipWhiteList) {
        sql += ",`ipWhiteList`='" + value.ipWhiteList + "'"
      }
      connection.query(sql, function(err, result) {
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
 * @api {get} /api/affilate/list  network list
 * @apiName network list
 * @apiGroup network
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
router.get('/api/affilate/list', function(req, res, next) {
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
        "select `id`,`name`,`postbackUrl` from AffiliateNetwork  where `status`= ? and `userId`= ?", [
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


router.post('/api/affilate/edit', function(req, res, next) {
  var schema = Joi.object().keys({
    id: Joi.number().required(),
    userId: Joi.number().required(),
    name: Joi.string().optional(),
    postbackUrl: Joi.string().optional(),
    appendClickId: Joi.number().optional(),
    duplicatedPostback: Joi.number().optional(),
    ipWhiteList: Joi.string().optional(),
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
      var sql = "update AffiliateNetwork set `id`= " + value.id;
      if (value.status == 0) {
        sql += ",`status`=" + value.status
      }
      if (value.name) {
        sql += ",`name`='" + value.name + "'"
      }
      if (value.postbackUrl) {
        sql += ",`postbackUrl`='" + value.postbackUrl + "'"
      }
      if (value.appendClickId != undefined) {
        sql += ",`appendClickId`=" + value.appendClickId
      }
      if (value.duplicatedPostback != undefined) {
        sql += ",`duplicatedPostback`=" + value.duplicatedPostback
      }
      if (value.ipWhiteList) {
        sql += ",`ipWhiteList`='" + value.ipWhiteList + "'"
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


module.exports = router;
