var express = require('express');
var router = express.Router();
var Joi = require('joi');


/**
 * @api {post} /affilate/tpl/add  networktpl add
 * @apiName networktpl add
 * @apiGroup networktpl
 *
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "status": 1,
 *       "message": "success"
 *     }
 *
 */
router.post('/affilate/tpl/add', function(req, res, next) {
  var schema = Joi.object().keys({
    name: Joi.string().required(),
    postbackParams: Joi.string().required(),
    desc: Joi.string().required(),
  });
  Joi.validate(req.body, schema, function(err, value) {
    if (err) {
      return next(err);
    }
    pool.getConnection(function(err, connection) {
      connection.release();
      if (err) {
        err.status = 303
        return next(err);
      }
      connection.query(
        "insert into TemplateAffiliateNetwork (`name`,`postbackParams`,`desc`,`status`) values(?,?,?,?)", [
          value.name, value.postbackParams, value.desc, 1
        ],
        function(err) {
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
 * @api {get} /affilate/tpl/list  networktpl list
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
router.get('/affilate/tpl/list', function(req, res, next) {
  pool.getConnection(function(err, connection) {
    if (err) {
      err.status = 303
      return next(err);
    }
    connection.query(
      "select `id`,`name`,`postbackParams`,`desc` from TemplateAffiliateNetwork where `status`=?", [
        1
      ],
      function(err, results) {
        connection.release();
        if (err) {
          return next(err);
        }
        res.json({
          status: 1,
          message: 'success',
          data: {
            lists: results
          }
        });
      });
  });
});


module.exports = router;
