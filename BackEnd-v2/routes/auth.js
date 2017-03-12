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
var Pub = require('./redis_sub_pub');
var uuidV4 = require('uuid/v4');
var emailCtrl = require('../util/email');
const _ = require('lodash');
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
router.post('/auth/login', async function (req, res, next) {
  var schema = Joi.object().keys({
    email: Joi.string().trim().email().required(),
    password: Joi.string().required()
  });
  let connection;
  try {
    let value = await common.validate(req.body, schema);
    connection = await common.getConnection();

    let sql = "select  `id`,`idText`,`email`,`password`,`firstname`,`emailVerified` from User where `email` = ? and `deleted` =0";

    let rows = await common.query(sql, [value.email], connection);

    if (rows.length > 0) {
      if (rows[0].emailVerified == 0) {
        throw new Error("Your email has not been verified.");
      }
      if (rows[0].password == md5(value.password)) {
        let userGroup = await common.query("select `groupId` from UserGroup where `userId`= ? and `role`= 0", [rows[0].id], connection);
        if (userGroup.length == 0) {
          throw new Error("account exception");
        }
        let clientId = userGroup[0].groupId;
        var expires = moment().add(200, 'days').valueOf();
        //set cookie
        res.cookie("clientId", clientId);
        res.json({ token: util.setToken(rows[0].id, expires, rows[0].firstname, rows[0].idText) });

        //更新登录时间
        let updateSql = "update User set `lastLogon`= unix_timestamp(now()) where `id`= ? ";
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
router.post('/auth/signup', async function (req, res, next) {
  try {
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
    subject: 'Newbidder Activate', // Subject line
    text: ``, // plain text body
    html: _.template(` <p>Hello,</p>

            <p>Thanks for signing up! We'll just need you to click the activation link below to get your account up and running.</p>
            <p><a href="<%=href%>">Activate my account</a></p>

            <p>Best regards,</p>
            <p>Newbidder Team </p>`)({
        href: setting.activateRouter + "?key=" + idText,

      })
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
    refToken: Joi.string().optional().empty("")
  });
  let connection;
  let beginTransaction = false;
  let value;
  try {
    value = await common.validate(data, schema);
    connection = await common.getConnection();
    //check email exists
    let UserResult = await common.query("select id from User where `email`=?", [value.email], connection);
    if (UserResult.length > 0) throw new Error("account exists");
    //事务开始
    await common.beginTransaction(connection);
    beginTransaction = true;
    let idtext = util.getRandomString(6);
    let reftoken = util.getUUID() + "." + idtext;
    //User
    let sql = "insert into User(`registerts`,`firstname`,`lastname`,`email`,`password`,`idText`,`referralToken`,`json`) values (unix_timestamp(now()),?,?,?,?,?,?,?)";
    let params = [
      value.firstname, value.lastname, value.email,
      md5(value.password), idtext, reftoken, JSON.stringify(setting.defaultSetting)
    ];
    let result = await common.query(sql, params, connection);
    value.userId = result.insertId;
    value.idtext = idtext;
    //系统默认domains
    for (let index = 0; index < setting.domains.length; index++) {
      await common.query("insert into `UserDomain`(`userId`,`domain`,`main`,`customize`) values (?,?,?,?)", [result.insertId, setting.domains[index].address, setting.domains[index].mainDomain ? 1 : 0, 0], connection);
    }

    //如果refToken 不为"" 说明是从推广链接过来的
    if (value.refToken) {
      let slice = value.refToken.split('.');
      let referreUserId = slice.length == 2 ? slice[1] : 0;
      if (referreUserId) {
        let USER = await common.query("select `id` from User where `idText` = ?", [referreUserId], connection);
        if (USER.length == 0) {
          throw new Error("refToken error");
        }
        await common.query("insert into `UserReferralLog` (`userId`,`referredUserId`,`acquired`,`status`,`percent`) values (?,?,unix_timestamp(now()),0,?)", [USER[0].id, result.insertId, 500], connection);
      }
    }

    //user Group
    let configSlice = await common.query("select `config` from RolePrivilege where `role`=?", [0], connection);

    await common.query("insert into UserGroup (`groupId`,`userId`,`role`,`createdAt`,`privilege`) values(?,?,?,unix_timestamp(now()),?)", [uuidV4(), result.insertId, 0, configSlice.length ? configSlice[0].config : "{}"], connection);


    await common.commit(connection);
    //redis publish
    new Pub(true).publish(setting.redis.channel, result.insertId + ".add.user." + result.insertId, "userAdd");

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
router.post('/account/check', function (req, res, next) {
  var schema = Joi.object().keys({
    email: Joi.string().trim().email().required()
  });
  Joi.validate(req.body, schema, function (err, value) {
    if (err) {
      return next(err);
    }
    pool.getConnection(function (err, connection) {
      if (err) {
        err.status = 303
        return next(err);
      }
      connection.query("select id from User where `email`=?", [
        value.email
      ], function (err, result) {
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
router.get('/timezones', function (req, res, next) {
  pool.getConnection(function (err, connection) {
    if (err) {
      err.status = 303
      return next(err);
    }
    connection.query(
      "select `id`,`name`,`detail`,`region`,`utcShift` from `Timezones`",
      function (err, result) {
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


router.get('/invitation', async function (req, res, next) {
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
    let userSlice = await common.query("select `userId`,`inviteeEmail`,`groupId` from GroupInvitation where `code`=? and `deleted`= 0 and `status`!= 3", [value.code], connection);
    if (userSlice.length == 0) {
      throw new Error("code error");
    }

    let users = await common.query("select  `id`,`idText`,`firstname` from User where `email` = ?", [userSlice[0].inviteeEmail], connection);
    if (users.length) {
      //加入用户组
      if (users[0].id != userSlice[0].userId) {//排除自身
        await Promise.all([common.query("insert into UserGroup (`groupId`,`userId`,`role`,`createdAt`) values(?,?,?,unix_timestamp(now())) ON DUPLICATE KEY UPDATE `role` = 1", [userSlice[0].groupId, users[0].id, 1], connection), common.query("update   GroupInvitation set `status`= 1  where `code`=?", [value.code], connection)]);
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
        html: _.template(` <p>Hello,</p>

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
                             `)({
            email: userSlice[0].inviteeEmail,
            password: password,
            href: setting.invitationredirect
          })
      }
      //异步发送邮件
      emailCtrl.sendMail([userSlice[0].inviteeEmail], tpl);
      let configSlice = await common.query("select `config` from RolePrivilege where `role`=?", [1], connection);
      if (configSlice == 0) {
        throw new Error('role config error');
      }
      await Promise.all([common.query("insert into UserGroup (`groupId`,`userId`,`role`,`createdAt`,`privilege`) values(?,?,?,unix_timestamp(now()),?)", [userSlice[0].groupId, user.userId, 1, configSlice[0].config], connection), common.query("update   GroupInvitation set `status`= 1  where `code`=?", [value.code], connection), common.query("update User set emailVerified= ? where id= ?", [1, user.userId], connection)]);

      var expires = moment().add(200, 'days').valueOf();
      res.cookie("token", util.setToken(user.userId, expires, user.firstname, user.idText));
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


router.get('/user/active', async function (req, res, next) {
  var schema = Joi.object().keys({
    key: Joi.string().trim().required()
  });
  let connection;
  try {
    let value = await common.validate(req.query, schema);
    connection = await common.getConnection();
    await common.query("update User set emailVerified = ? where idText = ?", [1, value.key], connection);
    res.redirect(setting.invitationredirect);
  } catch (e) {
    next(e);
  } finally {
    if (connection) {
      connection.release();
    }
  }
});

router.get('/user/resendconfirmation', async function (req, res, next) {
  var schema = Joi.object().keys({
    email: Joi.string().trim().required()
  });
  let connection;
  try {
    let value = await common.validate(req.query, schema);
    connection = await common.getConnection();
    let user = await common.query("select  `idText` from User   where email = ?", [value.email], connection);
    //异步发送邮件
    if (user.length & user[0].idText) {
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





module.exports = router;
