var Joi = require('joi');
var uuidV4 = require('uuid/v4');
var redis = require("redis");
var setting = require("../config/setting");
var Pub = require('./redis_sub_pub');


function query(sql, params, connection) {
    return new Promise(function (resolve, reject) {
        connection.query(sql, params, function (err, result) {
            if (err) {
                reject(err);
            }
            resolve(result);
        });
    });
}


function getRedisClient() {
    return redis.createClient(setting.redis);
}


function getConnection() {
    return new Promise(function (resolve, reject) {
        pool.getConnection(function (err, connection) {
            if (err) {
                reject(err)
            }
            resolve(connection)
        })
    })
}

function beginTransaction(connection) {
    return new Promise(function (resolve, reject) {
        connection.beginTransaction(function (err) {
            if (err) {
                reject(err);
            }
            resolve(1);
        })
    })
}

function commit(connection) {
    return new Promise(function (resolve, reject) {
        connection.commit(function (err) {
            if (err) {
                reject(err);
            }
            resolve(1);
        })
    })
}

function rollback(connection) {
    return new Promise(function (resolve, reject) {
        connection.rollback(function () {
            resolve(1);
        })
    })
}


function validate(data, schema) {
    return new Promise(function (resolve, reject) {
        Joi.validate(data, schema, function (err, value) {
            if (err) {
                reject(err);
            }
            resolve(value);
        })
    });
}

// Campaign
async function insertCampaign(value, hash, connection) {
    let params = [];
    //required
    let col = "`userId`";
    let val = "?";
    params.push(value.userId);

    col += ",`costModel`";
    val += ",?";
    params.push(value.costModel);

    col += ",`targetType`";
    val += ",?";
    params.push(value.targetType);

    col += ",`name`";
    val += ",?";
    params.push(value.name);

    col += ",`hash`";
    val += ",?";
    params.push(hash);



    col += ",`trafficSourceId`";
    val += ",?";
    params.push(value.trafficSource.id);

    col += ",`trafficSourceName`";
    val += ",?";
    params.push(value.trafficSource.name);

    col += ",`redirectMode`";
    val += ",?";
    params.push(value.redirectMode);

    col += ",`status`";
    val += ",?";
    params.push(value.status);


    //optional
    if (value.cpc != undefined) {
        col += ",`cpcValue`";
        val += ",?";
        params.push(value.cpc);
    }
    if (value.cpa != undefined) {
        col += ",`cpaValue`";
        val += ",?";
        params.push(value.cpa);
    }
    if (value.cpm != undefined) {
        col += ",`cpmValue`";
        val += ",?";
        params.push(value.cpm);
    }

    if (value.postbackUrl != undefined) {
        col += ",`postbackUrl`";
        val += ",?";
        params.push(value.postbackUrl);
    }

    if (value.pixelRedirectUrl) {
        col += ",`postbackUrl`";
        val += ",?";
        params.push(value.pixelRedirectUrl);
    }

    if (value.country) {
        // var countryCode = value.country.alpha3Code ? value.country.alpha3Code: "";
        col += ",`country`";
        val += ",?";
        params.push(value.country);
    }

    if (value.targetUrl != undefined) {
        col += ",`targetUrl`";
        val += ",?";
        params.push(value.targetUrl);
    }

    //flow targetType=1 &&  flow.id
    if (value.flow && value.flow.id) {
        col += ",`targetFlowId`";
        val += ",?";
        params.push(value.flow.id);
    }

    let result = await Promise.all([query("insert into TrackingCampaign (" + col + ") values (" + val + ")", params, connection), insertEventLog(value.userId, 1, value.name, hash, 1, connection)]);
    //redis pub
    new Pub(true).publish(setting.redis.channel, value.userId + ".add.campaign." + result[0].insertId, "campaignAdd");
    return result[0];
}


async function insertEventLog(userId, entityType, entityName, entityId, actionType, connection) {
    await query("insert into UserEventLog (`userId`,`entityType`,`entityName`,`entityId`,`actionType`,`changedAt`) values (?,?,?,?,?,unix_timestamp(now()))", [userId, entityType, entityName, entityId, actionType], connection);
    return true;
}


async function updateCampaign(value, connection) {
    let params = [];
    var sqlCampaign = "update TrackingCampaign set `id`= ?";
    params.push(value.id);
    if (value.name) {
        sqlCampaign += ",`name`=?";
    }
    params.push(value.name);
    if (value.url) {
        sqlCampaign += ",`url`=?";
        params.push(value.url);
    }
    if (value.trafficSource && value.trafficSource.id) {
        sqlCampaign += ",`trafficSourceId`=?";
        params.push(value.trafficSource.id);
    }
    if (value.trafficSource && value.trafficSource.name) {
        sqlCampaign += ",`trafficSourceName`=?";
        params.push(value.trafficSource.name);
    }

    if (value.impPixelUrl) {
        sqlCampaign += ",`impPixelUrl`=?";
        params.push(value.impPixelUrl);
    }
    if (value.cpc != undefined) {
        sqlCampaign += ",`cpcValue`=?";
        params.push(value.cpc);
    }
    if (value.cpa != undefined) {
        sqlCampaign += ",`cpaValue`=?";
        params.push(value.cpa);
    }
    if (value.cpm != undefined) {
        sqlCampaign += ",`cpmValue`=?";
        params.push(value.cpm);
    }

    if (value.country) {
        //var countryCode = value.country.alpha3Code ? value.country.alpha3Code: "";
        sqlCampaign += ",`country`=?";
        params.push(value.country);
    }

    if (value.costModel != undefined) {
        sqlCampaign += ",`costModel`=?";
        params.push(value.costModel);
    }
    if (value.redirectMode != undefined) {
        sqlCampaign += ",`redirectMode`=?";
        params.push(value.redirectMode);
    }
    if (value.status != undefined) {
        sqlCampaign += ",`status`=?";
        params.push(value.status);
    }
    if (value.targetType != undefined) {
        sqlCampaign += ",`targetType`=?";
        params.push(value.targetType);
    }

    if (value.targetUrl != undefined) {
        sqlCampaign += ",`targetUrl`=?";
        params.push(value.targetUrl);
    }

    if (value.postbackUrl != undefined) {
        sqlCampaign += ",`postbackUrl`=?";
        params.push(value.postbackUrl);
    }

    if (value.pixelRedirectUrl) {
        sqlCampaign += ",`pixelRedirectUrl`=?";
        params.push(value.pixelRedirectUrl);
    }

    //flow targetType=1 &&  flow.id
    if (value.flow && value.flow.id) {
        sqlCampaign += ",`targetFlowId`=?";
        params.push(value.flow.id);

    }

    sqlCampaign += " where `id`= ? and `userId`= ?";

    params.push(value.id);
    params.push(value.userId);
    let result = await query(sqlCampaign, params, connection);
    let campaign = await query("select `name`,`hash` from TrackingCampaign where `id`=? and `userId` = ?", [value.id, value.userId], connection);
    if (campaign.length) {
        await insertEventLog(value.userId, 1, campaign[0].name, campaign[0].hash, 2, connection);
    }

    new Pub(true).publish(setting.redis.channel, value.userId + ".update.campaign."+ value.id, "campaignUpdate");

    return result;
}

async function getCampaign(id, userId, idText, connection) {

    let sqlCampaign = "select `id`,`name`,`hash`,`url`,`impPixelUrl`,`trafficSourceId`,`trafficSourceName`,`country`," +
        "`costModel`,`cpcValue`,`cpaValue`,`cpmValue`,`redirectMode`,`targetType`,`targetFlowId`,`targetUrl`,`status` from `TrackingCampaign` where `userId`=? and `id`=? and `deleted`=?"
    let sqltag = "select `id`,`name` from `Tags` where `userId`=? and `targetId`=? and `type`=? and `deleted`=?";

    let mainDomainsql = "select `domain` from UserDomain where `userId`= ? and `main` = 1";

    let results = await Promise.all([query(sqlCampaign, [userId, id, 0], connection), query(sqltag, [userId, id, 1, 0], connection), query(mainDomainsql, [userId], connection)]);
    let camResult = results[0];
    let tagsResult = results[1];
    let domainResult = results[2];

    let tags = [];
    for (let index = 0; index < tagsResult.length; index++) {
        tags.push(tagsResult[index]);
    }

    if (camResult.length) {
        //重写 campaign URL  和 imimpPixelUrl
        if (domainResult.length) {
            camResult[0].url = setting.newbidder.httpPix + idText + "." + domainResult[0].domain + "/" + camResult[0].hash;
            camResult[0].impPixelUrl = setting.newbidder.httpPix + idText + "." + domainResult[0].domain + setting.newbidder.impRouter + "/" + camResult[0].hash;
        }
        camResult[0].tags = tags;
    }


    return camResult[0]

}




async function deleteCampaign(id, userId, connection) {

    var sqlCampaign = "update TrackingCampaign set `deleted`= 1  where `id`= ? and `userId`= ? ";

    await query(sqlCampaign, [id, userId], connection);
    let campaign = await query("select `name`,`hash` from TrackingCampaign where `id`=? and `userId`= ?", [id, userId], connection);
    if (campaign.length) {
        await insertEventLog(userId, 1, campaign[0].name, campaign[0].hash, 3, connection);
    }
    //redis 
    new Pub(true).publish(setting.redis.channel, userId + ".delete.campaign." + id, "campaignDelete");
    return true;
}

//Flow
async function insertFlow(userId, flow, connection) {
    let params = [];

    //required
    var col = "`userId`";
    var val = "?";
    params.push(userId)

    col += ",`name`";
    val += ",?";
    params.push(flow.name)

    col += ",`hash`";
    val += ",?";
    params.push(uuidV4())

    col += ",`type`";
    val += ",?";
    params.push(flow.type)

    col += ",`redirectMode`";
    val += ",?";
    params.push(flow.redirectMode)

    //optional
    if (flow.country) {
        //var countryCode = flow.country.alpha3Code ? flow.country.alpha3Code: "";
        col += ",`country`";
        val += ",?";
        params.push(flow.country);
    }

    let result = await query("insert into Flow (" + col + ") values (" + val + ")", params, connection);

    //reids pub
    new Pub(true).publish(setting.redis.channel, userId + ".add.flow." + result.insertId, "flowAdd");

    return result;


};

async function updateFlow(userId, flow, connection) {
    let params = [];
    var sqlFlow = "update Flow set `id`= ? ";
    params.push(flow.id);
    if (flow.name) {
        sqlFlow += ",`name`=?";
        params.push(flow.name);
    }
    if (flow.country) {
        //var countryCode = flow.country.alpha3Code ? flow.country.alpha3Code: "";
        sqlFlow += ",`country`=?";
        params.push(flow.country);
    }
    if (flow.redirectMode != undefined) {
        sqlFlow += ",`redirectMode`= ?";
        params.push(flow.redirectMode);
    }


    sqlFlow += " where `id`= ? and `userId`= ?";
    params.push(flow.id);
    params.push(userId);

    let result = await query(sqlFlow, params, connection);
    //reids pub
    new Pub(true).publish(setting.redis.channel, userId + ".update.flow." + flow.id, "flowUpdate");
    return result;

}

async function deleteFlow(id, userId, connection) {
    let sql = "update Flow set `deleted`= 1  where `id`= ? and `userId`= ?";
    await query(sql, [id, userId], connection);
    new Pub(true).publish(setting.redis.channel, userId + ".delete.flow." + id, "flowDelete");
    return true;
}

//Tags
async function insertTags(userId, targetId, name, type, connection) {
    let result = await query("insert into `Tags` (`userId`,`name`,`type`,`targetId`) values (?,?,?,?)", [userId, name, type, targetId], connection);
    return result;
}

//删除所有tags 
async function updateTags(userId, targetId, type, connection) {
    let result = await query("update `Tags` set `deleted`=1 where `userId`= ?  and `targetId`=? and `type`= ? ", [userId, targetId, type], connection);
    return result;
}

//Rule
async function insetRule(userId, rule, connection) {
    var sqlRule = "insert into `Rule` (`userId`,`name`,`hash`,`type`,`object`,`json`,`status`) values (?,?,?,?,?,?,?)";
    let result = await query(sqlRule, [userId, rule.name ? rule.name : "", uuidV4(), rule.isDefault ? 0 : 1, rule.json ?
        JSON.stringify(rule.json) : JSON.stringify([]), rule.object ?
            JSON.stringify(rule.object) : JSON.stringify([]), rule.enabled ? 1 : 0], connection);
    new Pub(true).publish(setting.redis.channel, userId + ".add.rule." + result.insertId, "ruleAdd");
    return result;
}

async function updateRule(userId, rule, connection) {
    let params = [];
    var sqlRule = "update `Rule` set `id`= ?";
    params.push(rule.id);
    if (rule.name) {
        sqlRule += ",`name`=?";
        params.push(rule.name);
    }
    if (rule.type != undefined) {
        sqlRule += ",`type`= ?";
        params.push(rule.type);
    }
    if (rule.json) {
        sqlRule += ",`json`=?";
        params.push(JSON.stringify(rule.object));
    }
    if (rule.object) {
        sqlRule += ",`object`=?";
        params.push(JSON.stringify(rule.json));
    }
    if (rule.status != undefined) {
        sqlRule += ",`status`=?";
        params.push(rule.status);
    }
    params.push(userId);
    params.push(rule.id);
    sqlRule += " where `userId`= ? and `id`= ? ";
    let result = await query(sqlRule, params, connection);
    new Pub(true).publish(setting.redis.channel, userId + ".update.rule." + rule.id, "ruleUpdate");
    return result;
}

//Path
async function insertPath(userId, path, connection) {
    var sqlpath = "insert into `Path` (`userId`,`name`,`hash`,`redirectMode`,`directLink`,`status`) values (?,?,?,?,?,?)";
    let result = await query(sqlpath, [userId, path.name, uuidV4(), path.redirectMode, path.directLinking ? 1 : 0, path.enabled ? 1 : 0], connection);
    new Pub(true).publish(setting.redis.channel, userId + ".add.path." + result.insertId, "pathAdd");
    return result;
}

async function updatePath(userId, path, connection, callback) {
    let params = [];
    var sqlUpdatePath = "update `Path` set `id`= ?";
    params.push(path.id);
    if (path.name) {
        sqlUpdatePath += ",`name`=?";
        params.push(path.name);
    }
    if (path.redirectMode != undefined) {
        sqlUpdatePath += ",`redirectMode`= ?";
        params.push(path.redirectMode);
    }
    if (path.directLinking != undefined) {
        sqlUpdatePath += ",`directLink`=?";
        params.push(path.directLinking);
    }
    if (path.enabled != undefined) {
        sqlUpdatePath += ",`status`=?";
        params.push(path.enabled);
    }

    sqlUpdatePath += " where `id`=? and `userId`= ? ";

    params.push(path.id);
    params.push(userId);

    let result = await query(sqlUpdatePath, params, connection);
    new Pub(true).publish(setting.redis.channel, userId + ".update.path." + path.id, "pathUpdate");
    return result;

}

//Lander
async function insertLander(userId, lander, connection) {
    let params = [];
    //required
    var col = "`userId`";

    var val = "?";
    params.push(userId);

    var hash = uuidV4();

    col += ",`name`";
    val += ",?";
    params.push(lander.name);

    col += ",`hash`";
    val += ",?";
    params.push(hash);

    col += ",`url`";
    val += ",?";
    params.push(lander.url);

    col += ",`numberOfOffers`";
    val += ",?";
    params.push(lander.numberOfOffers);

    //optional
    if (lander.country) {
        //var countryCode = lander.country.alpha3Code ? lander.country.alpha3Code: "";
        col += ",`country`";
        val += ",?";
        params.push(lander.country);
    }
    let result = await Promise.all([query("insert into Lander (" + col + ") values (" + val + ") ", params, connection), insertEventLog(userId, 2, lander.name, hash, 1, connection)]);

    //reids pub
    new Pub(true).publish(setting.redis.channel, userId + ".add.lander." + result[0].insertId, "landerAdd");
    return result[0];

}

async function updateLander(userId, lander, connection) {
    let params = [];
    var sqlUpdateLander = "update Lander set `id`= ?";
    params.push(lander.id);
    if (lander.country) {
        // var countryCode = lander.country.alpha3Code ? lander.country.alpha3Code: "";
        sqlUpdateLander += ",`country`=?";
        params.push(lander.country);
    }
    if (lander.name) {
        sqlUpdateLander += ",`name`=?";
        params.push(lander.name);
    }
    if (lander.url) {
        sqlUpdateLander += ",`url`=? ";
        params.push(lander.url);
    }
    if (lander.numberOfOffers) {
        sqlUpdateLander += ",`numberOfOffers`= ?";
        params.push(lander.numberOfOffers);
    }

    sqlUpdateLander += " where `id`= ?  and `userId`= ? ";
    params.push(lander.id);
    params.push(userId);

    let result = await query(sqlUpdateLander, params, connection);
    let landerResult = await query("select `name`,`hash` from Lander where `id`= ? and `userId`= ?", [lander.id, userId], connection);
    if (lander.length) {
        await insertEventLog(userId, 2, landerResult[0].name, landerResult[0].hash, 2, connection);
    }
    //reids pub
    new Pub(true).publish(setting.redis.channel, userId + ".update.lander." + lander.id, "landerUpdate");
    return result;
}

async function getLanderDetail(id, userId, connection) {
    let sqlLander = "select `id`,`name`,`hash`,`url`,`country`,`numberOfOffers` from `Lander` where `userId`=? and `deleted`=? and `id`=?";
    let sqltag = "select `id`,`name` from `Tags` where `userId`=? and `targetId`=? and `type`=? and `deleted`=?";

    let result = await Promise.all([query(sqlLander, [userId, 0, id], connection), query(sqltag, [userId, id, 2, 0], connection)]);
    let lander = result[0];
    let tagsResult = result[1];
    let tags = [];
    for (let index = 0; index < tagsResult.length; index++) {
        tags.push(tagsResult[index]);
    }
    if (lander[0]) {
        lander[0].tags = tags;
    }

    return lander[0];


}

async function deleteLander(id, userId, connection) {
    let sqlCampaign = "update Lander set `deleted`= 1  where `id`= ? and `userId`= ? ";

    await query(sqlCampaign, [id, userId], connection);

    let lander = await query("select `name`,`hash` from Lander where `id`=? and `userId`= ?", [id, userId], connection);
    if (lander.length) {
        await insertEventLog(userId, 2, lander[0].name, lander[0].hash, 3, connection);
    }
    //reids pub
    new Pub(true).publish(setting.redis.channel, userId + ".delete.lander." + id, "landerDelete");
    return true;
}

//Lander2Path
async function insertLander2Path(landerid, pathid, pathweight, connection) {
    var sqllander2path = "insert into Lander2Path (`landerId`,`pathId`,`weight`) values (?,?,?)";
    let result = await query(sqllander2path, [landerid, pathid, pathweight], connection);
    return result;
}

async function updateLander2Path(landerId, pathId, weight, connection) {
    var sqllander2path = "delete from   Lander2Path   where `landerId` =? and `pathId`=?";
    await query(sqllander2path, [landerId, pathId], connection);
    return true;

}

async function deleteLander2Path(pathId, connection) {
    var sqllander2path = "delete from   Lander2Path   where `pathId`=?";
    await query(sqllander2path, [pathId], connection);
    return true;
}

//Offer
async function insertOffer(userId, idText, offer, connection) {
    let params = [];
    //required
    var col = "`userId`"
    var val = "?";
    params.push(userId);

    var hash = uuidV4();

    col += ",`name`";
    val += ",?";
    params.push(offer.name);

    col += ",`hash`";
    val += ",?";
    params.push(hash);

    col += ",`url`";
    val += ",?";
    params.push(offer.url);

    col += ",`payoutMode`";
    val += ",?";

    params.push(offer.payoutMode);


    //optional
    if (offer.country) {
        //var countrycode = offer.country.alpha3Code ? offer.country.alpha3Code: "";
        col += ",`country`";
        val += ",?";
        params.push(offer.country);
    }

    if (offer.postbackUrl) {
        col += ",`postbackUrl`";
        val += ",?";
        params.push(offer.postbackUrl);
    }


    if (offer.payoutValue != undefined) {
        col += ",`payoutValue`";
        val += ",?";
        params.push(offer.payoutValue);
    }
    if (offer.affiliateNetwork && offer.affiliateNetwork.id) {
        col += ",`AffiliateNetworkId`";
        val += ",?";
        params.push(offer.affiliateNetwork.id);
    }
    if (offer.affiliateNetwork && offer.affiliateNetwork.name) {
        col += ",`AffiliateNetworkName`";
        val += ",?";
        params.push(offer.affiliateNetwork.name);
    }

    var sqloffer = "insert into Offer (" + col + ") values (" + val + ") ";

    let result = await Promise.all([query(sqloffer, params, connection), insertEventLog(userId, 3, offer.name, hash, 1, connection)]);
    //reids pub
    new Pub(true).publish(setting.redis.channel, userId + ".add.offer." + result[0].insertId, "offerAdd");

    return result[0];
}

async function updateOffer(userId, offer, connection) {
    let params = [];
    var sqlUpdateOffer = "update  Offer  set `id`= ? ";
    params.push(offer.id);
    if (offer.country) {
        // var countrycode = offer.country.alpha3Code ? offer.country.alpha3Code: "";
        sqlUpdateOffer += ",`country`= ? ";
        params.push(offer.country);
    }
    if (offer.postbackUrl) {
        sqlUpdateOffer += ",`postbackUrl`=?";
        params.push(offer.postbackUrl);
    }
    if (offer.payoutValue != undefined) {
        sqlUpdateOffer += ",`payoutValue`= ? ";
        params.push(offer.payoutValue);
    }
    if (offer.affiliateNetwork && offer.affiliateNetwork.id) {
        sqlUpdateOffer += ",`AffiliateNetworkId`= ? ";
        params.push(offer.affiliateNetwork.id);
    }
    if (offer.affiliateNetwork && offer.affiliateNetwork.name) {
        sqlUpdateOffer += ",`AffiliateNetworkName`=?";
        params.push(offer.affiliateNetwork.name);
    }

    if (offer.name) {
        sqlUpdateOffer += ",`name`=? ";
        params.push(offer.name);
    }
    if (offer.url) {
        sqlUpdateOffer += ",`url`=? ";
        params.push(offer.url);

    }
    if (offer.payoutMode != undefined) {
        sqlUpdateOffer += ",`payoutMode`= ? ";
        params.push(offer.payoutMode);
    }
    sqlUpdateOffer += " where `userId`= ? and `id`= ? ";
    params.push(userId);
    params.push(offer.id);

    let result = await query(sqlUpdateOffer, params, connection);

    let offerResult = await query("select `name`,`hash` from Offer where `id`= ? and `userId`= ?", [offer.id, userId], connection);
    if (offerResult.length) {
        await insertEventLog(userId, 3, offerResult[0].name, offerResult[0].hash, 2, connection);
    }
    new Pub(true).publish(setting.redis.channel, userId + ".update.offer." + offer.id, "offerUpdate");

    return result;

}

async function getOfferDetail(id, userId, connection) {
    let sqlLander = "select `id`,`name`,`hash`,`url`,`country`,`AffiliateNetworkId`,`AffiliateNetworkName`,`postbackUrl`,`payoutMode`,`payoutValue` from `Offer` where `userId`=? and `id`=?";
    let sqltag = "select `id`,`name` from `Tags` where `userId`=? and `targetId`=? and `type`=? and `deleted`=?";

    let results = await Promise.all([query(sqlLander, [userId, id], connection), query(sqltag, [userId, id, 3, 0], connection)]);
    let lander = results[0];
    let tagsResult = results[1];
    let tags = [];
    for (let index = 0; index < tagsResult.length; index++) {
        tags.push(tagsResult[index]);
    }
    if (lander[0]) {
        lander[0].tags = tags;
    }
    return lander[0];
}

async function deleteOffer(id, userId, name, hash, connection) {
    var sqlCampaign = "update Offer set `deleted`= 1 where `id`= ? and `userId`= ? ";

    await query(sqlCampaign, [id, userId], connection);
    let offerResult = await query("select `name`,`hash` from Offer where `id`= ?", [offer.id], connection);
    if (offerResult.length) {
        await insertEventLog(userId, 3, offerResult[0].name, offerResult[0].hash, 3, connection);
    }

    new Pub(true).publish(setting.redis.channel, userId + ".delete.offer." + id, "offerDelete");

    return true;
}

//Offer2Path
async function insertOffer2Path(offerid, pathid, pathweight, connection) {
    let result = await query("insert into Offer2Path (`offerId`,`pathId`,`weight`) values (?,?,?)", [offerid, pathid, pathweight], connection);
    return result;
}

async function updateOffer2Path(offerId, pathId, weight, connection) {
    var sqloffer2path = "delete from   Offer2Path  where `offerId`=? and `pathId`=?";
    await query(sqloffer2path, [offerId, pathId], connection);
    return true;
}

async function deleteOffer2Path(pathId, connection) {
    var sqloffer2path = "delete from   Offer2Path  where  `pathId`=?";
    await query(sqloffer2path, [pathId], connection);
    return true;
}

//Path2Rule 
async function insertPath2Rule(pathId, ruleId, weight, status, connection) {
    let result = await query("insert into Path2Rule (`pathId`,`ruleId`,`weight`,`status`) values (?,?,?,?)", [pathId, ruleId, weight, status], connection);
    return result;
}

async function updatePath2Rule(pathId, ruleId, weight, status, connection) {
    var sqlpath2rule = "delete  from Path2Rule   where `pathId`=? and `ruleId`=?";

    let result = await query(sqlpath2rule, [pathId, ruleId], connection);
    return result;

}
async function deletePath2Rule(ruleId, connection) {
    var sqlpath2rule = "delete  from Path2Rule  where  `ruleId`=?";

    let result = await query(sqlpath2rule, [ruleId], connection);
    return result;
}

//Rule2Flow
async function insertRule2Flow(ruleId, flowId, status, connection) {
    let result = await query("insert into Rule2Flow (`ruleId`,`flowId`,`status`) values (?,?,?)", [ruleId, flowId, status], connection);
    return result;
}

async function updateRule2Flow(status, ruleId, flowId, connection) {
    var sqlrule2flow = "delete from   Rule2Flow   where  `ruleId`=?  and `flowId`=?";

    let result = await query(sqlrule2flow, [ruleId, flowId], connection);
    return result;

}

async function deleteRule2Flow(flowId, connection) {
    var sqlrule2flow = "delete from  Rule2Flow   where  `flowId`=?";
    let result = await query(sqlrule2flow, [flowId], connection);
    return result;
}

async function insertTrafficSource(userId, traffic, connection) {
    let params = [];
    //required
    var col = "`userId`"
    var val = "?";
    params.push(userId);
    var hash = uuidV4();

    col += ",`name`";
    val += ",?";
    params.push(traffic.name);

    col += ",`hash`";
    val += ",?";
    params.push(hash);

    if (traffic.postbackUrl) {
        col += ",`postbackUrl`";
        val += ",?";
        params.push(traffic.postbackUrl);
    }

    if (traffic.pixelRedirectUrl) {
        col += ",`pixelRedirectUrl`";
        val += ",?";
        params.push(traffic.pixelRedirectUrl);
    }

    if (traffic.impTracking != undefined) {
        col += ",`impTracking`";
        val += ",?";
        params.push(traffic.impTracking);
    }
    if (traffic.externalId) {
        col += ",`externalId`";
        val += ",?";
        params.push(traffic.externalId);
    }
    if (traffic.cost) {
        col += ",`cost`";
        val += ",?";
        params.push(traffic.cost);
    }
    if (traffic.params) {
        col += ",`params`";
        val += ",?";
        params.push(traffic.params);
    }
    var sqltraffic = "insert into TrafficSource (" + col + ") values (" + val + ") ";
    let result = await Promise.all([query(sqltraffic, params, connection), insertEventLog(userId, 4, traffic.name, hash, 1, connection)]);
    return result[0];

}

async function updatetraffic(userId, traffic, connection) {
    let params = [];
    let sqlUpdateOffer = "update  TrafficSource  set `id`= ?";
    params.push(traffic.id);
    if (traffic.name != undefined) {
        sqlUpdateOffer += ",`name`=?";
        params.push(traffic.name);
    }
    if (traffic.postbackUrl != undefined) {
        sqlUpdateOffer += ",`postbackUrl`=?";
        params.push(traffic.postbackUrl);
    }
    if (traffic.pixelRedirectUrl != undefined) {
        sqlUpdateOffer += ",`pixelRedirectUrl`=?";
        params.push(traffic.pixelRedirectUrl);
    }
    if (traffic.impTracking != undefined) {
        sqlUpdateOffer += ",`impTracking`=?";
        params.push(traffic.impTracking);
    }
    if (traffic.externalId != undefined) {
        sqlUpdateOffer += ",`externalId`=?";
        params.push(traffic.externalId);
    }
    if (traffic.cost != undefined) {
        sqlUpdateOffer += ",`cost`=?";
        params.push(traffic.cost);
    }
    if (traffic.params != undefined) {
        sqlUpdateOffer += ",`params`=?";
        params.push(traffic.params);
    }
    sqlUpdateOffer += " where `userId`= ?  and `id`= ? ";
    params.push(userId);
    params.push(traffic.id);
    let result = await query(sqlUpdateOffer, params, connection);
    let trafficResult = await query("select `name`,`hash` from TrafficSource where `id`=? and `userId`=?", [traffic.id, userId], connection);
    if (trafficResult.length) {
        await insertEventLog(userId, 4, trafficResult[0].name, trafficResult[0].hash, 2, connection);
    }
    return result;

}

async function gettrafficDetail(id, userId, connection) {
    let result = await query("select `id`, `name`,`hash`,`postbackUrl`,`pixelRedirectUrl`,`impTracking`,`externalId`,`cost`,`params` from `TrafficSource` where `userId`=? and `id`=? ", [userId, id], connection);
    return result;
}

async function deletetraffic(id, userId, connection) {
    let sqlCampaign = "update TrafficSource set `deleted`= 1 where `id`= ?  and `userId`= ?";
    await query(sqlCampaign, [id, userId], connection);
    let trafficResult = await query("select `name`,`hash` from TrafficSource where `id`=? and `userId`= ?", [id, userId], connection);
    if (trafficResult.length) {
        await insertEventLog(userId, 4, trafficResult[0].name, trafficResult[0].hash, 3, connection);
    }

    return true;
}



async function insertAffiliates(userId, affiliate, connection) {
    let params = [];
    var hash = uuidV4();
    var sql = "insert into AffiliateNetwork set `userId`= ?,`name`=?,`hash`= ?";

    params.push(userId);
    params.push(affiliate.name);
    params.push(hash);
    if (affiliate.postbackUrl) {
        sql += ",`postbackUrl`=?";
        params.push(affiliate.postbackUrl);
    }
    if (affiliate.appendClickId != undefined) {
        sql += ",`appendClickId`=?";
        params.push(affiliate.appendClickId);
    }
    if (affiliate.duplicatedPostback != undefined) {
        sql += ",`duplicatedPostback`=?";
        params.push(affiliate.duplicatedPostback);
    }
    if (affiliate.ipWhiteList) {
        sql += ",`ipWhiteList`=?";
        params.push(affiliate.ipWhiteList);
    }
    let result = await Promise.all([query(sql, params, connection), insertEventLog(userId, 5, affiliate.name, hash, 1, connection)]);

    return result[0];

}

async function updateAffiliates(userId, affiliate, connection) {
    let params = [];
    var sql = "update AffiliateNetwork set `id`= ?";
    params.push(affiliate.id)
    if (affiliate.name != undefined) {
        sql += ",`name`=?";
        params.push(affiliate.name);
    }
    if (affiliate.postbackUrl != undefined) {
        sql += ",`postbackUrl`=?";
        params.push(affiliate.postbackUrl);
    }
    if (affiliate.appendClickId != undefined) {
        sql += ",`appendClickId`= ?";
        params.push(affiliate.appendClickId);
    }
    if (affiliate.duplicatedPostback != undefined) {
        sql += ",`duplicatedPostback`= ?";
        params.push(affiliate.duplicatedPostback);
    }
    if (affiliate.ipWhiteList != undefined) {
        sql += ",`ipWhiteList`=?";
        params.push(affiliate.ipWhiteList);
    }

    sql += " where `userId`= ? and `id`= ?";

    params.push(userId);
    params.push(affiliate.id);
    let result = await query(sql, params, connection);
    let affiliateResult = await query("select `name`,`hash` from AffiliateNetwork where `id`=? and `userId`= ?", [affiliate.id, userId], connection);
    if (affiliateResult.length) {
        await insertEventLog(userId, 5, affiliateResult[0].name, affiliateResult[0].hash, 2, connection);
    }
    return result;
}


async function deleteAffiliate(id, userId, connection) {
    var sqlCampaign = "update AffiliateNetwork set `deleted`= 1  where `id`= ? and `userId`= ? ";

    await query(sqlCampaign, [id, userId], connection);
    let affiliateResult = await query("select `name`,`hash` from AffiliateNetwork where `id`=? and `userId`= ?", [id, userId], connection);
    if (affiliateResult.length) {
        await insertEventLog(userId, 5, affiliateResult[0].name, affiliateResult[0].hash, 3, connection);
    }
    return true;
}

exports.deleteAffiliate = deleteAffiliate;
exports.updateAffiliates = updateAffiliates;
exports.insertAffiliates = insertAffiliates;
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
exports.insertTrafficSource = insertTrafficSource;
exports.gettrafficDetail = gettrafficDetail;
exports.updatetraffic = updatetraffic;
exports.deleteCampaign = deleteCampaign;
exports.deleteFlow = deleteFlow;
exports.deleteLander = deleteLander;
exports.deleteOffer = deleteOffer;
exports.deletetraffic = deletetraffic;
exports.query = query;
exports.deletePath2Rule = deletePath2Rule;
exports.deleteRule2Flow = deleteRule2Flow;
exports.deleteLander2Path = deleteLander2Path;
exports.deleteOffer2Path = deleteOffer2Path;