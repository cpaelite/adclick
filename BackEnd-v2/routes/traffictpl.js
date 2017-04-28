var express = require('express');
var router = express.Router();



/**
 * @api {get} /api/traffic/tpl  traffictpl list
 * @apiName traffictpl list
 * @apiGroup traffictpl
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
router.get('/api/traffic/tpl', function(req, res, next) {
    pool.getConnection('m1', function(err, connection) {
        if (err) {
            err.status = 303
            return next(err);
        }
        connection.query(
            "select `id`,`name`,`postbackUrl`,`pixelRedirectUrl` ,`externalId`, `cost`,`params`,`campaignId`,`websiteId` from TemplateTrafficSource where `deleted`=? order by `order` ASC", [
                0
            ],
            function(err, results) {
                connection.release();
                if (err) {
                    return next(err);
                }
                try {
                    res.json({
                        status: 1,
                        message: 'success',
                        data: {
                            lists: results.length ? results : []
                        }
                    });
                } catch (e) {
                    next(e);
                }
            });
    });
});


module.exports = router;