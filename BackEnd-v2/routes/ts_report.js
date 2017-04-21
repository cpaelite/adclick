import express from 'express';
const router = express.Router();
import moment from 'moment';
import { validate } from './common';
import Joi from 'Joi';
import sequelize from 'sequelize';
const _ = require('lodash');

export default router;

const {
    TrafficSourceSyncTask: TASK,
    TemplateTrafficSource: TPTS,
    ThirdPartyTrafficSource: TTS,
    TrafficSourceStatis: TSSTATIS,
    AdStatisReport: AdStatisReport
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
            attributes: ['id', 'name', 'trustedTrafficSourceId', 'token', ['userName', 'account'], 'password'],
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
            attributes: ['id', 'name', 'apiReport', 'apiMode', 'apiParams', 'apiTimezones', 'apiMeshSize', 'apiDimensions'],
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
            if (resultSlice[index].apiDimensions) {
                resultSlice[index].apiDimensions = JSON.parse(resultSlice[index].apiDimensions)
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
        let IntervalResult = await TTS.findOne({
            include: [{
                model: TPTS,
                attributes: ['apiInterval']
            }],
            where: {
                id: value.tsId
            },
            attributes: ['trustedTrafficSourceId']
        });

        let { dataValues: { TemplateTrafficSource: { dataValues: { apiInterval: Interval } } } } = IntervalResult;

        let Results = await TASK.findAll({
            where: {
                userId: value.userId,
                thirdPartyTrafficSourceId: value.tsId
            },
            attributes: ['createdAt'],
            order: 'createdAt DESC',
            offset: 0, limit: 1
        });
        let begin = null;

        if (Results.length) {
            [{ dataValues: { createdAt: begin } }] = Results;
        }


        if (begin && (Interval && Interval > 0)) {
            if ((moment().unix() - begin) < Interval) {
                return res.json({
                    status: 0,
                    message: `please wait ${moment().unix() - (begin + Interval)}s`
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
 * @api {get}  /api/third/traffic-source/tasks
 * @apiName 获取trafficSourceSyncTask
 * @apiParam {Number} thirdPartyTrafficSourceId
 *
 * @apiGroup ThirdPartyTrafficSource
 */
router.get('/api/third/traffic-source/tasks', async function (req, res, next) {
    try {
        let schema = Joi.object().keys({
            thirdPartyTrafficSourceId: Joi.number().required(),
            userId: Joi.number().required()
        });
        req.query.userId = req.parent.id;
        let value = await validate(req.query, schema);
        let rows = await TASK.findAll({
            where: {
                userId: value.userId,
                thirdPartyTrafficSourceId: value.thirdPartyTrafficSourceId
            },
            //0:minute;1:hour;2:day;3:week;4:month;5:year
            attributes: ['id', 'status', 'message', 'tzId', 'tzShift', 'tzParam', ['thirdPartyTrafficSourceId', 'tsId'], [sequelize.literal('DATE_FORMAT(statisFrom,\'%Y-%m-%dT%H:%i\')'), 'from'], [sequelize.literal('DATE_FORMAT(statisTo,\'%Y-%m-%dT%H:%i\')'), 'to'],
                [sequelize.literal('case meshSize when 0 then \'minute\' when 1 then \'hour\' when 2 then \'day\' when 3 then \'week\' when 4 then \'month\' else \'year\' end '), 'meshSize']],
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


const trafficSourceStatisAttributes = [
    'campaignId',
    'campaignName',
    'websiteId',
    'status',
    [sequelize.literal('sum(impression)'), 'impression'],
    [sequelize.literal('sum(click)'), 'click'],
    [sequelize.literal('round(sum(Cost/1000000),2)'), 'cost'],
    [sequelize.literal('sum(0)'),'visit'],
    [sequelize.literal('sum(0)'),'conversion'],
    [sequelize.literal('sum(0)'),'revenue'],
    'v1', 'v2', 'v3', 'v4', 'v5', 'v6', 'v7', 'v8', 'v9', 'v10', 'time'
];

const adReportAttributes = [
    [sequelize.literal('sum(Visits)'), 'visit'],
    [sequelize.literal('sum(Conversions)'), 'conversion'],
    [sequelize.literal('round(sum(Revenue/1000000),2)'), 'revenue']
]

const mapping = {
    campaignId: 'tsCampaignId',
    websiteId: 'tsWebsiteId',
    v1: 'V1',
    v2: 'V2',
    v3: 'V3',
    v4: 'V4',
    v5: 'V5',
    v6: 'V6',
    v7: 'V7',
    v8: 'V8',
    v9: 'V9',
    v10: 'V10',
}

/**
 * @apiName  load TrafficSourceStatis list
 * @apiGroup ThirdPartyTrafficSource
 *
 * @apiParam {Number} taskId
 * @apiParam {String} groupBy
 * @apiParam {Number} page
 * @apiParam {Number} limit
 * @apiParam {String} order 
 *
 */
router.get('/api/third/traffic-source-statis', async function (req, res, next) {
    try {
        let schema = Joi.object().keys({
            userId: Joi.number().required(),
            taskId: Joi.number().required(),
            groupBy: Joi.string().required(),
            page: Joi.number().required(),
            limit: Joi.number().required(),
            order: Joi.string().required(),
            campaignId: Joi.string().optional()
        });
        req.query.userId = req.parent.id;
        let value = await validate(req.query, schema);

        //check groupby 
        if (!_.has(mapping, value.groupBy)) {
            return res.json({
                status: 0,
                message: 'groupBy error'
            });
        }

        let { groupBy, limit, page, order } = value;
        // limit
        limit = parseInt(limit)
        if (!limit || limit < 0) limit = 1000;
        // offset
        page = parseInt(page)
        let offset = (page - 1) * limit;
        if (!offset) offset = 0;
        //order
        let orderBy = [];
        if (order) {
            if (order.slice(0, 1) === '-') {
                orderBy[1] = 'DESC';
                orderBy[0] = order.slice(1);
            } else {
                orderBy[1] = 'ASC';
                orderBy[0] = order;
            }
        }

        //select task get from to tz
        let { dataValues: taskObj } = await TASK.findOne({
            where: {
                id: value.taskId
            },
            attributes: ['tzShift', 'statisFrom', 'statisTo', 'meshSize']
        });
        if (!taskObj) {
            throw new Error('taskId error');
        }

        //console.log(taskObj)

        let { statisFrom: from, statisTo: to, tzShift: tz, meshSize: meshSize } = taskObj;
        //console.log('form :', from);
        //console.log('to :', to);
        //v1~v10 campaignId/webSiteId/time的顺序依次赋值
        let IN = 5; //默认campaignId,time

        switch (groupBy) {
            case 'campaignId':
                IN = parseInt('101', 2);
                break;
            case 'websiteId':
                IN = parseInt('111', 2);
                break;
            case 'v1':
                IN = parseInt('1000000000101', 2);
                break;
            case 'v2':
                IN = parseInt('100000000101', 2);
                break;
            case 'v3':
                IN = parseInt('10000000101', 2);
                break;
            case 'v4':
                IN = parseInt('1000000101', 2);
                break;
            case 'v5':
                IN = parseInt('100000101', 2);
                break;
            case 'v6':
                IN = parseInt('10000101', 2);
                break;
            case 'v7':
                IN = parseInt('1000101', 2);
                break;
            case 'v8':
                IN = parseInt('100101', 2);
                break;
            case 'v9':
                IN = parseInt('10101', 2);
                break;
            case 'v10':
                IN = parseInt('1101', 2);
                break;
            default:
                IN = 5;
        }

        let whereConditon = {
            userId: value.userId,
            taskId: value.taskId,
            dimensions: sequelize.literal(`dimensions & ${IN} > 0`)
        };
        if (value.campaignId != undefined) {
            whereConditon.campaignId = value.campaignId;
        }
        //console.log('IN ======= :', IN)
        //select 3rd ts report 
        let rows = await TSSTATIS.findAll({
            where: whereConditon,
            limit,
            offset,
            group: `${groupBy},time`,
            attributes: trafficSourceStatisAttributes,
            order: orderBy.length ? [[sequelize.literal(orderBy[0]), orderBy[1]]] : [[sequelize.literal('campaignId'), 'ASC']]
        });
    
        let rawRows = [];
        let InSlice = [];
        for (let index = 0; index < rows.length; index++) {
            rawRows.push(rows[index].dataValues);
            let value = rows[index].dataValues[groupBy]
            InSlice.push(value);
        }

        if (rawRows.length) {
            //report 
            let sqlWhere = {};
            let having;
            sqlWhere.UserID = value.userId

            sqlWhere[mapping[groupBy]] = {
                $in: InSlice
            }
            if(value.campaignId !=undefined){
                sqlWhere.tsCampaignId= value.campaignId;
            }
            let groupCondition = groupBy;
            let finalAttribute = [];

            //处理列存储tz 问题
            let tag = tz.slice(0, 1);
            let numberString = tz.slice(1);
            let slice = numberString.split(':');
            let intavlHour = `${tag}${parseInt(slice[0]) + (parseInt(slice[1]) / 60)}`

            //0:minute;1:hour;2:day;3:week;4:month;5:year
            let formatType = '%Y-%m-%d';
            let groupByKey = 'time'
            switch (meshSize) {
                // case 0:
                case 1:
                    formatType = '%Y-%m-%d %H';
                    break;
                case 2:
                    formatType = '%Y-%m-%d';
                    break;
                case 3:
                    formatType = '%Y-W%V';
                    break;
                case 4:
                    formatType = '%Y-%m';
                    break;
                case 5:
                    formatType = '%Y';
                    break;
                default:
                    formatType = '%Y-%m-%d';
            }
            from = moment(from).startOf('day').format('YYYY-MM-DD HH:mm:ss');
            to = moment(to).startOf('day').format('YYYY-MM-DD HH:mm:ss');
            groupCondition = groupCondition + ',' + groupByKey;
            sqlWhere.Timestamp = sequelize.and(sequelize.literal(`AdStatisReport.Timestamp >= (UNIX_TIMESTAMP(CONVERT_TZ('${from}','${tz}', '+00:00')) * 1000)`), sequelize.literal(`AdStatisReport.Timestamp < (UNIX_TIMESTAMP(CONVERT_TZ('${to}','${tz}', '+00:00')) * 1000)`));
            finalAttribute = [[mapping[groupBy], groupBy], [sequelize.literal(`DATE_FORMAT(DATE_ADD(FROM_UNIXTIME((TIMESTAMP/1000), "%Y-%m-%d %H:%i:%s"), INTERVAL ${intavlHour} HOUR), '${formatType}')`), `${groupByKey}`]];
            finalAttribute = _.concat(finalAttribute, adReportAttributes);
            let reportRows = await AdStatisReport.findAll({
                where: sqlWhere,
                group: groupCondition,
                attributes: finalAttribute
            });
           
            for (let index = 0; index < reportRows.length; index++) {
                for (let i = 0; i < rawRows.length; i++) {
                    if (rawRows[i].time == reportRows[index].dataValues[groupByKey]) {
                        rawRows[i] = _.assign(rawRows[i], reportRows[index].dataValues)
                    }
                }
            }

        }

        return res.json({
            status: 1,
            message: 'success',
            data: {
                rows: rawRows
            }
        });
    } catch (e) {
        next(e);
    }
});