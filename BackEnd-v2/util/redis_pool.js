var RedisPool = require('sol-redis-pool');
var log4js = require('log4js');
var logger = log4js.getLogger("redis-pool");
var moment = require('moment');


class myPool {
  constructor(redisSettings, poolSettings) {
    this.pool = RedisPool(redisSettings, poolSettings);
  }
  publish(channel, data) {
    var self = this;
    self.pool.acquire(function (err, client) {
      if (err) {
        return logger.error(err);
      }
      client.publish(channel, data);
      logger.info('[redis][publish]: ',channel,data,moment().unix());
      setTimeout(function () {
         self.pool.release(client);
      }, 3000);
     
    })
  }
}

module.exports = function (redisSettings, poolSettings) {
  return new myPool(redisSettings, poolSettings)
}