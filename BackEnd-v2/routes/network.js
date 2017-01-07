var express = require('express');
var router = express.Router();
var Joi = require('joi');



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
        value.userId + ",`name=`" + value.name + ",`postbackUrl`=" +
        value.postbackUrl
      if (value.appendClickId) {
        sql += ",`appendClickId`=" + value.appendClickId
      }
      if (value.duplicatedPostback) {
        sql += ",`duplicatedPostback`=" + value.duplicatedPostback
      }
      if (value.ipWhiteList) {
        sql += ",`ipWhiteList`=" + value.ipWhiteList
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
