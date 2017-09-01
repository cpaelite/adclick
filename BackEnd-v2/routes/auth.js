var express = require('express');
var router = express.Router();
var Joi = require('joi');
var util = require('../util/index');
var log4js = require('log4js');
var log = log4js.getLogger('user');
var md5 = require('md5');
var moment = require('moment');
var common = require('./common');
var setting = require('../config/setting');

var uuidV4 = require('uuid/v4');
var emailCtrl = require('../util/email');
const _ = require('lodash');
var crypto = require('crypto');
const codeKey = '^niu1bi&#$285'; //密匙
// var trial = require('../util/billing');

/**
 * @api {post} /auth/login  登陆
 * @apiName Login
 * @apiGroup auth
 *
 * @apiParam {String} email
 * @apiParam {String} password
 *
 * @apiSuccessExample {json} Success-Response:
 *{
 * status: 1,
 *   message: 'success',
 *   data: {
 *    token: 'xxxxxx',firstname:"xxx"
 *     }
 *   }
 *
 */
router.post('/auth/login', async function(req, res, next) {
  var schema = Joi.object().keys({
    email: Joi.string().trim().email().required(),
    password: Joi.string().required()
  });
  let connection;
  try {
    let clientId;
    let value = await common.validate(req.body, schema);
    connection = await common.getConnection();

    let sql =
      "select  `id`,`idText`,`email`,`password`,`firstname`,`emailVerified`,`currentGroup` from User where `email` = ? and `deleted` =0";

    let rows = await common.query(sql, [value.email], connection);
    if (rows.length > 0) {
      if (rows[0].emailVerified == 0) {
        let err = new Error("Your email has not been verified.");
        err.code = 1010;
        throw err;
      }
      // if (rows[0].password == md5(value.password)) {
      if (rows[0].password == md5(value.password) || rows[0].password == value.password) {
        if (rows[0].currentGroup && String(rows[0].currentGroup) !== '0') {
          clientId = rows[0].currentGroup;
        } else {
          let userGroup = await common.query(
            "select `groupId` from UserGroup where `userId`= ? and `role`= 0", [
              rows[0].id
            ], connection);
          if (userGroup.length == 0) {
            throw new Error("account exception");
          }
          clientId = userGroup[0].groupId;
        }

        var expires = moment().add(200, 'days').valueOf();
        //set cookie
        res.cookie("clientId", clientId);
        res.json({
          token: util.setToken(rows[0].id, expires, rows[0].firstname,
            rows[0].idText)
        });

        //更新登录时间
        let updateSql =
          "update User set `lastLogon`= unix_timestamp(now()) where `id`= ? ";
        await common.query(updateSql, [rows[0].id], connection);

      } else {
        res.status(401).json({
          status: 1002,
          message: "account/password error"
        });
      }
    } else {
      res.status(401).json({
        status: 1001,
        message: "account/password error"
      });
    }
  } catch (e) {
    next(e);
  } finally {
    if (connection) {
      connection.release();
    }

  }
});

/**
 * @api {post} /auth/signup  注册
 * @apiName register
 * @apiGroup auth
 * @apiDescription make sure request '/account/check' for checking account exists or not first
 *
 * @apiParam {String} email
 * @apiParam {String} firstname
 * @apiParam {String} lastname
 * @apiParam {String} password
 * @apiParam {Object} json
 * @apiParam {String} [refToken]
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "status": 1,
 *       "message": "success"
 *     }
 *
 */
router.post('/auth/signup', async function(req, res, next) {
  try {
    if (req.cookies && req.cookies.refToken) {
      req.body.refToken = req.cookies.refToken;
    }
    let value = await signup(req.body, next);
    //异步发送邮件
    sendActiveEmail(req.body.email, value.idtext);
    return res.json({
      status: 1,
      message: 'success'
    });
  } catch (e) {
    next(e)
  }
});


function sendActiveEmail(email, idText) {
  let tpl = {
    TemplateId: '2535401',
    TemplateModel: {
      action_url: setting.activateRouter + "?key=" + idText
    }
  };
  //异步发送邮件
  emailCtrl.sendMail([email], tpl);
}

function sendforgetPwdEmail(email, code) {
  let tpl = {
    TemplateId: '2548324',
    TemplateModel: {
      action_url: setting.forgetPwdRouter + "?code=" + code
    }
  };
  //异步发送邮件
  emailCtrl.sendMail([email], tpl);
}


async function signup(data, next) {
  var schema = Joi.object().keys({
    email: Joi.string().trim().email().required(),
    password: Joi.string().required(),
    firstname: Joi.string().required().allow(""),
    lastname: Joi.string().required().allow(""),
    refToken: Joi.string().optional().empty(""),
    qq: Joi.string().optional().empty(""),
    skype: Joi.string().optional().empty("")
  });
  let connection;
  let beginTransaction = false;
  let value;
  try {
    value = await common.validate(data, schema);
    connection = await common.getConnection();
    //check email exists
    let UserResult = await common.query("select id from User where `email`=?", [
      value.email
    ], connection);
    if (UserResult.length > 0) throw new Error("account exists");
    //事务开始
    await common.beginTransaction(connection);
    beginTransaction = true;
    let idtext = util.getRandomString(6);
    let reftoken = util.getUUID() + "." + idtext;
    //User
    let sql =
      "insert into User(`status`,`registerts`,`firstname`,`lastname`,`email`,`password`,`idText`,`referralToken`,`json`,`contact`) values (2,unix_timestamp(now()),?,?,?,?,?,?,?,?)";
    let contact = {};
    if (value.qq) {
      contact.qq = value.qq;
    }
    if (value.skype) {
      contact.skype = value.skype;
    }
    let params = [
      value.firstname, value.lastname, value.email,
      md5(value.password), idtext, reftoken, JSON.stringify(setting.defaultSetting),
      JSON.stringify(contact)
    ];
    let result = await common.query(sql, params, connection);
    value.userId = result.insertId;
    value.idtext = idtext;
    //系统默认domains
    for (let index = 0; index < setting.domains.length; index++) {
      await common.query(
        "insert into `UserDomain`(`userId`,`domain`,`main`,`customize`,`verified`) values (?,?,?,?,1)", [
          result.insertId, setting.domains[index].address, setting.domains[
            index].mainDomain ? 1 : 0, 0
        ], connection);
    }

    //如果refToken 不为"" 说明是从推广链接过来的
    if (value.refToken) {
      let slice = value.refToken.split('.');
      let referreUserId = slice.length == 2 ? slice[1] : 0;
      if (referreUserId) {
        let USER = await common.query(
          "select `id` from User where `idText` = ?", [referreUserId],
          connection);
        if (USER.length == 0) {
          throw new Error("refToken error");
        }
        await common.query(
          "insert into `UserReferralLog` (`userId`,`referredUserId`,`acquired`,`status`,`percent`) values (?,?,unix_timestamp(now()),0,?)", [
            USER[0].id, result.insertId, 500
          ], connection);
      }
    }

    //user Group
    let configSlice = await common.query(
      "select `config` from RolePrivilege where `role`=?", [0], connection);

    let UPDATEUserGroup = common.query(
      "insert into UserGroup (`groupId`,`userId`,`role`,`createdAt`,`privilege`) values(?,?,?,unix_timestamp(now()),?)", [
        uuidV4(), result.insertId, 0, configSlice.length ? configSlice[0].config :
        "{}"
      ], connection);

    //免费plan逻辑

    let GETFREEPLAN = common.query(
      `select id,name,includedEvents,retentionLimit,domainLimit,userLimit,tsReportLimit,anOfferAPILimit,ffRuleLimit,scRuleLimit,separateIP,price,hasCommission from UserPlan where userId = ? and deleted = ?`, [
        0, 0
      ], connection);

    let [
      [freePlanMap]
    ] = await Promise.all([GETFREEPLAN, UPDATEUserGroup]);

    if (freePlanMap) {
      let UPDATEUSERBILLING = common.query(
        `insert into UserBilling (userId,planId,customPlanId,planPaymentLogId,planStart,planEnd,billedEvents,totalEvents,includedEvents,agreementId) values(?,?,?,?,?,?,?,?,?,?)`, [
          value.userId, freePlanMap.id, freePlanMap.id, 0, moment().unix(), 0,
          0, 0, freePlanMap.includedEvents, 0
        ], connection);

      let functionsString = JSON.stringify({
        retentionLimit: freePlanMap.retentionLimit,
        domainLimit: freePlanMap.domainLimit,
        userLimit: freePlanMap.userLimit,
        tsReportLimit: freePlanMap.tsReportLimit,
        anOfferAPILimit: freePlanMap.anOfferAPILimit,
        ffRuleLimit: freePlanMap.ffRuleLimit,
        scRuleLimit: freePlanMap.scRuleLimit,
        separateIP: freePlanMap.separateIP
      });

      let UPDATEUserFunctions = common.query(
        `insert UserFunctions (userId,functions) values (?,?)`, [value.userId,
          functionsString
        ], connection);

      await Promise.all([UPDATEUSERBILLING, UPDATEUserFunctions]);
    }


    await common.commit(connection);
    //redis publish
    redisPool.publish(setting.redis.channel, result.insertId + ".add.user." +
      result.insertId);

    return value;
  } catch (e) {
    if (beginTransaction) {
      await common.rollback(connection);
    }
    throw e;
  } finally {
    if (connection) {
      connection.release();
    }

  }
}



/**
 * @api {post} /account/check  检查用户是否存在
 * @apiName account check
 * @apiGroup auth
 * @apiParam {String} email
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "status": 1,
 *       "message": "success"
 *       "data":{"exists":true}
 *     }
 *
 */
router.post('/account/check', function(req, res, next) {
  var schema = Joi.object().keys({
    email: Joi.string().trim().email().required()
  });
  Joi.validate(req.body, schema, function(err, value) {
    if (err) {
      return next(err);
    }
    pool['m1'].getConnection(function(err, connection) {
      if (err) {
        err.status = 303
        return next(err);
      }
      connection.query("select id from User where `email`=?", [
        value.email
      ], function(err, result) {
        connection.release();
        if (err) {
          return next(err);
        }
        var exist = false;
        if (result.length > 0) {
          exist = true
        }
        res.json({
          status: 1,
          message: 'success',
          data: {
            exists: exist
          }
        });
      });
    });
  });
});

/**
 * @api {get} /timezones  获取所有timezones
 * @apiName  get all timezones
 * @apiGroup auth
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "status": 1,
 *       "message": "success"
 *       "data":{"timezones":[]}
 *     }
 *
 */
router.get('/timezones', function(req, res, next) {
  pool['m1'].getConnection(function(err, connection) {
    if (err) {
      err.status = 303
      return next(err);
    }
    connection.query(
      "select `id`,`name`,`detail`,`region`,`utcShift` from `Timezones`",
      function(err, result) {
        connection.release();
        if (err) {
          return next(err);
        }
        res.json({
          status: 1,
          message: 'success',
          data: {
            timezones: result
          }
        });
      });
  });
});


router.get('/invitation', async function(req, res, next) {
  var schema = Joi.object().keys({
    code: Joi.string().trim().required()
  });
  let connection;
  let beginTransaction = false;
  try {
    let value = await common.validate(req.query, schema);
    connection = await common.getConnection();
    await common.beginTransaction(connection);
    beginTransaction = true;
    let userSlice = await common.query(
      "select `userId`,`inviteeEmail`,`groupId` from GroupInvitation where `code`=? and `deleted`= 0 and `status`!= 3", [
        value.code
      ], connection);
    if (userSlice.length == 0) {
      throw new Error("code error");
    }
    let config_user = await Promise.all([common.query(
      "select `config` from RolePrivilege where `role`=?", [1],
      connection), common.query(
      "select  `id`,`idText`,`firstname` from User where `email` = ?", [
        userSlice[0].inviteeEmail
      ], connection)]);
    let users = config_user[1];
    let configSlice = config_user[0]
    if (configSlice == 0) {
      throw new Error('role config error');
    }

    if (users.length) {
      //加入用户组
      if (users[0].id != userSlice[0].userId) { //排除自身
        await Promise.all([common.query(
          "insert into UserGroup (`groupId`,`userId`,`role`,`createdAt`,`privilege`) values(?,?,?,unix_timestamp(now()),?) ON DUPLICATE KEY UPDATE `privilege` = ?", [
            userSlice[0].groupId, users[0].id, 1, configSlice[0].config,
            configSlice[0].config
          ], connection), common.query(
          "update   GroupInvitation set `status`= 1  where `code`=?", [
            value.code
          ], connection)]);
      }
      res.redirect(setting.invitationredirect);
    } else {
      //自动注册
      let password = util.getRandomString(6);
      let user = await signup({
        password: password,
        email: userSlice[0].inviteeEmail,
        firstname: userSlice[0].inviteeEmail.split('@')[0],
        lastname: ""
      }, next);
      //并发加入用户组   发送邮件
      let tpl = {
          subject: 'Newbidder Register', // Subject line
          text: ``, // plain text body
          html: _.template(
            ` <p>Hello,</p>

                    <p>Welcome to Newbidder! Please follow the link to complete your Profile (or copy/paste it in your browser):</p>
                    <p><%= href%>/#/setApp/profile</p>

                    <p>YOUR USERNAME: <%=email%></p>
                    <p>YOUR SECRET: <%=password%></p>

                    <p>To reset your password follow the link below:</p>
                    <p><%= href%>/#/setApp/profile</p>

                    <p>If you have any questions, feel free to contact us at: support@newbidder.com</p>


                    <p>Best regards,</p>
                    <p>Newbidder Support Team</p>
                    <p>Skype：support@newbidder</p>
                             `
          )({
            email: userSlice[0].inviteeEmail,
            password: password,
            href: setting.invitationredirect
          })
        }
        //异步发送邮件
      emailCtrl.sendMail([userSlice[0].inviteeEmail], tpl);

      await Promise.all([common.query(
        "insert into UserGroup (`groupId`,`userId`,`role`,`createdAt`,`privilege`) values(?,?,?,unix_timestamp(now()),?)", [
          userSlice[0].groupId, user.userId, 1, configSlice[0].config
        ], connection), common.query(
        "update   GroupInvitation set `status`= 1  where `code`=?", [
          value.code
        ], connection), common.query(
        "update User set emailVerified= ? where id= ?", [1, user.userId],
        connection)]);

      var expires = moment().add(200, 'days').valueOf();
      res.cookie("token", util.setToken(user.userId, expires, user.firstname,
        user.idText));
      res.cookie("clientId", userSlice[0].groupId);
      res.redirect(setting.invitationredirect);
    }
    await common.commit(connection);

  } catch (e) {
    next(e);
    if (beginTransaction) {
      await common.rollback(connection);
    }
  } finally {
    if (connection) {
      connection.release();
    }

  }
});


// router.get('/free/trial', async function (req, res, next) {
//   res.cookie("free", true);
//   res.redirect(setting.freetrialRedirect);
// });


router.get('/user/active', async function(req, res, next) {
  var schema = Joi.object().keys({
    key: Joi.string().trim().required()
  });
  let connection;
  try {
    let value = await common.validate(req.query, schema);
    connection = await common.getConnection();
    await common.query("update User set emailVerified = ? where idText = ?", [
      1, value.key
    ], connection);
    res.redirect(setting.invitationredirect);
  } catch (e) {
    next(e);
  } finally {
    if (connection) {
      connection.release();
    }
  }
});

router.get('/user/resendconfirmation', async function(req, res, next) {
  var schema = Joi.object().keys({
    email: Joi.string().trim().required()
  });
  let connection;
  try {
    let value = await common.validate(req.query, schema);
    connection = await common.getConnection();
    let user = await common.query(
      "select  `idText` from User   where email = ?", [value.email],
      connection);

    //异步发送邮件
    if (user.length) {
      sendActiveEmail(value.email, user[0].idText);
    }
    res.json({
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


router.get('/user/resetpassword', async function(req, res, next) {
  var schema = Joi.object().keys({
    email: Joi.string().trim().required()
  });
  let connection;
  let code;
  try {
    let value = await common.validate(req.query, schema);
    connection = await common.getConnection();
    let user = await common.query(
      "select  `id`,`idText` from User   where email = ?", [value.email],
      connection);
    if (user.length == 0) {
      let err = new Error('email error');
      err.status = 200;
      throw err;
    }
    let codeSlice = await common.query(
      "select `code`,`expireAt`,`status` from UserResetCode where `userId`=? and `expireAt`> ? and `status`= ?", [
        user[0].id, moment().unix(), 0
      ], connection);
    if (codeSlice.length) {
      code = codeSlice[0].code;
    } else {
      code = util.getUUID() + "." + user[0].idText;
      await common.query(
        "insert into UserResetCode (`userId`,`code`,`expireAt`) values(?,?,?)", [
          user[0].id, code, moment().unix() + 30 * 60
        ], connection);
    }
    var cipher = crypto.createCipher('aes-256-cbc', codeKey)
    var crypted = cipher.update(code, 'utf8', 'hex')
    crypted += cipher.final('hex')
      //异步发送邮件
    if (user.length) {
      sendforgetPwdEmail(value.email, crypted);
    }

    res.json({
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


router.post('/user/resetpassword', async function(req, res, next) {
  var schema = Joi.object().keys({
    code: Joi.string().trim().required(),
    password: Joi.string().trim().required()
  });
  let connection;
  let key;
  let err = new Error();
  try {
    let value = await common.validate(req.body, schema);
    //解析code
    try {
      var decipher = crypto.createDecipher('aes-256-cbc', codeKey)
      key = decipher.update(value.code, 'hex', 'utf8')
      key += decipher.final('utf8')
    } catch (e) {
      err.message = "code error";
      err.status = 200;
      throw err;
    }

    if (!key) {
      err.message = "code error";
      err.status = 200;
      throw err;
    }
    connection = await common.getConnection();
    let result = await common.query(
      "select `userId`,`expireAt`,`status` from UserResetCode where `code`=?", [
        key
      ], connection);

    if (result.length == 0) {
      err.message = "code error";
      err.status = 200;
      throw err;
    }

    if (result[0].status !== 0 || result[0].expireAt < moment().unix()) {
      err.message = 'code expired';
      err.status = 200;
      throw err;
    }

    let updateUser = common.query(
      "update User set `password`=? where `id`=?", [md5(value.password),
        result[0].userId
      ], connection);
    let updateUserCode = common.query(
      "update UserResetCode set `status`=? where `userId`=? and `code`=?", [
        1, result[0].userId, key
      ], connection);

    await Promise.all([updateUser, updateUserCode]);

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
})

router.get('/status', function(req, res) {
  res.status(200).send('ok');
});

router.get('/robot.txt', function(req, res) {
  res.status(200).send('User-agent: *\nDisallow: /');
});


router.get('/referral', function(req, res) {
  if (req.query.refToken) {
    res.cookie('refToken', req.query.refToken, {
      maxAge: 86400000,
      path: '/auth/signup'
    })
  }
  res.redirect(setting.freetrialRedirect);
});

router.get('/free-plan', async function(req, res, next) {
  var userId = req.query.userId;
  let connection;
  try {
    connection = await common.getConnection();

    let tempfreePlanMap = await common.query(
    `select id,name,includedEvents,retentionLimit,domainLimit,userLimit,tsReportLimit,anOfferAPILimit,ffRuleLimit,scRuleLimit,separateIP,price,hasCommission from UserPlan where userId = ? and deleted = ?`, [
      0, 0
    ], connection);

    let freePlanMap = tempfreePlanMap[0];

    if (freePlanMap) {
      let UPDATEUSERBILLING = common.query(
      `insert into UserBilling (userId,planId,customPlanId,planPaymentLogId,planStart,planEnd,billedEvents,totalEvents,includedEvents,agreementId) values(?,?,?,?,?,?,?,?,?,?)`, [
        userId, freePlanMap.id, freePlanMap.id, 0, moment().unix(), 0,
        0, 0, freePlanMap.includedEvents, 0
      ], connection);

      let functionsString = JSON.stringify({
        retentionLimit: freePlanMap.retentionLimit,
        domainLimit: freePlanMap.domainLimit,
        userLimit: freePlanMap.userLimit,
        tsReportLimit: freePlanMap.tsReportLimit,
        anOfferAPILimit: freePlanMap.anOfferAPILimit,
        ffRuleLimit: freePlanMap.ffRuleLimit,
        scRuleLimit: freePlanMap.scRuleLimit,
        separateIP: freePlanMap.separateIP
      });

      let UPDATEUserFunctions = common.query(
        `insert into UserFunctions (userId,functions) VALUES (?,?) ON DUPLICATE KEY UPDATE functions=?`, [userId, functionsString, functionsString], connection);

      await Promise.all([UPDATEUSERBILLING, UPDATEUserFunctions]);
    }
    await common.commit(connection);
    res.json({
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
