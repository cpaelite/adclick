var Joi = require('joi');
var uuidV4 = require('uuid/v4');
var redis = require("redis");
var setting = require("../config/setting");



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
                let validateJSON={
                    code:8,
                    message:"validate error",
                    data:{}
                }
                for(let index=0;index<err.details.length;index++){
                    validateJSON.data[err.details[index].path]=err.details[index].message;
                }
                reject(validateJSON);
            }
            resolve(value);
        })
    });
}

// Campaign
function insertCampaign(value, hash, connection) {
    // //url
    // let urlValue = setting.newbidder.httpPix + value.idText + "." + setting.newbidder.mainDomain + "/" + hash;
    // let impPixelUrl = setting.newbidder.httpPix + value.idText + "." + setting.newbidder.mainDomain + setting.newbidder.impRouter + "/" + hash

    // value.url = urlValue;
    // value.impPixelUrl = impPixelUrl;
    //required
    var col = "`userId`";
    var val = value.userId;

    col += ",`costModel`";
    val += "," + value.costModel;

    col += ",`targetType`";
    val += "," + value.targetType

    col += ",`name`";
    val += ",'" + value.name + "'";

    col += ",`hash`";
    val += ",'" + hash + "'";

    // col += ",`url`";
    // val += ",'" + value.url + "'";

    col += ",`trafficSourceId`";
    val += "," + value.trafficSource.id;

    col += ",`trafficSourceName`";
    val += ",'" + value.trafficSource.name + "'";

    col += ",`redirectMode`";
    val += "," + value.redirectMode;

    col += ",`status`";
    val += "," + value.status;

    // col += ",`impPixelUrl`";
    // val += ",'" + impPixelUrl + "'";

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

    if (value.postbackUrl) {
        col += ",`postbackUrl`";
        val += ",'" + value.postbackUrl + "'";
    }

    if (value.pixelRedirectUrl) {
        col += ",`postbackUrl`";
        val += ",'" + value.pixelRedirectUrl + "'";
    }

    if (value.country) {
        // var countryCode = value.country.alpha3Code ? value.country.alpha3Code: "";
        col += ",`country`";
        val += ",'" + value.country + "'";
    }

    if (value.targetUrl) {
        col += ",`targetUrl`";
        val += ",'" + value.targetUrl + "'";
    }

    //flow targetType=1 &&  flow.id
    if (value.flow && value.flow.id) {
        col += ",`targetFlowId`";
        val += "," + value.flow.id;
    }

    return new Promise(function (resolve, reject) {
        connection.query("insert into TrackingCampaign (" + col + ") values (" + val + ")", function (err, result) {
            if (err) {
                return reject(err);
            }
            connection.query("insert into UserEventLog (`userId`,`entityType`,`entityName`,`entityId`,`actionType`,`changedAt`) values (?,?,?,?,?,unix_timestamp(now()))", [value.userId, 1, value.name ? value.name : "", hash, 1], function (err) {
                if (err) {
                    return reject(err);
                }
                resolve(result);
            });
        });
    })
}

function updateCampaign(value, connection) {
    var sqlCampaign = "update TrackingCampaign set `id`=" + value.id;
    if (value.name) {
        sqlCampaign += ",`name`='" + value.name + "'"
    }
    if (value.url) {
        sqlCampaign += ",`url`='" + value.url + "'"
    }
    if (value.trafficSource && value.trafficSource.id) {
        sqlCampaign += ",`trafficSourceId`='" + value.trafficSource.id + "'"
    }
    if (value.trafficSource && value.trafficSource.name) {
        sqlCampaign += ",`trafficSourceName`='" + value.trafficSource.name + "'"
    }

    if (value.impPixelUrl) {
        sqlCampaign += ",`impPixelUrl`='" + value.impPixelUrl + "'"
    }
    if (value.cpc != undefined) {
        sqlCampaign += ",`cpcValue`=" + value.cpc
    }
    if (value.cpa != undefined) {
        sqlCampaign += ",`cpaValue`=" + value.cpa
    }
    if (value.cpm != undefined) {
        sqlCampaign += ",`cpmValue`=" + value.cpm
    }

    if (value.country) {
        //var countryCode = value.country.alpha3Code ? value.country.alpha3Code: "";
        sqlCampaign += ",`country`='" + value.country + "'"
    }

    if (value.costModel != undefined) {
        sqlCampaign += ",`costModel`=" + value.costModel
    }
    if (value.redirectMode != undefined) {
        sqlCampaign += ",`redirectMode`=" + value.redirectMode
    }
    if (value.status != undefined) {
        sqlCampaign += ",`status`=" + value.status
    }
    if (value.targetType != undefined) {
        sqlCampaign += ",`targetType`=" + value.targetType
    }

    if (value.targetUrl) {
        sqlCampaign += ",`targetUrl`='" + value.targetUrl + "'"
    }

    if (value.postbackUrl) {
        sqlCampaign += ",`postbackUrl`='" + value.postbackUrl + "'"
    }

    if (value.pixelRedirectUrl) {
        sqlCampaign += ",`pixelRedirectUrl`='" + value.pixelRedirectUrl + "'"
    }

    //flow targetType=1 &&  flow.id
    if (value.flow && value.flow.id) {
        sqlCampaign += ",`targetFlowId`=" + value.flow.id;

    }

    sqlCampaign += " where `id`=" + value.id + " and `userId`=" + value.userId
    return new Promise(function (resolve, reject) {
        connection.query(sqlCampaign, function (err, result) {
            if (err) {
                reject(err);
            }
            connection.query("insert into UserEventLog (`userId`,`entityType`,`entityName`,`entityId`,`actionType`,`changedAt`) values (?,?,?,?,?,unix_timestamp(now()))", [value.userId, 1, value.name ? value.name : "", value.hash ? value.hash : "", 2], function (err) {
                if (err) {
                    return reject(err);
                }
                resolve(result);
            });
        });
    })
}

async function getCampaign(id, userId, idText, connection) {

    let sqlCampaign = "select `id`,`name`,`hash`,`url`,`impPixelUrl`,`trafficSourceId`,`trafficSourceName`,`country`," +
        "`costModel`,`cpcValue`,`cpaValue`,`cpmValue`,`redirectMode`,`targetType`,`targetFlowId`,`targetUrl`,`status` from `TrackingCampaign` where `userId`=? and `id`=? and `deleted`=?"
    let sqltag = "select `name` from `Tags` where `userId`=? and `targetId`=? and `type`=? and `deleted`=?";

    let mainDomainsql = "select `domain` from UserDomain where `userId`= ? and `main` = 1";

    let results = await Promise.all([query(sqlCampaign, [userId, id, 0], connection), query(sqltag, [userId, id, 1, 0], connection), query(mainDomainsql, [userId], connection)]);
    let camResult = results[0];
    let tagsResult = results[1];
    let domainResult = results[2];

    let tags = [];
    for (let index = 0; index < tagsResult.length; index++) {
        tags.push(tagsResult[index].name);
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




function deleteCampaign(id, userId, hash, name, connection) {
    var sqlCampaign = "update TrackingCampaign set `deleted`= 1"
    sqlCampaign += " where `id`=" + id + " and `userId`=" + userId
    return new Promise(function (resolve, reject) {
        connection.query(sqlCampaign, function (err, result) {
            if (err) {
                reject(err);
            }
            connection.query("insert into UserEventLog (`userId`,`entityType`,`entityName`,`entityId`,`actionType`,`changedAt`) values (?,?,?,?,?,unix_timestamp(now()))", [userId, 1, name ? name : "", hash ? hash : "", 3], function (err) {
                if (err) {
                    return reject(err);
                }
                resolve(1);
            });
        });
    })
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
        //var countryCode = flow.country.alpha3Code ? flow.country.alpha3Code: "";
        col += ",`country`";
        val += ",'" + flow.country + "'";
    }
    ;

    return new Promise(function (resolve, reject) {
        connection.query("insert into Flow (" + col + ") values (" + val + ")", function (err, result) {
            if (err) {
                reject(err);
            }
            resolve(result);
        })
    });

};

function updateFlow(userId, flow, connection) {

    var sqlFlow = "update Flow set `id`=" + flow.id
    if (flow.name) {
        sqlFlow += ",`name`='" + flow.name + "'"
    }
    if (flow.country) {
        //var countryCode = flow.country.alpha3Code ? flow.country.alpha3Code: "";
        sqlFlow += ",`country`='" + flow.country + "'";
    }
    if (flow.redirectMode != undefined) {
        sqlFlow += ",`redirectMode`=" + flow.redirectMode;
    }
    if (flow.deleted != undefined) {
        sqlFlow += ",`deleted`=" + flow.deleted
    }

    sqlFlow += " where `id`=" + flow.id + " and `userId`=" + userId

    return new Promise(function (resolve, reject) {
        connection.query(sqlFlow, function (err, result) {
            if (err) {
                reject(err);
            }
            resolve(result);
        });
    })

}

function deleteFlow(id, userId, connection) {
    var sqlCampaign = "update Flow set `deleted`= 1"
    sqlCampaign += " where `id`=" + value.id + " and `userId`=" + value.userId
    return new Promise(function (resolve, reject) {
        connection.query(sqlCampaign, function (err, result) {
            if (err) {
                reject(err);
            }
            resolve(1);
        });
    })
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
    })
}

//Rule
function insetRule(userId, rule, connection) {
    var sqlRule = "insert into `Rule` (`userId`,`name`,`hash`,`type`,`object`,`json`,`status`) values (?,?,?,?,?,?,?)";
    return new Promise(function (resolve, reject) {
        connection.query(sqlRule, [userId, rule.name ? rule.name : "", uuidV4(), rule.isDefault ? 0 : 1, rule.json ?
            JSON.stringify(rule.json) : JSON.stringify([]), rule.object ?
                JSON.stringify(rule.object) : JSON.stringify([]), rule.enabled ? 1 : 0], function (err, result) {
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
        sqlRule += ",`name`='" + rule.name + "'"
    }
    if (rule.type != undefined) {
        sqlRule += ",`type`=" + rule.type
    }
    if (rule.json) {
        sqlRule += ",`json`='" + JSON.stringify(rule.object) + "'"
    }
    if (rule.object) {
        sqlRule += ",`object`='" + JSON.stringify(rule.json) + "'"
    }
    if (rule.status != undefined) {
        sqlRule += ",`status`=" + rule.status
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
        connection.query(sqlpath, [userId, path.name, uuidV4(), path.redirectMode, path.directLinking ? 1 : 0, path.enabled ? 1 : 0], function (err, result) {
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
        sqlUpdatePath += ",`name`='" + path.name + "'"
    }
    if (path.redirectMode != undefined) {
        sqlUpdatePath += ",`redirectMode`=" + path.redirectMode
    }
    if (path.directLink != undefined) {
        sqlUpdatePath += ",`directLink`=" + path.directLink
    }
    if (path.status != undefined) {
        sqlUpdatePath += ",`status`=" + path.status
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
    var col = "`userId`"

    var val = userId

    var hash = uuidV4();

    col += ",`name`";
    val += ",'" + lander.name + "'";

    col += ",`hash`";
    val += ",'" + hash + "'"

    col += ",`url`";
    val += ",'" + lander.url + "'";

    col += ",`numberOfOffers`";
    val += "," + lander.numberOfOffers;

    //optional
    if (lander.country) {
        //var countryCode = lander.country.alpha3Code ? lander.country.alpha3Code: "";
        col += ",`country`";
        val += ",'" + lander.country + "'";
    }

    return new Promise(function (resolve, reject) {
        connection.query("insert into Lander (" + col + ") values (" + val + ") ", function (err, result) {
            if (err) {
                reject(err);
            }
            connection.query("insert into UserEventLog (`userId`,`entityType`,`entityName`,`entityId`,`actionType`,`changedAt`) values (?,?,?,?,?,unix_timestamp(now()))", [userId, 2, lander.name ? lander.name : "", hash, 1], function (err) {
                if (err) {
                    return reject(err);
                }
                resolve(result);
            });
        });
    })

}

function updateLander(userId, lander, connection) {
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

    return new Promise(function (resolve, reject) {
        connection.query(sqlUpdateLander, params, function (err, result) {
            if (err) {
                reject(err);
            }
            connection.query("insert into UserEventLog (`userId`,`entityType`,`entityName`,`entityId`,`actionType`,`changedAt`) values (?,?,?,?,?,unix_timestamp(now()))", [userId, 2, lander.name ? lander.name : "", lander.hash ? lander.hash : "", 2], function (err) {
                if (err) {
                    return reject(err);
                }
                resolve(result);
            });
        });
    })
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
                if (lander[0]) {
                    lander[0].tags = tags;
                }

                resolve(lander[0])
            })
        })
    })
}

function deleteLander(id, userId, name, hash, connection) {
    var sqlCampaign = "update Lander set `deleted`= 1"
    sqlCampaign += " where `id`=" + id + " and `userId`=" + userId
    return new Promise(function (resolve, reject) {
        connection.query(sqlCampaign, function (err, result) {
            if (err) {
                reject(err);
            }
            connection.query("insert into UserEventLog (`userId`,`entityType`,`entityName`,`entityId`,`actionType`,`changedAt`) values (?,?,?,?,?,unix_timestamp(now()))", [userId, 2, name ? name : "", hash ? hash : "", 3], function (err) {
                if (err) {
                    return reject(err);
                }
                resolve(1);
            });
        });
    })
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
    var sqllander2path = "delete from   Lander2Path   where `landerId` =? and `pathId`=?";
    return new Promise(function (resolve, reject) {
        connection.query(sqllander2path, [landerId, pathId], function (err, result) {
            if (err) {
                reject(err);
            }
            resolve(result);
        });
    })
}

function deleteLander2Path(pathId, connection) {
    var sqllander2path = "delete from   Lander2Path   where `pathId`=?";
    return new Promise(function (resolve, reject) {
        connection.query(sqllander2path, [pathId], function (err, result) {
            if (err) {
                reject(err);
            }
            resolve(result);
        });
    })
}

//Offer
function insertOffer(userId, idText, offer, connection) {

    //required
    var col = "`userId`"
    var val = userId
    var hash = uuidV4();

    col += ",`name`";
    val += ",'" + offer.name + "'"

    col += ",`hash`";
    val += ",'" + hash + "'"

    col += ",`url`";
    val += ",'" + offer.url + "'";

    col += ",`payoutMode`";
    val += "," + offer.payoutMode


    //optional
    if (offer.country) {
        //var countrycode = offer.country.alpha3Code ? offer.country.alpha3Code: "";
        col += ",`country`";
        val += ",'" + offer.country + "'";
    }

    if (offer.postbackUrl) {
        col += ",`postbackUrl`";
        val += ",'" + offer.postbackUrl + "'"
    }


    if (offer.payoutValue != undefined) {
        col += ",`payoutValue`";
        val += "," + offer.payoutValue
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
            connection.query("insert into UserEventLog (`userId`,`entityType`,`entityName`,`entityId`,`actionType`,`changedAt`) values (?,?,?,?,?,unix_timestamp(now()))", [userId, 3, offer.name ? offer.name : "", hash, 1], function (err) {
                if (err) {
                    return reject(err);
                }
                resolve(result);
            });
        });
    });
}

function updateOffer(userId, offer, connection) {
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

    return new Promise(function (resolve, reject) {
        connection.query(sqlUpdateOffer, params, function (err, result) {
            if (err) {
                reject(err);
            }
            connection.query("insert into UserEventLog (`userId`,`entityType`,`entityName`,`entityId`,`actionType`,`changedAt`) values (?,?,?,?,?,unix_timestamp(now()))", [userId, 3, offer.name ? offer.name : "", offer.hash ? offer.hash : "", 2], function (err) {
                if (err) {
                    return reject(err);
                }
                resolve(result);
            });
        });
    });

}

function getOfferDetail(id, userId, connection) {
    let sqlLander = "select `id`,`name`,`hash`,`url`,`country`,`AffiliateNetworkId`,`AffiliateNetworkName`,`postbackUrl`,`payoutMode`,`payoutValue` from `Offer` where `userId`=? and `id`=?";
    let sqltag = "select `name` from `Tags` where `userId`=? and `targetId`=? and `type`=? and `deleted`=?";
    return new Promise(function (resolve, reject) {
        connection.query(sqlLander, [userId, id], function (err, lander) {
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
                if (lander[0]) {
                    lander[0].tags = tags;
                }
                resolve(lander[0])
            })
        })
    })
}

function deleteOffer(id, userId, name, hash, connection) {
    var sqlCampaign = "update Offer set `deleted`= 1"
    sqlCampaign += " where `id`=" + id + " and `userId`=" + userId;
    return new Promise(function (resolve, reject) {
        connection.query(sqlCampaign, function (err, result) {
            if (err) {
                reject(err);
            }
            connection.query("insert into UserEventLog (`userId`,`entityType`,`entityName`,`entityId`,`actionType`,`changedAt`) values (?,?,?,?,?,unix_timestamp(now()))", [userId, 3, name ? name : "", hash ? hash : "", 3], function (err) {
                if (err) {
                    return reject(err);
                }
                resolve(1);
            });
        });
    })
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
    })
}

function updateOffer2Path(offerId, pathId, weight, connection) {
    var sqloffer2path = "delete from   Offer2Path  where `offerId`=? and `pathId`=?";
    return new Promise(function (resolve, reject) {
        connection.query(sqloffer2path, [offerId, pathId], function (err, result) {
            if (err) {
                reject(err);
            }
            resolve(result);
        });
    })
}

function deleteOffer2Path(pathId, connection) {
    var sqloffer2path = "delete from   Offer2Path  where  `pathId`=?";
    return new Promise(function (resolve, reject) {
        connection.query(sqloffer2path, [pathId], function (err, result) {
            if (err) {
                reject(err);
            }
            resolve(result);
        });
    })
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
    var sqlpath2rule = "delete  from Path2Rule   where `pathId`=? and `ruleId`=?";
    return new Promise(function (resolve, reject) {
        connection.query(sqlpath2rule, [pathId, ruleId], function (err, result) {
            if (err) {
                reject(err);
            }
            resolve(result);
        });
    });
}
function deletePath2Rule(ruleId, connection) {
    var sqlpath2rule = "delete  from Path2Rule  where  `ruleId`=?";
    return new Promise(function (resolve, reject) {
        connection.query(sqlpath2rule, [ruleId], function (err, result) {
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
    var sqlrule2flow = "delete from   Rule2Flow   where  `ruleId`=?  and `flowId`=?";
    return new Promise(function (resolve, reject) {
        connection.query(sqlrule2flow, [ruleId, flowId], function (err, result) {
            if (err) {
                reject(err);
            }
            resolve(result);
        });
    });
}

function deleteRule2Flow(flowId, connection) {
    var sqlrule2flow = "delete from  Rule2Flow   where  `flowId`=?";
    return new Promise(function (resolve, reject) {
        connection.query(sqlrule2flow, [flowId], function (err, result) {
            if (err) {
                reject(err);
            }
            resolve(result);
        });
    });
}

function insertTrafficSource(userId, traffic, connection) {
    return new Promise(function (resolve, reject) {
        //required
        var col = "`userId`"
        var val = userId
        var hash = uuidV4();

        col += ",`name`";
        val += ",'" + traffic.name + "'"

        col += ",`hash`";
        val += ",'" + hash + "'"

        if (traffic.postbackUrl) {
            col += ",`postbackUrl`";
            val += ",'" + traffic.postbackUrl + "'"
        }

        if (traffic.pixelRedirectUrl) {
            col += ",`pixelRedirectUrl`";
            val += ",'" + traffic.pixelRedirectUrl + "'"
        }

        if (traffic.impTracking != undefined) {
            col += ",`impTracking`";
            val += "," + traffic.impTracking
        }
        if (traffic.externalId) {
            col += ",`externalId`";
            val += ",'" + traffic.externalId + "'"
        }
        if (traffic.cost) {
            col += ",`cost`";
            val += ",'" + traffic.cost + "'"
        }
        if (traffic.params) {
            col += ",`params`";
            val += ",'" + traffic.params + "'"
        }
        var sqltraffic = "insert into TrafficSource (" + col + ") values (" + val + ") ";

        connection.query(sqltraffic, function (err, result) {
            if (err) {
                reject(err);
            }
            connection.query("insert into UserEventLog (`userId`,`entityType`,`entityName`,`entityId`,`actionType`,`changedAt`) values (?,?,?,?,?,unix_timestamp(now()))", [userId, 4, traffic.name ? traffic.name : "", hash, 1], function (err) {
                if (err) {
                    return reject(err);
                }
                resolve(result);
            });
        });
    });
}

function updatetraffic(userId, traffic, connection) {
    return new Promise(function (resolve, reject) {
        var sqlUpdateOffer = "update  TrafficSource  set `id`=" + traffic.id;
        if (traffic.name != undefined) {
            sqlUpdateOffer += ",`name`='" + traffic.name + "'"
        }
        if (traffic.postbackUrl != undefined) {
            sqlUpdateOffer += ",`postbackUrl`='" + traffic.postbackUrl + "'"
        }

        if (traffic.pixelRedirectUrl != undefined) {
            sqlUpdateOffer += ",`pixelRedirectUrl`='" + traffic.pixelRedirectUrl + "'"
        }
        if (traffic.impTracking != undefined) {
            sqlUpdateOffer += ",`impTracking`=" + traffic.impTracking
        }
        if (traffic.externalId != undefined) {
            sqlUpdateOffer += ",`externalId`='" + traffic.externalId + "'"
        }
        if (traffic.cost != undefined) {
            sqlUpdateOffer += ",`cost`='" + traffic.cost + "'"
        }
        if (traffic.params != undefined) {
            sqlUpdateOffer += ",`params`='" + traffic.params + "'"
        }
        sqlUpdateOffer += " where `userId`=" + userId + " and `id`= " + traffic.id;

        connection.query(sqlUpdateOffer, function (err, result) {
            if (err) {
                reject(err);
            }
            connection.query("insert into UserEventLog (`userId`,`entityType`,`entityName`,`entityId`,`actionType`,`changedAt`) values (?,?,?,?,?,unix_timestamp(now()))", [userId, 4, traffic.name ? traffic.name : "", traffic.hash ? traffic.hash : "", 2], function (err) {
                if (err) {
                    return reject(err);
                }
                resolve(result);
            });
        });
    })
}

function gettrafficDetail(id, userId, connection) {
    return new Promise(function (resolve, reject) {
        connection.query("select `id`, `name`,`hash`,`postbackUrl`,`pixelRedirectUrl`,`impTracking`,`externalId`,`cost`,`params` from `TrafficSource` where `userId`=? and `id`=? ", [userId, id], function (err, result) {
            if (err) {
                reject(err);
            }
            resolve(result);
        });
    });
}

function deletetraffic(id, userId, name, hash, connection) {
    var sqlCampaign = "update TrafficSource set `deleted`= 1"
    sqlCampaign += " where `id`=" + id + " and `userId`=" + userId
    return new Promise(function (resolve, reject) {
        connection.query(sqlCampaign, function (err, result) {
            if (err) {
                reject(err);
            }
            connection.query("insert into UserEventLog (`userId`,`entityType`,`entityName`,`entityId`,`actionType`,`changedAt`) values (?,?,?,?,?,unix_timestamp(now()))", [userId, 4, name ? name : "", hash ? hash : "", 3], function (err) {
                if (err) {
                    return reject(err);
                }
                resolve(1);
            });
        });
    })
}

function saveEventLog(userId, entityType, entityName, entityId, actionType, connection) {

    return new Promise(function (resolve, reject) {
        connection.query("insert into UserEventLog (`userId`,`entityType`,`entityName`,`entityId`,`actionType`,`changedAt`) values (?,?,?,?,?,unix_timestamp(now()))", [userId, entityType, entityName, entityId, actionType], function (err, result) {
            if (err) {
                reject(err);
            }
            resolve(1);
        });
    })
}

function insertAffiliates(userId, affiliate, connection) {
    return new Promise(function (resolve, reject) {
        var hash = uuidV4();
        var sql = "insert into AffiliateNetwork set `userId`= " +
            userId + ",`name`='" + affiliate.name + "',`hash`= '" + hash + "'";

        if (affiliate.postbackUrl) {
            sql += ",`postbackUrl`='" + affiliate.postbackUrl + "'"
        }
        if (affiliate.appendClickId != undefined) {
            sql += ",`appendClickId`='" + affiliate.appendClickId + "'"
        }
        if (affiliate.duplicatedPostback != undefined) {
            sql += ",`duplicatedPostback`='" + affiliate.duplicatedPostback +
                "'"
        }
        if (affiliate.ipWhiteList) {
            sql += ",`ipWhiteList`='" + affiliate.ipWhiteList + "'"
        }
        connection.query(sql, function (err, result) {
            if (err) {
                reject(err);
            }
            connection.query("insert into UserEventLog (`userId`,`entityType`,`entityName`,`entityId`,`actionType`,`changedAt`) values (?,?,?,?,?,unix_timestamp(now()))", [userId, 5, affiliate.name ? affiliate.name : "", hash ? hash : "", 1], function (err) {
                if (err) {
                    return reject(err);
                }
                resolve(result);
            });
        });
    });
}

function updateAffiliates(userId, affiliate, connection) {
    return new Promise(function (resolve, reject) {
        var sql = "update AffiliateNetwork set `id`= " + affiliate.id;

        if (affiliate.name) {
            sql += ",`name`='" + affiliate.name + "'"
        }
        if (affiliate.postbackUrl) {
            sql += ",`postbackUrl`='" + affiliate.postbackUrl + "'"
        }
        if (affiliate.appendClickId != undefined) {
            sql += ",`appendClickId`=" + affiliate.appendClickId
        }
        if (affiliate.duplicatedPostback != undefined) {
            sql += ",`duplicatedPostback`=" + affiliate.duplicatedPostback
        }
        if (affiliate.ipWhiteList) {
            sql += ",`ipWhiteList`='" + affiliate.ipWhiteList + "'"
        }

        sql += " where `userId`=" + userId + " and `id`=" +
            affiliate.id
        connection.query(sql, function (err, result) {
            if (err) {
                reject(err);
            }
            connection.query("insert into UserEventLog (`userId`,`entityType`,`entityName`,`entityId`,`actionType`,`changedAt`) values (?,?,?,?,?,unix_timestamp(now()))", [userId, 5, affiliate.name ? affiliate.name : "", affiliate.hash ? affiliate.hash : "", 2], function (err) {
                if (err) {
                    return reject(err);
                }
                resolve(result);
            });
        });
    });
}


function deleteAffiliate(id, userId, name, hash, connection) {
    var sqlCampaign = "update AffiliateNetwork set `deleted`= 1"
    sqlCampaign += " where `id`=" + id + " and `userId`=" + userId
    return new Promise(function (resolve, reject) {
        connection.query(sqlCampaign, function (err, result) {
            if (err) {
                reject(err);
            }
            connection.query("insert into UserEventLog (`userId`,`entityType`,`entityName`,`entityId`,`actionType`,`changedAt`) values (?,?,?,?,?,unix_timestamp(now()))", [userId, 5, name ? name : "", hash ? hash : "", 3], function (err) {
                if (err) {
                    return reject(err);
                }
                resolve(1);
            });
        });
    })
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
exports.saveEventLog = saveEventLog;
exports.query = query;
exports.deletePath2Rule = deletePath2Rule;
exports.deleteRule2Flow = deleteRule2Flow;
exports.deleteLander2Path = deleteLander2Path;
exports.deleteOffer2Path = deleteOffer2Path;