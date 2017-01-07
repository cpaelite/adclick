var express = require('express');
var router = express.Router();
var Joi = require('joi');


router.post('/api/offer/add', function(req, res, next) {
  var schema = Joi.object().keys({
    userId: Joi.number().required(),
    name: Joi.string().required(),
    url: Joi.string().required(),
    country: Joi.string().required(),
    postbackUrl: Joi.string().required(),
    payoutMode: Joi.number().required(),
    AffiliateNetworkId: Joi.number().required(),
  });
  req.body.userId = req.userId;
  Joi.validate(req.body, schema, function(err, value) {
    if (err) {
      return next(err);
    }
    pool.getConnection(function(err, connection) {

    });
  });
});
