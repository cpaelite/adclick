var express = require('express');
var router = express.Router();
var Joi = require('joi');


/**
 * @api {post} /api/offer/add  新增offer
 * @apiName 新增offer
 * @apiGroup offer
 *
 * @apiParam {String} name
 * @apiParam {String} url
 * @apiParam {String} postbackUrl
 * @apiParam {Number} payoutMode
 * @apiParam {Number} AffiliateNetworkId
 * @apiParam {Number} [payoutValue]
 * @apiParam {String} country
 *
 * @apiSuccessExample {json} Success-Response:
 *   {
 *    status: 1,
 *    message: 'success'
 *   }
 *
 */
router.post('/api/offer/add', function(req, res, next) {
  var schema = Joi.object().keys({
    userId: Joi.number().required(),
    name: Joi.string().required(),
    url: Joi.string().required(),
    country: Joi.string().required(),
    postbackUrl: Joi.string().required(),
    payoutMode: Joi.number().required(),
    AffiliateNetworkId: Joi.number().required(),
    payoutValue: Joi.number().optional()
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
      var sql = "insert into Offer set `userId`= " +
        value.userId + ",`name`='" + value.name +
        "',`url`='" + value.url + "',`country`='" + value.country +
        "',`postbackUrl`='" +
        value.postbackUrl +
        "',`payoutMode`=" +
        value.payoutMode + ",`AffiliateNetworkId`=" +
        value.AffiliateNetworkId + ",`status`=1";

      if (value.payoutValue != undefined) {
        sql += ",`payoutValue`=" + value.payoutValue
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
 * @api {get} /api/offer/list  offer list
 * @apiName offer list
 * @apiGroup offer
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
router.get('/api/offer/list', function(req, res, next) {
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
        "select a.`id`,a.`name`,a.`url`,a.`country`,a.`postbackUrl` ,b.`name` as `AffiliateNetworkName`,a.`payoutValue` from Offer a left  join AffiliateNetwork b  on   a.`AffiliateNetworkId` = b.`id` where a.`status`= ? and a.`userId`= ? ", [
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

/**
 * @api {post} /api/offer/edit  编辑offer
 * @apiName 编辑offer
 * @apiGroup offer
 *
 * @apiParam {Number} id
 * @apiParam {String} [name]
 * @apiParam {String} [url]
 * @apiParam {String} [postbackUrl]
 * @apiParam {Number} [payoutMode]
 * @apiParam {Number} [AffiliateNetworkId]
 * @apiParam {Number} [payoutValue]
 * @apiParam {String} [country]
 * @apiParam {Number} [status]
 *
 * @apiSuccessExample {json} Success-Response:
 *   {
 *    status: 1,
 *    message: 'success'
 *   }
 *
 */
router.post('/api/offer/edit', function(req, res, next) {
  var schema = Joi.object().keys({
    id: Joi.number().required(),
    userId: Joi.number().required(),
    name: Joi.string().optional(),
    url: Joi.string().optional(),
    country: Joi.string().optional(),
    postbackUrl: Joi.string().optional(),
    payoutMode: Joi.number().optional(),
    AffiliateNetworkId: Joi.number().optional(),
    payoutValue: Joi.number().optional(),
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
      var sql = "update Offer set `id`= " + value.id;
      if (value.status == 0) {
        sql += ",`status`=" + value.status
      }
      if (value.name) {
        sql += ",`name`='" + value.name + "'"
      }
      if (value.url) {
        sql += ",`url`='" + value.url + "'"
      }
      if (value.country) {
        sql += ",`country`='" + value.country + "'"
      }
      if (value.postbackUrl) {
        sql += ",`postbackUrl`='" + value.postbackUrl + "'"
      }
      if (value.payoutMode != undefined) {
        sql += ",`payoutMode`=" + value.payoutMode
      }
      if (value.AffiliateNetworkId != undefined) {
        sql += ",`AffiliateNetworkId`=" + value.AffiliateNetworkId
      }
      if (value.payoutValue != undefined) {
        sql += ",`payoutValue`=" + value.payoutValue
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
