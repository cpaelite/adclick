var express = require('express');
var router = express.Router();
var Joi = require('joi');
var common = require('./common');
var md5 = require('md5');


/**
 * @api {get} /api/profile  
 * @apiName  
 * @apiGroup User
 *
 *
 * @apiSuccessExample {json} Success-Response:
 *   {
 *    status: 1,
 *    message: 'success',
 *    data:{
 *        idText:"",
          firstname: 'test',
          lastname:'test',
          companyname: 'zheng',
          tel: '13120663670',
          timezone:'+08:00',
          homescreen:'dashboard',  // or campaignList
          referralToken:"",
          status:0  //0:New;1:运行中;2:已过期
    }
 *
 *   }
 *
 */
router.get('/api/profile', async function (req, res, next) {
    var schema = Joi.object().keys({
        userId: Joi.number().required()
    });
    req.query.userId = req.userId;
    let connection;
    try {
        let value = await common.validate(req.query, schema);
        connection = await common.getConnection();
        let result = await query("select `idText`,`firstname`,`lastname`,`status`,`timezone`,`setting`,`referralToken` from User where  `id`= ?"  , [value.userId],connection);

        let responseData = {};
        if (result.length) {
            responseData.idText = result[0].idText;
            responseData.firstname = result[0].firstname;
            responseData.lastname = result[0].lastname;
            responseData.status = result[0].status;
            responseData.timezone = result[0].timezone;
            responseData.referralToken = result[0].referralToken;
            if (result[0].setting) {
                let settingJSON = JSON.parse(result[0].setting);
                responseData.companyname = settingJSON.companyname ? settingJSON.companyname : "";
                responseData.tel = settingJSON.tel ? settingJSON.tel : "";
                responseData.homescreen = settingJSON.homescreen ? settingJSON.homescreen : "";
            } else {
                responseData.companyname = "";
                responseData.tel = "";
                responseData.homescreen = "dashboard";
            }
        }
        res.json({
            status: 1,
            message: 'succes',
            data: responseData
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
 * @api {post} /api/profile  
 * @apiName  
 * @apiGroup User
 *
 * @apiParam {String} firstname
 * @apiParam {String} lastname
 * @apiParam {String} [companyname]
 * @apiParam {String} [tel]
 * @apiParam {String} timezone
 * @apiParam {String} homescreen
 *
 * @apiSuccessExample {json} Success-Response:
 *   {
 *    status: 1,
 *    message: 'success',
 *    data:{
          firstname: 'test',
          lastname:'test',
          companyname: 'zheng',
          tel: "13120663670",
          timezone:'+08:00',
          homescreen:'dashboard',  // or campaignList
     }
 *
 *  }
 *
 */
router.post('/api/profile', async function (req, res, next) {
    var schema = Joi.object().keys({
        userId: Joi.number().required(),
        firstname: Joi.string().required(),
        lastname: Joi.string().required(),
        companyname: Joi.string().optional(),
        tel: Joi.string().optional(),
        timezone: Joi.string().required(),
        homescreen: Joi.string().required()
    });
    req.body.userId = req.userId;
    let connection;
    try {
        let value = await common.validate(req.body, schema);
        connection = await common.getConnection();
        let valueCopy={};
        Object.assign(valueCopy,value);
        let sql = 'update User set ';
        if (valueCopy.firstname) {
            sql += "`firstname`='" + valueCopy.firstname + "'";
        }
        if (valueCopy.lastname) {
            sql += ",`lastname`='" + valueCopy.lastname + "'";
        }
        if (valueCopy.timezone) {
            sql += ",`timezone`='" + valueCopy.timezone + "'";
        }

        delete valueCopy.userId;

        sql += ",`setting`='" + JSON.stringify(valueCopy) +"'";

        sql += " where `id`= ? ";
        await query(sql,[value.userId], connection);

        res.json({
            "status": 1,
            "message": "success",
            "data": valueCopy
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
 * @api {post} /api/password   用户修改密码
 * @apiName  用户修改密码
 * @apiGroup User
 *
 * @apiParam {String} oldpassword   
 * @apiParam {String} newpassword
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "status": 1,
 *       "message": "success"
 *     }
 * 
 * @apiErrorExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "status": 0,
 *       "message": "old password error"
 *     }
 *
 */
router.post('/api/password', async function (req, res, next) {
    var schema = Joi.object().keys({
        userId: Joi.number().required(),
        oldpassword: Joi.string().required().trim(),
        newpassword: Joi.string().required().trim()
    });
    req.body.userId = req.userId;
    let connection;

    try {
        let value = await common.validate(req.body, schema);
        connection = await common.getConnection();
        let result = await query("select `password` from User where `id`= ? " , [value.userId], connection);
        let message;
        if (result && result[0]) {
            if (md5(value.oldpassword) == result[0].password) {
                await query("update User set `password`= ? where `id`= ? " ,[md5(value.newpassword),value.userId], connection);
                message = "success";
            } else {
                message = "password error";
            }
        } else {
            message = "account error";
        }
        res.json({
            status: 1,
            message: message
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
 * @api {post} /api/email   用户修改邮箱
 * @apiName   用户修改邮箱
 * @apiGroup User
 *
 * @apiParam {String} password
 * @apiParam {String} email
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "status": 1,
 *       "message": "success"
 *     }
 * 
 * @apiErrorExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "status": 0,
 *       "message": "password error" // email exists
 *     }
 *
 */
router.post('/api/email', async function (req, res, next) {
    var schema = Joi.object().keys({
        userId: Joi.number().required(),
        email: Joi.string().required(),
        password: Joi.string().required()
    });
    req.body.userId = req.userId;
    let connection;
    try {
        let value = await common.validate(req.body, schema);
        connection = await common.getConnection();
        //check email 是否存在
        let UserResult=await query("select id from User where `email`= ? ",[value.email],connection);
        if (UserResult.length >0 ) throw new Error("email exists");

        let result = await query("select `password` from User where `id`= ? " ,[value.userId], connection);
        let message;
        if (result && result[0]) {
            if (md5(value.password) == result[0].password) {
                await query("update User set `email`= ?  where `id`= ? " ,[value.email,value.userId], connection);
                message = "success";
            } else {
                message = "password error";
            }
        } else {
            message = "account error";
        }
        res.json({
            status: 1,
            message: message
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
 * @api {get} /api/referrals   用户推广收益
 * @apiName  用户推广收益
 * @apiGroup User
 * 
 * @apiParam {Number} page
 * @apiParam {Number} limit
 * @apiParam {String} sort  "-name"
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "status": 1,
 *       "message": "success",
 *       "data":{
 *           referrals:[
 *           {"referredUserId":,
 *           "acquired":"",
 *            "status":"New",
 *            "lastactivity":"2017-02-17 00:00",
 *            "recentCommission":"",
 *            "totalCommission":""}],
 *          "totals":{count:2,"lastMonthCommissions":"","lifeTimeCommissions":""}]
 *        }
 *     }
 *
 */
router.get('/api/referrals', async function (req, res, next) {
       var schema = Joi.object().keys({
        userId: Joi.number().required(),
        page:Joi.number().required().min(1),
        limit:Joi.number().required().min(1),
        sort:Joi.string().required()
    });
    req.query.userId = req.userId;
    let connection;
    try {
        let value = await common.validate(req.query, schema);
        connection = await common.getConnection();
        let {
            limit,
            page,
            sort,
            userId
        } = value;
        let dir ="asc";
        limit = parseInt(limit);
        page = parseInt(page);
        let offset = (page - 1) * limit;
        if(sort.indexOf('-')>=0){
           dir="desc";
           sort = sort.replace(new RegExp(/-/g), '');
        }
        let sql = ""
        res.json({
            status: 1,
            message: 'succes',
            data: responseData
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
 * {
  "id" : "be0500b7-0786-4b23-80e8-bb4d03ca868c",
  "planCode" : "PRO",
  "status" : "READY",
  "activeSubscription" : {
    "startTime" : "2017-01-22T07:11:33.078",
    "endTime" : "2017-02-22T07:11:33.078",
    "plan" : {
      "id" : "880c7aee-c661-4812-90d4-36b2c576a946",
      "code" : "PRO",
      "name" : "Pro",
      "price" : 99,
      "billingCycle" : "P1M",
      "includedEvents" : 1000000,
      "costPerEvent" : 0.00004,
      "dataRetentionDays" : 190,
      "maximumUserAccounts" : 0,
      "customDomains" : 3
    },
    "discountedPrice" : 74,
    "discount" : {
      "code" : "5d1cd608-3e35-412b-899b-9e2de13c6c0a",
      "percentOff" : 25,
      "expirationInstant" : "2017-04-01T00:00:00Z"
    },
    "statistics" : {
      "from" : "2017-01-22T07:00",
      "to" : "2017-02-08T11:00",
      "visits" : 1,
      "clicks" : 0,
      "conversions" : 0,
      "freeVisits" : 0,
      "freeClicks" : 0,
      "freeConversions" : 0,
      "totalEvents" : 1,
      "freeEvents" : 0,
      "billedEvents" : 1
    }
  }
}
 */
router.get('/api/user/billing', function (req, res, next) {

});

// {
//   "internalDomains" : [ {
//     "address" : "9cmzk.voluumtrk2.com",
//     "mainDomain" : false
//   }, {
//     "address" : "9cmzk.voluumtrk.com",
//     "mainDomain" : false
//   }, {
//     "address" : "9cmzk.trackvoluum.com",
//     "mainDomain" : false
//   } ],
//   "customDomains" : [ {
//     "address" : "www.keepin.tv",
//     "mainDomain" : true
//   } ]
// }

/**
 * @api {get} /api/user/referrals   用户推广收益
 * @apiName  用户推广收益
 * @apiGroup Setting
 * 
 * @apiParam {Number} page
 * @apiParam {Number} limit
 * @apiParam {sort} string
 * @
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "status": 1,
 *       "message": "success",
 *       "data":{
 *           referrals:[{"referredUserId":,
 *           "acquired":"",
 *           "status":,
 *            "recentCommission":"",
 *            "totalCommission":""}],
 *          "totals":{count:2,"lastMonthCommissions":"","lifeTimeCommissions":""}
 *        }
 *     }
 *
 */
router.get('/api/user/domains', function (req, res, next) {

});


function query(sql,params, connection) {
    return new Promise(function (resolve, reject) {
        connection.query(sql, params,function (err, result) {
            if (err) {
                reject(err)
            }
            resolve(result);
        })
    })
}


module.exports = router;

