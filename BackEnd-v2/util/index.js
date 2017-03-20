var jwt = require('jwt-simple');
var log4js = require('log4js');
var log = log4js.getLogger('util');
var uuidV4 = require('uuid/v4');
var setting = require('../config/setting');
var common = require('../routes/common');
var _ = require('lodash');

exports.checkToken = function () {
  return async function (req, res, next) {
    let connection;
    try {
      var token = req.headers['authorization'];
      if (!token) {
        let err = new Error('need access_token');
        err.status = 401;
        throw err;
      }
      token = token.split(' ')[1];
      var decode = jwt.decode(token, setting['jwtTokenSrcret']);
      if (decode.exp <= Date.now()) {
        let err = new Error('access token has expired');
        err.status = 401;
        throw err;
      }
      connection = await common.getConnection();
      let user = await common.query("select user.`status`,user.`id`,user.`email`,user.`idText`,user.`firstname`,user.`lastname`,user.`campanyName`,g.`groupId`,g.`privilege` from `User` user inner join UserGroup g on g.`userId`=user.`id`  where user.`id`= ? and g.`role`= 0 and g.`deleted`= 0", [decode.iss], connection);
      if (!user.length) {
        let err = new Error('no user');
        err.status = 401;
        throw err;
      }
      //user 信息
      req.user = {
        status: user[0].status,
        id: user[0].id,
        idText: user[0].idText,
        groupId: user[0].groupId,
        firstname: user[0].firstname,
        lastname: user[0].lastname,
        email: user[0].email,
        campanyname: user[0].campanyName,
        privilege: user[0].privilege
      }

      req.owner = true;
      next();
    } catch (e) {
      log.error('[util.js][checkToken] error', e)
      next(e);
    } finally {
      if (connection) {
        connection.release();
      }
    }

  }
}

exports.checkPlan = function () {
  return function (req, res, next) {
    if (req.parent && req.parent.status !== 1) {
      //用户是否成功购买套餐
      let err = new Error('INSUFFICIENT_SUBSCRIPTION');
      err.status = 405;
      next(err);
    } else {
      next();
    }
  }
}


exports.resetUserByClientId = function () {
  return async function (req, res, next) {
    let connection;
    try {
      let clientId = req.cookies.clientId;
      if (!clientId || (clientId && clientId == req.user.groupId)) {
        req.parent = req.user;
        return next();
      }

      connection = await common.getConnection();
      //查询用户所在的组
      let userGroups = common.query("select `groupId`,`privilege` from UserGroup  where `deleted`=? and `userId`= ?", [0, req.user.id], connection);

      //获取用户所在的用户组的管理员信息
      let groupOwers = common.query("select g1.`groupId`,user.`id` as userId,user.`status` as status,user.`idText`,user.`email`,user.`firstname`,user.`lastname`,user.`campanyName`,g1.`role` from UserGroup g1 inner join User user on user.`id`= g1.`userId` where `role` =0  and `groupId` in ( select `groupId` from  UserGroup g   where g.`userId`=?  and g.`role`= 1 and g.`deleted`=0)", [req.user.id], connection);

      let results = await Promise.all([userGroups, groupOwers]);
      let userGroupSlice = results[0];
      //check clientId 合法
      if (!_.some(userGroupSlice, ['groupId', clientId])) {
        let err = new Error('clientId invalidate');
        err.status = 401;
        throw err;
      }
      let user_privilege = _.find(userGroupSlice, { groupId: clientId }).privilege;
      //获取client 管理员信息
      let userGroupObject = _.find(results[1], { groupId: clientId, role: 0 });
      if (_.isEmpty(userGroupObject)) {
        let err = new Error('clientId invalidate');
        err.status = 401;
        throw err;
      }
      req.parent = {
        id: userGroupObject.userId,
        status: userGroupObject.status,
        idText: userGroupObject.idText,
        groupId: userGroupObject.groupId,
        firstname: userGroupObject.firstname,
        lastname: userGroupObject.lastname,
        email: userGroupObject.email,
        campanyname: userGroupObject.campanyName,
        privilege: user_privilege
      }
      req.owner = false;
      next();
    } catch (e) {
      next(e);
    } finally {
      if (connection) {
        connection.release();
      }
    }
  }
}


exports.setToken = function (userid, expires, firstname, idtext) {
  return jwt.encode({
    iss: userid,
    exp: expires,
    firstname: firstname,
    idText: idtext
  }, setting['jwtTokenSrcret'])
}

exports.getRandomString = function (len) {
  var chars = ["a", "b", "c", "d", "e", "f",
    "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s",
    "t", "u", "v", "w", "x", "y", "z", "0", "1", "2", "3", "4", "5",
    "6", "7", "8", "9"
  ];
  var stringToHex = function (str) {
    var val = "";
    for (var i = 0; i < str.length; i++) {
      if (val == "") {
        val = str.charCodeAt(i).toString(16);
      } else {
        val += str.charCodeAt(i).toString(16);
      }
    }
    return val;
  }
  var result = ""
  var uuid = uuidV4().replace(new RegExp(/-/g), '')
  for (var i = 0; i < len; i++) {
    var str = uuid.substring(i * 4, i * 4 + 4)
    result += chars[parseInt(stringToHex(str), 16) % 0x24]
  }
  return result
}


exports.getUUID = function () {
  return uuidV4().replace(new RegExp(/-/g), '')
}


exports.regWebURL = new RegExp(
  //"^((http|https)://)(([a-zA-Z0-9\._-]+\.[a-zA-Z]{2,6})|([0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}))(:[0-9]{1,4})*(/[a-zA-Z0-9\&%_\./-~-]*)?$"
  //"^((http|https)://)(([a-zA-Z0-9\._-]+\.[a-zA-Z]{2,6})|([0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}))(:[0-9]{1,4})*(/([#%@]?)[a-zA-Z0-9\&\#%_\./-~-]*)?$"
  "^((http|https)://)((([a-z0-9]+(-[a-z0-9]+)*\.)+[a-z]{2,})|([0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}))(:[0-9]{1,5})*($|/)"
);


