var express = require('express');
var router = express.Router();
var Joi = require('joi');


/**
 * @api {post} /login  登陆
 * @apiName Login
 * @apiGroup User
 *
 * @apiParam {String} email
 * @apiParam {String} pwd
 *
 * @apiSuccess {String} firstname Firstname of the User.
 *
 */
router.post('/login', function(req, res, next) {
  var schema = Joi.object().keys({
    email: Joi.string().trim().email().required(),
    pwd: Joi.string().required()
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
        "select id,email,password from user where email = ?", [
          req.body.email
        ],
        function(
          err, rows) {
          connection.release();
          if (err) {
            return next(err);
          }
          console.log(JSON.stringify(rows))
          res.send('ok');
        });
    });

  });
});


router.get('/api/offer/list', function(req, res) {
  res.send('success')
});


module.exports = router;
