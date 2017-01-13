var express = require('express');
var router = express.Router();
var Joi = require('joi');
var campaignContrl = require('./campaign');

/**
 * @api {post} /api/report  报表
 * @apiName  报表
 * @apiGroup report
 * @apiDescription  报表
 *
 * @apiParam {String} from 开始时间
 * @apiParam {String} to   截止时间
 * @apiParam {String} tz   timezone
 * @apiParam {String} sort  排序字段
 * @apiParam {String} direction  desc
 * @apiParam {String} groupBy   表名
 * @apiParam {Number} offset
 * @apiParam {Number} limit
 * @apiParam {String} filter1
 * @apiParam {String} filter1Value
 * @apiParam {String} {filter2}
 * @apiParam {String} {filter2Value}
 * @apiParam {Array}  columns     列
 *
 *
 */


//from   to tz  sort  direction columns=[]  groupBy  offset   limit  filter1  filter1Value  filter2 filter2Value

router.get('/api/report', function (req, res, next) {
    var schema = Joi.object().keys({
        userId: Joi.number().required(),
        from: Joi.string().required(),
        to: Joi.string().required(),
        tz: Joi.string().required(),//+08:00
        direction: Joi.string().required(),
        groupBy: Joi.string().required(),
        offset: Joi.number().required(),
        limit: Joi.number().required(),
        filter1: Joi.string().required(),
        filter1Value: Joi.string().required(),
        filter2: Joi.string().optional(),
        filter2Value: Joi.string().optional(),
        columns: Joi.array().required().length(1)
    })
    req.query.userId = req.userId
    Joi.validate(req.query, schema,
        function (err, value) {
            if (err) {
                return next(err);
            }
            //campaign
            if (value.groupBy == 'campaign') {
                campaignContrl.campaignList(value, function (err, result) {
                    if (err) {
                        return next(err);
                    }
                    res.json(result);
                })
            }


        })
})


module.exports = router;