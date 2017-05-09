var redis = require('redis');
var createPool = require('generic-pool').createPool;
var log4js = require('log4js');
var logger = log4js.getLogger("redis_pool");
var moment = require('moment');


function RedisConnectionPool(options) {

  this.factory = {
    create: function () {
      return new Promise(function (resolve, reject) {
        var client = redis.createClient(options);
        client.on('connected', function () {
          resolve(client)
        });
        client.on('error', function (err) {
          reject(err);
        });
      });
    },
    destroy: function (client) {
      return new Promise(function (resolve) {
        client.quit();
        resolve(true);
      });
    },
  }

  this.factoryOptions = {
    max: options.max_clients
  }

  this.pool = createPool(this.factory, this.factoryOptions);

  return this;
}



/**
 * Function: on
 *
 * listen for redis events
 *
 * Parameters:
 *
 *   type - (string) - Type of event to listen for.
 *   cb   - (function) - Callback function when the event is triggered.
 *
 */
RedisConnectionPool.prototype.on = function (type, cb) {
  var client = redis.createClient();
  client.on(type, cb);
};



/**
 * Function: publish
 *
 * Execute a redis PUBLISH command
 *
 * Parameters:
 *
 *   key   - (string) - A channel to assign the data to
 *   data  - (string) - Value to assign to hash
 *   cb    - (function) - Callback to be executed on completion
 *
 */
RedisConnectionPool.prototype.publish = function (key, data, cb) {
  logger.info("[redis][push]:  ", key, data, moment().unix());
  _setFuncs.apply(this, ['publish', key, data, cb]);
};





function _setFuncs(funcName, key, field, data, cb) {
  var pool = this.pool;

  if (typeof cb === 'undefined') {
    cb = data;
    data = field;
    field = null;
  }

  pool.acquire().then(function (client) {
    client[funcName](key, data, function (err, reply) {
      pool.release(client);
      if (err) {
        logger.error("[redis][push][error]:  ", key, data, moment().unix());
        if (typeof cb === 'function') {
          cb(err, reply);
        }
      }
    });
  });
}

module.exports = function (cfg) {
  return new RedisConnectionPool(cfg);
};
