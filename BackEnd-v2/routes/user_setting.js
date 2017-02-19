var express = require('express');
var router = express.Router();
var Joi = require('joi');
var common = require('./common');
var md5 = require('md5');
var _ = require('lodash');
var dns = require("dns");
var setting = require('../config/setting');
var _ = require('lodash');

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
          email:"",
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
        let result = await query("select `idText`,`firstname`,`lastname`,`email`,`status`,`timezone`,`setting`,`referralToken` from User where  `id`= ?", [value.userId], connection);

        let responseData = {};
        if (result.length) {
            responseData.idText = result[0].idText;
            responseData.firstname = result[0].firstname;
            responseData.lastname = result[0].lastname;
            responseData.status = result[0].status;
            responseData.timezone = result[0].timezone;
            responseData.referralToken = result[0].referralToken;
            responseData.email = result[0].email;
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
        tel: Joi.string().optional().empty(""),
        timezone: Joi.string().required(),
        homescreen: Joi.string().required()
    });
    req.body.userId = req.userId;
    let connection;
    try {
        let value = await common.validate(req.body, schema);
        connection = await common.getConnection();
        let valueCopy = {};
        Object.assign(valueCopy, value);
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

        sql += ",`setting`='" + JSON.stringify(valueCopy) + "'";

        sql += " where `id`= ? ";
        await query(sql, [value.userId], connection);

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
        let result = await query("select `password` from User where `id`= ? ", [value.userId], connection);
        let message;
        if (result && result[0]) {
            if (md5(value.oldpassword) == result[0].password) {
                await query("update User set `password`= ? where `id`= ? ", [md5(value.newpassword), value.userId], connection);
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
        let UserResult = await query("select id from User where `email`= ? ", [value.email], connection);
        if (UserResult.length > 0) throw new Error("email exists");

        let result = await query("select `password` from User where `id`= ? ", [value.userId], connection);


        if (result && result[0]) {
            if (md5(value.password) == result[0].password) {
                await query("update User set `email`= ?  where `id`= ? ", [value.email, value.userId], connection);

            } else {
                throw new Error("password error");
            }
        } else {
            throw new Error("account error");
        }
        res.json({
            status: 1,
            message: "success"
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
 *           "acquired":"17-02-2017 00:00",
 *            "status":"New",
 *            "lastactivity":"17-02-2017 00:00",
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
        page: Joi.number().required().min(1),
        limit: Joi.number().required().min(1),
        sort: Joi.string().required()
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
        let dir = "asc";
        limit = parseInt(limit);
        page = parseInt(page);
        let offset = (page - 1) * limit;
        if (sort.indexOf('-') >= 0) {
            dir = "desc";
            sort = sort.replace(new RegExp(/-/g), '');
        }
        let listSql = "select  user.`idText` as referredUserId ,FROM_UNIXTIME(log.`acquired`,'%d-%m-%Y %H:%i') as acquired," +
            "(case log.`status` when 0 then \"New\" when 1 then \"Activated\"  END) as status," +
            "FROM_UNIXTIME(log.`lastActivity`,'%d-%m-%Y %H:%i') as lastactivity," +
            "log.`recentCommission` as recentCommission,log.`totalCommission` as totalCommission " +
            "from UserReferralLog log  inner join User  user on user.`id` = log.`referredUserId` where log.`userId`=" + userId + " order by " + sort + " " + dir;

        let countsql = "select COUNT(*) as `count`,sum(recentCommission) as lastMonthCommissions,sum(totalCommission) as lifeTimeCommissions from ((" + listSql + ") as T)";

        let result = await Promise.all([query(listSql, [], connection), query(countsql, [], connection)]);
        res.json({
            status: 1,
            message: 'succes',
            data: {
                referrals: result[0],
                totals: result[1].length ? result[1][0] : { count: 0, lastMonthCommissions: "", lifeTimeCommissions: "" }
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


/**
 * @api {get} /api/billing   用户套餐使用状态
 * @apiName  用户套餐使用状态
 * @apiGroup User
 * 
 * @apiParam {String} timezone  "+08:00"
 * 
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "status": 1,
 *       "message": "success",
 *       "data":{  
            "activeSubscription" : {
                "startTime" : "19-01-2017",
                "endTime" : "19-02-2017",
                "plan" : {
                    "id" : 1,
                    "name" : "Agency",
                    "price" : 399,                      //normalPrice  
                    "eventsLimit" : 10000000,
                    "overageCPM" : 0.000036,
                    "retentionLimit" : 370,
                    "userLimit" : 2,
                    "domainLimit" : 5                 
                },
                "statistics" : {     
                    "overageEvents":1,
                    "remainingEvents":1,
                    "overageCost":0.999,
                    "totalEvents" : 2,
                    "billedEvents" : 2
                }
              }
            } 
 *     }
 *
 */

router.get('/api/billing', async function (req, res, next) {
    var schema = Joi.object().keys({
        userId: Joi.number().required(),
        timezone: Joi.string().required()
    });
    req.query.userId = req.userId;
    let connection;
    try {
        let value = await common.validate(req.query, schema);
        connection = await common.getConnection();
        let compled = _.template(`select  DATE_FORMAT(CONVERT_TZ(FROM_UNIXTIME(bill.\`planStart\`,'%Y-%m-%d %H:%i:%s'),'+00:00','<%= tz %>'),'%d-%m-%Y %H:%i')  as startTime,   
        DATE_FORMAT(CONVERT_TZ(FROM_UNIXTIME(bill.\`planEnd\`,'%Y-%m-%d %H:%i:%s'),'+00:00','<%= tz %>'),'%d-%m-%Y %H:%i')   as endTime,
        plan.\`id\` as id , plan.\`name\` as name, plan.\`normalPrice\` as price,plan.\`eventsLimit\` as eventsLimit,plan.\`retentionLimit\` as  retentionLimit,
        plan.\`userLimit\` as   userLimit,plan.\`domainLimit\` as domainLimit,(plan.\`overageCPM\`/ 1000000) as overageCPM, bill.\`overageEvents\` as overageEvents,
        (plan.\`overageCPM\`/1000 * bill.\`overageEvents\`) as overageCost ,bill.\`totalEvents\` as totalEvents,bill.\`billedEvents\` as billedEvents,(plan.\`eventsLimit\` - bill.\`billedEvents\` ) as remainingEvents  
        from UserBilling bill  inner join TemplatePlan plan on bill.\`planId\`= plan.\`id\` where bill.\`expired\` = 0 and bill.\`userId\`=<%=userId%>`);
        let sql = compled({
            tz: value.timezone,
            userId: value.userId
        });
        let results = await query(sql, [], connection);
        let val = results.length ? results[0] : null;
        let result = {
            activeSubscription: {
            }
        };
        if (val) {
            result.activeSubscription = {
                startTime: val.startTime,
                endTime: val.endTime,
                plan: {
                    id: val.id,
                    name: val.name,
                    price: val.price,
                    eventsLimit: val.eventsLimit,
                    overageCPM: val.overageCPM,
                    retentionLimit: val.retentionLimit,
                    userLimit: val.userLimit,
                    domainLimit: val.domainLimit
                },
                statistics: {
                    overageEvents: val.overageEvents,
                    overageCost: val.overageCost,
                    totalEvents: val.totalEvents,
                    billedEvents: val.billedEvents
                }
            }
        }
        res.json({
            status: 1,
            message: 'succes',
            data: result
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
 * @api {get} /api/billing   用户当前套餐 
 * @apiName  用户当前套餐 
 * @apiGroup User
 * 
 * 
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
   {status:1,message:'success', "plan" : {
                    "id" : 1,
                    "name" : "Agency",
                    "price" : 399,                      //normalPrice  
                    "eventsLimit" : 10000000,
                    "overageCPM" : 0.000036,
                    "retentionLimit" : 370,
                    "userLimit" : 2,
                    "domainLimit" : 5                 
                }}
 *
 */
router.get('/api/plan', async function (req, res, next) {
    var schema = Joi.object().keys({
        userId: Joi.number().required()
    });
    req.query.userId = req.userId;
    let connection;
    try {
        let value = await common.validate(req.query, schema);
        connection = await common.getConnection();
        let compled = _.template(`select   
        plan.\`id\` as id , plan.\`name\` as name, plan.\`normalPrice\` as price,plan.\`eventsLimit\` as eventsLimit,plan.\`retentionLimit\` as  retentionLimit,
        plan.\`userLimit\` as   userLimit,plan.\`domainLimit\` as domainLimit,(plan.\`overageCPM\`/ 1000000) as overageCPM  from UserBilling bill  inner join TemplatePlan plan on bill.\`planId\`= plan.\`id\` where bill.\`expired\` = 0 and bill.\`userId\`=<%=userId%>`);
        let sql = compled({
            userId: value.userId
        });
        let results = await query(sql, [], connection);
        let val = results.length ? results[0] : null;
        let responseData = { plan: {} };
        if (val) {
            responseData.plan = {
                id: val.id,
                name: val.name,
                price: val.price,
                eventsLimit: val.eventsLimit,
                overageCPM: val.overageCPM,
                retentionLimit: val.retentionLimit,
                userLimit: val.userLimit,
                domainLimit: val.domainLimit

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
})

/**
 * @api {get} /api/domains 获取用户domdomains
 * @apiName 获取用户domdomains
 * @apiGroup User
 *   @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
       // {
       //     status: 1,
       //     message: 'success',
       //     data: {
       //         internal: [
       //             {
       //                 address: "www.newbidder1.com",
       //                 main: false
       //             },
       //             {
       //                 address: "www.newbidder2.com",
       //                 main: true
       //             },
       //             {
       //                 address: "www.newbidder1.com",
       //                 main: false
       //             }
       //         ],
       //         custom: [
       //             {
       //                 address: "www.adbund.com",
       //                 main: false
       //             }
       //         ]
       //     }
       // }
 *
 */
router.get('/api/domains', async function (req, res, next) {
    var schema = Joi.object().keys({
        userId: Joi.number().required()
    });
    req.query.userId = req.userId;
    let connection;
    try {
        let value = await common.validate(req.query, schema);
        connection = await common.getConnection();
        let result = {
            internal: [],
            custom: []
        }
        let sql = "select `domain` as address,`main`,`customize` from UserDomain where `userId`= ? and `deleted`=0 ";
        let userDomians = await common.query(sql, [value.userId], connection);
        for (let index = 0; index < userDomians.length; index++) {
            if (userDomians[index].customize == 0) {
                result.internal.push({ address: userDomians[index].address, main: userDomians[index].main == 1 ? true : false });
            } else {
                result.custom.push({ address: userDomians[index].address, main: userDomians[index].main == 1 ? true : false });
            }
        }
        res.json({
            status: 1,
            message: 'succes',
            data: result
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
 * @api {post} /api/domains 用户修改domdomains
 * @apiName 用户修改domdomains
 * @apiGroup User
 * apiParam {Array} internal 
 * apiParam {Array} custom 
   {
       //         internal: [
       //             {
       //                 address: "www.newbidder1.com",
       //                 main: false
       //             },
       //             {
       //                 address: "www.newbidder2.com",
       //                 main: true
       //             },
       //             {
       //                 address: "www.newbidder1.com",
       //                 main: false
       //             }
       //         ],
       //         custom: [
       //             {
       //                 address: "www.adbund.com",
       //                 main: false
       //             }
       //         ]
       //     }

 *
 */
router.post('/api/domains', async function (req, res, next) {
    var schema = Joi.object().keys({
        userId: Joi.number().required(),
        internal: Joi.array().items({
            address: Joi.string().required(),
            main: Joi.boolean().required()
        }).required().length(3),
        custom: Joi.array().items({
            address: Joi.string().required(),
            main: Joi.boolean().required()
        }).required()
    });
    req.body.userId = req.userId;
    let connection;
    try {
        let insertData = [];
        let value = await common.validate(req.body, schema);
        //check params
        let passCheck = false;
        let mainDomianNumber = 0;
        for (let index = 0; index < value.internal.length; index++) {
            if (value.internal[index].main) {
                mainDomianNumber++;
            }
            insertData.push({ domain: value.internal[index].address, main: value.internal[index].main ? 1 : 0, customize: 0 });

        }
        for (let index = 0; index < value.custom.length; index++) {
            if (value.custom[index].main) {
                mainDomianNumber++;
            }
            insertData.push({ domain: value.custom[index].address, main: value.custom[index].main ? 1 : 0, customize: 1 });
        }
        if (mainDomianNumber !== 1) {
            throw new Error("please reset mian domian correctly");
        }

        connection = await common.getConnection();
        await common.query("update UserDomain set `deleted` = 1 where `userId`= ? ", [value.userId], connection);

        for (let index = 0; index < insertData.length; index++) {
            let sql = "insert into UserDomain (`domain`,`main`,`customize`,`userId`) values (?,?,?,?)";
            await common.query(sql, [insertData[index].domain, insertData[index].main, insertData[index].customize, value.userId], connection);
        }
        delete value.userId;
        res.json({
            status: 1,
            message: 'succes',
            data: value
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
 * @api /api/domains/validatecname 
 * @apiName 验证Domain Adress
 * @apiGroup User
 * 
 * @apiParam {String} adress {adress: 'www.adbund.com'}
 * 
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
         {
            status: 1,
            message: 'success',
            data: {
                domain: 'www.adbund.com',
                validateResult: "NOT_FOUND"
            }
        }
 */
router.get('/api/domains/validatecname', async function (req, res, next) {
    var schema = Joi.object().keys({
        userId: Joi.number().required(),
        idText: Joi.string().required(),
        address: Joi.string().required()
    });
    req.query.userId = req.userId;
    req.query.idText = req.idText;
    try {
        let cnames = [];
        let value = await common.validate(req.query, schema);
        cnames = await ((address) => {
            return new Promise(function (resolve, reject) {
                dns.resolveCname(address, function (err, result) {
                    if (err) {
                        reject(err);
                    }
                    resolve(result);

                });
            });
        })(value.address);

        //获取该用户系统默认domians
        let userDefaultDomains = [];
        for (let index = 0; index < setting.domains.length; index++) {
            userDefaultDomains.push(value.idText + "." + setting.domains[index].address);
        }

        let checked = false;

        for (let index = 0; index < cnames.length; index++) {
            if (_.includes(userDefaultDomains, cnames[index])) {
                checked = true;
            }
        }

        let validateResult = "NOT_FOUND";

        if (checked) {
            validateResult = "Matched"
            res.json({
                status: 1,
                message: "success",
                data: {
                    domain: value.address,
                    validateResult: validateResult
                }
            });
            return;
        }

        res.json({
            status: 0,
            message: validateResult,
            data: {
                domain: value.address,
                validateResult: validateResult
            }
        });
    } catch (e) {
        next(e);
    }

});



/**
 * @api {post} /api/blacklist   新增黑名单策略 
 * 
 * @apiGroup User 
 * @apiName 新增黑名单策略 
 * 
 * @apiParam blacklist 
 * @apapiParam enabled   
 * 
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 * {
    "status": 1, 
    "message": "success", 
    "data": {

        "blacklist": [
            {
                "id": 1, 
                "name": "test1", 
                "ipRules": [
                    {
                        "ipRangeStart": "1.1.1.1", 
                        "ipRangeEnd": "1.1.1.1"
                    }
                ], 
                "userAgentRules": [
                    {
                        "userAgent": "test1"
                    }
                ]
            }, 
            {
                "id": 2, 
                "name": "test2", 
                "ipRules": [
                    {
                        "ipRangeStart": "1.1.1.1", 
                        "ipRangeEnd": "1.1.1.1"
                    }
                ], 
                "userAgentRules": [
                    {
                        "userAgent": "test2"
                    }
                ]
            }
        ]
    }
}
 */

router.post('/api/blacklist', async function (req, res, next) {
    var schema = Joi.object().keys({
        userId: Joi.number().required(),
        idText: Joi.string().required(),
        enabled: Joi.boolean().required(),
        blacklist: Joi.array().required().items({
            name: Joi.string().required(),
            ipRules: Joi.array().required(),
            userAgentRules: Joi.array().required()
        })
    });
    req.body.userId = req.userId;
    req.body.idText = req.idText;
    let connection;
    try {
        let value = await common.validate(req.body, schema);
        connection = await common.getConnection();
        await common.query("delete from UserBotBlacklist  where `userId`= ? ", [value.userId], connection);
        for (let index = 0; index < value.blacklist.length; index++) {
            await common.query("insert into UserBotBlacklist (`userId`,`name`,`ipRange`,`userAgent`,`enabled`) values (?,?,?,?,?)", [value.userId, value.blacklist[index].name, JSON.stringify(value.blacklist[index].ipRules), JSON.stringify(value.blacklist[index].userAgentRules), value.enabled ? 1 : 0], connection);
        }

        delete value.userId;
        delete value.idText;

        res.json({
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


router.get('/api/blacklist', async function (req, res, next) {
    var schema = Joi.object().keys({
        userId: Joi.number().required(),
        idText: Joi.string().required()
    });
    req.body.userId = req.userId;
    req.body.idText = req.idText;
    let connection;
    try {
        let responseData = {
            enabled: false,
            blacklist: []
        };
        let value = await common.validate(req.body, schema);
        connection = await common.getConnection();
        let result = await common.query("select  `name`,`ipRange`,`userAgent`,`enabled` from UserBotBlacklist  where `userId`= ? and `deleted` = ? ", [value.userId, 0], connection);
        for (let index = 0; index < result.length; index++) {
            responseData.blacklist.push({
                name: result[index].name,
                ipRules: JSON.parse(result[index].ipRange),
                userAgentRules: JSON.parse(result[index].userAgent)
            });
            responseData.enabled = result[index].enabled == 1 ? true : false;
        }
        res.json({
            status: 1,
            message: 'success',
            data: responseData
        });

    } catch (e) {
        next(e);
    } finally {
        if (connection) {
            connection.release();
        }
    }

})

function query(sql, params, connection) {
    return new Promise(function (resolve, reject) {
        connection.query(sql, params, function (err, result) {
            if (err) {
                reject(err)
            }
            resolve(result);
        })
    })
}


module.exports = router;

