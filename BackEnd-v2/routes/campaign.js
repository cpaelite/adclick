var express = require('express');
var router = express.Router();
var Joi = require('joi');
var async = require('async');
var uuidV4 = require('uuid/v4')

// * @apiParam {String} from 开始时间
// * @apiParam {String} to   截止时间
// * @apiParam {String} tz   timezone
// * @apiParam {String} sort  排序字段
// * @apiParam {String} direction  desc
// * @apiParam {String} groupBy   表名
// * @apiParam {Number} offset
// * @apiParam {Number} limit
// * @apiParam {String} filter1
// * @apiParam {String} filter1Value
// * @apiParam {String} {filter2}
// * @apiParam {String} {filter2Value}
// * @apiParam {Array}  columns     列

function campaignList(values, callback) {
    pool.getConnection(function (err, connection) {
        if (err) {
            err.status = 303
            return next(err);
        }
        // var sql= "select t.`hash` as campaignId ,t.name` as campaignName,"+
        //  "t.`url` as campaignUrl,t.`country` as campaignCountry,t.`trafficSourceName` as trafficSourceName,t.`costModel` as costModel,"+
        //  "t.`costValue` as costValue,a.`Visits` as visits , a.`Clicks` as clicks,a.`Conversions` as conversions ,a.`Cost` as cost "+
        //  " from `TrackingCampaign` t left join `AdStatis` a  on  t.`hash`=a.`CampaignID`  where a.`userId`="+values.userId + "and a.`Timestamp` between " +
        //     "unix_timestamp(CONVERT_TZ("+values.from+","+values.tz+""+",'+08:00','+00:00'))"
        //
        //  connection.query()
    })
}


// select
// case
// when t.`costModel`= 1 then "cpc"
// when t.`costModel`= 2 then "cpa"
// when t.`costModel`= 3 then "cpm"
// else "Do-not-track-costs" end as costModel,
//     t.`costValue`,t.`country` as campaignCountry,t.`trafficSourceName` as trafficSourceName,
// t.`hash` as campaignId,t.`name` as campaignName,t.`url` as campaignUrl,
// a.`Clicks` as Clicks,a.`Conversions` as Conversions,0 as Impressions,a.`Visits` as Visits,a.`Payout` as Revenue,
// a.`Cost` as Cost,(a.`Payout`-a.`Cost`) as Profit,
//     from `TrackingCampaign` t left join `AdStatis` a where t.`userId`=1 and t.`hash` = a.`CampaignID`
// and a.`Timestamp` BETWEEN UNIX_TIMESTAMP(CONVERT_TZ('','+08:00','+00:00')) and UNIX_TIMESTAMP(CONVERT_TZ('','+08:00','+00:00'))


exports.campaignList = campaignList


/**
 * @api {post} /api/campaign  新增campaign
 * @apiName 新增campaign
 * @apiGroup campaign
 *
 * @apiParam {String} name
 * @apiParam {String} url
 * @apiParam {String} {impPixelUrl}
 * @apiParam {Object} trafficSource
 * @apiParam {String} country
 * @apiParam {Number} {costModel}  0:Do-not-track-costs;1:cpc;2:cpa;3:cpm;4:auto?
 * @apiParam {Number} {cpc}
 * @apiParam {Number} {cpa}
 * @apiParam {Number} {cpm}
 * @apiParam {Number} redirectMode
 * @apiParam {Array} {tags}
 * @apiParam {Number} targetType 跳转类型 0:URL;1:Flow;2:Rule;3:Path;4:Lander;5:Offer
 * @apiParam {Number} {targetFlowId} targetType 为 1
 * @apiParam {String} {targetUrl}  targetType 为 0
 *
 * @apiSuccessExample {json} Success-Response:
 *   {
 *    status: 1,
 *    message: 'success' *   }

 *
 */

var campaign = {
    id:1,
    name: "",
    hash:"",
    url: "",
    "redirectMode": 0, //'0:302;1:Meta refresh;2:Double meta refresh
    "impPixelUrl": "",
    "country":{},
    "costModel": 0,//0:Do-not-track-costs;1:cpc;2:cpa;3:cpm;4:auto?
    "cpc": 0.8,
    "cpa":0.5,
    "cpm":0.5,
    "targetType":0, //跳转类型,0:URL;1:Flow;2:Rule;3:Path;4:Lander;5:Offer
    "status":1,
    "trafficSource": {
        "id": "",
        "name": ""
    },
    "tags": [],
    "flow":{
        id:1,
        hash:"",
        type:0, //0:匿名;1:普通
        name:"",
        country:{},
        redirectMode:0,//0:302;1:Meta refresh;2:Double meta refresh
        rules:[{
            id:1,
            name:"",
            hash:"",
            type:0, //0:匿名;1:普通
            json:{},// TODO
            status:1, //0:停止;1:运行
            paths:[{
                id:1,
                name:"",
                hash:"",
                redirectMode:0, //0:302;1:Meta refresh;2:Double meta refresh
                directLink:0, //0:No;1:Yes
                status:0,//0:停止;1:运行
                weight:100, // TODO
                landers:[{
                    id:1,
                    name:"",
                    hash:"",
                    url:"",
                    country:"",
                    numberOfOffers:2,
                    weight:100,
                    tags:[]
                }],
                offers:[{
                    id:1,
                    name:"",
                    hash:"",
                    url:"",
                    country:"",
                    AffiliateNetwork:{
                        id:1,
                        name:""
                    },
                    postbackUrl:"",
                    payoutMode:0,//0:Auto;1:Manual
                    payoutValue:0.8,
                    tags:[]
                }]
            }]
        }]
    }
}
router.post('/api/campaign', function (req, res, next) {
    var schema = Joi.object().keys({
        userId: Joi.number().required(),
        name: Joi.string().required(),
        url: Joi.string().required(),
        trafficSource: Joi.object().required(),
        costModel: Joi.number().required(),
        redirectMode: Joi.number().required(),
        targetType:Joi.number().required(),
        status:Joi.number().required(),
        country: Joi.object().optional(),
        impPixelUrl: Joi.string().optional(),
        cpc:Joi.number().optional(),
        cpa:Joi.number().optional(),
        cpm:Joi.number().optional(),
        tags: Joi.array().optional(),
        hash:Joi.string().optional()
    });
    req.body.userId = req.userId
    Joi.validate(req.body, schema, function (err, value) {
        if (err) {
            return next(err);
        }
        pool.getConnection(function (err, connection) {
            if (err) {
                err.status = 303
                return next(err);
            }
            connection.beginTransaction(function(err){
                if(err){
                    return next(err)
                }
                var ParallelArray = []
                var col="`userId`,`name`,`hash`,`url`,`trafficSourceId`,`trafficSourceName`,`redirectMode`,`status`"
                var val=value.userId+","+value.name+","+uuidV4()+","+value.trafficSource.id+","+value.trafficSource.name+","+value.redirectMode+","+value.status;
                if (value.impPixelUrl != undefined) {
                    col += ",`impPixelUrl`"
                    val += ","+value.impPixelUrl
                }
                if (value.cpc != undefined) {
                    col += ",`cpcValue`"
                    val += ","+value.cpc
                }
                if (value.cpa != undefined) {
                    col += ",`cpaValue`"
                    val += ","+value.cpa
                }
                if (value.cpm != undefined) {
                    col += ",`cpmValue`"
                    val += ","+value.cpm
                }
                if (value.country) {
                    col += ",`country`"
                    val += ","+value.country.alpha3Code ? value.country.alpha3Code:""
                }
                //required
                col += ",`costModel`"
                val += ","+value.costModel
                col += ",`redirectMode`"
                val += ","+value.redirectMode
                col += ",`targetType`"
                val += ","+value.targetType


                var sqlCampaign ="insert into TrackingCampaign ("+ col +") values ("+val+")";


            })

            var ParallelArray = []
            // var sqlCampaign = "insert into TrackingCampaign set `userId`= " +
            //     value.userId + ",`name`='" + value.name +
            //     "',`url`='" + value.url + "',`country`='" + value.country +
            //     "',`hash`='" +
            //      +
            //     "',`trafficSourceId`=" +
            //     value.trafficSourceId + ",`trafficSourceName`=" +
            //     value.trafficSourceName + ",`redirectMode`=" +
            //     value.redirectMode + ",`dstType`=" +
            //     value.dstType + ",`status`=" +
            //     1 + ",`deleted`=0";

            if (value.impPixelUrl != undefined) {
                sql += ",`impPixelUrl`=" + value.impPixelUrl
            }
            if (value.costModel != undefined) {
                sql += ",`costModel`=" + value.costModel
            }

            if (value.dstFlowId != undefined) {
                sql += ",`dstFlowId`=" + value.dstFlowId
            }
            if (value.dstUrl != undefined) {
                sql += ",`dstUrl`=" + value.dstUrl
            }
            ParallelArray.push(function (callback) {
                connection.query(sqlCampaign, callback);
            });

            if (value.tags && value.tags.length > 0) {
                var sqlTags = "insert into `Tags` (`userId`,`name`,`type`,`targetId`,`deleted`) values (?,?,?,?,?)"

                for (var i = 0; i < value.tags.length; i++) {
                    ParallelArray.push(function (callback) {
                        connection.query(sqlTags, [value.userId, value.tags[i], 1,], callback);
                    });
                }
            }

        });
    });
});


module.exports = router;

