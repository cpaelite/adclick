// package Description
// 1.token 或者user/password 拉取offers
// 2.将第三方offer 导入newbidder

var express = require('express');
var router = express.Router();
var Joi = require('joi');
var common = require('./common');
var moment = require('moment');
var uuidV4 = require('uuid/v4');
var setting = require('../config/setting');
var _ = require('lodash');

/**
 * @api {post} /api/third/affiliates  新建ThirdPartyAffiliateNetwork
 * @apiName  新建ThirdPartyAffiliateNetwork
 * @apiGroup ThirdParty
 * 
 * @apiParam {Number} affiliateId 
 * @apiParam {String} name
 * @apiParam {String} [token]
 * @apiParam {String} [account]
 * @apiParam {String} [password]
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "status": 1,
 *       "message": "success",
 *       "data":{
 *           id:11,
 *           affiliateId:22,
 *           name:"",
 *           token:"",
 *           account:"",
 *           password:""
 *        }
 *     }
 *
 */
router.post('/api/third/affiliates', async function (req, res, next) {
    //TODO 验证可以新建几个
    let schema = Joi.object().keys({
        affiliateId: Joi.number().required(),
        userId: Joi.number().required(),
        name: Joi.string().required(),
        token: Joi.string().optional(),
        account: Joi.string().optional(),
        password: Joi.string().optional()
    }).or('token', 'account').with('account', 'password');
    let connection;
    try {
        req.body.userId = req.parent.id;
        let value = await common.validate(req.body, schema);
        connection = await common.getConnection();
        let sql = `insert into ThirdPartyAffiliateNetwork (userId,trustedANId,name,token,userName,password,createdAt) values (?,?,?,?,?,?,?)`;
        let params = [value.userId, value.affiliateId, value.name, value.token ? value.token : "", value.account ? value.account : "", value.password ? value.password : "", moment().unix()];

        let { insertId: id } = await common.query(sql, params, connection);
        value.id = id;
        delete value.userId;
        return res.json({
            status: 1,
            message: 'success',
            data: value
        });
    } catch (e) {
        next(e);
    } finally {
        if (connection) {
            connection.release();
        }
    }
});

/**
 * @api {get} /api/third/affiliates  获取ThirdPartyAffiliateNetwork  
 * @apiName  获取ThirdPartyAffiliateNetwork  
 * @apiGroup ThirdParty
 * 
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "status": 1,
 *       "message": "success",
 *       "data":[{id:1,name:"",affiliateId:1,token:"",account:"",password:""}]
 *     }
 *
 */
router.get('/api/third/affiliates', async function (req, res, next) {
    let schema = Joi.object().keys({
        userId: Joi.number().required()
    });
    let connection;
    try {
        req.query.userId = req.parent.id;
        let value = await common.validate(req.query, schema);
        connection = await common.getConnection();
        let sql = `select id,name,token,userName as account,password,trustedANId as affiliateId from ThirdPartyAffiliateNetwork  where deleted = ? and userId = ?`;
        let result = await common.query(sql, [0, value.userId], connection);
        return res.json({
            status: 1,
            message: 'success',
            data: result
        });
    } catch (e) {
        next(e);
    } finally {
        if (connection) {
            connection.release();
        }
    }
});


router.put('/api/third/affiliates/:id', async function (req, res, next) {
    let schema = Joi.object().keys({
        id: Joi.number().required(),
        affiliateId: Joi.number().required(),
        userId: Joi.number().required(),
        name: Joi.string().optional(),
        token: Joi.string().optional(),
        account: Joi.string().optional(),
        password: Joi.string().optional()
    });
    let connection;
    try {
        req.body.userId = req.parent.id;
        req.body.id = req.params.id;
        let value = await common.validate(req.body, schema);
        connection = await common.getConnection();
        let params = [];
        let sql = "update ThirdPartyAffiliateNetwork set userId = ?"
        params.push(value.userId);
        if (value.name != undefined) {
            sql += ",`name`=?";
            params.push(value.name);
        }
        if (value.trustedANId != undefined) {
            sql += ",`trustedANId`=?";
            params.push(value.trustedANId);
        }
        if (value.token != undefined) {
            sql += ",`token`=?";
            params.push(value.token);
        }
        if (value.account != undefined) {
            sql += ",`userName`=?";
            params.push(value.account);
        }
        if (value.password != undefined) {
            sql += ",`password`=?";
            params.push(value.password);
        }
        sql += " where `userId`= ?  and `id`= ? ";
        params.push(value.userId);
        params.push(value.id);
        await common.query(sql, params, connection);
        delete value.userId;
        return res.json({
            status: 1,
            message: 'success',
            data: value
        });
    } catch (e) {
        next(e);
    } finally {
        if (connection) {
            connection.release();
        }
    }
});



/**
 * @api {delete} /api/third/affiliates/:id  删除ThirdPartyAffiliateNetwork
 * @apiName  删除ThirdPartyAffiliateNetwork
 * @apiGroup ThirdParty
 * 
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "status": 1,
 *       "message": "success"
 *     }
 *
 */
router.delete('/api/third/affiliates/:id', async function (req, res, next) {
    let schema = Joi.object().keys({
        id: Joi.number().required(),
        userId: Joi.number().required()
    });
    let connection;
    try {
        req.query.id = req.params.id;
        req.query.userId = req.parent.id;
        let value = await common.validate(req.query, schema);
        connection = await common.getConnection();
        let sql = `update ThirdPartyAffiliateNetwork set deleted=? where id=? and userId= ?`;
        await common.query(sql, [1, value.id, value.userId], connection);
        return res.json({
            status: 1,
            message: 'success'
        });
    } catch (e) {
        next(e);
    } finally {
        if (connection) {
            connection.release();
        }
    }
});


/**
 * @api {post} /api/third/tasks  新建OfferSyncTask
 * @apiName   新建OfferSyncTask
 * @apiGroup ThirdParty
 * 
 * @apiParam {Number} thirdPartyANId 
 * 
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "status": 1,
 *       "message": "success",
 *       "data":{
 *           id:1,
 *           thirdPartyANId:2
 *        }
 *     }
 *
 */
router.post('/api/third/tasks', async function (req, res, next) {
    let schema = Joi.object().keys({
        thirdPartyANId: Joi.number().required(),
        userId: Joi.number().required()
    });
    let connection;
    try {
        req.body.userId = req.parent.id;
        let value = await common.validate(req.body, schema);
        connection = await common.getConnection();
        //check exist one task is running 
        let [{ total: count }] = await common.query('select count(*) as total from OfferSyncTask where thirdPartyANId=? and userId =? and deleted=0 and status in (?)', [value.thirdPartyANId, value.userId, [0, 1]], connection);
        if (count > 0) {
            let err = new Error("one task is running");
            err.status = 200;
            throw err;
        }
        let sql = `insert into OfferSyncTask (userId,thirdPartyANId,status,createdAt) values(?,?,?,?)`
        let { insertId: id } = await common.query(sql, [value.userId, value.thirdPartyANId, 0, moment().unix()], connection);
        value.id = id;
        delete value.userId;
        return res.json({
            status: 1,
            message: 'success',
            data: value
        });

    } catch (e) {
        next(e);
    } finally {
        if (connection) {
            connection.release();
        }
    }
});


/**
 * @api {get} /api/third/tasks  获取OfferSyncTask 
 * @apiName   获取OfferSyncTask  
 * @apiGroup ThirdParty
 *
 * @apiParam {Number} thirdPartyANId
 *  
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "status": 1,
 *       "message": "success",
 *       "data":{tasks:[]}  //0:新建;1:运行中;2:出错;3:完成
 *     }
 *
 */
router.get('/api/third/tasks', async function (req, res, next) {
    let schema = Joi.object().keys({
        thirdPartyANId: Joi.number().required(),
        userId: Joi.number().required()
    });
    let connection;
    try {
        req.query.userId = req.parent.id;
        let value = await common.validate(req.query, schema);
        connection = await common.getConnection();
        let sql = `select id,status,message from OfferSyncTask where thirdPartyANId=? and userId=? and deleted=0 order by createdAt DESC limit 0,1`;
        let result = await common.query(sql, [value.thirdPartyANId, value.userId], connection);

        return res.json({
            status: 1,
            message: 'success',
            data: result
        });

    } catch (e) {
        next(e);
    } finally {
        if (connection) {
            connection.release();
        }
    }
});




/**
 * @api {get} /api/third/offers/:id  获取第三方offer detail
 * @apiName   获取第三方offer detail
 * @apiGroup ThirdParty
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "status": 1,
 *       "message": "success",
 *       "data":{}
 *     }
 *
 */
router.get('/api/third/offers/:id', async function (req, res, next) {
    let schema = Joi.object().keys({
        id: Joi.number().required(),
        userId: Joi.number().required()
    });
    let connection;
    try {
        req.query.id = req.params.id;
        req.query.userId = req.parent.id;
        let value = await common.validate(req.query, schema);
        connection = await common.getConnection();
        let sql = `select detail from ThirdPartyOffer where userId=? and id=?`;
        let [{ detail: resultString }] = await common.query(sql, [value.userId, value.id], connection);
        return res.json({
            status: 1,
            message: 'success',
            data: resultString ? JSON.parse(resultString) : {}
        });

    } catch (e) {
        next(e);
    } finally {
        if (connection) {
            connection.release();
        }
    }
});

/**
 * @api {get} /api/third/offers  load thirdparty offer list
 * @apiName  load thirdparty offer list
 * @apiGroup ThirdParty
 * 
 * @apiParam {Number} taskId 
 * @apiParam {Number} page
 * @apiParam {Number} limit
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "status": 1,
 *       "message": "success",
 *       "data":{
 *          offers:[
           {        
            status:1,         //   '1:active;2:pauseded',
            offerId:"189378",   //'第三方的OfferId',
            name:"",
            previewLink:"",
            trackingLink:"" ,
            countryCode:""   //'USA,SGP,CHN,IDA,IND',
            payoutMode:1, //   '0:Auto;1:Manual',
            payoutValue :0.23,
            category:"",
            carrier:"",
            platform:""
 *          }
 *     }
 * ]}
 *
 */
router.get('/api/third/offers', async function (req, res, next) {
    let schema = Joi.object().keys({
        taskId: Joi.number().required(),
        userId: Joi.number().required(),
        page: Joi.number().required(),
        limit: Joi.number().required()
    });
    let connection;
    try {
        req.query.userId = req.parent.id;
        let value = await common.validate(req.query, schema);
        let { limit, page } = value;
        // limit
        limit = parseInt(limit)
        if (!limit || limit < 0)
            limit = 1000
        value.limit = limit
        // offset
        page = parseInt(page)
        let offset = (page - 1) * limit;
        if (!offset)
            offset = 0
        value.offset = offset;
        let sql = `select id,status,offerId,name,previewLink,trackingLink,countryCode,payoutMode,payoutValue,category,carrier,platform from ThirdPartyOffer where userId=? and taskId=?`;

        let countSql = "select COUNT(*) as `total` from ((" + sql + ") as T)";

        sql += ` limit ?,?`
        connection = await common.getConnection();
        let [result, totalResult] = await Promise.all([common.query(sql, [value.userId, value.taskId, value.offset, value.limit], connection), common.query(countSql, [value.userId, value.taskId], connection)]);
        return res.json({
            status: 1,
            message: 'success',
            data: {
                totalRows: totalResult[0].total,
                rows: result
            }
        });

    } catch (e) {
        next(e);
    } finally {
        if (connection) {
            connection.release();
        }
    }
});


/**
 * @api {post} /api/third/offersImport  将第三方offer导入
 * @apiName   将第三方offer导入
 * @apiGroup ThirdParty
 * 
 * @apiParam {Array} offers
 * @apiParam {Number} affiliateId
 * @apiParam {Number} taskId
 * @apiParam {String} affiliateName
 * @apiParam {Number} action  1.import直接入库  2.覆盖
 * 
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "status": 1,
 *       "message": "success",
 *       "data":{}
 *     }
 *
 */
router.post('/api/third/offersImport', async function (req, res, next) {
    let schema = Joi.object().keys({
        affiliateId: Joi.number().required(),
        taskId: Joi.number(),
        offers: Joi.array(),
        affiliateName: Joi.string().required(),
        userId: Joi.number().required(),
        idText: Joi.string().required(),
        action: Joi.number().required()
    }).or('offers', 'taskId');
    let connection;
    try {
        req.body.userId = req.parent.id;
        req.body.idText = req.parent.idText;

        let value = await common.validate(req.body, schema);
        connection = await common.getConnection();

        let insertOffers;
        let existOffers = common.query('select id,thirdPartyOfferId from Offer where userId=? and AffiliateNetworkId = ?', [value.userId, value.affiliateId], connection);
        if (value.offers && value.offers.length) {
            insertOffers = common.query("select id,offerId,name,trackingLink,countryCode,payoutMode,payoutValue from ThirdPartyOffer where userId=? and id in (?)", [value.userId, value.offers], connection);
        } else if (value.taskId) {
            insertOffers = common.query('select id,offerId,name,trackingLink,countryCode,payoutMode,payoutValue from ThirdPartyOffer where userId=? and taskId=?', [value.userId, value.taskId], connection);
        }

        let UpdateOffers = []; //需要更新的offer
        let InsertOffers = [];

        let [exists, inserts] = await Promise.all([existOffers, insertOffers]);
        if (exists.length) {
            UpdateOffers = _.intersectionWith(inserts, exists, function (value, other) {
                if (value.offerId == other.thirdPartyOfferId) {
                    return true
                }
                return false;
            });

            if (UpdateOffers.length) {
                InsertOffers = _.differenceWith(inserts, UpdateOffers, _.isEqual);
            }
        } else {
            InsertOffers = inserts;
        }

        const INSERTLIMIT = 500;
        let sum = 0;

        let offerContainer = []; //二维数组 子数组的长度过定为最大并发数
        //id,status,offerId,name,previewLink,trackingLink,countryCode,payoutMode,payoutValue,category,carrier,platform
        let subSlice = [];
        for (let index = 0; index < InsertOffers.length; index++) {
            let nameCountry = InsertOffers[index].countryCode ? (InsertOffers[index].countryCode.indexOf(',') > 0 ? "Multi" : InsertOffers[index].countryCode) : "";
            let offerModel = [
                value.userId,
                `${value.affiliateName} - ${nameCountry} - ${InsertOffers[index].name}`,
                uuidV4(),
                InsertOffers[index].trackingLink,
                InsertOffers[index].countryCode,
                InsertOffers[index].offerId,
                value.affiliateId,
                value.affiliateName,
                setting.newbidder.httpPix + value.idText + "." + setting.newbidder.mainDomain + setting.newbidder.postBackRouter,
                InsertOffers[index].payoutMode,
                InsertOffers[index].payoutValue]

            sum++;
            subSlice.push(offerModel);
            if ((sum == InsertOffers.length && InsertOffers.length < INSERTLIMIT) || (sum == INSERTLIMIT)) {
                offerContainer.push(subSlice);
                subSlice = [];
                sum = 0;
            }
        }

        //Insert 
        let sql = `insert into Offer (userId,name,hash,url,country,thirdPartyOfferId,AffiliateNetworkId,AffiliateNetworkName,postbackUrl,payoutMode,payoutValue) values ?`;
        for (let i = 0; i < offerContainer.length; i++) {
            await common.query(sql, [offerContainer[i]], connection);
        }


        //action 是2 时才执行覆盖
        if (value.action == 2) {
            //Update 
            let total = 0;
            let updateSQL = "update Offer set userId=?,name=?,hash=?,url=?,country=?,thirdPartyOfferId=?,AffiliateNetworkId=?,AffiliateNetworkName=?,postbackUrl=?,payoutMode=?,payoutValue=? where thirdPartyOfferId= ? and AffiliateNetworkId= ? and userId =?";
            let promiseSlice = [];
            let updateOfferContainer = [];
            for (let index = 0; index < UpdateOffers.length; index++) {
                let nameCountry = UpdateOffers[index].countryCode ? (UpdateOffers[index].countryCode.indexOf(',') > 0 ? "Multi" : UpdateOffers[index].countryCode) : "";
                let offerModel = [
                    value.userId,
                    `${value.affiliateName} - ${nameCountry} - ${UpdateOffers[index].name}`,
                    uuidV4(),
                    UpdateOffers[index].trackingLink,
                    UpdateOffers[index].countryCode,
                    UpdateOffers[index].offerId,
                    value.affiliateId,
                    value.affiliateName,
                    setting.newbidder.httpPix + value.idText + "." + setting.newbidder.mainDomain + setting.newbidder.postBackRouter,
                    UpdateOffers[index].payoutMode,
                    UpdateOffers[index].payoutValue, UpdateOffers[index].offerId, value.affiliateId, value.userId]
                promiseSlice.push(common.query(updateSQL, offerModel, connection));
                total++;
                if ((total == UpdateOffers.length && UpdateOffers.length < INSERTLIMIT) || (total == INSERTLIMIT)) {
                    updateOfferContainer.push(promiseSlice);
                    promiseSlice = [];
                    total = 0;
                }
            }
            if (updateOfferContainer.length) {
                for (let index = 0; index < updateOfferContainer.length; index++) {
                    await Promise.all(updateOfferContainer[index])
                }

            }
        }

        //如果存在冲突的offer  将ids返回
        if (UpdateOffers.length) {
            let returns=[];
            for(let index=0;index<UpdateOffers.length;index++){

            }
            return res.json({
                status: 0,
                message: 'some offers exist',
                data:{
                    offers:[]
                }
            });
        }



        return res.json({
            status: 1,
            message: 'success'
        });

    } catch (e) {
        next(e);
    } finally {
        if (connection) {
            connection.release();
        }
    }
});


module.exports = router;