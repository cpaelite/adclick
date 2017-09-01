import express from 'express';
const supplementRouter = express.Router();

export {supplementRouter};

var setting = require('../config/setting');
var common = require('./common');

supplementRouter.get('/user-status', async function(req, res, next) {
  let connection;
  try {
    connection = await common.getConnection();
    let emails = req.query.emails.split(';');
    if(emails.length) {
      let fetchUserIds = common.query(`select id from User where email in (?)`, [emails], connection);
      let updateUserStatus = common.query(`update User set status = ? where email in (?)`, [1, emails], connection);

      let [userIds] = await Promise.all([fetchUserIds, updateUserStatus]);

      //redis publish
      for(var i = 0, l = userIds.length; i < l; i++) {
        if (userIds[i].id) {
          redisPool.publish(setting.redis.channel, userIds[i].id + ".update.user." + userIds[i].id);
        }
      }
      res.json({
        status: 1,
        message: 'success'
      });
    } else {
      res.json({
        status: 1,
        message: 'Dont tease me'
      });
    }
  } catch (e) {
    next(e)
  } finally {
    if (connection) {
      connection.release();
    }
  }
});
