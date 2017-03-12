var express = require('express');
var router = express.Router();
var Joi = require('joi');
var common = require('./common');
var setting = require('../config/setting');
const _ = require('lodash');


/**
 * @api {get} /api/preferences  获取用户配置
 * @apiName  get  user  preferences
 * @apiGroup User
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "status": 1,
 *       "message": "success"
 *       "data":{}
 *     }
 *
 */
router.get('/api/preferences', async function (req, res, next) {
  var schema = Joi.object().keys({
    userId: Joi.number().required()
  });
  req.body.userId = req.user.id;
  let connection;
  try {
    let result;
    let value = await common.validate(req.body, schema);
    connection = await common.getConnection();
    let results = await common.query("select  `json` from User where `id` = ? and `deleted` =0", [value.userId], connection);

    if (results.length) {
      result = _.merge(setting.defaultSetting, JSON.parse(results[0].json));

    } else {
      result = setting.defaultSetting;
    }
    return res.json({
      status: 1,
      message: "success",
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
 * @api {get} /countries  获取所有国家
 * @apiName  get all countries
 * @apiGroup auth
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "status": 1,
 *       "message": "success"
 *       "data":{"countries":[]}
 *     }
 *
 */
router.get('/api/countries', function (req, res, next) {
  pool.getConnection(function (err, connection) {
    if (err) {
      err.status = 303
      return next(err);
    }
    connection.query(
      "select `id`,`name` as display,`alpha2Code`,`alpha3Code` as value,`numCode` from `Country` order by name asc",
      function (err, result) {
        connection.release();
        if (err) {
          return next(err);
        }
        res.json(
          result
        );
      });
  });
});


/**
 * @api {get} /api/groups  获取用户所在的用户组
 *
 * @apiGroup User
 * @apiName  获取用户所在的用户组
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 * {status:1,message:'success',data:{
 *
 *  groups:[{ groupId:"",
            firstname:"",
            lastname:"",
            email:""}]
 * }}
 *
 **/
router.get('/api/groups', async function (req, res, next) {
  var schema = Joi.object().keys({
    userId: Joi.number().required(),
    idText: Joi.string().required()
  });
  let connection;
  try {
    req.query.userId = req.user.id;
    req.query.idText = req.user.idText;
    let value = await common.validate(req.query, schema);
    connection = await common.getConnection();
    let result = [];
    //获取用户所在的用户组的管理员信息
    result = await common.query("select g1.`groupId`,user.`firstname`,user.`lastname`,user.`email` from UserGroup g1 inner join User user on user.`id`= g1.`userId` where `role` =0  and `groupId` in ( select `groupId` from  UserGroup g   where g.`userId`=?  and g.`role`= 1 and g.`deleted`=0)", [value.userId], connection);
    //myself
    result.push({
      groupId: req.user.groupId,
      firstname: req.user.firstname,
      lastname: req.user.lastname,
      email: req.user.email
    });

    return res.json({
      status: 1,
      message: 'success',
      data: {
        groups: result
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
  req.query.userId = req.user.id;
  let connection;
  try {
    let value = await common.validate(req.query, schema);
    connection = await common.getConnection();
    let result = await common.query("select `idText`,`firstname`,`lastname`,`email`,`status`,`timezone`,`setting`,`referralToken` from User where  `id`= ?", [value.userId], connection);

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
  } finally {
    if (connection) {
      connection.release();
    }
  }

});


router.get('/api/permission', async function (req, res, next) {
  let connection;
  try {
    let privileges;
    connection = await common.getConnection();
    let f = await common.query("select `functions` from UserFunctions where `userId`= ?", [req.parent.id], connection);
    if (req.parent.privilege) {
      privileges = JSON.parse(req.parent.privilege);
    }
    //初始化
    if (_.has(privileges, "setting.domain")) {
      privileges.setting.domain.domainLimit = 0;
    }
    if (_.has(privileges, "setting.userManagement")) {
      privileges.setting.userManagement.userLimit = 0;
    }
    if (_.has(privileges, "report.tsReport")) {
      privileges.report.tsReport.tsReportLimit = 0;
    }
    if (_.has(privileges, "report")) {
      privileges.report.retentionLimit = 0;
    }
    if (f.length && req.parent.privilege) {
      let limits = JSON.parse(f[0].functions);
      if (_.has(limits, 'domainLimit') && _.has(privileges, "setting.domain")) {
        privileges.setting.domain.domainLimit = limits.domainLimit;
      }
      if (_.has(limits, 'userLimit') && _.has(privileges, "setting.userManagement")) {
        privileges.setting.userManagement.userLimit = limits.userLimit;
      }
      if (_.has(limits, 'tsReportLimit') && _.has(privileges, "report.tsReport")) {
        privileges.report.tsReport.tsReportLimit = limits.tsReportLimit;
      }
      if (_.has(limits, 'retentionLimit') && _.has(privileges, "report")) {
        privileges.report.retentionLimit = limits.retentionLimit;
      }
    }
    return res.json({
      status: 1,
      message: 'success',
      data: privileges
    })
  } catch (e) {
    next(e);
  } finally {
    if (connection) {
      connection.release();
    }
  }
});


module.exports = router;
