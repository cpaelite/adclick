// package Description
// 1.token 或者user/password 拉取offers
// 2.将第三方offer 导入newbidder

var express = require('express');
var router = express.Router();
var Joi = require('joi');
var common = require('./common');
var moment = require('moment');

/**
 * @api {post} /api/third/affiliates  新建ThirdPartyAffiliatNetwork
 * @apiName  新建ThirdPartyAffiliatNetwork
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
        let sql = `insert into ThirdPartyAffiliatNetwork (userId,trustedANId,name,token,userName,password,createdAt) values (?,?,?,?,?,?,?)`;
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
 * @api {get} /api/third/affiliates/:id  获取ThirdPartyAffiliatNetwork detail
 * @apiName  获取ThirdPartyAffiliatNetwork detail
 * @apiGroup ThirdParty
 * 
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "status": 1,
 *       "message": "success",
 *       "data":{name:"",affiliateId:1,token:"",account:"",password:""}
 *     }
 *
 */
router.get('/api/third/affiliates/:id', async function (req, res, next) {
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
        let sql = `select name,token,userName as account,password,trustedANId as affiliateId where id = ? and userId = ?`;
        let [result] = await common.query(sql, [value.id, value.userId], connection);
        return res.json({
            status: 1,
            message: 'success',
            data: result ? result : {}
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
 * @api {delete} /api/third/affiliates/:id  删除ThirdPartyAffiliatNetwork
 * @apiName  删除ThirdPartyAffiliatNetwork
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
        let sql = `update ThirdPartyAffiliatNetwork set deleted=? where id=? and userId= ?`;
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
 * @api {get} /api/third/tasks  获取OfferSyncTask id
 * @apiName   获取OfferSyncTask id
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
        let sql = `select id,status,message from OfferSyncTask where thirdPartyANId=? and userId=? and deleted=0`;
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
        let sql = `select id,status,offerId,name,previewLink,trackingLink,countryCode,payoutMode,payoutValue,category,carrier,platform from ThirdPartyOffer where userId=? and taskId=? limit ?,?`;
        connection = await common.getConnection();
        let result = await common.query(sql, [value.userId, value.taskId, value.offset, value.limit], connection);

        return res.json({
            status: 1,
            message: 'success',
            data: {
                offers: result
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
        userId: Joi.number().required(),
        offers: Joi.array().min(1).required()       
    });
    let connection;
    try {
        req.body.userId= req.parent.id;
        let value = await common.validate(req.body,schema);
        connection = await common.getConnection();
        let sql =`insert into Offer set ?`;
        await common.query(sql,[],connection);

        return res.json();

    } catch (e) {
        next(e);
    } finally {
        if (connection) {
            connection.release();
        }
    }
});


module.exports = router;