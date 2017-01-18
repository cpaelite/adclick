var express = require('express');
var router = express.Router();
var Joi = require('joi');
var common=require('./common');
 

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
 * @apiParam {String} [filter2]
 * @apiParam {String} [filter2Value]
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
    return campaignReport(res,next)
});



function campaignReport(res,next){
    const start= async ()=>{
      try{
         let sql="select  t.`id`,t.`name` ,t.`hash` ,t.`url` ,t.`impPixelUrl` ,t.`country` ,"+
        "t.`trafficSourceName` ,t.`costModel`,t.`cpcValue` as `CPC`,t.`cpaValue` as `CPA`,t.`cpmValue` as `CPM`,"+
        "t.`redirectMode` as `Redirect`,"+
        "ifnull(sum(a.`Impressions`),0) as `Impressions`,"+
        "ifnull(sum(a.`Visits`),0) as `Visits`,"+
        "ifnull(sum(a.`Clicks`),0) as `Clicks`,"+
        "ifnull(sum(a.`Conversions`),0) as `Conversions`,"+
        "CONCAT('$',Round(ifnull(sum(a.`Revenue`),0),2)) as `Revenue`,"+
        "CONCAT('$',Round(ifnull(sum(a.`Cost`),0),2) ) as `Cost`,"+
        "CONCAT('$',Round(ifnull(sum(a.`Revenue`)-sum(a.`Cost`),0),2) ) as `Profit` ,"+ 
        "CONCAT('$',Round(ifnull(sum(a.`Cost`)/sum(a.`Impressions`),0),4) ) as `CPV`,"+
        "CONCAT(Round(ifnull(sum(a.`Visits`)/sum(a.`Impressions`),0)*100,2),'%') as `ICTR`,"+
        "CONCAT(Round(ifnull(sum(a.`Clicks`)/sum(a.`Visits`),0)*100,2),'%') as `CTR`,"+
        "CONCAT(Round(ifnull(sum(a.`Conversions`)/sum(a.`Clicks`),0)*100,2),'%') as `CR`,"+
        "CONCAT(Round(ifnull(sum(a.`Conversions`)/sum(a.`Visits`),0)*100,2),'%') as `CV`,"+
        "CONCAT(Round(ifnull(sum(a.`Revenue`)/sum(a.`Cost`),0)*100,2),'%') as `ROI`,"+
        "CONCAT('$',Round(ifnull(sum(a.`Revenue`)/sum(a.`Visits`),0)*100,4)) as `EPV`,"+
        "CONCAT('$',Round(ifnull(sum(a.`Revenue`)/sum(a.`Clicks`),0)*100,2)) as `EPC`,"+
        "CONCAT('$',Round(ifnull(sum(a.`Revenue`)/sum(a.`Conversions`),0)*100,2)) as `AP` "+
        "from `TrackingCampaign` t "+
        "left join  `AdStatis` a on a.`CampaignID`= t.`id` group by t.`id`";
  
        let connection= await common.getConnection();
        let result=await query(sql,connection);
        connection.release();
        res.json({
                status:1,
                message:'success',
                data:result
        });   
      }catch(e){
        next(e);
      }
    }
    start();
}

function query(sql,connection){
    return new Promise(function(resolve,reject){
        connection.query(sql,function(err,result){
            if(err){reject(err)}
            resolve(result);
        })
    })
}


module.exports = router;