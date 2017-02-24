var express = require('express');
var router = express.Router();
var common = require('./common');
var Joi = require('joi');
var _ = require('lodash');


/**
 * @api {get} /api/conversions    conversions 报表
 * @apiName  conversions 报表
 * @apiGroup enentLog
 * @apiParam {String} from 
 * @apiParam {String} to 
 * @apiParam {Number} limit
 * @apiParam {Number} page
 * @apiParam {String} tz
 * @apiParam {String} sort
 * 
 */
router.get('/api/conversions', async function (req, res, next) {
    var schema = Joi.object().keys({
        from: Joi.string().required(),
        to: Joi.string().required(),
        limit: Joi.number().required().min(0),
        page: Joi.number().required(),
        sort:  Joi.string().required(),
        tz: Joi.string().required(),
        user: Joi.number().required()
    });
    let connection;

    try {
        req.query.user= req.userId;
        let value = await common.validate(req.query, schema);
        let {
            limit,
            page,
            from,
            to,
            tz,
            sort,
            user
        } = value;
        limit = parseInt(limit)
        page = parseInt(page)
        let offset = (page - 1) * limit;

        let sqlTmp="select IFNULL(DATE_FORMAT(convert_tz(FROM_UNIXTIME(`PostbackTimestamp`/1000, \"%Y-%m-%d %H:%i:%s\"),'+00:00','<%= tz %>') ,'%Y-%m-%d %h:%i:%s %p'),\"Unknown\") as PostbackTimestamp,"+
                     "IFNULL(DATE_FORMAT(convert_tz(FROM_UNIXTIME(`VisitTimestamp`/1000, \"%Y-%m-%d %H:%i:%s\"),'+00:00','<%= tz %>') ,'%Y-%m-%d %h:%i:%s %p'),\"Unknown\")  as VisitTimestamp,"+
                     "`ExternalID`,`ClickID`,`TransactionID`,`Revenue`,`Cost`,`CampaignName`,`CampaignID`,"+
                     "`LanderName`,`LanderID`,`OfferName`,`OfferID`,`Country`,`CountryCode`,`TrafficSourceName`,`TrafficSourceID`,"+
                    "`AffiliateNetworkName`,`AffiliateNetworkID`,`Device`,`OS`,`OSVersion`,`Brand`,`Model`,`Browser`,`BrowserVersion`,`ISP`,"+
                    "`MobileCarrier`,`ConnectionType`,`VisitorIP`,`VisitorReferrer`,`V1`,`V2`,`V3`,`V4`,`V5`,`V6`,`V7`,`V8`,`V9`,`V10`  "+  
                    "from AdConversionsStatis where `UserID` =<%=user%> and `PostbackTimestamp` >= (UNIX_TIMESTAMP(CONVERT_TZ('<%= from %>', '+00:00','<%= tz %>'))*1000) "+ 
                    "and `PostbackTimestamp` <= (UNIX_TIMESTAMP(CONVERT_TZ('<%= to %>', '+00:00','<%= tz %>'))*1000)  ";

        let compiled = _.template(sqlTmp);
        let dir = "asc";
        let sql = compiled({
            from: from,
            tz: tz,
            to: to,
            user: user
            
        });
        let countSql = "select COUNT(*) as `total`,sum(`Revenue`) as totalRevenue,sum(`Cost`) as totalCost from ((" + sql + ") as T)";

        if (sort.indexOf('-') >= 0) {
            dir = "desc";
            sort = sort.replace(new RegExp(/-/g), '');
        }

        sql += "order by "+ sort +" " + dir +"  limit " + offset + "," + limit ;
 
        connection = await common.getConnection();
        let result = await Promise.all([query(sql, connection), query(countSql, connection)]);
        res.json({
            status: 1,
            message: 'success',
            data: {
                totalRows: result[1],
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


 
function query(sql, connection) {
    return new Promise(function (resolve, reject) {
        connection.query(sql, function (err, result) {
            if (err) {
                return reject(err);
            }
            resolve(result);
        })
    });
}

module.exports = router;