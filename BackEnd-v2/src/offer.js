/**
 * Created by Aedan on 11/01/2017.
 */

var express = require('express');
var router = express.Router();
var Joi = require('joi');
var common =require('./common');


/**
 * @api {post} /api/offer  新增offer
 * @apiName 新增offer
 * @apiGroup offer
 *
 * @apiParam {String} name
 * @apiParam {String} url
 * @apiParam {Number} payoutMode
 * @apiParam {Object} affiliateNetwork {"id":1,name:""}
 * @apiParam {Number} [payoutValue]
 * @apiParam {Object} country  "country": {"id": 1,"name": "Andorra","alpha2Code": "AD", "alpha3Code": "AND", "numCode": 20 }
 * @apiParam {Array}  [tags]  
 *
 * @apiSuccessExample {json} Success-Response:
 *   {
 *    status: 1,
 *    message: 'success' *   }
 *
 */
router.post('/api/offer', function (req, res, next) {
    var schema = Joi.object().keys({
        userId: Joi.number().required(),
        idText:Joi.string().required(),
        name: Joi.string().required(),
        url: Joi.string().required(),
        country: Joi.object().required(),
        payoutMode: Joi.number().required(),
        affiliateNetwork: Joi.object().required().keys({
            id:Joi.number().required(),
            name:Joi.string().required()
        }),
        payoutValue: Joi.number().optional(),
        tags: Joi.array().optional()
    });

    req.body.userId = req.userId;
    req.body.idText=req.idText;
    const start = async ()=>{
        try{
            let value=await common.validate(req.body,schema);
            let connection=await common.getConnection();
            let postbackUrl= setting.newbidder.httpPix+value.idText+"."+setting.newbidder.mainDomain+setting.newbidder.postBackRouter;
            value.postbackUrl=postbackUrl;
            let landerResult=await common.insertOffer(value.userId,value.idText,value,connection);
            if(value.tags && value.tags.length){
                for(let index=0;index<value.tags.length;index++){
                    await common.insertTags(value.userId,landerResult.insertId,value.tags[index],3,connection);
                }
            }
            delete value.userId;
            delete value.idText;
            value.id=landerResult.insertId;
            connection.release();
            res.json({
                status: 1,
                message: 'success',
                data: value
                });                  
        }catch(e){
            next(e);
        }
       
    }
    start();
   
});


/**
 * @api {post} /api/offer/:offerId  编辑offer
 * @apiName 编辑offer
 * @apiGroup offer
 *
 * @apiParam {Number} id
 * @apiParam {String} [name]
 * @apiParam {String} [url]
 * @apiParam {String} [postbackUrl]
 * @apiParam {Number} [payoutMode]
 * @apiParam {Number} [affiliateNetwork] {"id":1,name:""}
 * @apiParam {Number} [payoutValue]
 * @apiParam {Object} [country]  "country": {"id": 1,"name": "Andorra","alpha2Code": "AD", "alpha3Code": "AND", "numCode": 20 }
 * @apiParam {Number} [deleted]
 * @apiParam {Array} [tags]
 *
 * @apiSuccessExample {json} Success-Response:
 *   {
 *    status: 1,
 *    message: 'success'
 *   }
 *
 */
router.post('/api/offer/:id', function (req, res, next) {
    var schema = Joi.object().keys({
        id: Joi.number().required(),
        hash: Joi.string().optional(),
        userId: Joi.number().required(),
        idText:Joi.string().required(),
        name: Joi.string().required(),
        url: Joi.string().required(),
        country: Joi.object().required(),
        payoutMode: Joi.number().required(),
        affiliateNetwork: Joi.object().required().keys({
            id:Joi.number().required(),
            name:Joi.string().required()
        }),
        payoutValue: Joi.number().optional(),
        tags: Joi.array().optional(),
        deleted: Joi.number().optional(),
    });

     req.body.userId = req.userId;
      req.body.idText=req.idText;
     req.body.id = req.params.id;
   const start = async ()=>{
       try{
           let value=await common.validate(req.body,schema);
           let connection=await common.getConnection();
           await common.updateOffer(value.userId,value,connection);
           await common.updateTags(value.userId,value.id,3,connection);
           if(value.tags && value.tags.length){
                for(let index=0;index<value.tags.length;index++){
                    await common.insertTags(value.userId,value.id,value.tags[index],3,connection);
                }
            }
            delete value.userId;
            delete value.idText;
            connection.release();
            res.json({
                status: 1,
                message: 'success',
                data: value
            }); 

       }catch(e){
          next(e);
       }
   }
   start();
});


/**
 * @api {get} /api/offer/:id  offer detail
 * @apiName offer
 * @apiGroup offer
 *
 *
 *
 * @apiSuccessExample {json} Success-Response:
 *   {
 *    status: 1,
 *    message: 'success',data:{}  }
 *
 */
router.get('/api/offer/:id',function(req,res,next){
    var schema = Joi.object().keys({
        id: Joi.number().required(),
        userId: Joi.number().required()
    });
    req.query.id=req.params.id;
    req.query.userId=req.userId;
    const start = async ()=>{
        try{
           let value = await common.validate(req.query,schema);
           let connection= await common.getConnection();
           let result=await common.getOfferDetail(value.id,value.userId,connection);
           connection.release();
           res.json({
               status:1,
               message:'success',
               data:result ? result :{}
           });
        }catch(e){
            return next(err);
        }
    }
   start();

})

module.exports = router;
