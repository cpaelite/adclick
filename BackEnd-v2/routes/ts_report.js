import express from 'express';
const router = express.Router();
import moment from 'moment';
import { validate } from './common';
import Joi from 'Joi';
import Sequelize from 'sequelize';

export default router;

const {
    TrafficSourceSyncTask: TASK,
    TemplateTrafficSource: TPTS,
    ThirdPartyTrafficSource: TTS,
    TrafficSourceStatis: TSSTATIS
} = models;



/**
 *  @api {get} /api/third/traffic-source  获取ThirdPartyTrafficSource数据List
 *  @apiName 获取ThirdPartyTrafficSource数据List
 *   
 */
router.get('/api/third/traffic-source', async function (req, res, next) {
    try {
        let schema = Joi.object().keys({
            userId: Joi.number().required()
        });
        req.query.userId = req.parent.id;
        let value = await validate(req.query, schema);
        let result = await TTS.findAll({
            attributes: ['id', 'name', 'trustedTrafficSourceId', 'token', ['userName','account'], 'password'],
            where: {
                userId: value.userId
            }
        });
        let resultSlice = result.map(e => e.dataValues);
        return res.json({
            status: 1,
            message: 'success',
            data: {
                lists: resultSlice
            }
        });
    } catch (e) {
        next(e);
    }
});


/**
 *  @api {get} /api/third/traffic-source/:id  获取ThirdPartyTrafficSource detail
 *  @apiName 获取ThirdPartyTrafficSource  detail
 *   
 */
router.get('/api/third/traffic-source/:id', async function (req, res, next) {
    try {
        let schema = Joi.object().keys({
            userId: Joi.number().required(),
            id: Joi.number().required()
        });
        req.query.userId = req.parent.id;
        let value = await validate(req.query, schema);
        let result = await TTS.findOne({
            attributes: ['id', 'trustedTrafficSourceId', 'name', 'token', ['userName', 'account'], 'password'],
            where: {
                userId: value.userId,
                id: value.id
            }
        });
        return res.json({
            status: 1,
            message: 'success',
            data: result
        });

    } catch (e) {
        next(e);
    }
});

/**
 *  @api {post} /api/third/traffic-source  新建ThirdPartyTrafficSource
 *  @apiName 新建ThirdPartyTrafficSource
 *  @apiGroup 3rdThirdTraffic
 *
 *  @apiParam {Number} trafficId
 *  @apiParam {String} name
 *  @apiParam {String} [token]
 *  @apiParam {String} [account]
 *  @apiParam {String} [password]
 */
router.post('/api/third/traffic-source', async function (req, res, next) {
    try {
        let schema = Joi.object().keys({
            userId: Joi.number().required(),
            name: Joi.string().required(),
            trafficId: Joi.number().required(),
            token: Joi.string().optional().allow(""),
            account: Joi.string().optional().allow(""),
            password: Joi.string().optional().allow(""),
        }).or('token', 'account').with('account', 'password');
        req.body.userId = req.parent.id;
        let value = await validate(req.body, schema);
        let tts = TTS.build({
            userId: value.userId,
            trustedTrafficSourceId: value.trafficId,
            name: value.name,
            createdAt: moment().unix()
        });
        if (value.token) {
            tts.token = value.token
        }
        if (value.account) {
            tts.userName = value.account
        }
        if (value.password) {
            tts.password = value.password
        }

        let result = await tts.save();

        value.id = result.id;
        delete value.userId;

        return res.json({
            status: 1,
            message: "success",
            data: value
        });
    } catch (e) {
        next(e);
    }
});




/**
 * @api {put} /api/third/traffic-source/:id   更新ThirdPartyTrafficSource
 *  @apiName 更新ThirdPartyTrafficSource
 *  @apiGroup 3rdThirdTraffic
 *
 *  @apiParam {Number} trafficId
 *  @apiParam {String} name
 *  @apiParam {String} [token]
 *  @apiParam {String} [account]
 *  @apiParam {String} [password]
 */
router.put('/api/third/traffic-source/:id', async function (req, res, next) {
    try {
        let schema = Joi.object().keys({
            id: Joi.number().required(),
            userId: Joi.number().required(),
            name: Joi.string().optional(),
            trafficId: Joi.number().optional(),
            token: Joi.string().optional().allow(""),
            account: Joi.string().optional().allow(""),
            password: Joi.string().optional().allow(""),
        }).or('token', 'account').with('account', 'password');

        req.body.userId = req.parent.id;
        req.body.id = req.params.id;
        let value = await validate(req.body, schema);
        let updateObject = {
        }
        if (value.name != undefined) {
            updateObject.name = value.name;
        }
        if (value.trafficId != undefined) {
            updateObject.trafficId = value.trafficId;
        }
        if (value.token != undefined) {
            updateObject.token = value.token;
        }
        if (value.account != undefined) {
            updateObject.userName = value.account;
        }
        if (value.password != undefined) {
            updateObject.password = value.password;
        }
        await TTS.update(updateObject, { where: { id: value.id, userId: value.userId } });
        return res.json({
            status: 1,
            message: 'success'
        });
    } catch (e) {
        next(e);
    }
});



router.get('/api/traffic-source/tpl', async function (req, res, next) {
    try {
        let slice = [];
        let rows = await TPTS.findAll({
            attributes: ['id', 'name', 'apiReport', 'apiMode', 'apiParams', 'apiTimezones', 'apiMeshSize'],
            where: {
                apiReport: 1
            }
        });
        let resultSlice = rows.map(e => e.dataValues);

        for (let index = 0; index < resultSlice.length; index++) {
            if (resultSlice[index].apiParams) {
                resultSlice[index].apiParams = JSON.parse(resultSlice[index].apiParams);
            }
            if (resultSlice[index].apiTimezones) {
                resultSlice[index].apiTimezones = JSON.parse(resultSlice[index].apiTimezones);
            }
            slice.push(resultSlice[index]);
        }
        return res.json({
            status: 1,
            message: 'success',
            data: {
                lists: slice
            }
        });
    } catch (e) {
        next(e);
    }
});



/**
 * @api {post} /api/third/traffic-source/tasks
 * @apiName 新建trafficSourceSyncTask
 * @apiParam {Number} tsId
 * @apiParam {String} from
 * @apiParam {String} to
 * @apiParam {String} tzShift
 * @apiParam {String} tzParam
 * @apiParam {Number} tzId
 * @apiParam {String} meshSize 获取报告支持的最细粒度，0:minute;1:hour;2:day;3:week;4:month;5:year
 *
 * @apiGroup ThirdPartyTrafficSource
 *
 */
router.post('/api/third/traffic-source/tasks', async function (req, res, next) {
    try {
        let schema = Joi.object().keys({
            tsId: Joi.number().required(),
            userId: Joi.number().required(),
            from: Joi.string().required(),
            to: Joi.string().required(),
            tzShift: Joi.string().required(),
            tzParam: Joi.string().required(),
            tzId: Joi.number().required(),
            meshSize: Joi.string().required()
        });
        req.body.userId = req.parent.id;
        let value = await validate(req.body, schema);

        //限制新建task的频率
        let { apiInterval: Interval } = await TTS.findOne({
            include: [{
                model: TPTS,
                attributes: ['apiInterval']
            }],
            where: {
                id: value.tsId
            },
            attributes: ['']
        });

        let [{ createdAt: begin }] = await TASK.findAll({
            where: {
                userId: value.userId,
                thirdPartyTrafficSourceId: value.tsId
            },
            attributes: ['createdAt'],
            order: 'createdAt DESC',
            offset: 0, limit: 1
        });

        if (begin && (Interval && Interval > 0)) {
            if ((begin + Interval) < moment.unix()) {
                return res.json({
                    status: 0,
                    message: `please wait ${moment.unix() - (begin + Interval)}s`
                });
            }
        }

        let task = TASK.build({
            userId: value.userId,
            thirdPartyTrafficSourceId: value.tsId,
            tzShift: value.tzShift,
            tzId: value.tzId,
            tzParam: value.tzParam,
            statisFrom: value.from,
            statisTo: value.to,
            createdAt: moment().unix()
        });
        switch (value.meshSize) {
            case 'minute':
                task.meshSize = 0;
                break;
            case 'hour':
                task.meshSize = 1;
                break;
            case 'day':
                task.meshSize = 2;
                break;
            case 'week':
                task.meshSize = 3;
                break;
            case 'month':
                task.meshSize = 4;
                break;
            case 'year':
                task.meshSize = 5;
                break;
            default:
                task.meshSize = 2;
        }
        let result = await task.save();
        value.taskId = result.id;
        delete value.userId;
        return res.json({
            status: 1,
            message: 'success',
            data: value
        })
    } catch (e) {
        next(e);
    }

});

/**
 * @api {get}
 * @apiName 获取trafficSourceSyncTask
 * @apiParam {Number} ThirdPartyTrafficSourceId
 *
 * @apiGroup ThirdPartyTrafficSource
 */
router.get('/api/third/traffic-source/tasks', async function (req, res, next) {
    try {
        let schema = Joi.object().keys({
            ThirdPartyTrafficSourceId: Joi.number.required(),
            userId: Joi.number().required()
        });
        req.query.userId = req.parent.id;
        let rows = await TASK.findAll({
            where: {
                userId: value.userId,
                thirdPartyTrafficSourceId: value.ThirdPartyTrafficSourceId
            },
            attributes: ['id', 'status', 'message'],
            order: 'createdAt DESC',
            offset: 0, limit: 1
        });
        let resultSlice = rows.map(e => e.dataValues);
        return res.json({
            status: 1,
            message: 'success',
            data: resultSlice
        })
    } catch (e) {
        next(e);
    }

});