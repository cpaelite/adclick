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
 *    token: util.setToken(rows[0].id)
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
        "select id,email,password from User where email = ?", [
          req.body.email
        ],
        function(
          err, rows) {
          connection.release();
          if (err) {
            return next(err);
          }
          if (rows.length > 0) {
            if (rows[0].password == md5(req.body.password)) {
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
router.post('/register', function(req, res) {
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
      connection.query(
        "insert into User(firstname,lastname,email,password,idtext) values (?,?,?,?,?)", [
          req.body.firstname, req.body.lastname, req.body.email,
          md5(req.body.password), util.getRandomString()
        ],
        function(
          err, rows) {
          logger.error("[register]error:", err);
          connection.release();
          if (err) {
            return next(err);
          }
          res.json({
            "status": 1,
            "message": "success"
          });
        });
    });
  })

});


router.get('/api/offer/list', function(req, res) {
  res.send('success')
});


module.exports = router;
