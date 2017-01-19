var Joi = require('joi');
var uuidV4 = require('uuid/v4');
var redis = require("redis");
var setting = require("../config/setting");

function getRedisClient() {
    return redis.createClient(setting.redis);
}

function getConnection() {
    return new Promise(function (resolve, reject) {
        pool.getConnection(function (err, connection) {
            if (err) {
                reject(err);
            }
            resolve(connection);
        });
    });
}

function beginTransaction(connection) {
    return new Promise(function (resolve, reject) {
        connection.beginTransaction(function (err) {
            if (err) {
                reject(err);
            }
            resolve(1);
        });
    });
}

function commit(connection) {
    return new Promise(function (resolve, reject) {
        connection.commit(function (err) {
            if (err) {
                reject(err);
            }
            resolve(1);
        });
    });
}

function rollback(connection) {
    return new Promise(function (resolve, reject) {
        connection.rollback(function () {
            resolve(1);
        });
    });
}

function validate(data, schema) {
    return new Promise(function (resolve, reject) {
        Joi.validate(data, schema, function (err, value) {
            if (err) {
                reject(err);
            }
            resolve(value);
        });
    });
}

// Campaign
function insertCampaign(value, connection) {
    var hash = uuidV4();
    //url
    let urlValue = setting.newbidder.httpPix + value.idText + "." + setting.newbidder.mainDomain + "/" + hash;
    let impPixelUrl = setting.newbidder.httpPix + value.idText + "." + setting.newbidder.mainDomain + setting.newbidder.impRouter + "/" + hash;

    value.url = urlValue;
    value.impPixelUrl = impPixelUrl;
    //required
    var col = "`userId`";
    var val = value.userId;

    col += ",`costModel`";
    val += "," + value.costModel;

    col += ",`targetType`";
    val += "," + value.targetType;

    col += ",`name`";
    val += ",'" + value.name + "'";

    col += ",`hash`";
    val += ",'" + hash + "'";

    col += ",`url`";
    val += ",'" + urlValue + "'";

    col += ",`trafficSourceId`";
    val += "," + value.trafficSource.id;

    col += ",`trafficSourceName`";
    val += ",'" + value.trafficSource.name + "'";

    col += ",`redirectMode`";
    val += "," + value.redirectMode;

    col += ",`status`";
    val += "," + value.status;

    col += ",`impPixelUrl`";
    val += ",'" + impPixelUrl + "'";

    //optional
    if (value.cpc != undefined) {
        col += ",`cpcValue`";
        val += "," + value.cpc;
    }
    if (value.cpa != undefined) {
        col += ",`cpaValue`";
        val += "," + value.cpa;
    }
    if (value.cpm != undefined) {
        col += ",`cpmValue`";
        val += "," + value.cpm;
    }

    if (value.country) {
        var countryCode = value.country.alpha3Code ? value.country.alpha3Code : "";
        col += ",`country`";
        val += ",'" + countryCode + "'";
    }

    //flow targetType=1 &&  flow.id
    if (value.flow && value.flow.id) {
        col += ",`targetFlowId`";
        val += "," + value.flow.id;
    }

    return new Promise(function (resolve, reject) {
        connection.query("insert into TrackingCampaign (" + col + ") values (" + val + ")", function (err, result) {
            if (err) {
                reject(err);
            }
            resolve(result);
        });
    });
}

function updateCampaign(value, connection) {
    var sqlCampaign = "update TrackingCampaign set `id`=" + value.id;
    if (value.name) {
        sqlCampaign += ",`name`='" + value.name + "'";
    }
    if (value.url) {
        sqlCampaign += ",`url`='" + value.url + "'";
    }
    if (value.trafficSource && value.trafficSource.id) {
        sqlCampaign += ",`trafficSourceId`='" + value.trafficSource.id + "'";
    }
    if (value.trafficSource && value.trafficSource.name) {
        sqlCampaign += ",`trafficSourceName`='" + value.trafficSource.name + "'";
    }

    if (value.impPixelUrl) {
        sqlCampaign += ",`impPixelUrl`='" + value.impPixelUrl + "'";
    }
    if (value.cpc != undefined) {
        sqlCampaign += ",`cpcValue`=" + value.cpc;
    }
    if (value.cpa != undefined) {
        sqlCampaign += ",`cpaValue`=" + value.cpa;
    }
    if (value.cpm != undefined) {
        sqlCampaign += ",`cpmValue`=" + value.cpm;
    }

    if (value.country) {
        var countryCode = value.country.alpha3Code ? value.country.alpha3Code : "";
        sqlCampaign += ",`country`='" + countryCode + "'";
    }

    if (value.costModel != undefined) {
        sqlCampaign += ",`costModel`=" + value.costModel;
    }
    if (value.redirectMode != undefined) {
        sqlCampaign += ",`redirectMode`=" + value.redirectMode;
    }
    if (value.status != undefined) {
        sqlCampaign += ",`status`=" + value.status;
    }
    if (value.targetType != undefined) {
        sqlCampaign += ",`targetType`=" + value.targetType;
    }

    //flow targetType=1 &&  flow.id
    if (value.flow && value.flow.id) {
        sqlCampaign += ",`targetFlowId`=" + value.flow.id;
    }

    sqlCampaign += " where `id`=" + value.id + " and `userId`=" + value.userId;
    return new Promise(function (resolve, reject) {
        connection.query(sqlCampaign, function (err, result) {
            if (err) {
                reject(err);
            }
            resolve(result);
        });
    });
}

function getCampaign(id, userId, connection) {
    let sqlCampaign = "select `id`,`name`,`hash`,`url`,`impPixelUrl`,`trafficSourceId`,`trafficSourceName`,`country`,`costModel`,`cpcValue`,`cpaValue`,`cpmValue`,`redirectMode`,`targetType`,`targetFlowId`,`targetUrl`,`status` from `TrackingCampaign` where `userId`=? and `id`=? and `deleted`=?";
    let sqltag = "select `name` from `Tags` where `userId`=? and `targetId`=? and `type`=? and `deleted`=?";
    return new Promise(function (resolve, reject) {
        connection.query(sqlCampaign, [userId, id, 0], function (err, camResult) {
            if (err) {
                reject(err);
            }
            connection.query(sqltag, [userId, id, 1, 0], function (err, tagsResult) {
                if (err) {
                    reject(err);
                }
                let tags = [];
                for (let index = 0; index < tagsResult.length; index++) {
                    tags.push(tagsResult[index].name);
                }
                camResult[0].tags = tags;
                resolve(camResult[0]);
            });
        });
    });
}

//Flow
function insertFlow(userId, flow, connection) {
    //required
    var col = "`userId`";
    var val = userId;

    col += ",`name`";
    val += ",'" + flow.name + "'";

    col += ",`hash`";
    val += ",'" + uuidV4() + "'";

    col += ",`type`";
    val += "," + flow.type;

    col += ",`redirectMode`";
    val += "," + flow.redirectMode;

    //optional
    if (flow.country) {
        var countryCode = flow.country.alpha3Code ? flow.country.alpha3Code : "";
        col += ",`country`";
        val += ",'" + countryCode + "'";
    };

    return new Promise(function (resolve, reject) {
        connection.query("insert into Flow (" + col + ") values (" + val + ")", function (err, result) {
            if (err) {
                reject(err);
            }
            resolve(result);
        });
    });
};

function updateFlow(userId, flow, connection) {
    var sqlFlow = "update Flow set `id`=" + flow.id;
    if (flow.name) {
        sqlFlow += ",`name`='" + flow.name + "'";
    }
    if (flow.country) {
        var countryCode = flow.country.alpha3Code ? flow.country.alpha3Code : "";
        sqlFlow += ",`country`='" + countryCode + "'";
    }
    if (flow.redirectMode != undefined) {
        sqlFlow += ",`redirectMode`=" + flow.redirectMode;
    }
    if (flow.deleted != undefined) {
        sqlFlow += ",`deleted`=" + flow.deleted;
    }

    sqlFlow += " where `id`=" + flow.id + " and `userId`=" + userId;

    return new Promise(function (resolve, reject) {
        connection.query(sqlFlow, function (err, result) {
            if (err) {
                reject(err);
            }
            resolve(result);
        });
    });
}

//Tags
function insertTags(userId, targetId, name, type, connection) {
    return new Promise(function (resolve, reject) {
        connection.query("insert into `Tags` (`userId`,`name`,`type`,`targetId`) values (?,?,?,?)", [userId, name, type, targetId], function (err, result) {
            if (err) {
                reject(err);
            }
            resolve(result);
        });
    });
}

//删除所有tags 
function updateTags(userId, targetId, type, connection) {
    return new Promise(function (resolve, reject) {
        connection.query("update `Tags` set `deleted`=1 where `userId`= ?  and `targetId`=? and `type`= ? ", [userId, targetId, type], function (err, result) {
            if (err) {
                reject(err);
            }
            resolve(result);
        });
    });
}

//Rule
function insetRule(userId, rule, connection) {
    var sqlRule = "insert into `Rule` (`userId`,`name`,`hash`,`type`,`json`,`status`) values (?,?,?,?,?,?)";
    return new Promise(function (resolve, reject) {
        connection.query(sqlRule, [userId, rule.name, uuidV4(), rule.type, JSON.stringify(rule.json), rule.status], function (err, result) {
            if (err) {
                reject(err);
            }
            resolve(result);
        });
    });
}

function updateRule(userId, rule, connection) {
    var sqlRule = "update `Rule` set `id`=" + rule.id;
    if (rule.name) {
        sqlRule += ",`name`='" + rule.name + "'";
    }
    if (rule.type != undefined) {
        sqlRule += ",`type`=" + rule.type;
    }
    if (rule.json) {
        sqlRule += ",`json`='" + JSON.stringify(rule.json) + "'";
    }
    if (rule.status != undefined) {
        sqlRule += ",`status`=" + rule.status;
    }
    sqlRule += " where `userId`= ? and `id`= ? ";
    return new Promise(function (resolve, reject) {
        connection.query(sqlRule, [userId, rule.id], function (err, result) {
            if (err) {
                reject(err);
            }
            resolve(result);
        });
    });
}

//Path
function insertPath(userId, path, connection) {
    var sqlpath = "insert into `Path` (`userId`,`name`,`hash`,`redirectMode`,`directLink`,`status`) values (?,?,?,?,?,?)";
    return new Promise(function (resolve, reject) {
        connection.query(sqlpath, [userId, path.name, uuidV4(), path.redirectMode, path.directLink, path.status], function (err, result) {
            if (err) {
                reject(err);
            }
            resolve(result);
        });
    });
}

function updatePath(userId, path, connection, callback) {
    var sqlUpdatePath = "update `Path` set `id`=" + path.id;
    if (path.name) {
        sqlUpdatePath += ",`name`='" + path.name + "'";
    }
    if (path.redirectMode != undefined) {
        sqlUpdatePath += ",`redirectMode`=" + path.redirectMode;
    }
    if (path.directLink != undefined) {
        sqlUpdatePath += ",`directLink`=" + path.directLink;
    }
    if (path.status != undefined) {
        sqlUpdatePath += ",`status`=" + path.status;
    }

    sqlUpdatePath += " where `id`=? and `userId`= ? ";

    return new Promise(function (resolve, reject) {
        connection.query(sqlUpdatePath, [path.id, userId], function (err, result) {
            if (err) {
                reject(err);
            }
            resolve(result);
        });
    });
}

//Lander
function insertLander(userId, lander, connection) {
    //required
    var col = "`userId`";

    var val = userId;

    col += ",`name`";
    val += ",'" + lander.name + "'";

    col += ",`hash`";
    val += ",'" + uuidV4() + "'";

    col += ",`url`";
    val += ",'" + lander.url + "'";

    col += ",`numberOfOffers`";
    val += "," + lander.numberOfOffers;

    //optional
    if (lander.country) {
        var countryCode = lander.country.alpha3Code ? lander.country.alpha3Code : "";
        col += ",`country`";
        val += ",'" + countryCode + "'";
    }

    return new Promise(function (resolve, reject) {
        connection.query("insert into Lander (" + col + ") values (" + val + ") ", function (err, result) {
            if (err) {
                reject(err);
            }
            resolve(result);
        });
    });
}

function updateLander(userId, lander, connection) {
    var sqlUpdateLander = "update Lander set `id`=" + lander.id;
    if (lander.country) {
        var countryCode = lander.country.alpha3Code ? lander.country.alpha3Code : "";
        sqlUpdateLander += ",`country`='" + countryCode + "'";
    }
    if (lander.name) {
        sqlUpdateLander += ",`name`='" + lander.name + "'";
    }
    if (lander.url) {
        sqlUpdateLander += ",`url`='" + lander.url + "'";
    }
    if (lander.numberOfOffers) {
        sqlUpdateLander += ",`numberOfOffers`=" + lander.numberOfOffers;
    }

    sqlUpdateLander += " where `id`= ?  and `userId`= ? ";

    return new Promise(function (resolve, reject) {
        connection.query(sqlUpdateLander, [lander.id, userId], function (err, result) {
            if (err) {
                reject(err);
            }
            resolve(result);
        });
    });
}

function getLanderDetail(id, userId, connection) {
    let sqlLander = "select `id`,`name`,`hash`,`url`,`country`,`numberOfOffers` from `Lander` where `userId`=? and `deleted`=? and `id`=?";
    let sqltag = "select `name` from `Tags` where `userId`=? and `targetId`=? and `type`=? and `deleted`=?";
    return new Promise(function (resolve, reject) {
        connection.query(sqlLander, [userId, 0, id], function (err, lander) {
            if (err) {
                reject(err);
            }
            connection.query(sqltag, [userId, id, 2, 0], function (err, tagsResult) {
                if (err) {
                    reject(err);
                }
                let tags = [];
                for (let index = 0; index < tagsResult.length; index++) {
                    tags.push(tagsResult[index].name);
                }
                lander[0].tags = tags;
                resolve(lander[0]);
            });
        });
    });
}

//Lander2Path
function insertLander2Path(landerid, pathid, pathweight, connection) {
    var sqllander2path = "insert into Lander2Path (`landerId`,`pathId`,`weight`) values (?,?,?)";
    return new Promise(function (resolve, reject) {
        connection.query(sqllander2path, [landerid, pathid, pathweight], function (err, result) {
            if (err) {
                reject(err);
            }
            resolve(result);
        });
    });
}

function updateLander2Path(landerId, pathId, weight, connection) {
    var sqllander2path = "update  Lander2Path set `weight`= ? where `landerId` =? and `pathId`=?";
    return new Promise(function (resolve, reject) {
        connection.query(sqllander2path, [weight, landerId, pathId], function (err, result) {
            if (err) {
                reject(err);
            }
            resolve(result);
        });
    });
}

//Offer
function insertOffer(userId, idText, offer, connection) {

    //required
    var col = "`userId`";
    var val = userId;

    col += ",`name`";
    val += ",'" + offer.name + "'";

    col += ",`hash`";
    val += ",'" + uuidV4() + "'";

    col += ",`url`";
    val += ",'" + offer.url + "'";

    col += ",`payoutMode`";
    val += "," + offer.payoutMode;

    //optional
    if (offer.country) {
        var countrycode = offer.country.alpha3Code ? offer.country.alpha3Code : "";
        col += ",`country`";
        val += ",'" + countrycode + "'";
    }

    if (offer.postbackUrl) {
        col += ",`postbackUrl`";
        val += ",'" + offer.postbackUrl + "'";
    }

    if (offer.payoutValue != undefined) {
        col += ",`payoutValue`";
        val += "," + offer.payoutValue;
    }
    if (offer.affiliateNetwork && offer.affiliateNetwork.id) {
        col += ",`AffiliateNetworkId`";
        val += "," + offer.affiliateNetwork.id;
    }
    if (offer.affiliateNetwork && offer.affiliateNetwork.name) {
        col += ",`AffiliateNetworkName`";
        val += ",'" + offer.affiliateNetwork.name + "'";
    }

    var sqloffer = "insert into Offer (" + col + ") values (" + val + ") ";
    return new Promise(function (resolve, reject) {
        connection.query(sqloffer, function (err, result) {
            if (err) {
                reject(err);
            }
            resolve(result);
        });
    });
}

function updateOffer(userId, offer, connection) {
    var sqlUpdateOffer = "update  Offer  set `id`=" + offer.id;
    if (offer.country) {
        var countrycode = offer.country.alpha3Code ? offer.country.alpha3Code : "";
        sqlUpdateOffer += ",`country`='" + countrycode + "'";
    }
    if (offer.postbackUrl) {
        sqlUpdateOffer += ",`postbackUrl`='" + offer.postbackUrl + "'";
    }
    if (offer.payoutValue != undefined) {
        sqlUpdateOffer += ",`payoutValue`=" + offer.payoutValue;
    }
    if (offer.affiliateNetwork && offer.affiliateNetwork.id) {
        sqlUpdateOffer += ",`AffiliateNetworkId`=" + offer.affiliateNetwork.id;
    }
    if (offer.affiliateNetwork && offer.affiliateNetwork.name) {
        sqlUpdateOffer += ",`AffiliateNetworkName`='" + offer.affiliateNetwork.name + "'";
    }

    if (offer.name) {
        sqlUpdateOffer += ",`name`='" + offer.name + "'";
    }
    if (offer.url) {
        sqlUpdateOffer += ",`url`='" + offer.url + "'";
    }
    if (offer.payoutMode != undefined) {
        sqlUpdateOffer += ",`payoutMode`=" + offer.payoutMode;
    }
    sqlUpdateOffer += " where `userId`= ? and `id`= ? ";

    return new Promise(function (resolve, reject) {
        connection.query(sqlUpdateOffer, [userId, offer.id], function (err, result) {
            if (err) {
                reject(err);
            }
            resolve(result);
        });
    });
}

function getOfferDetail(id, userId, connection) {
    let sqlLander = "select `id`,`name`,`hash`,`url`,`country`,`AffiliateNetworkId`,`AffiliateNetworkName`,`postbackUrl`,`payoutMode`,`payoutValue` from `Offer` where `userId`=? and `deleted`=? and `id`=?";
    let sqltag = "select `name` from `Tags` where `userId`=? and `targetId`=? and `type`=? and `deleted`=?";
    return new Promise(function (resolve, reject) {
        connection.query(sqlLander, [userId, 0, id], function (err, lander) {
            if (err) {
                reject(err);
            }
            connection.query(sqltag, [userId, id, 3, 0], function (err, tagsResult) {
                if (err) {
                    reject(err);
                }
                let tags = [];
                for (let index = 0; index < tagsResult.length; index++) {
                    tags.push(tagsResult[index].name);
                }
                lander[0].tags = tags;
                resolve(lander[0]);
            });
        });
    });
}

//Offer2Path
function insertOffer2Path(offerid, pathid, pathweight, connection) {
    return new Promise(function (resolve, reject) {
        connection.query("insert into Offer2Path (`offerId`,`pathId`,`weight`) values (?,?,?)", [offerid, pathid, pathweight], function (err, result) {
            if (err) {
                reject(err);
            }
            resolve(result);
        });
    });
}

function updateOffer2Path(offerId, pathId, weight, connection) {
    var sqloffer2path = "update  Offer2Path set `weight`= ? where `offerId`=? and `pathId`=?";

    return new Promise(function (resolve, reject) {
        connection.query(sqloffer2path, [weight, offerId, pathId], function (err, result) {
            if (err) {
                reject(err);
            }
            resolve(result);
        });
    });
}
//Path2Rule 
function insertPath2Rule(pathId, ruleId, weight, status, connection) {
    return new Promise(function (resolve, reject) {
        connection.query("insert into Path2Rule (`pathId`,`ruleId`,`weight`,`status`) values (?,?,?,?)", [pathId, ruleId, weight, status], function (err, result) {
            if (err) {
                reject(err);
            }
            resolve(result);
        });
    });
}

function updatePath2Rule(pathId, ruleId, weight, status, connection) {
    var sqlpath2rule = "update  Path2Rule set `weight`=?,`status`=? where `pathId`=? and `ruleId`=?";
    return new Promise(function (resolve, reject) {
        connection.query(sqlpath2rule, [weight, status, pathId, ruleId], function (err, result) {
            if (err) {
                reject(err);
            }
            resolve(result);
        });
    });
}

//Rule2Flow
function insertRule2Flow(ruleId, flowId, status, connection) {

    return new Promise(function (resolve, reject) {
        connection.query("insert into Rule2Flow (`ruleId`,`flowId`,`status`) values (?,?,?)", [ruleId, flowId, status], function (err, result) {
            if (err) {
                reject(err);
            }
            resolve(result);
        });
    });
}

function updateRule2Flow(status, ruleId, flowId, connection) {
    var sqlrule2flow = "update  Rule2Flow set `status`=? where  `ruleId`=?  and `flowId`=?";
    return new Promise(function (resolve, reject) {
        connection.query(sqlrule2flow, [status, ruleId, flowId], function (err, result) {
            if (err) {
                reject(err);
            }
            resolve(result);
        });
    });
}

exports.updateRule2Flow = updateRule2Flow;
exports.insertRule2Flow = insertRule2Flow;
exports.updatePath2Rule = updatePath2Rule;
exports.insertPath2Rule = insertPath2Rule;
exports.updateOffer2Path = updateOffer2Path;
exports.insertOffer2Path = insertOffer2Path;
exports.updateOffer = updateOffer;
exports.insertOffer = insertOffer;
exports.updateLander2Path = updateLander2Path;
exports.insertLander2Path = insertLander2Path;
exports.updateLander = updateLander;
exports.insertLander = insertLander;
exports.updatePath = updatePath;
exports.insertPath = insertPath;
exports.updateRule = updateRule;
exports.insetRule = insetRule;
exports.updateTags = updateTags;
exports.insertTags = insertTags;
exports.updateFlow = updateFlow;
exports.insertFlow = insertFlow;
exports.updateCampaign = updateCampaign;
exports.insertCampaign = insertCampaign;
exports.validate = validate;
exports.rollback = rollback;
exports.commit = commit;
exports.beginTransaction = beginTransaction;
exports.getConnection = getConnection;
exports.getRedisClient = getRedisClient;
exports.getLanderDetail = getLanderDetail;
exports.getCampaign = getCampaign;
exports.getOfferDetail = getOfferDetail;