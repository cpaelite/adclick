var express = require('express');
var router = express.Router();
var common = require('./common');
var Joi = require('joi');
var _ = require('lodash');
var rp = require('request-promise');
var setting = require('../config/setting');

/**
 * @api {get} /api/conversions    conversions 报表
 * @apiName  conversions 报表
 * @apiGroup  conversions
 * @apiParam {String} from 
 * @apiParam {String} to 
 * @apiParam {Number} limit
 * @apiParam {Number} page
 * @apiParam {String} tz
 * @apiParam {String} order
 * 
 */
router.get('/api/conversions', async function (req, res, next) {
    var schema = Joi.object().keys({
        from: Joi.string().required(),
        to: Joi.string().required(),
        limit: Joi.number().required().min(0),
        page: Joi.number().required(),
        order:  Joi.string().required(),
        tz: Joi.string().required(),
        user: Joi.number().required()
    });
    let connection;

    try {
        req.query.user = req.parent.id;
        let value = await common.validate(req.query, schema);
        let {
            limit,
            page,
            from,
            to,
            tz,
            order,
            user
        } = value;
        limit = parseInt(limit)
        page = parseInt(page)
        let offset = (page - 1) * limit;

        let sqlTmp = "select (case statis.PostbackTimestamp when 0 then \"Unknown\" else IFNULL(DATE_FORMAT(convert_tz(FROM_UNIXTIME(statis.`PostbackTimestamp`/1000, \"%Y-%m-%d %H:%i:%s\"),'+00:00','<%= tz %>') ,'%Y-%m-%d %h:%i:%s %p'),\"Unknown\") end) as PostbackTimestamp," +
            "(case statis.VisitTimestamp when 0 then \"Unknown\" else IFNULL(DATE_FORMAT(convert_tz(FROM_UNIXTIME(statis.`VisitTimestamp`/1000, \"%Y-%m-%d %H:%i:%s\"),'+00:00','<%= tz %>') ,'%Y-%m-%d %h:%i:%s %p'),\"Unknown\") end)  as VisitTimestamp," +
            "statis.`ExternalID`,statis.`ClickID`,statis.`TransactionID`,statis.`Revenue`,statis.`Cost`,statis.`CampaignName`,statis.`CampaignID`," +
            "statis.`LanderName`,statis.`LanderID`,statis.`OfferName`,statis.`OfferID`,statis.`Country`,statis.`CountryCode`,statis.`TrafficSourceName`,statis.`TrafficSourceID`," +
            "statis.`AffiliateNetworkName`,statis.`AffiliateNetworkID`,statis.`Device`,statis.`OS`,statis.`OSVersion`,statis.`Brand`,statis.`Model`,statis.`Browser`,statis.`BrowserVersion`,statis.`ISP`," +
            "statis.`MobileCarrier`,statis.`ConnectionType`,statis.`VisitorIP`,statis.`VisitorReferrer`,statis.`V1`,statis.`V2`,statis.`V3`,statis.`V4`,statis.`V5`,statis.`V6`,statis.`V7`,statis.`V8`,statis.`V9`,statis.`V10`  " +
            "from AdConversionsStatis statis where statis.`UserID` =<%=user%> and statis.`PostbackTimestamp` >= (UNIX_TIMESTAMP(CONVERT_TZ('<%= from %>', '<%= tz %>','+00:00'))*1000) " +
            "and statis.`PostbackTimestamp` <= (UNIX_TIMESTAMP(CONVERT_TZ('<%= to %>', '<%= tz %>','+00:00'))*1000)  ";

        let compiled = _.template(sqlTmp);
        let dir = "asc";
        let sql = compiled({
            from: from,
            tz: tz,
            to: to,
            user: user

        });
        let countSql = "select COUNT(*) as `total`,round(sum(`Revenue`),2) as Revenue,round(sum(`Cost`),2) as Cost from ((" + sql + ") as T)";

        if (order.indexOf('-') >= 0) {
            dir = "desc";
            order = order.replace(new RegExp(/-/g), '');
        }

        sql += "order by statis."+ order +" " + dir +"  limit " + offset + "," + limit ;
        connection = await common.getConnection();
        let result = await Promise.all([common.query(sql,[], connection), common.query(countSql,[], connection)]);
        res.json({
            status: 1,
            message: 'success',
            data: {
                totalRows: result[1][0] ? result[1][0].total : 0,
                totals: {
                    Cost: result[1][0] ? result[1][0].Cost : 0,
                    Revenue: result[1][0] ? result[1][0].Revenue : 0
                },
                rows: result[0]
            }
        });
    } catch (e) {
        next(e);
    }
    finally {
        if (connection) {
            connection.release();
        }

    }
});


/**
 * @api {post}  /api/conversions setting conversionUpload 
 * @apiName setting conversionUpload 
 * @apiGroup conversions
 * @apiParam {Array} keys 
 * 
 *  @apiSuccessExample {json} Success-Response:
 * 
 * {
  "status": 1,
  "message": "success",
  "data": [
    {
      "I": 0,
      "V": "c384EFV6JHQODRN70575OK6UG5, 10.0, abc1234",
      "E": "invalid data"
    },
    {
      "I": 1,
      "V": "c384EFV6JHQODRN70575OK6UG6, 11.0, abc1234",
      "E": "invalid data"
    }
  ]
}
 * 
 */
router.post('/api/conversions', async function (req, res, next) {
    var schema = Joi.object().keys({
        keys: Joi.array().items(Joi.string()).required(),
        user: Joi.number().required(),
        idText: Joi.string().required(),
    });
    let connection;
    try {
        req.body.user = req.user.id;
        req.body.idText = req.user.idText;
        let value = await common.validate(req.body, schema);
        let defaultDomain;
        for (let index = 0; index < setting.domains.length; index++) {
            if (setting.domains[index].postBackDomain) {
                defaultDomain = setting.domains[index].address;
            }
        }
        let options = {
            method: 'POST',
            uri: `http://${value.idText}.${defaultDomain}/conversions`,
            body: value.keys,
            json: true // Automatically stringifies the body to JSON 
        };
        let result = await rp(options);
        res.json({
            status: 1,
            message: 'success',
            data: result
        });
    } catch (e) {
        next(e);
    }
    finally {
        if (connection) {
            connection.release();
        }

    }
});



 
module.exports = router;
