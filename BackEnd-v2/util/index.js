var jwt = require('jwt-simple');
var log4js = require('log4js');
var log = log4js.getLogger('util');
var uuidV4 = require('uuid/v4');
var setting = require('../config/setting');

exports.checkToken = function() {
  return function(req, res, next) {
    /*var token = (req.body && req.body.access_token) || (req.query && req.query
        .access_token) ||
      req.headers['x-access-token'];*/
      var token = req.headers['authorization'].split(' ')[1];
    if (token) {
      try {
        var decode = jwt.decode(token, setting['jwtTokenSrcret']);
          console.log(decode);
        req.userId = decode.userid
          //TODO  验证userId
        next();
      } catch (e) {
        log.error('[util.js][checkToken] error', e)
        next(e);
      }
    } else {
      next(new Error('need access_token'));
    }
  }
}

exports.setToken = function(userid) {
  return jwt.encode({
    userid: userid
  }, setting['jwtTokenSrcret'])
}


exports.getRandomString = function(len) {
  var chars = ["a", "b", "c", "d", "e", "f",
    "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s",
    "t", "u", "v", "w", "x", "y", "z", "0", "1", "2", "3", "4", "5",
    "6", "7", "8", "9"
  ];
  var stringToHex = function(str) {　　　　
    var val = "";　　　　
    for (var i = 0; i < str.length; i++) {　　　　　　
      if (val == "") {
        val = str.charCodeAt(i).toString(16);　　
      } else　 {
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
