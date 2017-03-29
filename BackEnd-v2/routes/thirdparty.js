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
        let key = "insertId";
        let { [key]: id } = await common.query(sql, params, connection);
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
        // affiliateId: Joi.number().required(),
        // userId: Joi.number().required(),
        // name: Joi.string().required(),
        // token: Joi.string().optional(),
        // account: Joi.string().optional(),
        // password: Joi.string().optional()
    }).or('token', 'account').with('account', 'password');
    let connection;
    try {
        let value = await common.validate();
        connection = await common.getConnection();

        return res.json();

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
    //TODO 验证可以新建几个
    let schema = Joi.object().keys({
        // affiliateId: Joi.number().required(),
        // userId: Joi.number().required(),
        // name: Joi.string().required(),
        // token: Joi.string().optional(),
        // account: Joi.string().optional(),
        // password: Joi.string().optional()
    }).or('token', 'account').with('account', 'password');
    let connection;
    try {
        let value = await common.validate();
        connection = await common.getConnection();

        return res.json();

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
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "status": 1,
 *       "message": "success"
 *     }
 *
 */
router.post('/api/third/tasks', async function (req, res, next) {
    //TODO 验证可以新建几个
    let schema = Joi.object().keys({
        // affiliateId: Joi.number().required(),
        // userId: Joi.number().required(),
        // name: Joi.string().required(),
        // token: Joi.string().optional(),
        // account: Joi.string().optional(),
        // password: Joi.string().optional()
    }).or('token', 'account').with('account', 'password');
    let connection;
    try {
        let value = await common.validate();
        connection = await common.getConnection();

        return res.json();

    } catch (e) {
        next(e);
    } finally {
        if (connection) {
            connection.release();
        }
    }
});

/**
 * @api {get} /api/third/tasks/:id  获取OfferSyncTask状态
 * @apiName   获取OfferSyncTask状态
 * @apiGroup ThirdParty
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "status": 1,
 *       "message": "success",
 *       "data":{progress:1,error:""} //0:新建;1:运行中;2:出错;3:完成
 *     }
 *
 */
router.get('/api/third/tasks/:id', async function (req, res, next) {
    let schema = Joi.object().keys({
        // affiliateId: Joi.number().required(),
        // userId: Joi.number().required(),
        // name: Joi.string().required(),
        // token: Joi.string().optional(),
        // account: Joi.string().optional(),
        // password: Joi.string().optional()
    }).or('token', 'account').with('account', 'password');
    let connection;
    try {
        let value = await common.validate();
        connection = await common.getConnection();

        return res.json();

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
        // affiliateId: Joi.number().required(),
        // userId: Joi.number().required(),
        // name: Joi.string().required(),
        // token: Joi.string().optional(),
        // account: Joi.string().optional(),
        // password: Joi.string().optional()
    }).or('token', 'account').with('account', 'password');
    let connection;
    try {
        let value = await common.validate();
        connection = await common.getConnection();

        return res.json();

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
 *
 */
router.get('/api/third/offers', async function (req, res, next) {
    let schema = Joi.object().keys({
        // affiliateId: Joi.number().required(),
        // userId: Joi.number().required(),
        // name: Joi.string().required(),
        // token: Joi.string().optional(),
        // account: Joi.string().optional(),
        // password: Joi.string().optional()
    }).or('token', 'account').with('account', 'password');
    let connection;
    try {
        let value = await common.validate();
        connection = await common.getConnection();

        return res.json();

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
 * @apiParam {Array} ids
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
        // affiliateId: Joi.number().required(),
        // userId: Joi.number().required(),
        // name: Joi.string().required(),
        // token: Joi.string().optional(),
        // account: Joi.string().optional(),
        // password: Joi.string().optional()
    }).or('token', 'account').with('account', 'password');
    let connection;
    try {
        let value = await common.validate();
        connection = await common.getConnection();

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