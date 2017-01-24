var express = require('express');
var router = express.Router();
var Joi = require('joi');


/**
 * @api {post} /affilate/tpl  networktpl add
 * @apiName networktpl add
 * @apiGroup networktpl
 *
 * @apiParam {String} name
 * @apiParam {String} postbackParams
 * @apiParam {String} desc
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "status": 1,
 *       "message": "success"
 *     }
 *
 */
router.post('/affilate/tpl', function (req, res, next) {
    var schema = Joi.object().keys({
        name: Joi.string().required(),
        postbackParams: Joi.string().required(),
        desc: Joi.string().required(),
    });
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
                "insert into TemplateAffiliateNetwork (`name`,`postbackParams`,`desc`,`deleted`) values(?,?,?,?)", [
                    value.name, value.postbackParams, value.desc, 0
                ],
                function (err) {
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
 * @api {get} /affilate/tpl  networktpl list
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
router.get('/affilate/tpl', function (req, res, next) {
    pool.getConnection(function (err, connection) {
        if (err) {
            err.status = 303
            return next(err);
        }
        connection.query(
            "select `id`,`name`,`postbackParams`,`desc` from TemplateAffiliateNetwork where `deleted`=?", [
                0
            ],
            function (err, results) {
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
