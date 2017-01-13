/**
 * Created by Aedan on 12/01/2017.
 */



var express = require('express');
var router = express.Router();
var Joi = require('joi');

router.get('/api/preferences', function (req, res, next) {
    var schema = Joi.object().keys({
        userId: Joi.number().required()
    });
    req.body.userId = req.userId;
    Joi.validate(req.body, schema, function (err, value) {
        if (err) {
            return next(err);
        }
        pool.getConnection(function (err, connection) {
            if (err) {
                err.status = 303
                return next(err);
            }
            connection.query(
                "select  `json` from User where `id` = ? and `deleted` =0", [
                    value.userId
                ],
                function (err, result) {
                    connection.release();
                    if (err) {
                        return next(err);
                    }
                    res.json({
                        status: 1,
                        message: "success",
                        data:JSON.parse(result.json)
                    });

                });
        });
    });
});


//type 1:Campaign;2:Lander;3:Offer

router.get('/api/tags',function(req,res,next){
    res.json({
            "status": 1,
            "message": "",
            "data": {
                "tags": [
                    {
                        id: 1,
                        name: "tag1"
                    }
                ]
            }
        }
    )
})




module.exports = router;