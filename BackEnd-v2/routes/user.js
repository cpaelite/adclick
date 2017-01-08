var express = require('express');
var router = express.Router();
var Joi = require('joi');
var util = require('../util/index');
var log4js = require('log4js');
var log = log4js.getLogger('user');
var md5 = require('md5');


/**
 * @api {post} /login  登陆
 * @apiName Login
 * @apiGroup User
 *
 * @apiParam {String} email
 * @apiParam {String} password
 *

 * @apiSuccessExample {json} Success-Response:
 *{
 * status: 1,
 *   message: 'success',
 *   data: {
 *    token: 'xxxxxx'
 *     }
 *   }
 *
 */
router.post('/login', function(req, res, next) {
  var schema = Joi.object().keys({
    email: Joi.string().trim().email().required(),
    password: Joi.string().required()
  });
  Joi.validate(req.body, schema, function(err, value) {
    if (err) {
      return next(err);
    }
    pool.getConnection(function(err, connection) {
      if (err) {
        err.status = 303
        return next(err);
      }
      connection.query(
        "select id,email,password from User where `email` = ?", [
          value.email
        ],
        function(
          err, rows) {
          connection.release();
          if (err) {
            return next(err);
          }
          if (rows.length > 0) {
            if (rows[0].password == md5(value.password)) {
              res.json({
                status: 1,
                message: 'success',
                data: {
                  token: util.setToken(rows[0].id)
                }
              })
            } else {
              res.json({
                status: 1002,
                message: "password error"
              });
            }
          } else {
            res.json({
              status: 1001,
              message: "email not exist"
            });
          }
        });
    });
  });
});

/**
 * @api {post} /register  注册
 * @apiName register
 * @apiGroup User
 * @apiDescription make sure request '/account/check' for checking account exists or not first
 *
 * @apiParam {String} email
 * @apiParam {String} firstname
 * @apiParam {String} lastname
 * @apiParam {String} password
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "status": 1,
 *       "message": "success"
 *     }
 *
 */
router.post('/register', function(req, res, next) {
  var schema = Joi.object().keys({
    email: Joi.string().trim().email().required(),
    password: Joi.string().required(),
    firstname: Joi.string().required(),
    lastname: Joi.string().required(),
  });
  Joi.validate(req.body, schema, function(err, value) {
    if (err) {
      return next(err);
    }
    pool.getConnection(function(err, connection) {
      if (err) {
        err.status = 303
        return next(err);
      }
      var idtext = util.getRandomString(8)
      connection.query(
        "insert into User(`firstname`,`lastname`,`email`,`password`,`idtext`) values (?,?,?,?,?)", [
          value.firstname, value.lastname, value.email,
          md5(value.password), idtext
        ],
        function(
          err, rows) {
          connection.release();
          if (err) {
            log.error("[register]error:", err);
            return next(err);
          }
          res.json({
            "status": 1,
            "message": "success"
          });
        });
    });
  });
});

/**
 * @api {post} /account/check  检查用户是否存在
 * @apiName account check
 * @apiGroup User
 * @apiParam {String} email
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "status": 1,
 *       "message": "success"
 *       "data":{"exists":true}
 *     }
 *
 */
router.post('/account/check', function(req, res, next) {
  var schema = Joi.object().keys({
    email: Joi.string().trim().email().required()
  });
  Joi.validate(req.body, schema, function(err, value) {
    if (err) {
      return next(err);
    }
    pool.getConnection(function(err, connection) {
      if (err) {
        err.status = 303
        return next(err);
      }
      connection.query("select id from User where `email`=?", [
        value.email
      ], function(err, result) {
        connection.release();
        if (err) {
          return next(err);
        }
        var exist = false;
        if (result.length > 0) {
          exist = true
        }
        res.json({
          status: 1,
          message: 'success',
          data: {
            exists: exist
          }
        });
      });
    });
  });
});



module.exports = router;
