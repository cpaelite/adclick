var express = require('express');
var router = express.Router();
var Joi = require('joi');
var common = require('./common');
var setting = require('../config/setting');
var uuidV4 = require('uuid/v4');
var util = require('../util');
var saveOrUpdateFlow = require('./flow').saveOrUpdateFlow;
var _ = require('lodash');


/**
 * @api {post} /api/campaigns/ 新增campaign
 * @apiName 新增campaign
 * @apiGroup campaign
 *
 * @apiParam {String} name
 * @apiParam {String} [url]
 * @apiParam {String} [impPixelUrl]
 * @apiParam {Object} trafficSource {id:1,name:""}
 * @apiParam {String} country   AND
 * @apiParam {Number} costModel  0:Do-not-track-costs;1:cpc;2:cpa;3:cpm;4:auto?
 * @apiParam {Number} [cpc]
 * @apiParam {Number} [cpa]
 * @apiParam {Number} [cpm]
 * @apiParam {Number} redirectMode 0:302;1:Meta refresh;2:Double meta refresh
 * @apiParam {Array} [tags]
 * @apiParam {Number} targetType 跳转类型 0:URL;1:Flow;2:Rule;3:Path;4:Lander;5:Offer
 * @apiParam {Number} [targetFlowId] targetType 为 1
 * @apiParam {String} [targetUrl]  targetType 为 0
 * @apiParam {Number} status
 * @apiParam {String} [postbackUrl]
 * @apiParam {String} [pixelRedirectUrl]
 *
 * @apiSuccessExample {json} Success-Response:
 *   {
 *    status: 1,
 *    message: 'success',
 *    data:{}
 *
 *   }
 *
 */
router.post('/api/campaigns', async function (req, res, next) {
    var schema = Joi.object().keys({
        userId: Joi.number().required(),
        idText: Joi.string().required(),
        name: Joi.string().required(),
        trafficSource: Joi.object().required(),
        costModel: Joi.number().required(),
        redirectMode: Joi.number().required(),
        targetType: Joi.number().required(),
        status: Joi.number().required(),
        flow: Joi.object().optional().keys({
            rules: Joi.array(),
            hash: Joi.string(),
            type: Joi.number(),
            id: Joi.number(),
            name: Joi.string(),
            country: Joi.string(),
            redirectMode: Joi.number()
        }).optionalKeys('id', 'hash', 'type', 'name', 'country', 'redirectMode', 'rules'),
        url: Joi.string().optional().allow(""),
        country: Joi.string().optional(),
        impPixelUrl: Joi.string().optional().empty(""),
        cpc: Joi.number().optional(),
        cpa: Joi.number().optional(),
        cpm: Joi.number().optional(),
        tags: Joi.array().optional(),
        hash: Joi.string().optional(),
        targetUrl: Joi.string().regex(util.regWebURL, 'targetUrl').optional().allow(""),
        targetFlowId: Joi.number().optional(),
        postbackUrl: Joi.string().optional().empty(""),
        pixelRedirectUrl: Joi.string().optional().empty(""),
        deleted: Joi.number().optional()
    });
    let connection;
    try {
        req.body.userId = req.parent.id;
        req.body.idText = req.parent.idText;
        let value = await common.validate(req.body, schema);
        connection = await common.getConnection();
        let data = await start(req.user.id, value, connection);
        data.deleted = 0;
        res.json({
            status: 1,
            message: 'success',
            data: data
        });
    } catch (e) {
        next(e);
    } finally {
        if (connection) {
            connection.release();
        }
    }
});

/**
 * @api {post} /api/campaigns/:id 编辑campaign
 * @apiName 编辑campaign
 * @apiGroup campaign
 *
 * @apiParam {Number} id
 * @apiParam {String} name
 * @apiParam {String} [url]
 * @apiParam {String} [impPixelUrl]
 * @apiParam {Object} trafficSource {id:1,name:""}
 * @apiParam {String} country   "AND"
 * @apiParam {Number} costModel  0:Do-not-track-costs;1:cpc;2:cpa;3:cpm;4:auto?
 * @apiParam {Number} [cpc]
 * @apiParam {Number} [cpa]
 * @apiParam {Number} [cpm]
 * @apiParam {Number} redirectMode 0:302;1:Meta refresh;2:Double meta refresh
 * @apiParam {Array} [tags]
 * @apiParam {Number} targetType 跳转类型 0:URL;1:Flow;2:Rule;3:Path;4:Lander;5:Offer
 * @apiParam {Number} [targetFlowId] targetType 为 1
 * @apiParam {String} [targetUrl]  targetType 为 0
 * @apiParam {Number} status
 * @apiParam {String} [postbackUrl]
 * @apiParam {String} [pixelRedirectUrl]
 *
 * @apiSuccessExample {json} Success-Response:
 *   {
 *    status: 1,
 *    message: 'success',
 *    data:{}
 *
 *   }
 *
 */
router.post('/api/campaigns/:id', async function (req, res, next) {
    var schema = Joi.object().keys({
        id: Joi.string().required(),
        userId: Joi.number().required(),
        idText: Joi.string().required(),
        name: Joi.string().optional(),
        trafficSource: Joi.object().optional(),
        costModel: Joi.number().optional(),
        redirectMode: Joi.number().optional(),
        targetType: Joi.number().optional(),
        status: Joi.number().optional(),
        flow: Joi.object().optional().keys({
            rules: Joi.array(),
            hash: Joi.string(),
            type: Joi.number(),
            id: Joi.number(),
            name: Joi.string(),
            country: Joi.string(),
            redirectMode: Joi.number()
        }).optionalKeys('id', 'hash', 'type', 'name', 'country', 'redirectMode', 'rules'),
        url: Joi.string().optional(),
        country: Joi.string().optional().allow(""),
        impPixelUrl: Joi.string().optional(),
        cpc: Joi.number().optional(),
        cpa: Joi.number().optional(),
        cpm: Joi.number().optional(),
        tags: Joi.array().optional(),
        hash: Joi.string().optional().empty(""),
        targetUrl: Joi.string().regex(util.regWebURL, 'targetUrl').optional().allow(""),
        targetFlowId: Joi.number().optional(),
        postbackUrl: Joi.string().optional().empty(""),
        pixelRedirectUrl: Joi.string().optional().empty(""),
        deleted: Joi.number().optional()
    });
    let connection;
    try {
        req.body.userId = req.parent.id;
        req.body.id = req.params.id;
        req.body.idText = req.parent.idText;
        let value = await common.validate(req.body, schema);
        connection = await common.getConnection();
        var ids = value.id.split(','), p = [];
        //restore check
        if (value.deleted == 0) {
            ids.forEach((id) => {
              p.push(checkCampaignRelativeFlowstatus(value.userId, id, connection))
            });
            let archivedArray = await Promise.all(p);
            let hasArchived = archivedArray.some((archived) => {
              return archived.length > 0;
            });
            // let archivedArray = await checkCampaignRelativeFlowstatus(value.userId, value.id, connection);
            if (hasArchived) {
                return res.json({
                    status: 0,
                    message: 'restore Interrupt',
                    data: {
                        flows: archivedArray
                    }
                });
            }
        }

        let promiseArr = [];
        ids.forEach((id) => {
          let v = _.clone(value, true);
          v.id = Number(id);
          promiseArr.push(start(req.user.id, v, connection))
        });
        let data = await Promise.all(promiseArr);
        res.json({
            status: 1,
            message: 'success',
            data: data
        });
    } catch (e) {
        next(e);
    } finally {
        if (connection) {
            connection.release();
        }
    }
});

async function checkCampaignRelativeFlowstatus(userId, campaignId, connection) {
    let sql = `select f.id,f.deleted as archived  from  TrackingCampaign cam
              inner join Flow f on cam.targetFlowId = f.id
              where cam.id=? and cam.targetType > 0 and cam.userId= ?`;
    let result = await common.query(sql, [campaignId, userId], connection);
    let archivedArray = [];//缓存删除状态的flow
    if (result.length) {
        for (let index = 0; index < result.length; index++) {
            if (result[index].archived == 1) {
                archivedArray.push(result[index]);
            }
        }
    }
    return archivedArray;
}


const start = async (subId, value, connection) => {
    let targetFlowId;
    //新建campaign path
    if (value.flow && value.flow.type == 0) {
        let flowObject = value.flow;
        flowObject.userId = value.userId;
        flowObject.idText = value.idText;
        let flowValue = await saveOrUpdateFlow(subId, flowObject, connection);
        targetFlowId = flowValue.id;
    }
    if (targetFlowId) {
        value.targetFlowId = targetFlowId;
    }

    await saveOrUpdateCampaign(subId, value, connection)

    if (value.flow && value.flow.userId) {
        delete value.flow.userId
    }
    if (value.flow && value.flow.idText) {
        delete value.flow.idText;
    }
    delete value.userId;
    delete value.idText;
    return value;
}

const saveOrUpdateCampaign = async (subId, value, connection) => {
    //check campaign name exists
    if (await common.checkNameExists(value.userId, value.id ? value.id : null, value.name, 1, connection)) {
        throw new Error("Campaign name exists");
    }
    //Campaign
    let campResult;
    if (value.id) {
        await common.updateCampaign(subId, value, connection);
    } else {
        let hash = uuidV4();
        let mainDomainsql = "select `domain`,`customize` from UserDomain where `userId`= ? and `main` = 1 and `deleted` = 0";
        campResult = await common.insertCampaign(subId, value, hash, connection);
        let domainResult = await common.query(mainDomainsql, [value.userId], connection);
        value.hash = hash;

        let defaultDomain;
        //如果自己定义了main domain 优先
        if (domainResult.length) {
            if (domainResult[0].customize == 1) {
                defaultDomain = domainResult[0].domain;
            } else {
                defaultDomain = value.idText + "." + domainResult[0].domain;
            }
        } else {
            //默认使用系统配置
            for (let index = 0; index < setting.domains.length; index++) {
                if (setting.domains[index].postBackDomain) {
                    defaultDomain = value.idText + "." + setting.domains[index].address;
                }
            }
        }
        value.url = setting.newbidder.httpPix + defaultDomain + "/" + value.hash;
        value.impPixelUrl = setting.newbidder.httpPix + defaultDomain + setting.newbidder.impRouter + "/" + value.hash;
    }

    let campaignId = value.id ? value.id : (campResult ? (campResult.insertId ? campResult.insertId : 0) : 0);

    if (!campaignId) {
        throw new Error('Campaign ID Lost')
    }
    //campaignId
    value.id = campaignId;
    //删除所有tags
    await common.updateTags(value.userId, campaignId, 1, connection);
    //campain Tags
    if (value.tags && value.tags.length > 0) {
        if (value.tags && value.tags.length > 0) {
            for (let index = 0; index < value.tags.length; index++) {
                await common.insertTags(value.userId, campaignId, value.tags[index], 1, connection);
            }
        }
    }

    return true;

}

router.get('/api/campaigns', async function (req, res, next) {
    let connection;
    try {
        var schema = Joi.object().keys({
            userId: Joi.number().required(),
            idText: Joi.string().required()
        });
        req.query.userId = req.parent.id;
        req.query.idText = req.parent.idText;
        let value = await common.validate(req.query, schema);
        connection = await common.getConnection();
        let result = await common.query('select id,name from TrackingCampaign where userId= ? and deleted = ?', [value.userId, 0], connection);
        res.json({
            status: 1,
            message: 'success',
            data: result ? result : {}
        });
    } catch (e) {
        next(e);
    }
    finally {
        if (connection) {
            connection.release();
        }

    }

});

/**
 * @api {get} /api/campaign/:id   campaign detail
 * @apiName  campaign detail
 * @apiGroup campaign
 */
router.get('/api/campaigns/:id', async function (req, res, next) {
    let connection;
    try {
        var schema = Joi.object().keys({
            id: Joi.number().required(),
            userId: Joi.number().required(),
            idText: Joi.string().required()
        });
        req.query.userId = req.parent.id;
        req.query.id = req.params.id;
        req.query.idText = req.parent.idText;
        let value = await common.validate(req.query, schema);
        connection = await common.getConnection();
        let result = await common.getCampaign(value.id, value.userId, value.idText, connection);
        res.json({
            status: 1,
            message: 'success',
            data: result ? result : {}
        });
    } catch (e) {
        next(e);
    }
    finally {
        if (connection) {
            connection.release();
        }

    }


});

/**
 * @api {delete} /api/campaigns/:id   delete campaign
 * @apiName  delete campaign
 * @apiGroup campaign
 * @apiParam hash
 * @apiParam name
 *
 */
router.delete('/api/campaigns/:id', async function (req, res, next) {

    let connection;
    try {
        var schema = Joi.object().keys({
            id: Joi.string().required(),
            userId: Joi.number().required(),
            hash: Joi.string().optional(),
            name: Joi.string().optional()
        });
        req.query.userId = req.parent.id;
        req.query.id = req.params.id;
        let value = await common.validate(req.query, schema);
        connection = await common.getConnection();
        var idArr = value.id.split(','), p = [];
        idArr.forEach((id) => {
          p.push(common.deleteCampaign(req.user.id, id, value.userId, connection));
        });
        await Promise.all(p);
        // let result = await common.deleteCampaign(req.user.id, value.id, value.userId, connection);
        res.json({
            status: 1,
            message: 'success'
        });

    } catch (e) {
        next(e);
    }
    finally {
        if (connection) {
            connection.release();
        }

    }


});


module.exports = router;
