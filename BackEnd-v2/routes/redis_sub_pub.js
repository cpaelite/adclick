var setting = require('../config/setting');
var redis = require('redis');
var log4js = require('log4js');
var log = log4js.getLogger('redis');

function initClient(param) {
    var option = { host: setting.redis.host, port: setting.redis.port };
    if(setting.redis && setting.redis.password){
       option.password= setting.redis.password
    }
    if (param) {
        option = Object.assign(option, param);
    }
    let client = redis.createClient(option);

    client.on("error", function (err) {
        console.error(err.message);
        log.error("[initClient]error:", err);
    });

    return client;
}


class PubSub {
    constructor(subConnected) {
        this.sub = initClient();
        this.handlers = new Map();
        this.subAction = (channle, message) => {
            let actions = this.handlers.get(channle) || new Set();
            for (let action of actions) {
                action(message);
            }
        }
        this.alredyPublishs = [];
        this.subConnected = subConnected ? subConnected : false;
    }

    publish(channel, message, method) {
        let action = () => {
            let client = initClient();
            client.publish(channel, message);
            log.info("[redis][push]", channel, message, method);
            client.quit();   
        };
        if (this.subConnected === false) {
            this.alredyPublishs.push(action);
        } else {
            action();
        }
    }


    registerHandlers(channel, action) {
        var actions = this.handlers.get(channel) || new Set();
        actions.add(action);
        this.handlers.set(channel, actions);
    }

    subscribe(channel) {
        let self = this;
        this.sub.subscribe(channel, function (err, reply) {
            if (err)
                log.error(err);
            self.subConnected = true;
            for (let publish of self.alredyPublishs)
                publish();
            console.log(reply);
        });

        this.sub.on("message", function (channel, message) {
            self.subAction(channel, message);
        });
    }

    set(key,value){
        this.sub.set(key,value);
    }

    get(key,callback){
        this.sub.get(key,callback);
    }

    tearDown() {
        this.sub.quit();
    }
}


module.exports = PubSub;