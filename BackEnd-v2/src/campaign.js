var express = require('express');
var router = express.Router();
var Joi = require('joi');
var async = require('async');
var uuidV4 = require('uuid/v4');

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
 

//Request Example:
// {
//     "name": "testcapm",
//     "url": "hddssds",
//     "redirectMode": 0,
//     "impPixelUrl": "idddsdsds",
//     "country": {
//     "id": 1,
//         "name": "Andorra",
//         "alpha2Code": "AD",
//         "alpha3Code": "AND",
//         "numCode": 20
// },
//     "costModel": 0,
//     "cpc": 0.8,
//     "targetType": 0,
//     "status": 1,
//     "trafficSource": {
//     "id": 2,
//         "name": "trafficsource"
// },
//     "tags": [
//     "tagstest",
//     "hhh"
// ],
//     "flow": {
//     "type": 1,
//         "name": "flowtest",
//         "country": {
//         "id": 1,
//             "name": "Andorra",
//             "alpha2Code": "AD",
//             "alpha3Code": "AND",
//             "numCode": 20
//     },
//     "redirectMode": 0,
//         "rules": [
//         {
//             "name": "ruletest",
//             "type": 1,
//             "json": {},
//             "status": 1,
//             "rule2flow": 1,
//             "paths": [
//                 {
//                     "name": "pathtest",
//                     "redirectMode": 0,
//                     "directLink": 0,
//                     "status": 1,
//                     "path2rule": 1,
//                     "weight": 100,
//                     "landers": [
//                         {
//                             "name": "landertest",
//                             "url": "dddffd",
//                             "country": {
//                                 "id": 1,
//                                 "name": "Andorra",
//                                 "alpha2Code": "AD",
//                                 "alpha3Code": "AND",
//                                 "numCode": 20
//                             },
//                             "numberOfOffers": 2,
//                             "weight": 100,
//                             "tags": [
//                                 "landertags",
//                                 "landertest2"
//                             ]
//                         }
//                     ],
//                     "offers": [
//                         {
//                             "name": "offertest",
//                             "url": "eweewwe",
//                             "weight":100,
//                             "country": {
//                                 "id": 1,
//                                 "name": "Andorra",
//                                 "alpha2Code": "AD",
//                                 "alpha3Code": "AND",
//                                 "numCode": 20
//                             },
//                             "affiliateNetwork": {
//                                 "id": 1,
//                                 "name": "appnext"
//                             },
//                             "postbackUrl": "dshshds",
//                             "payoutMode": 0,
//                             "payoutValue": 0.8,
//                             "tags": [
//                                 "offertag1",
//                                 "offertag2"
//                             ]
//                         }
//                     ]
//                 }
//             ]
//         }
//     ]
// }
// }

//Response Example
//
// {
//     "status": 1,
//     "message": "success",
//     "data": {
//     "campaign": {
//         "name": "testcapm",
//             "url": "hddssds",
//             "redirectMode": 0,
//             "impPixelUrl": "idddsdsds",
//             "country": {
//             "id": 1,
//                 "name": "Andorra",
//                 "alpha2Code": "AD",
//                 "alpha3Code": "AND",
//                 "numCode": 20
//         },
//         "costModel": 0,
//             "cpc": 0.8,
//             "targetType": 0,
//             "status": 1,
//             "trafficSource": {
//             "id": 2,
//                 "name": "trafficsource"
//         },
//         "tags": [
//             "tagstest",
//             "hhh"
//         ],
//             "flow": {
//             "type": 1,
//                 "name": "flowtest",
//                 "country": {
//                 "id": 1,
//                     "name": "Andorra",
//                     "alpha2Code": "AD",
//                     "alpha3Code": "AND",
//                     "numCode": 20
//             },
//             "redirectMode": 0,
//                 "rules": [
//                 {
//                     "name": "ruletest",
//                     "type": 1,
//                     "json": {},
//                     "status": 1,
//                     "rule2flow": 1,
//                     "paths": [
//                         {
//                             "name": "pathtest",
//                             "redirectMode": 0,
//                             "directLink": 0,
//                             "status": 1,
//                             "path2rule": 1,
//                             "weight": 100,
//                             "landers": [
//                                 {
//                                     "name": "landertest",
//                                     "url": "dddffd",
//                                     "country": {
//                                         "id": 1,
//                                         "name": "Andorra",
//                                         "alpha2Code": "AD",
//                                         "alpha3Code": "AND",
//                                         "numCode": 20
//                                     },
//                                     "numberOfOffers": 2,
//                                     "weight": 100,
//                                     "tags": [
//                                         "landertags",
//                                         "landertest2"
//                                     ],
//                                     "id": 1
//                                 }
//                             ],
//                             "offers": [
//                                 {
//                                     "name": "offertest",
//                                     "url": "eweewwe",
//                                     "weight": 100,
//                                     "country": {
//                                         "id": 1,
//                                         "name": "Andorra",
//                                         "alpha2Code": "AD",
//                                         "alpha3Code": "AND",
//                                         "numCode": 20
//                                     },
//                                     "affiliateNetwork": {
//                                         "id": 1,
//                                         "name": "appnext"
//                                     },
//                                     "postbackUrl": "dshshds",
//                                     "payoutMode": 0,
//                                     "payoutValue": 0.8,
//                                     "tags": [
//                                         "offertag1",
//                                         "offertag2"
//                                     ],
//                                     "id": 1
//                                 }
//                             ],
//                             "id": 1
//                         }
//                     ],
//                     "id": 1
//                 }
//             ],
//                 "id": 1
//         },
//         "id": 1
//     }
// }
// }

/**
 * @api {post} /api/campaign/:id  编辑campaign
 * @apiName 编辑campaign
 * @apiGroup campaign
 *
 * @apiParam {Number} id
 * @apiParam {String} name
 * @apiParam {String} url
 * @apiParam {String} [impPixelUrl]
 * @apiParam {Object} trafficSource {id:1,name:""}
 * @apiParam {Object} country  {"id": 1,"name": "Andorra", "alpha2Code": "AD","alpha3Code": "AND","numCode": 20}
 * @apiParam {Number} costModel  0:Do-not-track-costs;1:cpc;2:cpa;3:cpm;4:auto?
 * @apiParam {Number} [cpc]
 * @apiParam {Number} [cpa]
 * @apiParam {Number} [cpm]
 * @apiParam {Number} redirectMode 0:302;1:Meta refresh;2:Double meta refresh
 * @apiParam {Array} [tags]
 * @apiParam {Number} targetType 跳转类型 0:URL;1:Flow;2:Rule;3:Path;4:Lander;5:Offer
 * @apiParam {Number} [targetFlowId] targetType 为 1
 * @apiParam {String} [targetUrl]  targetType 为 0
 * @apiParam {Number} status
 *
 * @apiSuccessExample {json} Success-Response:
 *   {
 *    status: 1,
 *    message: 'success',
 *    data:{}
 *
 *   }
 *
 */
router.post('/api/campaign',function(req,res,next){
       var schema = Joi.object().keys({
        id: Joi.number().optional(),
        userId: Joi.number().required(),
        name: Joi.string().required(),
        url: Joi.string().required(),
        trafficSource: Joi.object().required(),
        costModel: Joi.number().required(),
        redirectMode: Joi.number().required(),
        targetType: Joi.number().required(),
        status: Joi.number().required(),
        flow: Joi.object().required().keys({
            rules: Joi.array().required().length(1),
            hash: Joi.string(),
            type: Joi.number(),
            name: Joi.string(),
            country: Joi.object(),
            redirectMode: Joi.number()
        }).optionalKeys('hash', 'type', 'name', 'country', 'redirectMode'),
        country: Joi.object().optional(),
        impPixelUrl: Joi.string().optional(),
        cpc: Joi.number().optional(),
        cpa: Joi.number().optional(),
        cpm: Joi.number().optional(),
        tags: Joi.array().optional(),
        hash: Joi.string().optional()
    });
    req.body.userId = req.userId;
    
    start(req.body,schema).then(function(data){
        res.json({
            status:1,
            message:'success',
            data:data
        })
    }).catch(function(err){
        next(err);
    });
});


 const start = async (data,schema) => {
         let Result;
         let ResultError;
         try{
            let value= await validate(data,schema);
            let connection= await getConnection();
            await beginTransaction(connection);
            try{
                    //Campaign
                let campResult,flowResult; 
                if (value.id) {
                    await updateCampaign(value, connection);
                    } else {
                    campResult= await insertCampaign(value, connection);
                    }               

                    //Flow
                    if (value.flow && !value.flow.id) {
                        flowResult =await insertFlow(value, connection)
                    } else if (value.flow && value.flow.id) {
                        await updateFlow(value, connection)
                    } 
                     console.log(11111)
                   let campaignId = value.id ? value.id: (campResult? (campResult.insertId ? campResult.insertId: 0) :0);
                    // if(value.id){
                    //     campaignId=value.id;
                    // }else{
                    //     if(campResult && campResult.insertId){
                    //         campaignId=campResult.insertId
                    //     }
                    // }
                     console.log(2222)
                    if (!campaignId) {
                        throw new Error('Campaign ID Lost')
                    }
                    

                    //campaignId
                    value.id = campaignId;

                    let flowId = value.flow.id ? value.flow.id: (flowResult ? (flowResult.insertId?flowResult.insertId: 0) :0);

                    if (!flowId) {
                        throw new Error('Flow ID Lost');
                    }
                    //flowId
                    value.flow.id = flowId; 

                   

                     
                    //删除所有tags
                     await updateTags(value.userId, campaignId, 1, connection);

                    //campain Tags
                    if (value.tags && value.tags.length > 0) {
                        if (value.tags && value.tags.length > 0) {
                        for (let index = 0; index < value.tags.length; index++) {
                               await insertTags(value.userId, campaignId, value.tags[index], 1, connection);
                            }
                        }
                    }

                    if (value.flow.rules && value.flow.rules.length > 0) {
                        for (let i = 0; i < value.flow.rules.length; i++) {
                                try{
                                    let ruleResult;
                                    //RULE
                                    if (!value.flow.rules[i].id) {
                                        ruleResult = await  insetRule(value.userId, value.flow.rules[i], connection);    
                                        await insertRule2Flow(ruleResult.insertId, flowId, value.flow.rules[i].rule2flow, connection); 
                                    }else{
                                        await  updateRule(value.userId, value.flow.rules[i], connection);
                                        await  updateRule2Flow(value.flow.rules[i].rule2flow, value.flow.rules[i].id, flowId, connection);
                                    }
                                    let ruleId=value.flow.rules[i].id ? value.flow.rules[i].id :(ruleResult ?(ruleResult.insertId?ruleResult.insertId:0) :0);
                                    if(!ruleId){
                                        throw new Error('Rule ID Lost');
                                    }
                                    value.flow.rules[i].id=ruleId;

                                    //PATH
                                    if (value.flow.rules[i].paths && value.flow.rules[i].paths.length > 0) {
                                        for (let j = 0; j < value.flow.rules[i].paths.length; j++) {
                                            let pathResult;
                                            if (!value.flow.rules[i].paths[j].id) {
                                            pathResult=await insertPath(value.userId, value.flow.rules[i].paths[j], connection);
                                            await insertPath2Rule(pathResult.insertId, ruleId, value.flow.rules[i].paths[j].weight, value.flow.rules[i].paths[j].path2rule, connection);
                                             
                                            }else{
                                                await updatePath(value.userId, value.flow.rules[i].paths[j], connection);
                                                await updatePath2Rule(value.flow.rules[i].paths[j].id, value.flow.rules[i].id, value.flow.rules[i].paths[j].weight, value.flow.rules[i].paths[j].path2rule, connection);
                                            }
                                            
                                            let pathId = value.flow.rules[i].paths[j].id? value.flow.rules[i].paths[j].id:(pathResult?(pathResult.insertId?pathResult.insertId:0):0);
                                            if(!pathId){
                                                throw new Error('Path ID Lost');
                                            }
                                            value.flow.rules[i].paths[j].id=pathId;

                                            //Lander
                                            if (value.flow.rules[i].paths[j].landers && value.flow.rules[i].paths[j].landers.length > 0) {
                                                for (let k = 0; k < value.flow.rules[i].paths[j].landers.length; k++) {
                                                    let landerResult;
                                                    if (!value.flow.rules[i].paths[j].landers[k].id) {
                                                        landerResult= await insertLander(value.userId, value.flow.rules[i].paths[j].landers[k], connection);
                                                        await insertLander2Path(landerResult.insertId, pathId, value.flow.rules[i].paths[j].landers[k].weight, connection);
                                                    }else{
                                                        await updateLander(value.userId, value.flow.rules[i].paths[j].landers[k], connection);
                                                        await updateLander2Path(value.flow.rules[i].paths[j].landers[k].id, pathId, value.flow.rules[i].paths[j].landers[k].weight, connection);
                                                    }
                                                    
                                                    let landerId = value.flow.rules[i].paths[j].landers[k].id? value.flow.rules[i].paths[j].landers[k].id:(landerResult?(landerResult.insertId?landerResult.insertId:0):0);
                                                    if(!landerId){
                                                        throw new Error('Lander ID Lost');
                                                    }
                                                    value.flow.rules[i].paths[j].landers[k].id=landerId;
                                                    //Lander tags 
                                                    //删除所有tags
                                                    
                                                    await updateTags(value.userId, landerId, 2, connection);
                                                   
                                                    if (value.flow.rules[i].paths[j].landers[k].tags && value.flow.rules[i].paths[j].landers[k].tags.length > 0) {
                                                        for (let q = 0; q < value.flow.rules[i].paths[j].landers[k].tags.length; q++) {
                                                            
                                                            await insertTags(value.userId,landerId,value.flow.rules[i].paths[j].landers[k].tags[q],2,connection);
                                                    }
                                                    }
                                                }
                                            }

                                           

                                            //Offer
                                            if (value.flow.rules[i].paths[j].offers && value.flow.rules[i].paths[j].offers.length > 0) {
                                                for (let z = 0; z < value.flow.rules[i].paths[j].offers.length; z++) {
                                                    let offerResult;
                                                    if (!value.flow.rules[i].paths[j].offers[z].id) {
                                                        offerResult=await insertOffer(value.userId, value.flow.rules[i].paths[j].offers[z], connection);
                                                        await insertOffer2Path(offerResult.insertId, pathId, value.flow.rules[i].paths[j].offers[z].weight, connection);
                                                    }else{
                                                        await  updateOffer(value.userId, value.flow.rules[i].paths[j].offers[z], connection);
                                                        await  updateOffer2Path(value.flow.rules[i].paths[j].offers[z].id, pathId, value.flow.rules[i].paths[j].offers[z].weight, connection);
                                                    }
                                                    let offerId = value.flow.rules[i].paths[j].offers[z].id? value.flow.rules[i].paths[j].offers[z].id:(offerResult?(offerResult.insertId?offerResult.insertId:0):0);
                                                    if(!offerId){
                                                        throw new Error('Offer ID Lost');
                                                    }
                                                    value.flow.rules[i].paths[j].offers[z].id=offerId;
                                                    //删除所有offer tags
                                                    await updateTags(value.userId, offerId, 3, connection);
                                                    //offer tags 
                                                    if (value.flow.rules[i].paths[j].offers[z].tags && value.flow.rules[i].paths[j].offers[z].tags.length > 0) {
                                                        for (let p = 0; p < value.flow.rules[i].paths[j].offers[z].tags.length; p++) {
                                                            await insertTags(value.userId,offerId,value.flow.rules[i].paths[j].offers[z].tags[p],3,connection);
                                                        }
                                                    }                                                                              
                                                }
                                            }


                                        }
                                    }
                                     await commit(connection);
                                }catch(e){
                                    throw e;
                                }
                        }
                    }
                   
            }catch(err){
                await rollback(connection);
                throw err;
            } 
           delete value.userId;          
           Result=value;
         }catch(e){
            ResultError=e;
         } 

         return new Promise(function(resolve,reject){
             if(ResultError){
                 reject(ResultError);
             }
             resolve(Result);
         }); 
 };



function getConnection(){
    return new Promise(function(resolve,reject){
       pool.getConnection(function(err, connection) {
           if(err){reject(err)}
           resolve(connection)
       })
    })
}

function beginTransaction(connection){
  return new Promise(function(resolve,reject){
      connection.beginTransaction(function(err){
          if(err){
              reject(err);
          }
          resolve(1);
      })
  })
}

function commit(connection){
    return new Promise(function(resolve,reject){
        connection.commit(function(err){
            if(err){
                reject(err);
            }
            resolve(1);
        })
    })
}

function rollback(connection){
    return new Promise(function(resolve,reject){
        connection.rollback(function(){
            resolve(1);
        })
    })
}




function validate(data,schema){
    return new Promise(function(resolve,reject){
        Joi.validate(data,schema,function(err,value){
            if(err){
                reject(err);
            }
            resolve(value);
        })
    });
}

// Campaign
function insertCampaign(value, connection) {

    //required
    var col = "`userId`";
    var val = value.userId;

    col += ",`costModel`";
    val += "," + value.costModel;

    col += ",`targetType`";
    val += "," + value.targetType

    col += ",`name`";
    val += ",'" + value.name + "'";

    col += ",`hash`";
    val += ",'" + uuidV4() + "'";

    col += ",`url`";
    val += ",'" + value.url + "'";

    col += ",`trafficSourceId`";
    val += "," + value.trafficSource.id;

    col += ",`trafficSourceName`";
    val += ",'" + value.trafficSource.name + "'";

    col += ",`redirectMode`";
    val += "," + value.redirectMode;

    col += ",`status`";
    val += "," + value.status;

    //optional
    if (value.impPixelUrl != undefined) {
        col += ",`impPixelUrl`";
        val += ",'" + value.impPixelUrl + "'";
    }
    if (value.cpc != undefined) {
        col += ",`cpcValue`";
        val += "," + value.cpc;
    }
    if (value.cpa != undefined) {
        col += ",`cpaValue`";
        val += "," + value.cpa;
    }
    if (value.cpm != undefined) {
        col += ",`cpmValue`";
        val += "," + value.cpm;
    }

    if (value.country) {
        var countryCode = value.country.alpha3Code ? value.country.alpha3Code: "";
        col += ",`country`";
        val += ",'" + countryCode + "'";
    }

    //flow targetType=1 &&  flow.id
    if (value.flow && value.flow.id) {
        col += ",`targetFlowId`";
        val += "," + value.flow.id;
    }

    return new Promise(function(resolve,reject){
      connection.query("insert into TrackingCampaign (" + col + ") values (" + val + ")", function(err,result){
        if(err){
                reject(err);
            }
            resolve(result);
      })
    })
}

function updateCampaign(value, connection) {
    var sqlCampaign = "update TrackingCampaign set `id`=" + value.id;
    if (value.name) {
        sqlCampaign += ",`name`='" + value.name + "'"
    }
    if (value.url) {
        sqlCampaign += ",`url`='" + value.url + "'"
    }
    if (value.trafficSource && value.trafficSource.id) {
        sqlCampaign += ",`trafficSourceId`='" + value.trafficSource.id + "'"
    }
    if (value.trafficSource && value.trafficSource.name) {
        sqlCampaign += ",`trafficSourceName`='" + value.trafficSource.name + "'"
    }

    if (value.impPixelUrl) {
        sqlCampaign += ",`impPixelUrl`='" + value.impPixelUrl + "'"
    }
    if (value.cpc != undefined) {
        sqlCampaign += ",`cpcValue`=" + value.cpc
    }
    if (value.cpa != undefined) {
        sqlCampaign += ",`cpaValue`=" + value.cpa
    }
    if (value.cpm != undefined) {
        sqlCampaign += ",`cpmValue`=" + value.cpm
    }

    if (value.country) {
        var countryCode = value.country.alpha3Code ? value.country.alpha3Code: "";
        sqlCampaign += ",`country`='" + countryCode + "'"
    }

    if (value.costModel != undefined) {
        sqlCampaign += ",`costModel`=" + value.costModel
    }
    if (value.redirectMode != undefined) {
        sqlCampaign += ",`redirectMode`=" + value.redirectMode
    }
    if (value.status != undefined) {
        sqlCampaign += ",`status`=" + value.status
    }
    if (value.targetType != undefined) {
        sqlCampaign += ",`targetType`=" + value.targetType
    }

    //flow targetType=1 &&  flow.id
    if (value.flow && value.flow.id) {
        sqlCampaign += ",`targetFlowId`=" + value.flow.id
    }

    sqlCampaign += " where `id`=" + value.id + " and `userId`=" + value.userId
    return new Promise(function(resolve,reject){
        connection.query(sqlCampaign, function(err,result){
            if(err){
                reject(err);
            }
            resolve(result);
        });
    })
}

//Flow
function insertFlow(value, connection) {
    //required
    var col = "`userId`";
    var val = value.userId;

    col += ",`name`";
    val += ",'" + value.flow.name + "'";

    col += ",`hash`";
    val += ",'" + uuidV4() + "'";

    col += ",`type`";
    val += "," + value.flow.type;

    col += ",`redirectMode`";
    val += "," + value.flow.redirectMode;

    //optional
    if (value.flow.country) {
        var countryCode = value.flow.country.alpha3Code ? value.flow.country.alpha3Code: "";
        col += ",`country`";
        val += ",'" + countryCode + "'";
    };

    return new Promise(function(resolve,reject){
        connection.query("insert into Flow (" + col + ") values (" + val + ")", function(err,result){
            if(err){
                reject(err);
            }
            resolve(result);
        })
    });

};

function updateFlow(value, connection) {
    var sqlFlow = "update Flow set `id`=" + value.flow.id
    if (value.flow.name) {
        sqlFlow += ",`name`='" + value.flow.name + "'"
    }
    if (value.flow.country) {
        var countryCode = value.flow.country.alpha3Code ? value.flow.country.alpha3Code: "";
        sqlFlow += ",`country`='" + countryCode + "'"
    }
    if (value.flow.redirectMode != undefined) {
        sqlFlow += ",`redirectMode`=" + value.flow.redirectMode.redirectMode
    }
    if (value.flow.name) {
        sqlFlow += ",`name`='" + value.flow.name + "'"
    }
    if (value.flow.name) {
        sqlFlow += ",`name`='" + value.flow.name + "'"
    }
    sqlFlow += " where `id`=" + value.flow.id + " and `userId`=" + value.userId
       
  return  new Promise(function(resolve,reject){
         connection.query(sqlFlow, function(err,result){
            if(err){
                reject(err);
            }
            resolve(result);
        });
    })
    
}

//Tags
function insertTags(userId, targetId, name, type, connection) {
    return  new Promise(function(resolve,reject){
        connection.query("insert into `Tags` (`userId`,`name`,`type`,`targetId`) values (?,?,?,?)", [userId, name, type, targetId], function(err,result){            
            if(err){
                reject(err);
            }
            resolve(result);
        });
    });
}

//删除所有tags 
function updateTags(userId, targetId, type, connection) {
    return  new Promise(function(resolve,reject){
        connection.query("update `Tags` set `deleted`=1 where `userId`= ?  and `targetId`=? and `type`= ? ", [userId, targetId, type], function(err,result){            
            if(err){
                reject(err);
            }
            resolve(result);
        });
    })
}

//Rule
function insetRule(userId, rule, connection) {
  var sqlRule = "insert into `Rule` (`userId`,`name`,`hash`,`type`,`json`,`status`) values (?,?,?,?,?,?)";
   return  new Promise(function(resolve,reject){
     connection.query(sqlRule, [userId, rule.name, uuidV4(), rule.type, JSON.stringify(rule.json), rule.status], function(err,result){  
            if(err){
                reject(err);
            }
            resolve(result);
        });
    });
}

function updateRule(userId, rule, connection) {
    var sqlRule = "update `Rule` set `id`=" + rule.id;
    if (rule.name) {
        sqlRule += ",`name`='" + rule.name + "'"
    }
    if (rule.type != undefined) {
        sqlRule += ",`type`=" + rule.type
    }
    if (rule.json) {
        sqlRule += ",`json`='" + JSON.stringify(rule.json) + "'"
    }
    if (rule.status != undefined) {
        sqlRule += ",`status`=" + rule.status
    }
    sqlRule += " where `userId`= ? and `id`= ? ";
    return  new Promise(function(resolve,reject){
        connection.query(sqlRule, [userId, rule.id], function(err,result){            
                if(err){
                    reject(err);
                }
                resolve(result);
            });
        });
}

//Path
function insertPath(userId, path, connection) {
    var sqlpath = "insert into `Path` (`userId`,`name`,`hash`,`redirectMode`,`directLink`,`status`) values (?,?,?,?,?,?)";
   return new Promise(function(resolve,reject){
    connection.query(sqlpath, [userId, path.name, uuidV4(), path.redirectMode, path.directLink, path.status], function(err,result){
        if(err){
            reject(err);
        }
        resolve(result);
    });
    });
}

function updatePath(userId, path, connection, callback) {
    var sqlUpdatePath = "update `Path` set `id`=" + path.id;
    if (path.name) {
        sqlUpdatePath += ",`name`='" + path.name + "'"
    }
    if (path.redirectMode != undefined) {
        sqlUpdatePath += ",`redirectMode`=" + path.redirectMode
    }
    if (path.directLink != undefined) {
        sqlUpdatePath += ",`directLink`=" + path.directLink
    }
    if (path.status != undefined) {
        sqlUpdatePath += ",`status`=" + path.status
    }

    sqlUpdatePath += " where `id`=? and `userId`= ? ";

    return  new Promise(function(resolve,reject){
        connection.query(sqlUpdatePath, [path.id, userId], function(err,result){  
            if(err){
                reject(err);
            }
            resolve(result);
        });
    });

}

//Lander
function insertLander(userId, lander, connection) {
    //required
    var col = "`userId`"

    var val = userId

    col += ",`name`";
    val += ",'" + lander.name + "'";

    col += ",`hash`";
    val += ",'" + uuidV4() + "'"

    col += ",`url`";
    val += ",'" + lander.url + "'";

    col += ",`numberOfOffers`";
    val += "," + lander.numberOfOffers;

    //optional
    if (lander.country) {
        var countryCode = lander.country.alpha3Code ? lander.country.alpha3Code: "";
        col += ",`country`";
        val += ",'" + countryCode + "'";
    }

   return  new Promise(function(resolve,reject){
      connection.query("insert into Lander (" + col + ") values (" + val + ") ", function(err,result){
            if(err){
                reject(err);
            }
            resolve(result);
        });
    })

}

function updateLander(userId, lander, connection) {
    var sqlUpdateLander = "update Lander set `id`=" + lander.id;
    if (lander.country) {
        var countryCode = lander.country.alpha3Code ? lander.country.alpha3Code: "";
        sqlUpdateLander += ",`country`='" + countryCode + "'"
    }
    if (lander.name) {
        sqlUpdateLander += ",`name`='" + lander.name + "'"
    }
    if (lander.url) {
        sqlUpdateLander += ",`url`='" + lander.url + "'"
    }
    if (lander.numberOfOffers) {
        sqlUpdateLander += ",`numberOfOffers`=" + lander.numberOfOffers
    }

    sqlUpdateLander += " where `id`= ?  and `userId`= ? "

    return  new Promise(function(resolve,reject){
        connection.query(sqlUpdateLander, [lander.id, userId], function(err,result){
            if(err){
                reject(err);
            }
            resolve(result);
        });
    })
}

//Lander2Path
function insertLander2Path(landerid, pathid, pathweight, connection) {
    var sqllander2path = "insert into Lander2Path (`landerId`,`pathId`,`weight`) values (?,?,?)";
    return  new Promise(function(resolve,reject){
        connection.query(sqllander2path, [landerid, pathid, pathweight], function(err,result){            
            if(err){
                reject(err);
            }
            resolve(result);
        });
    });
}

function updateLander2Path(landerId, pathId, weight, connection) {
    var sqllander2path = "update  Lander2Path set `weight`= ? where `landerId` =? and `pathId`=?";
    return  new Promise(function(resolve,reject){
       connection.query(sqllander2path, [weight, landerId, pathId], function(err,result){
            if(err){
                reject(err);
            }
            resolve(result);
        });
    })

}

//Offer
function insertOffer(userId, offer, connection) {

    //required
    var col = "`userId`"
    var val = userId

    col += ",`name`";
    val += ",'" + offer.name + "'"

    col += ",`hash`";
    val += ",'" + uuidV4() + "'"

    col += ",`url`";
    val += ",'" + offer.url + "'";

    col += ",`payoutMode`";
    val += "," + offer.payoutMode

    //optional
    if (offer.country) {
        var countrycode = offer.country.alpha3Code ? offer.country.alpha3Code: "";
        col += ",`country`";
        val += ",'" + countrycode + "'";
    }
    if (offer.postbackUrl) {
        col += ",`postbackUrl`";
        val += ",'" + offer.postbackUrl + "'"
    }
    if (offer.payoutValue != undefined) {
        col += ",`payoutValue`";
        val += "," + offer.payoutValue
    }
    if (offer.affiliateNetwork && offer.affiliateNetwork.id) {
        col += ",`AffiliateNetworkId`";
        val += "," + offer.affiliateNetwork.id;
    }
    var sqloffer = "insert into Offer (" + col + ") values (" + val + ") ";
    return  new Promise(function(resolve,reject){
       connection.query(sqloffer, function(err,result){  
            if(err){
                reject(err);
            }
            resolve(result);
        });
    });
}

function updateOffer(userId, offer, connection) {
    var sqlUpdateOffer = "update  Offer  set `id`=" + offer.id;
    if (offer.country) {
        var countrycode = offer.country.alpha3Code ? offer.country.alpha3Code: "";
        sqlUpdateOffer += ",`country`='" + countrycode + "'"
    }
    if (offer.postbackUrl) {
        sqlUpdateOffer += ",`postbackUrl`='" + offer.postbackUrl + "'"
    }
    if (offer.payoutValue != undefined) {
        sqlUpdateOffer += ",`payoutValue`=" + offer.payoutValue

    }
    if (offer.affiliateNetwork && offer.affiliateNetwork.id) {
        sqlUpdateOffer += ",`AffiliateNetworkId`=" + offer.affiliateNetwork.id
    }
    if (offer.name) {
        sqlUpdateOffer += ",`name`='" + offer.name + "'"
    }
    if (value.flow.rules[i].paths[j].offers[z].url) {
        sqlUpdateOffer += ",`url`='" + offer.url + "'"

    }
    if (offer.payoutMode != undefined) {
        sqlUpdateOffer += ",`payoutMode`=" + offer.payoutMode

    }
    sqlUpdateOffer += " where `userId`= ? and `id`= ? ";

   return  new Promise(function(resolve,reject){
         connection.query(sqlUpdateOffer, [userId, offer.id], function(err,result){  
            if(err){
                reject(err);
            }
            resolve(result);
        });
    });

}

//Offer2Path
function insertOffer2Path(offerid, pathid, pathweight, connection) {
   return  new Promise(function(resolve,reject){
        connection.query("insert into Offer2Path (`offerId`,`pathId`,`weight`) values (?,?,?)", [offerid, pathid, pathweight], function(err,result){
            if(err){
                reject(err);
            }
            resolve(result);
        });
    })
}

function updateOffer2Path(offerId, pathId, weight, connection) {
    var sqloffer2path = "update  Offer2Path set `weight`= ? where `offerId`=? and `pathId`=?";

    return  new Promise(function(resolve,reject){
       connection.query(sqloffer2path, [weight, offerId, pathId], function(err,result){      
            if(err){
                reject(err);
            }
            resolve(result);
        });
    })

}
//Path2Rule 
function insertPath2Rule(pathId, ruleId, weight, status, connection) {
  return  new Promise(function(resolve,reject){
     connection.query("insert into Path2Rule (`pathId`,`ruleId`,`weight`,`status`) values (?,?,?,?)", [pathId, ruleId, weight, status], function(err,result){     
            if(err){
                reject(err);
            }
            resolve(result);
        });
    });
}

function updatePath2Rule(pathId, ruleId, weight, status, connection) {
    var sqlpath2rule = "update  Path2Rule set `weight`=?,`status`=? where `pathId`=? and `ruleId`=?";
    return  new Promise(function(resolve,reject){
      connection.query(sqlpath2rule, [weight, status, pathId, ruleId], function(err,result){   
            if(err){
                reject(err);
            }
            resolve(result);
        });
    });

}
  
//Rule2Flow
function insertRule2Flow(ruleId, flowId, status, connection) {

   return  new Promise(function(resolve,reject){
     connection.query("insert into Rule2Flow (`ruleId`,`flowId`,`status`) values (?,?,?)", [ruleId, flowId, status], function(err,result){ 
            if(err){
                reject(err);
            }
            resolve(result);
        });
    });
}

 function updateRule2Flow(status, ruleId, flowId, connection) {
    var sqlrule2flow = "update  Rule2Flow set `status`=? where  `ruleId`=?  and `flowId`=?";
    return  new Promise(function(resolve,reject){
       connection.query(sqlrule2flow, [status, ruleId, flowId], function(err,result){ 
            if(err){
                reject(err);
            }
            resolve(result);
        });
    });
}

module.exports = router;