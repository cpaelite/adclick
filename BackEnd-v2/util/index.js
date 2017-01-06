var jwt = require('jwt-simple');
var log4js = require('log4js');
var log = log4js.getLogger('util');


exports.checkToken = function(app) {
  return function(req, res, next) {
    var token = (req.body && req.body.access_token) || (req.query && req.query
        .access_token) ||
      req.headers['x-access-token'];
    if (token) {
      try {
        var decode = jwt.decode(token, app.get('jwtTokenSrcret'));
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
