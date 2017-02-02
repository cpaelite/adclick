var express = require('express');
var router = express.Router();
var Joi = require('joi');
var common=require('./common');
var setting=require('../config/setting');





/**
 * @api {post} /api/flows/ 新增flow
 * @apiName 新增flow
 * @apiGroup flow
 * @apiParam {String} name
 * @apiParam {String} country
 * @apiParam {Number} redirectMode
 */
router.post('/api/flows',function(req,res,next){
   var schema=Joi.object().keys({
            userId:Joi.number().required(),
            idText:Joi.string().required(),
            rules: Joi.array().required().length(1),
            hash: Joi.string(),
            type: Joi.number(),
            id: Joi.string().optional(),
            name: Joi.string(),
            country: Joi.string(),
            redirectMode: Joi.number()
        }).optionalKeys('id','hash', 'type', 'name', 'country', 'redirectMode');
    req.body.userId = req.userId;
    req.body.idText=req.idText;    
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


/**
 * @api {put} /api/flows/:id 编辑flow
 * @apiName  编辑flow
 * @apiGroup flow
 * @apiParam {String} name
 * @apiParam {String} country
 * @apiParam {Number} redirectMode
 */
router.put('/api/flows/:id',function(req,res,next){
   var schema=Joi.object().keys({
            rules: Joi.array().required().length(1),
            hash: Joi.string(),
            type: Joi.number(),
            id: Joi.number().required(),
            name: Joi.string(),
            country: Joi.string(),
            redirectMode: Joi.number(),
            userId:Joi.number().required(),
            idText:Joi.string().required()
        }).optionalKeys('hash', 'type', 'name', 'country', 'redirectMode','deleted');
    req.body.userId = req.userId; 
    req.body.idText=req.idText;   
    req.body.id=req.params.id;
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


/**
 * @api {delete} /api/flows/:id 删除flow
 * @apiName  删除flow
 * @apiGroup flow
 */
router.delete('/api/flows/:id',function(req,res,next){
    var schema=Joi.object().keys({
            id: Joi.number().required(),
            userId:Joi.number().required()
    });
    req.body.userId = req.userId;  
    req.body.id=req.params.id;
    const start =async ()=>{
        try{
            let value=await common.validate(req.query,schema);
            let connection=await common.getConnection();
            let result= await common.deleteFlow(value.id,value.userId,connection);
            connection.release();
            res.json({
                status:1,
                message:'success'
            });
        }catch(e){
            return next(e);
        }   
    }
    start();

});

module.exports=router;


 const start = async (data,schema) => {
         let Result;
         let ResultError;
         try{
            let value= await common.validate(data,schema);
            let connection= await common.getConnection();
            await common.beginTransaction(connection);
            try{
                     
                   let  flowResult; 
                    //Flow
                    if (!value.id) {
                        flowResult =await common.insertFlow(value.userId,value, connection)
                    } else if (value && value.id) {
                        await common.updateFlow(value.userId,value, connection)
                    } 
                   
                    let flowId = value.id ? value.id: (flowResult ? (flowResult.insertId?flowResult.insertId: 0) :0);
                  

                    if (!flowId) {
                        throw new Error('Flow ID Lost');
                    }
                    //flowId
                    value.id = flowId; 

                    if (value.rules && value.rules.length > 0) {
                        for (let i = 0; i < value.rules.length; i++) {
                                try{
                                    let ruleResult;
                                    //RULE
                                    if (!value.rules[i].id) {
                                        ruleResult = await  common.insetRule(value.userId, value.rules[i], connection);    
                                        await common.insertRule2Flow(ruleResult.insertId, flowId, value.rules[i].rule2flow, connection); 
                                    }else{
                                        await  common.updateRule(value.userId, value.rules[i], connection);
                                        await  common.updateRule2Flow(value.rules[i].rule2flow, value.rules[i].id, flowId, connection);
                                    }
                                    let ruleId=value.rules[i].id ? value.rules[i].id :(ruleResult ?(ruleResult.insertId?ruleResult.insertId:0) :0);
                                    if(!ruleId){
                                        throw new Error('Rule ID Lost');
                                    }
                                    value.rules[i].id=ruleId;

                                    //PATH
                                    if (value.rules[i].paths && value.rules[i].paths.length > 0) {
                                        for (let j = 0; j < value.rules[i].paths.length; j++) {
                                            let pathResult;
                                            if (!value.rules[i].paths[j].id) {
                                            pathResult=await common.insertPath(value.userId, value.rules[i].paths[j], connection);
                                            await common.insertPath2Rule(pathResult.insertId, ruleId, value.rules[i].paths[j].weight, value.rules[i].paths[j].path2rule, connection);
                                             
                                            }else{
                                                await common.updatePath(value.userId, value.rules[i].paths[j], connection);
                                                await common.updatePath2Rule(value.rules[i].paths[j].id, value.rules[i].id, value.rules[i].paths[j].weight, value.rules[i].paths[j].path2rule, connection);
                                            }
                                            
                                            let pathId = value.rules[i].paths[j].id? value.rules[i].paths[j].id:(pathResult?(pathResult.insertId?pathResult.insertId:0):0);
                                            if(!pathId){
                                                throw new Error('Path ID Lost');
                                            }
                                            value.rules[i].paths[j].id=pathId;

                                            //Lander
                                            if (value.rules[i].paths[j].landers && value.rules[i].paths[j].landers.length > 0) {
                                                for (let k = 0; k < value.rules[i].paths[j].landers.length; k++) {
                                                    let landerResult;
                                                    if (!value.rules[i].paths[j].landers[k].id) {
                                                        landerResult= await common.insertLander(value.userId, value.rules[i].paths[j].landers[k], connection);
                                                        await common.insertLander2Path(landerResult.insertId, pathId, value.rules[i].paths[j].landers[k].weight, connection);
                                                    }else{
                                                        await common.updateLander(value.userId, value.rules[i].paths[j].landers[k], connection);
                                                        await common.updateLander2Path(value.rules[i].paths[j].landers[k].id, pathId, value.rules[i].paths[j].landers[k].weight, connection);
                                                    }
                                                    
                                                    let landerId = value.rules[i].paths[j].landers[k].id? value.rules[i].paths[j].landers[k].id:(landerResult?(landerResult.insertId?landerResult.insertId:0):0);
                                                    if(!landerId){
                                                        throw new Error('Lander ID Lost');
                                                    }
                                                    value.rules[i].paths[j].landers[k].id=landerId;
                                                    //Lander tags 
                                                    //删除所有tags
                                                    
                                                    await common.updateTags(value.userId, landerId, 2, connection);
                                                   
                                                    if (value.rules[i].paths[j].landers[k].tags && value.rules[i].paths[j].landers[k].tags.length > 0) {
                                                        for (let q = 0; q < value.rules[i].paths[j].landers[k].tags.length; q++) {
                                                            
                                                            await common.insertTags(value.userId,landerId,value.rules[i].paths[j].landers[k].tags[q],2,connection);
                                                    }
                                                    }
                                                }
                                            }

                                           

                                            //Offer
                                            if (value.rules[i].paths[j].offers && value.rules[i].paths[j].offers.length > 0) {
                                                for (let z = 0; z < value.rules[i].paths[j].offers.length; z++) {
                                                    let offerResult;
                                                    
                                                    if (!value.rules[i].paths[j].offers[z].id) {
                                                        let postbackUrl= setting.newbidder.httpPix+value.idText+"."+setting.newbidder.mainDomain+setting.newbidder.postBackRouter;
                                                        value.rules[i].paths[j].offers[z].postbackUrl=postbackUrl;
                                                        offerResult=await common.insertOffer(value.userId,value.idText, value.rules[i].paths[j].offers[z], connection);
                                                        await common.insertOffer2Path(offerResult.insertId, pathId, value.rules[i].paths[j].offers[z].weight, connection);
                                                    }else{
                                                         
                                                        await  common.updateOffer(value.userId, value.rules[i].paths[j].offers[z], connection);
                                                         
                                                        await  common.updateOffer2Path(value.rules[i].paths[j].offers[z].id, pathId, value.rules[i].paths[j].offers[z].weight, connection);
                                                        
                                                    }
                                                    
                                                    let offerId = value.rules[i].paths[j].offers[z].id? value.rules[i].paths[j].offers[z].id:(offerResult?(offerResult.insertId?offerResult.insertId:0):0);
                                                    if(!offerId){
                                                        throw new Error('Offer ID Lost');
                                                    }
                                                    value.rules[i].paths[j].offers[z].id=offerId;
                                                    //删除所有offer tags
                                                    await common.updateTags(value.userId, offerId, 3, connection);
                                                    //offer tags 
                                                    if (value.rules[i].paths[j].offers[z].tags && value.rules[i].paths[j].offers[z].tags.length > 0) {
                                                        for (let p = 0; p < value.rules[i].paths[j].offers[z].tags.length; p++) {
                                                            await common.insertTags(value.userId,offerId,value.rules[i].paths[j].offers[z].tags[p],3,connection);
                                                        }
                                                    }                                                                              
                                                }
                                            }


                                        }
                                    }
                                    
                                }catch(e){
                                    throw e;
                                }
                        }
                    }
                   
            }catch(err){
                await common.rollback(connection);
                throw err;
            }
           await common.commit(connection);  
           connection.release(); 
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

/**
 * get list of landers
 * params:
 *  columns - needed columns, comma seperated, e.g. id,name
 * shang@v1
 */
router.get('/api/landers', function (req, res) {
    var result = [{
        "id": "1234f491-a22b-455d-bcc9-5c1324a8885b",
        "name": "Global - AecurityAlert-en 1",
    }, {
        "id": "3456f491-a22b-455d-bcc9-5c1324a8885b",
        "name": "US - BecurityAlert-2",
    }, {
        "id": "5678f491-a22b-455d-bcc9-5c1324a8885b",
        "name": "JP - CrityAlert-en3",
    }, {
        "id": "6789f491-a22b-455d-bcc9-5c1324a8885b",
        "name": "CN - DecurityAlert-en4",
    }, {
        "id": "7890f491-a22b-455d-bcc9-5c1324a8885b",
        "name": "CA - EecityArt-en5",
    }];
    res.json(result)
});


/**
 * get list of conditions
 * shang@v1 [Warren] TODO
 */
router.get('/api/conditions', function (req, res) {
    var result = [{
        "id": "1234",
        "display": "Day of week",
        "fields": [{
            "type": "checkbox", "name": "weekday", "options": [
                { "value": "mon", "display": "Monday" },
                { "value": "tue", "display": "Tuesday" },
                { "value": "wed", "display": "Wednesday" },
                { "value": "thu", "display": "Thursday" },
                { "value": "fri", "display": "Friday" },
                { "value": "sat", "display": "Saturday" },
                { "value": "sun", "display": "Sunday" }
            ]
        }, {
            "type": "select", "label": "Time zone", "name": "tz", "options": [
                { "value": "utc", "display": "UTC" },
                { "value": "-8", "display": "-8 PDT" },
                { "value": "+8", "display": "+8 Shanghai" },
                { "value": "-7", "display": "+7 Soul" },
                { "value": "+7", "display": "+7 Tokyo" }
            ]
        }]
    }, {
        "id": "2334",
        "display": "Country",
        "fields": [{
            "type": "select", "name": "value", "options": [
                { "value": "us", "display": "American" },
                { "value": "ca", "display": "Canada" },
                { "value": "cn", "display": "China" },
                { "value": "jp", "display": "Japan" },
                { "value": "hk", "display": "Hongkong" }
            ]
        }]
    }, {
        "id": "3434",
        "display": "OS",
        "fields": [{
            "type": "l2select", "name": "value", "options": [{
                "value": "linux", "display": "Linux", "suboptions": [
                    { "value": "ubuntu", "display": "Ubuntu" },
                    { "value": "debian", "display": "Debian" },
                    { "value": "centos", "display": "Centos" },
                    { "value": "redhat", "display": "Redhat" },
                    { "value": "gentoo", "display": "Gentoo" },
                    { "value": "lfs",    "display": "LFS" }
                ]
            }, {
                "value": "windows", "display": "Windows", "suboptions": [
                    { "value": "winxp", "display": "Windows XP" },
                    { "value": "win7", "display": "Windows 7" },
                    { "value": "win8", "display": "Windows 8" },
                    { "value": "win10", "display": "Windows 10" }
                ]
            }, {
                "value": "android", "display": "Android", "suboptions": [
                    { "value": "android4.2", "display": "Android 4.2" },
                    { "value": "android4.3", "display": "Android 4.3" },
                    { "value": "android4.4", "display": "Android 4.4" },
                    { "value": "android4.5", "display": "Android 4.5" },
                    { "value": "android4.6", "display": "Android 4.6" },
                    { "value": "android5.0", "display": "Android 5.0" },
                    { "value": "android6.0", "display": "Android 6.0" },
                    { "value": "android7.0", "display": "Android 7.0" }
                ]
            }]
        }]
    }, {
        "id": "8334",
        "display": "Device type",
        "fields": [{
            "type": "chips", "name": "value", "options": [
                { "value": "mobile", "display": "Mobile Phones" },
                { "value": "tablet", "display": "Tablet" },
                { "value": "pc", "display": "Desktops & Laptops" },
                { "value": "tv", "display": "Smart TV" }
            ]
        }]
    }, {
        "id": "3534",
        "display": "IP and IP ranges",
        "fields": [{
            "type": "textarea", "name": "value",
            "desc": "Enter one IP address or subnet per line in the following format: 20.30.40.50 or 20.30.40.50/24"
        }]
    }, {
        "id": "4934",
        "display": "Time of day",
        "fields": [{
            "type": "inputgroup",
            "inputs": [
                { "label": "Between", "name": "starttime", "placeholder": "00:00" },
                { "label": "and", "name": "endtime", "placeholder": "00:00" },
            ]
        }, {
            "type": "select", "label": "Time zone", "name": "tz", "options": [
                { "value": "utc", "display": "UTC" },
                { "value": "-8", "display": "-8 PDT" },
                { "value": "+8", "display": "+8 Shanghai" },
                { "value": "+7", "display": "+7 Soul" },
                { "value": "+9", "display": "+7 Tokyo" }
            ]
        }]
    }];
    res.json(result)
});