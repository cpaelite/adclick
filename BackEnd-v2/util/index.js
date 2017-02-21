var jwt = require('jwt-simple');
var log4js = require('log4js');
var log = log4js.getLogger('util');
var uuidV4 = require('uuid/v4');
var setting = require('../config/setting');
var common = require('../routes/common');
var _ = require('lodash');

exports.checkToken = function () {
  return async function (req, res, next) {
    var token = req.headers['authorization'];
    if (!token) throw new Error('need access_token');
    token = token.split(' ')[1];
    let connection;
    try {
      var decode = jwt.decode(token, setting['jwtTokenSrcret']);
      if (decode.exp <= Date.now()) {
        return next(new Error('access token has expired'));
      }
      connection = await common.getConnection();
      let user = await common.query("select `id`,`idText` from `User` where `id`= ?", [decode.iss], connection);
      if (!user.length) {
        throw new Error('no user');
      }
      req.userId = user[0].id;
      req.idText = user[0].idText;
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


exports.resetUserByClientId = function () {
  return async function (req, res, next) {
    let connection;
    try {
      let clientId = req.cookies.clientId;
      if (!clientId) {
        return next();
      }
      //获取用户group 信息
      connection = await common.getConnection();
      let userGroupSlice = await common.query("select g.`groupId`,g.`userId`,g.`role`,user.`idText`,user.`email` from UserGroup g inner join User user on user.`id` = g.`userId`  where g.`deleted`=? and g.`userId`= ?", [0, req.userId], connection);
       if(!_.some(userGroupSlice,['groupId',clientId])){
          throw new Error("clientId invalidate");
       }
      let userGroupObject=_.find(userGroupSlice,{groupId:clientId,role:0});
      req.userId= userGroupObject.userId;
      req.idText = userGroupObject.idText;
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
  "^((http|https)://)(([a-zA-Z0-9\._-]+\.[a-zA-Z]{2,6})|([0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}))(:[0-9]{1,4})*(/[a-zA-Z0-9\&%_\./-~-]*)?$"
);


