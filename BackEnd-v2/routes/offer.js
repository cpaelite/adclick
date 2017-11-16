/**
 * Created by Aedan on 11/01/2017.
 */

var express = require('express');
var router = express.Router();
var Joi = require('joi');
var common = require('./common');
var setting = require('../config/setting');
var _ = require('lodash');
var util = require('../util');

/**
 * @api {post} /api/offers  新增offer
 * @apiName 新增offer
 * @apiGroup offer
 *
 * @apiParam {String} name
 * @apiParam {String} url
 * @apiParam {Number} payoutMode
 * @apiParam {Object} affiliateNetwork {"id":1,name:""}
 * @apiParam {Number} [payoutValue]
 * @apiParam {String} country ""
 * @apiParam {Array}  [tags]
 *
 * @apiSuccessExample {json} Success-Response:
 *   {
 *    status: 1,
 *    message: 'success' *   }
 *
 */
router.post('/api/offers', async function (req, res, next) {
    var schema = Joi.object().keys({
        userId: Joi.number().required(),
        idText: Joi.string().required(),
        name: Joi.string().required(),
        url: Joi.string().required().regex(util.regWebURL, 'url'),
        country: Joi.string().optional().allow(""),
        payoutMode: Joi.number().required(),
        affiliateNetwork: Joi.object().optional().keys({
            id: Joi.number().required(),
            name: Joi.string().required(),
            postbackUrl: Joi.string().optional().allow("")
        }),
        payoutValue: Joi.number().optional(),
        tags: Joi.array().optional(),
        capEnabled: Joi.number().required(),
        dailyCap: Joi.number().optional(),
        capTimezoneId: Joi.number().optional(),
        redirectOfferId: Joi.number().optional()
    });

    req.body.userId = req.parent.id;
    req.body.idText = req.parent.idText;
    let connection;
    try {
        let value = await common.validate(req.body, schema);
        console.log(value)
        connection = await common.getConnection();
        //check offer name exists
        if (await common.checkNameExists(value.userId, null, value.name, 3, connection)) {
            throw new Error("Offer name exists");
        }

        let postbackUrl = setting.newbidder.httpPix + value.idText + "." + setting.newbidder.mainDomain + setting.newbidder.postBackRouter;
        value.postbackUrl = postbackUrl;
        let landerResult = await common.insertOffer(req.user.id, value.userId, value.idText, value, connection);
        if (value.tags && value.tags.length) {
            for (let index = 0; index < value.tags.length; index++) {
                await common.insertTags(value.userId, landerResult.insertId, value.tags[index], 3, connection);
            }
        }


        delete value.userId;
        delete value.idText;
        value.id = landerResult.insertId;
        value.deleted = 0;
        res.json({
            status: 1,
            message: 'success',
            data: value
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
 * @api {post} /api/offers/:offerId  编辑offer
 * @apiName 编辑offer
 * @apiGroup offer
 *
 * @apiParam {Number} id
 * @apiParam {String} [name]
 * @apiParam {String} [url]
 * @apiParam {String} [postbackUrl]
 * @apiParam {Number} [payoutMode]
 * @apiParam {Number} [affiliateNetwork] {"id":1,name:""}
 * @apiParam {Number} [payoutValue]
 * @apiParam {String} [country]
 * @apiParam {Number} [deleted]
 * @apiParam {Array} [tags]
 *
 * @apiSuccessExample {json} Success-Response:
 *   {
 *    status: 1,
 *    message: 'success'
 *   }
 *
 */
router.post('/api/offers/:id', async function (req, res, next) {
    var schema = Joi.object().keys({
        id: Joi.string().required(),
        hash: Joi.string().optional(),
        userId: Joi.number().required(),
        idText: Joi.string().required(),
        name: Joi.string().optional(),
        url: Joi.string().optional().regex(util.regWebURL, 'url'),
        country: Joi.string().optional().allow(""),
        payoutMode: Joi.number().optional(),
        affiliateNetwork: Joi.object().optional().keys({
            id: Joi.number().required(),
            name: Joi.string().required(),
            postbackUrl: Joi.string().optional().allow("")
        }),
        payoutValue: Joi.number().optional(),
        tags: Joi.array().optional(),
        deleted: Joi.number().optional(),
        capEnabled: Joi.number().optional(),
        dailyCap: Joi.number().optional(),
        capTimezoneId: Joi.number().optional(),
        redirectOfferId: Joi.number().optional()
    });

    req.body.userId = req.parent.id;
    req.body.idText = req.parent.idText;
    req.body.id = req.params.id;
    let connection;
    try {
        let value = await common.validate(req.body, schema);
        connection = await common.getConnection();
        //check offer name exists
        if(value.name) {
          value.id = Number(value.id);
          if (await common.checkNameExists(value.userId, Number(value.id), value.name, 3, connection)) {
            throw new Error("Offer name exists");
          }

          await common.updateTags(value.userId, value.id, 3, connection);
          if (value.tags && value.tags.length) {
            for (let index = 0; index < value.tags.length; index++) {
              await common.insertTags(value.userId, value.id, value.tags[index], 3, connection);
            }
          }
          await common.updateOffer(req.user.id, value.userId, value, connection);
        } else {
          var ids = value.id.split(','), p = [];
          ids.forEach((id) => {
            let v = _.clone(value, true);
            v.id = id;
            p.push(common.updateOffer(req.user.id, value.userId, v, connection));
          });
          await Promise.all(p);
        }

        delete value.userId;
        delete value.idText;
        res.json({
            status: 1,
            message: 'success',
            data: value
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
 * @api {get} /api/offers/:id  offer detail
 * @apiName offer
 * @apiGroup offer
 *
 *
 *
 * @apiSuccessExample {json} Success-Response:
 *   {
 *    status: 1,
 *    message: 'success',data:{}  }
 *
 */
router.get('/api/offers/:id', async function (req, res, next) {
    var schema = Joi.object().keys({
        id: Joi.number().required(),
        userId: Joi.number().required()
    });
    req.query.id = req.params.id;
    req.query.userId = req.parent.id;
    let connection;
    try {
        let value = await common.validate(req.query, schema);
        connection = await common.getConnection();
        let result = await common.getOfferDetail(value.id, value.userId, connection);
        res.json({
            status: 1,
            message: 'success',
            data: result ? result : {}
        });
    } catch (e) {
        next(err);
    } finally {
        if (connection) {
            connection.release();
        }
    }


});

/**
 * @api {get} /api/offers get offer list
 * @apiName offers
 * @apiGroup offer
 * @apiParam {String}  [columns]
 * @apiParam {String} [country]
 * @apiParam {String}  [ids]
 * @apiParam {String} [filter]
 *
 * @apiSuccessExample {json} Success-Response:
 *   {
 *    status: 1,
 *    message: 'success',data:{}  }
 *
 */
router.get('/api/offers', async function (req, res, next) {
    // userId from jwt, don't need validation
    var schema = Joi.object().keys({
        columns: Joi.string().optional(),
        country: Joi.string().optional().empty(""),
        ids: Joi.string().optional().allow(""),
        userId: Joi.number().required(),
        filter: Joi.string().optional().allow("")
    });
    let connection;
    try {
        req.query.userId = req.parent.id;
        let value = await common.validate(req.query, schema);
        connection = await common.getConnection();
        let params = [];
        let sql = "select id, name,country from Offer where userId = ? and deleted = 0 ";
        params.push(value.userId);
        if (value.country && value.country != 'ZZZ') {
            sql += ` and (country like ? or country='ZZZ')`;
            params.push("%" + value.country + "%");
        }
        if (value.filter) {
            sql += ` and name like ?`;
            params.push("%" + value.filter + "%");
        }
        if (value.ids) {
            let offerIds = value.ids.split(',');
            sql += ` and id NOT IN (?) `
            params.push(offerIds);
        }

        let result = await common.query(sql, params, connection);
        return res.json(result)
    } catch (e) {
        next(e);
    } finally {
        if (connection) {
            connection.release()
        }
    }
});


/**
 * @api {delete} /api/offers/:id 删除offer
 * @apiName  删除offer
 * @apiGroup offer
 *
 * @apiParam {String} name
 * @apiParam {String} hash
 *
 */
router.delete('/api/offers/:id', async function (req, res, next) {
    var schema = Joi.object().keys({
        id: Joi.string().required(),
        userId: Joi.number().required(),
        name: Joi.string().optional(),
        hash: Joi.string().optional(),
    });
    req.query.userId = req.parent.id;
    req.query.id = req.params.id;
    let connection;
    try {
        let value = await common.validate(req.query, schema);
        connection = await common.getConnection();

        //check offer used by 普通flow ?
        let templeSql = `select  f.id as flowId,f.name as flowName from  Offer offer
            right join Offer2Path p2 on offer.id = p2.offerId
            right join Path p on p.id = p2.pathId
            right join Path2Rule r2 on r2.pathId = p.id
            right join Rule r on r.id= r2.ruleId
            right join Rule2Flow f2 on f2.ruleId= r.id
            right join Flow f on f.id = f2.flowId
            where  f.deleted = 0 and offer.id= ? and offer.userId= ? and f.type= 1`;
        //check offer used by  campaign
        let usedByCampaignsql = `select  cam.id as campaignId,cam.name as campaignName from  Offer offer
            right join Offer2Path p2 on offer.id = p2.offerId
            right join Path p on p.id = p2.pathId
            right join Path2Rule r2 on r2.pathId = p.id
            right join Rule r on r.id= r2.ruleId
            right join Rule2Flow f2 on f2.ruleId= r.id
            right join Flow f on f.id = f2.flowId
            right join TrackingCampaign cam on cam.targetFlowId = f.id
            where  f.deleted = 0 and offer.id= ? and offer.userId= ? and f.type= 0 and cam.deleted= 0`;
        // check offer used by cap flow
        let updateCapFlowSql = `update Offer set capEnabled = 0 where redirectOfferId = ? and userId= ?`;

        var idArr = value.id.split(','), p = [];

        idArr.forEach((id) => {
          p.push(common.query(templeSql, [id, value.userId], connection));
          p.push(common.query(usedByCampaignsql, [id, value.userId], connection));
        });
        let relevanceArr = await Promise.all(p);
        let hasRelevance = relevanceArr.some((r) => {
          return r.length > 0
        });
        // let [flowResult, campaignResult] = await Promise.all([common.query(templeSql, [], connection), common.query(usedByCampaignsql, [], connection)]);
        if (hasRelevance) {
            res.json({
                status: 0,
                message: 'offer used by flow or campaign!',
                data: {
                    // flows: flowResult
                }
            });
            return;
        }

        // if (campaignResult.length) {
        //     res.json({
        //         status: 0,
        //         message: 'offer used by campaign!',
        //         data: {
        //             campaigns: campaignResult
        //         }
        //     });
        //     return;
        // }

        let promiseArr = [];
        idArr.forEach((id) => {
          promiseArr.push(common.deleteOffer(req.user.id, id, value.userId, value.name, value.hash, connection));
          promiseArr.push(common.query(updateCapFlowSql, [id, value.userId], connection))
        });
        await Promise.all(promiseArr);
        // let [result, count] = await Promise.all([common.deleteOffer(req.user.id, value.id, value.userId, value.name, value.hash, connection), common.query(updateCapFlowSql, [], connection)]);

        return  res.json({
            status: 1,
            message: 'success'
        });
    } catch (e) {
        next(e);
    } finally {
        if (connection) {
            connection.release();
        }
    }
});


module.exports = router;
